-- Add notes column to study_logs
ALTER TABLE public.study_logs
  ADD COLUMN IF NOT EXISTS notes TEXT;
