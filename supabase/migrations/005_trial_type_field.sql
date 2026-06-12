-- =====================
-- Trial type expansion: TYT/AYT (Sayisal/EA/Sozel) + Brans
-- =====================

-- Drop old constraint (TYT/AYT/LGS only)
ALTER TABLE public.trials
  DROP CONSTRAINT IF EXISTS trials_exam_type_check;

-- Add new constraint with expanded values
ALTER TABLE public.trials
  ADD CONSTRAINT trials_exam_type_check
  CHECK (exam_type IN ('TYT', 'AYT_SAY', 'AYT_EA', 'AYT_SOZ', 'BRANCH', 'AYT', 'LGS'));

-- Field: Sayisal / Esit Agirlik / Sozel (only for AYT)
ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS field TEXT;

-- Branch subject key: e.g. 'ayt_biyoloji' (only for BRANCH)
ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS branch_subject TEXT;

-- Index for exam_type queries on analysis screen
CREATE INDEX IF NOT EXISTS idx_trials_exam_type ON public.trials(user_id, exam_type);
