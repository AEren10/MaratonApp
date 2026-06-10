-- Storage bucket for wrong question images
-- Created: 2026-06-10

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wrong-questions',
  'wrong-questions',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS: users can upload to their own folder
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wrong-questions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS: users can view their own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wrong-questions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS: users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wrong-questions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
