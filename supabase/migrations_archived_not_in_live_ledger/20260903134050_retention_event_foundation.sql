-- Retention foundation for redesign-era behavioral state.
-- Keeps user-facing product nudges/paywall triggers auditable without mixing
-- them into broad analytics_events.

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

CREATE INDEX IF NOT EXISTS idx_retention_events_user_time
  ON public.retention_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_retention_events_event_time
  ON public.retention_events (event, occurred_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_retention_events_client_event_id
  ON public.retention_events (user_id, client_event_id)
  WHERE client_event_id IS NOT NULL;

ALTER TABLE public.retention_events ENABLE ROW LEVEL SECURITY;

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

REVOKE ALL ON public.retention_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.retention_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.retention_events_id_seq TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_study_session()
RETURNS INTEGER
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  UPDATE public.profiles
     SET study_session_count = COALESCE(study_session_count, 0) + 1
   WHERE id = (select auth.uid())
   RETURNING study_session_count;
$fn$;

REVOKE ALL ON FUNCTION public.increment_study_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_study_session() TO authenticated;

-- Remove the duplicate unique index introduced during idempotency hardening.
-- trial_subjects_trial_id_subject_key already enforces the same contract.
DROP INDEX IF EXISTS public.idx_trial_subjects_trial_subject_unique;

NOTIFY pgrst, 'reload schema';
