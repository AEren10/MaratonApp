-- G) Spaced repetition yanlış defteri.
-- next_review_at: bir sonraki tekrar zamanı (NULL = henüz SR'a girmemiş)
-- interval_days: mevcut tekrar aralığı (gün)
-- ease: SM-2 kolaylık faktörü
-- last_reviewed_at: son tekrar zamanı

ALTER TABLE public.wrong_questions
  ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ease NUMERIC DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_wrong_questions_due
  ON public.wrong_questions(user_id, next_review_at);
