-- Katman 1 / Madde 1: Günlük soru hedefi
-- Kullanıcının kendine koyduğu günlük soru hedefi (Home mikro-hedef halkası).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_question_goal INTEGER DEFAULT 100;
