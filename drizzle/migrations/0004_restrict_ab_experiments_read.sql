DROP POLICY IF EXISTS "experiments are public read" ON public.ab_experiments;
CREATE POLICY "Visitors read active experiments" ON public.ab_experiments
  FOR SELECT TO anon, authenticated
  USING (status IN ('running','completed'));
CREATE POLICY "Admins read all experiments" ON public.ab_experiments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.ab_experiments FROM anon, authenticated;
GRANT SELECT (id, key, surface, goal, status, winner, variants, ended_at) ON public.ab_experiments TO anon, authenticated;
GRANT ALL ON public.ab_experiments TO service_role;