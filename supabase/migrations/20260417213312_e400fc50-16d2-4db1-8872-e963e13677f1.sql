
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_analysis_history_share_token
  ON public.analysis_history (share_token)
  WHERE share_token IS NOT NULL;

-- Allow anyone (anon + authenticated) to read an analysis when they have the share token
CREATE POLICY "Public can view shared analyses"
  ON public.analysis_history
  FOR SELECT
  TO anon, authenticated
  USING (share_token IS NOT NULL);

-- Allow owners to update share_token on their own analyses (currently no UPDATE policy exists)
CREATE POLICY "Users can update their own history"
  ON public.analysis_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
