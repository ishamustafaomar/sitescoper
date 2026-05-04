-- Revoke direct execute on has_active_subscription so authenticated users can't query other users' subscription status
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon, authenticated, public;

-- Remove DELETE policy on analysis_history to prevent free-tier quota bypass via row deletion
DROP POLICY IF EXISTS "Users can delete their own history" ON public.analysis_history;