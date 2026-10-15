CREATE TABLE public.video_roasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  site_url text NOT NULL,
  job_id text,
  status text NOT NULL DEFAULT 'queued',
  storage_path text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_roasts TO authenticated;
GRANT ALL ON public.video_roasts TO service_role;
ALTER TABLE public.video_roasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their video roasts" ON public.video_roasts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX video_roasts_user_created ON public.video_roasts(user_id, created_at DESC);