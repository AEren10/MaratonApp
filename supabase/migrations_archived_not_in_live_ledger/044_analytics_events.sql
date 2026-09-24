-- 044: Huni olcumu icin analytics_events tablosu (2026-08-18)
--
-- Amac: "insanlar nerede dusuyor" sorusunu cevaplamak. Yeni bir saglayiciya
-- (PostHog/Amplitude) bagimli olmadan, veri kullanicinin kendi Supabase'inde
-- kaliyor ve SQL ile sorgulanabiliyor.
--
-- Client: src/lib/analytics.js -> track()

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  TEXT,
  event       TEXT NOT NULL,
  props       JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_time
  ON public.analytics_events (event, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user
  ON public.analytics_events (user_id, occurred_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Kullanici yalnizca KENDI olayini yazabilir. Okuma yok — huni sorgulari
-- dashboard'dan (service_role) yapilir, boylece kimse baskasinin
-- davranisini goremez.
CREATE POLICY "analytics insert own"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.analytics_events FROM anon;
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO authenticated;
