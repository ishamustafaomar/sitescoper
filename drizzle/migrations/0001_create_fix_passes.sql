CREATE TABLE public.fix_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  analysis_id uuid,
  stripe_session_id text UNIQUE,
  price_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  amount_cents integer,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fix_passes_user_idx ON public.fix_passes (user_id, created_at DESC);
CREATE INDEX fix_passes_url_idx ON public.fix_passes (user_id, url);

GRANT SELECT ON public.fix_passes TO authenticated;
GRANT ALL ON public.fix_passes TO service_role;

ALTER TABLE public.fix_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own fix passes"
ON public.fix_passes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);