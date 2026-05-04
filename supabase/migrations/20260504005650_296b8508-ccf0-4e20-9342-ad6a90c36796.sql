
-- Tighten share_token access: drop overly broad policy, replace with token-scoped RPC
DROP POLICY IF EXISTS "Public can view shared analyses" ON public.analysis_history;

CREATE OR REPLACE FUNCTION public.get_shared_analysis(p_token text)
RETURNS SETOF public.analysis_history
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.analysis_history
  WHERE share_token = p_token AND p_token IS NOT NULL AND share_token IS NOT NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_analysis(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_analysis(text) TO anon, authenticated;
