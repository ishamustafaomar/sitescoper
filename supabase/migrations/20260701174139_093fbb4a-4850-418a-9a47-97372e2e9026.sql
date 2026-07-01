
ALTER TABLE public.youtube_shorts
  ADD COLUMN IF NOT EXISTS voice_url text,
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS caption_timings jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS target_site text,
  ADD COLUMN IF NOT EXISTS screenshot_urls jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS script text,
  ADD COLUMN IF NOT EXISTS duration_ms int,
  ADD COLUMN IF NOT EXISTS voice_id text;

DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
