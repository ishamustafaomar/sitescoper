
CREATE TABLE IF NOT EXISTS public.scan_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scan_usage TO authenticated;
GRANT ALL ON public.scan_usage TO service_role;
ALTER TABLE public.scan_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own scan usage" ON public.scan_usage;
CREATE POLICY "Users can view their own scan usage" ON public.scan_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_scan_usage_user_created ON public.scan_usage(user_id, created_at DESC);

-- Belt-and-suspenders: re-drop the self-delete policy on user_roles in case it was re-added.
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
