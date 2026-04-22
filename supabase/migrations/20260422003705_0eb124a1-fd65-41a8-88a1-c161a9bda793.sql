-- Allow users to delete their own data for GDPR compliance
CREATE POLICY "Users can delete their own history"
ON public.analysis_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding"
ON public.onboarding_responses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);