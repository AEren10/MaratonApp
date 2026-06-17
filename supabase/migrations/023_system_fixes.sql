-- 023: System fixes — exam config sync, study log notes, correct_count support
-- Fixes: profiles exam_type constraint, adds missing profile columns, adds notes to study_logs

-- 1. Migrate existing exam_type values to lowercase
UPDATE public.profiles SET exam_type = LOWER(exam_type) WHERE exam_type IS NOT NULL;

-- 2. Replace CHECK constraint to match app values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_exam_type_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_exam_type_check
  CHECK (exam_type IN ('tyt', 'tyt_ayt', 'dil', 'lgs'));

-- 3. Add missing exam config columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS field TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_ranking TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_department TEXT;

-- 4. Add notes column to study_logs
ALTER TABLE public.study_logs ADD COLUMN IF NOT EXISTS notes TEXT;
