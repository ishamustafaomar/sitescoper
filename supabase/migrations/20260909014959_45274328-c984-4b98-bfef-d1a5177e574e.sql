REVOKE ALL ON FUNCTION public.claim_anonymous_audit(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_anonymous_audit(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_audit(text) TO authenticated;