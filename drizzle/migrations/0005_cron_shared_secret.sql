CREATE TABLE public.internal_cron_secret (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex')
);
GRANT ALL ON public.internal_cron_secret TO service_role;
REVOKE ALL ON public.internal_cron_secret FROM anon, authenticated;
ALTER TABLE public.internal_cron_secret ENABLE ROW LEVEL SECURITY;
INSERT INTO public.internal_cron_secret (id) VALUES (1) ON CONFLICT DO NOTHING;