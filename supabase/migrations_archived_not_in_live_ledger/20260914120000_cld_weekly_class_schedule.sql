-- AKIS 7 · "Haftalık ders programı" (Ayarlar / Program Hub · PROGRAMIN KURALLARI).
-- "Hangi gün hangi derse çalıştığını söyle, rota durakları o günlere düşsün."
-- Haftanin gunu basina tek satir (Pzt=0 ... Paz=6).
-- UYGULANMADI: canli DB'ye karsi dogrulanip elle uygulanacak.

CREATE TABLE IF NOT EXISTS public.weekly_class_schedule (
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  weekday     SMALLINT    NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  kind        TEXT        NOT NULL DEFAULT 'study' CHECK (kind IN ('study', 'trial', 'off')),
  subjects    TEXT[]      NOT NULL DEFAULT '{}' CHECK (cardinality(subjects) <= 12),
  minutes     INTEGER     NOT NULL DEFAULT 0 CHECK (minutes BETWEEN 0 AND 960),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, weekday),
  CONSTRAINT weekly_class_schedule_off_empty CHECK (kind <> 'off' OR (minutes = 0 AND cardinality(subjects) = 0))
);

ALTER TABLE public.weekly_class_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_class_schedule select own" ON public.weekly_class_schedule;
CREATE POLICY "weekly_class_schedule select own"
  ON public.weekly_class_schedule FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "weekly_class_schedule insert own" ON public.weekly_class_schedule;
CREATE POLICY "weekly_class_schedule insert own"
  ON public.weekly_class_schedule FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "weekly_class_schedule update own" ON public.weekly_class_schedule;
CREATE POLICY "weekly_class_schedule update own"
  ON public.weekly_class_schedule FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "weekly_class_schedule delete own" ON public.weekly_class_schedule;
CREATE POLICY "weekly_class_schedule delete own"
  ON public.weekly_class_schedule FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.weekly_class_schedule FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_class_schedule TO authenticated;

DROP TRIGGER IF EXISTS weekly_class_schedule_updated_at ON public.weekly_class_schedule;
CREATE TRIGGER weekly_class_schedule_updated_at
  BEFORE UPDATE ON public.weekly_class_schedule
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
