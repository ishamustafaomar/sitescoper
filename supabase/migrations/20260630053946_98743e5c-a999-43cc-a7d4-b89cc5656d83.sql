
CREATE TABLE public.youtube_shorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format TEXT NOT NULL,
  insight TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  captions JSONB NOT NULL DEFAULT '[]'::jsonb,
  bg_color TEXT NOT NULL DEFAULT '#0F172A',
  accent_color TEXT NOT NULL DEFAULT '#3B82F6',
  status TEXT NOT NULL DEFAULT 'generated',
  posted_at TIMESTAMPTZ,
  utm_campaign TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_shorts TO authenticated;
GRANT ALL ON public.youtube_shorts TO service_role;

ALTER TABLE public.youtube_shorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage youtube_shorts"
  ON public.youtube_shorts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_youtube_shorts_generated_at ON public.youtube_shorts (generated_at DESC);
