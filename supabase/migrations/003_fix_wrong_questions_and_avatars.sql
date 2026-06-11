-- Fix wrong_questions: add missing columns, rename image_url → image_path
-- Also create avatars storage bucket

-- Add missing columns to wrong_questions
ALTER TABLE public.wrong_questions
  ADD COLUMN IF NOT EXISTS my_answer TEXT,
  ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- Rename image_url to image_path (what the code actually uses)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wrong_questions' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.wrong_questions RENAME COLUMN image_url TO image_path;
  END IF;
END $$;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Avatars RLS policies
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
