-- ============ Monitoring / Competitor Radar ============

CREATE TABLE public.monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text,
  kind text NOT NULL DEFAULT 'self' CHECK (kind IN ('self','competitor')),
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  next_run_at timestamptz NOT NULL DEFAULT now(),
  consecutive_failures integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, url)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitors TO authenticated;
GRANT ALL ON public.monitors TO service_role;
ALTER TABLE public.monitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own monitors select" ON public.monitors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own monitors insert" ON public.monitors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own monitors update" ON public.monitors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own monitors delete" ON public.monitors FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX monitors_due_idx ON public.monitors (next_run_at) WHERE active;

CREATE TABLE public.monitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES public.monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status_code integer,
  response_ms integer,
  content_hash text NOT NULL,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.monitor_snapshots TO authenticated;
GRANT ALL ON public.monitor_snapshots TO service_role;
ALTER TABLE public.monitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots select" ON public.monitor_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX monitor_snapshots_monitor_idx ON public.monitor_snapshots (monitor_id, created_at DESC);

CREATE TABLE public.monitor_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES public.monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  summary text,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.monitor_changes TO authenticated;
GRANT ALL ON public.monitor_changes TO service_role;
ALTER TABLE public.monitor_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own changes select" ON public.monitor_changes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX monitor_changes_user_idx ON public.monitor_changes (user_id, created_at DESC);

CREATE TABLE public.monitor_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily','weekly')),
  email_enabled boolean NOT NULL DEFAULT true,
  last_digest_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.monitor_settings TO authenticated;
GRANT ALL ON public.monitor_settings TO service_role;
ALTER TABLE public.monitor_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings select" ON public.monitor_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own settings insert" ON public.monitor_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings update" ON public.monitor_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER monitors_updated_at BEFORE UPDATE ON public.monitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER monitor_settings_updated_at BEFORE UPDATE ON public.monitor_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Background job single-flight leases ============

CREATE TABLE public.job_leases (
  job_name text PRIMARY KEY,
  locked_until timestamptz NOT NULL DEFAULT now(),
  paused_reason text,
  last_run_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.job_leases TO service_role;
ALTER TABLE public.job_leases ENABLE ROW LEVEL SECURITY;

-- ============ A/B experiments ============

CREATE TABLE public.ab_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  hypothesis text,
  surface text NOT NULL,
  goal text NOT NULL DEFAULT 'signup',
  variants jsonb NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','archived')),
  winner text,
  result_note text,
  min_sample integer NOT NULL DEFAULT 200,
  auto_promote boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ab_experiments TO anon, authenticated;
GRANT ALL ON public.ab_experiments TO service_role;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiments are public read" ON public.ab_experiments FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ab_events (
  id bigserial PRIMARY KEY,
  experiment_key text NOT NULL,
  variant text NOT NULL,
  visitor_id text NOT NULL,
  event text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.ab_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.ab_events_id_seq TO anon, authenticated;
GRANT ALL ON public.ab_events TO service_role;
GRANT ALL ON SEQUENCE public.ab_events_id_seq TO service_role;
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can record ab events" ON public.ab_events FOR INSERT TO anon, authenticated WITH CHECK (char_length(visitor_id) BETWEEN 8 AND 64 AND char_length(experiment_key) < 80);
CREATE INDEX ab_events_lookup_idx ON public.ab_events (experiment_key, variant, event);
CREATE UNIQUE INDEX ab_events_unique_idx ON public.ab_events (experiment_key, visitor_id, event);

CREATE OR REPLACE FUNCTION public.ab_results()
RETURNS TABLE (experiment_key text, variant text, exposures bigint, conversions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.experiment_key,
         e.variant,
         count(*) FILTER (WHERE e.event = 'exposure') AS exposures,
         count(*) FILTER (WHERE e.event <> 'exposure') AS conversions
  FROM public.ab_events e
  GROUP BY e.experiment_key, e.variant
$$;
REVOKE ALL ON FUNCTION public.ab_results() FROM public;
GRANT EXECUTE ON FUNCTION public.ab_results() TO authenticated, service_role;

-- ============ Seed the first batch of experiments ============

INSERT INTO public.ab_experiments (key, name, hypothesis, surface, goal, variants, status, priority, min_sample, started_at) VALUES
('hero_headline_v1', 'Homepage headline', 'A loss-framed headline beats a feature headline for starting an audit.', 'home_hero', 'audit_started',
 '[{"id":"control"},{"id":"loss","headline":"Most visitors leave your site in 8 seconds. Find out why.","sub":"A free, no-account audit of what is costing you signups."},{"id":"speed","headline":"Get a brutally honest audit of your website in 60 seconds.","sub":"No account. No credit card. Just paste your URL."}]'::jsonb,
 'running', 10, 240, now()),
('hero_cta_v1', 'Homepage button wording', 'Naming the outcome on the button beats a generic verb.', 'home_cta', 'audit_started',
 '[{"id":"control"},{"id":"free","label":"Audit my site free"},{"id":"outcome","label":"Show me what is losing me visitors"}]'::jsonb,
 'queued', 20, 240, NULL),
('pricing_cta_v1', 'Pricing button wording', 'A risk-reversal button beats a generic trial button.', 'pricing_cta', 'checkout_started',
 '[{"id":"control"},{"id":"risk","label":"Try Pro free for 7 days"},{"id":"value","label":"Unlock monitoring and competitor tracking"}]'::jsonb,
 'queued', 30, 150, NULL),
('report_gate_v1', 'Signup prompt on a guest report', 'Naming a single next action converts better than listing everything.', 'report_gate', 'signup',
 '[{"id":"control"},{"id":"single","label":"Save this report to your dashboard"},{"id":"stack","label":"Keep this report, export it, and track it every week"}]'::jsonb,
 'queued', 40, 200, NULL);
