-- V1'de anonim soru-cevap toplulugu yayinda degil. Mevcut veriyi ve sahip
-- silme yolunu korurken yeni icerik uretimini ve genel medya erisimini kapat.

REVOKE INSERT ON TABLE public.shared_questions FROM authenticated, anon;
REVOKE INSERT ON TABLE public.question_answers FROM authenticated, anon;

DROP POLICY IF EXISTS "Users can share own questions" ON public.shared_questions;
DROP POLICY IF EXISTS "Authenticated users can answer" ON public.question_answers;

UPDATE storage.buckets
   SET public = false
 WHERE id = 'community-answers';

DROP POLICY IF EXISTS "Anyone can view answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload answer images" ON storage.objects;
DROP POLICY IF EXISTS "Shared wrong question images are viewable" ON storage.objects;

DROP POLICY IF EXISTS "Users can view own community answer images" ON storage.objects;
CREATE POLICY "Users can view own community answer images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'community-answers'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'question_answers'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.question_answers';
  END IF;
END
$$;
