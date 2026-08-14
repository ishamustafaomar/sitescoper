CREATE TABLE public.integration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id text,
  connector_name text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.integration_requests TO authenticated;
GRANT ALL ON public.integration_requests TO service_role;

ALTER TABLE public.integration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own integration requests"
ON public.integration_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own integration requests"
ON public.integration_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all integration requests"
ON public.integration_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_integration_requests_created_at ON public.integration_requests (created_at DESC);