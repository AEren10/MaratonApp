-- Allow users to include their own analytics events in KVKK/GDPR export.
--
-- The original analytics table was intentionally insert-only for normal app
-- usage. The export flow later added analytics_events to the personal data
-- catalog, so authenticated users also need a narrow own-row SELECT path.

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

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

REVOKE ALL ON public.analytics_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO authenticated;
