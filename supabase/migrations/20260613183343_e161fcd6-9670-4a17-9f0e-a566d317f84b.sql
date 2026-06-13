
CREATE TABLE public.repo_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'github',
  installation_id TEXT NOT NULL,
  account_login TEXT NOT NULL,
  default_repo TEXT,
  default_branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, installation_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.repo_connections TO authenticated;
GRANT ALL ON public.repo_connections TO service_role;

ALTER TABLE public.repo_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own repo_connections"
  ON public.repo_connections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER repo_connections_updated_at
  BEFORE UPDATE ON public.repo_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fix_pull_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_history_id UUID REFERENCES public.analysis_history(id) ON DELETE SET NULL,
  repo_connection_id UUID REFERENCES public.repo_connections(id) ON DELETE SET NULL,
  repo TEXT NOT NULL,
  pr_url TEXT NOT NULL,
  pr_number INTEGER,
  branch TEXT NOT NULL,
  fixes_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fix_pull_requests TO authenticated;
GRANT ALL ON public.fix_pull_requests TO service_role;

ALTER TABLE public.fix_pull_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fix_pull_requests"
  ON public.fix_pull_requests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER fix_pull_requests_updated_at
  BEFORE UPDATE ON public.fix_pull_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX fix_pull_requests_analysis_idx ON public.fix_pull_requests(analysis_history_id);
CREATE INDEX fix_pull_requests_user_idx ON public.fix_pull_requests(user_id);
