CREATE TABLE public.anonymous_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_hash text,
  url text NOT NULL,
  overall_score integer NOT NULL,
  summary text,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  scrape_data jsonb,
  custom_instructions text,
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_anonymous_audits_session ON public.anonymous_audits (session_id);
CREATE INDEX idx_anonymous_audits_expires ON public.anonymous_audits (expires_at);

GRANT ALL ON public.anonymous_audits TO service_role;
ALTER TABLE public.anonymous_audits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.anon_scan_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_hash text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_anon_scan_usage_session ON public.anon_scan_usage (session_id, created_at DESC);
CREATE INDEX idx_anon_scan_usage_ip ON public.anon_scan_usage (ip_hash, created_at DESC);

GRANT ALL ON public.anon_scan_usage TO service_role;
ALTER TABLE public.anon_scan_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_anonymous_audit(p_session_id text)
RETURNS SETOF public.analysis_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL OR p_session_id IS NULL OR length(p_session_id) < 8 THEN
    RETURN;
  END IF;

  DELETE FROM public.anonymous_audits WHERE expires_at < now() AND claimed_by IS NULL;

  RETURN QUERY
  WITH src AS (
    SELECT * FROM public.anonymous_audits
    WHERE session_id = p_session_id
      AND claimed_by IS NULL
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 3
  ), ins AS (
    INSERT INTO public.analysis_history (user_id, url, overall_score, summary, categories, scrape_data, custom_instructions)
    SELECT v_user, src.url, src.overall_score, src.summary, src.categories, src.scrape_data, src.custom_instructions
    FROM src
    RETURNING *
  ), mark AS (
    UPDATE public.anonymous_audits a
    SET claimed_by = v_user, claimed_at = now()
    WHERE a.id IN (SELECT id FROM src)
    RETURNING a.id
  )
  SELECT * FROM ins;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_anonymous_audit(text) TO authenticated;