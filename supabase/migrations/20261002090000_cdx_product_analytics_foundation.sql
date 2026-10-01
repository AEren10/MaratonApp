-- Product analytics foundation.
--
-- The original table CREATE statements live in the archived migration ledger,
-- while production already has the tables. Keep this migration additive and
-- idempotent so a fresh database and the existing project converge safely.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_event_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS client_event_id TEXT;

CREATE TABLE IF NOT EXISTS public.retention_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  source TEXT,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_event_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- These indexes support the owner-only reports without exposing aggregates to
-- the mobile client. The partial unique indexes preserve legacy NULL IDs while
-- making every new-format event idempotent per user.
CREATE INDEX IF NOT EXISTS idx_analytics_user
  ON public.analytics_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_time
  ON public.analytics_events (event, occurred_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_client_event_id
  ON public.analytics_events (user_id, client_event_id)
  WHERE client_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_retention_events_user_time
  ON public.retention_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_retention_events_event_time
  ON public.retention_events (event, occurred_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_retention_events_client_event_id
  ON public.retention_events (user_id, client_event_id)
  WHERE client_event_id IS NOT NULL;

-- CREATE TABLE IF NOT EXISTS does not repair a pre-existing foreign key. Make
-- account deletion cascade on installations that have either a missing FK or
-- an older NO ACTION FK, without rewriting any event row.
DO $ensure_user_cascades$
DECLARE
  table_name TEXT;
  constraint_row RECORD;
  has_cascade BOOLEAN;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['analytics_events', 'retention_events']
  LOOP
    has_cascade := false;
    FOR constraint_row IN
      SELECT c.conname, c.confdeltype
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attrelid = c.conrelid
       AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = format('public.%I', table_name)::regclass
        AND c.contype = 'f'
        AND c.confrelid = 'auth.users'::regclass
        AND a.attname = 'user_id'
    LOOP
      IF constraint_row.confdeltype = 'c' THEN
        has_cascade := true;
      ELSE
        EXECUTE format(
          'ALTER TABLE public.%I DROP CONSTRAINT %I',
          table_name,
          constraint_row.conname
        );
      END IF;
    END LOOP;

    IF NOT has_cascade THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID',
        table_name,
        table_name || '_user_id_fkey'
      );
      EXECUTE format(
        'ALTER TABLE public.%I VALIDATE CONSTRAINT %I',
        table_name,
        table_name || '_user_id_fkey'
      );
    END IF;
  END LOOP;
END;
$ensure_user_cascades$;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics select own" ON public.analytics_events;
CREATE POLICY "analytics select own"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "analytics insert own" ON public.analytics_events;
CREATE POLICY "analytics insert own"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "retention events select own" ON public.retention_events;
CREATE POLICY "retention events select own"
  ON public.retention_events
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "retention events insert own" ON public.retention_events;
CREATE POLICY "retention events insert own"
  ON public.retention_events
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

REVOKE ALL ON public.analytics_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.retention_events FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT SELECT, INSERT ON public.retention_events TO authenticated;

-- Do not assume the sequence name when an existing installation used an
-- identity column. Grant sequence access only when PostgreSQL reports one.
DO $grant_sequences$
DECLARE
  sequence_name TEXT;
BEGIN
  sequence_name := pg_get_serial_sequence('public.analytics_events', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', sequence_name);
  END IF;

  sequence_name := pg_get_serial_sequence('public.retention_events', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', sequence_name);
  END IF;
END;
$grant_sequences$;

-- No aggregate view or RPC is created here. Cross-user reporting remains
-- available only to the project owner through the Supabase SQL Editor.

NOTIFY pgrst, 'reload schema';
