-- B) Wrong question: konu kaynağı.
-- Yeni kayıtlarda konu curriculum dropdown'undan mı yoksa elle mi yazıldı?
-- 'curriculum' = listeden seçildi, 'custom' = elle yazıldı.
-- Eski kayıtlar NULL kalır (bozulmaz).

ALTER TABLE public.wrong_questions
  ADD COLUMN IF NOT EXISTS topic_source TEXT
    CHECK (topic_source IN ('curriculum', 'custom'));
