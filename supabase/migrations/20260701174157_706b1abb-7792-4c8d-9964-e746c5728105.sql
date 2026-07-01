
CREATE POLICY "Admins read youtube-shorts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'youtube-shorts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins write youtube-shorts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'youtube-shorts' AND public.has_role(auth.uid(), 'admin'));
