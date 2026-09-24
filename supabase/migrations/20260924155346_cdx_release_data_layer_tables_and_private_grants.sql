-- Release data-layer tables that were used by the client but absent from the live ledger.
-- Also narrows private helper EXECUTE grants.
--
-- NOTE: public.award_xp / public.touch_streak / public.find_user_by_friend_code
-- are SECURITY INVOKER wrappers that call the private helpers. authenticated
-- therefore still needs EXECUTE on those private functions for the wrappers to
-- work. The security boundary is that the private schema is not an exposed Data
-- API schema; this migration removes PUBLIC/anon execution, not the wrapper's
-- required authenticated implementation grant.

CREATE TABLE IF NOT EXISTS public.exam_results (
  user_id           UUID         NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  exam_type         TEXT         NOT NULL CHECK (exam_type IN ('tyt', 'tyt_ayt', 'ayt', 'dil', 'lgs')),
  exam_date         DATE         NOT NULL,
  primary_net       NUMERIC(6,2) NOT NULL CHECK (primary_net >= 0 AND primary_net <= 120),
  secondary_net     NUMERIC(6,2) CHECK (secondary_net IS NULL OR (secondary_net >= 0 AND secondary_net <= 80)),
  placement_score   NUMERIC(6,2) CHECK (placement_score IS NULL OR (placement_score >= 0 AND placement_score <= 560)),
  forecast_snapshot JSONB        CHECK (forecast_snapshot IS NULL OR jsonb_typeof(forecast_snapshot) = 'object'),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exam_type, exam_date)
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_results select own" ON public.exam_results;
CREATE POLICY "exam_results select own"
  ON public.exam_results FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results insert own" ON public.exam_results;
CREATE POLICY "exam_results insert own"
  ON public.exam_results FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results update own" ON public.exam_results;
CREATE POLICY "exam_results update own"
  ON public.exam_results FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results delete own" ON public.exam_results;
CREATE POLICY "exam_results delete own"
  ON public.exam_results FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.exam_results FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_results TO authenticated;

DROP TRIGGER IF EXISTS exam_results_updated_at ON public.exam_results;
CREATE TRIGGER exam_results_updated_at
  BEFORE UPDATE ON public.exam_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  route_name TEXT,
  route_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  color_key TEXT NOT NULL DEFAULT 'accent',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications select own" ON public.notifications;
CREATE POLICY "notifications select own"
  ON public.notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "notifications insert own" ON public.notifications;
CREATE POLICY "notifications insert own"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "notifications update own" ON public.notifications;
CREATE POLICY "notifications update own"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "notifications delete own" ON public.notifications;
CREATE POLICY "notifications delete own"
  ON public.notifications FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

DO $$
BEGIN
  IF to_regprocedure('private.award_xp(text,integer)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION private.award_xp(text, integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION private.award_xp(text, integer) TO authenticated;
  END IF;
  IF to_regprocedure('private.touch_streak(date)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION private.touch_streak(date) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION private.touch_streak(date) TO authenticated;
  END IF;
  IF to_regprocedure('private.find_user_by_friend_code(text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION private.find_user_by_friend_code(text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION private.find_user_by_friend_code(text) TO authenticated;
  END IF;
END
$$;
