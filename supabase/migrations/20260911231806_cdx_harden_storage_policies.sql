-- Harden Storage mutating policies.
--
-- Supabase/Postgres UPDATE policies should include both USING and WITH CHECK.
-- Mutating object policies are also scoped explicitly to authenticated users.

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wrong-questions'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'wrong-questions'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own answer images" ON storage.objects;

CREATE POLICY "Users can upload answer images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'community-answers'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own answer images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'community-answers'
    AND (select auth.uid())::text = (storage.foldername(name))[1]
  );
