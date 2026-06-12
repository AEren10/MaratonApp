-- Katman 1 / Madde 3: Streak freeze (joker gün)
-- Kullanıcı bir günü atlasa bile haftada 1 joker hakkıyla streak korunur.
-- freeze_count: kalan joker hakkı (haftalık 1 ile yenilenir)
-- last_freeze_at: jokerin en son kullanıldığı an
-- freeze_reset_at: jokerin bir sonraki yenileneceği an (pazartesi 04:00)

ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS freeze_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_freeze_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS freeze_reset_at TIMESTAMPTZ;
