CREATE TABLE public.analytics_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL DEFAULT 'Analytics', messages jsonb NOT NULL DEFAULT '[]'::jsonb, updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), ai_paused_reason text);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_threads TO authenticated;
GRANT ALL ON public.analytics_threads TO service_role;
ALTER TABLE public.analytics_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_threads_owner ON public.analytics_threads FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX analytics_threads_owner_updated ON public.analytics_threads(user_id,updated_at DESC);