-- 031: Gamification + retention persistence
-- badges, gamification_stats, premium_until, expo_push_token zaten dashboard'dan
-- eklendi; IF NOT EXISTS idempotent tutar. Yeni eklenen: retention tracking sütunları.

-- 1. Gamification verileri (idempotent — zaten var)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gamification_stats JSONB DEFAULT '{}'::jsonb;

-- 2. Premium & push (idempotent — zaten var)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 3. Retention tracking — AsyncStorage'dan Supabase'e taşıma
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_session_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_rewarded_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_last_asked TIMESTAMPTZ;

-- 4. Index: push token queries for cron jobs (idempotent)
CREATE INDEX IF NOT EXISTS idx_profiles_push_token
  ON public.profiles (expo_push_token)
  WHERE expo_push_token IS NOT NULL;
