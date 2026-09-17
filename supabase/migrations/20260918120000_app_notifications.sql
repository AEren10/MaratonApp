-- App notification inbox ("Rota haberleri").
--
-- Stores durable in-app notification rows for route stop openings, trial
-- analysis readiness, weekly summaries and future product events. Push/local
-- notifications remain in expo-notifications; this table is the user's
-- cross-device inbox.

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notifications'
       AND policyname = 'notifications select own'
  ) THEN
    CREATE POLICY "notifications select own"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notifications'
       AND policyname = 'notifications insert own'
  ) THEN
    CREATE POLICY "notifications insert own"
      ON public.notifications
      FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notifications'
       AND policyname = 'notifications update own'
  ) THEN
    CREATE POLICY "notifications update own"
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notifications'
       AND policyname = 'notifications delete own'
  ) THEN
    CREATE POLICY "notifications delete own"
      ON public.notifications
      FOR DELETE
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END
$$;

REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
