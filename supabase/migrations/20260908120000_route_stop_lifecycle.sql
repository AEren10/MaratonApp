-- Durable route lifecycle. Access overlays (locked/frozen) are deliberately
-- not persisted: entitlement and route pause derive them at read time.

CREATE TABLE IF NOT EXISTS public.route_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision_key TEXT NOT NULL,
  exam_type TEXT,
  algorithm_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, revision_key)
);

CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision_id UUID NOT NULL REFERENCES public.route_revisions(id) ON DELETE CASCADE,
  logical_key TEXT NOT NULL,
  root_key TEXT NOT NULL,
  week_start DATE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  segment_index INTEGER NOT NULL DEFAULT 0 CHECK (segment_index >= 0),
  subject TEXT NOT NULL,
  subject_label TEXT,
  topic TEXT NOT NULL,
  stop_kind TEXT NOT NULL DEFAULT 'learn' CHECK (stop_kind IN ('learn', 'review')),
  lifecycle_status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (lifecycle_status IN ('completed', 'active', 'upcoming', 'rescheduled', 'skipped')),
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  predecessor_stop_id UUID REFERENCES public.route_stops(id) ON DELETE SET NULL,
  replacement_stop_id UUID REFERENCES public.route_stops(id) ON DELETE SET NULL,
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  rescheduled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, revision_id, logical_key)
);

CREATE TABLE IF NOT EXISTS public.route_stop_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES public.route_stops(id) ON DELETE CASCADE,
  client_operation_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_operation_id)
);

CREATE INDEX IF NOT EXISTS idx_route_revisions_user_time
  ON public.route_revisions (user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_user_week
  ON public.route_stops (user_id, week_start, position);
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_stops_one_active_per_revision
  ON public.route_stops (user_id, revision_id)
  WHERE lifecycle_status = 'active';
CREATE INDEX IF NOT EXISTS idx_route_stop_events_stop_time
  ON public.route_stop_events (stop_id, occurred_at DESC);

ALTER TABLE public.route_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stop_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route revisions select own" ON public.route_revisions
  FOR SELECT TO authenticated USING (
    (select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route')
  );
CREATE POLICY "route stops select own" ON public.route_stops
  FOR SELECT TO authenticated USING (
    (select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route')
  );
CREATE POLICY "route stop events select own" ON public.route_stop_events
  FOR SELECT TO authenticated USING (
    (select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route')
  );

REVOKE ALL ON public.route_revisions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.route_stops FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.route_stop_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.route_revisions, public.route_stops, public.route_stop_events TO authenticated;

CREATE OR REPLACE FUNCTION public.persist_route_revision(
  p_revision_key TEXT,
  p_exam_type TEXT,
  p_algorithm_version TEXT,
  p_input_hash TEXT,
  p_weeks JSONB
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := (select auth.uid());
  v_revision_id UUID;
  v_week JSONB;
  v_stop JSONB;
  v_lifecycle_status TEXT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000'; END IF;
  IF NOT private.has_feature_access(v_user_id, 'route') THEN
    RAISE EXCEPTION 'route access required' USING ERRCODE = '42501';
  END IF;
  IF coalesce(p_revision_key, '') = '' OR jsonb_typeof(p_weeks) <> 'array' THEN
    RAISE EXCEPTION 'invalid route revision payload' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.route_revisions
    (user_id, revision_key, exam_type, algorithm_version, input_hash)
  VALUES
    (v_user_id, p_revision_key, p_exam_type, p_algorithm_version, p_input_hash)
  ON CONFLICT (user_id, revision_key) DO UPDATE SET generated_at = now()
  RETURNING id INTO v_revision_id;

  FOR v_week IN SELECT value FROM jsonb_array_elements(p_weeks)
  LOOP
    FOR v_stop IN SELECT value FROM jsonb_array_elements(coalesce(v_week->'stops', '[]'::jsonb))
    LOOP
      IF coalesce(v_stop->>'logicalStopKey', '') = '' THEN CONTINUE; END IF;
      v_lifecycle_status := CASE
        WHEN v_stop->>'lifecycleStatus' IN ('completed','active','upcoming','rescheduled','skipped')
          THEN v_stop->>'lifecycleStatus'
        ELSE 'upcoming'
      END;
      SELECT lifecycle_status INTO v_lifecycle_status
        FROM public.route_stops
       WHERE user_id = v_user_id
         AND logical_key = v_stop->>'logicalStopKey'
         AND lifecycle_status IN ('completed', 'rescheduled', 'skipped')
       ORDER BY updated_at DESC
       LIMIT 1;
      v_lifecycle_status := coalesce(v_lifecycle_status,
        CASE WHEN v_stop->>'lifecycleStatus' IN ('completed','active','upcoming','rescheduled','skipped')
          THEN v_stop->>'lifecycleStatus' ELSE 'upcoming' END);
      INSERT INTO public.route_stops (
        user_id, revision_id, logical_key, root_key, week_start, position,
        segment_index, subject, subject_label, topic, stop_kind,
        lifecycle_status, metadata
      ) VALUES (
        v_user_id, v_revision_id, v_stop->>'logicalStopKey',
        coalesce(v_stop->>'rootStopKey', v_stop->>'logicalStopKey'),
        (v_week->>'week_start')::date,
        greatest(0, coalesce((v_stop->>'position')::integer, 0)),
        greatest(0, coalesce((v_stop->>'segmentIndex')::integer, 0)),
        v_stop->>'subject', v_stop->>'subjectLabel', v_stop->>'topic',
        CASE WHEN coalesce((v_stop->>'isReview')::boolean, false) THEN 'review' ELSE 'learn' END,
        v_lifecycle_status,
        v_stop
      )
      ON CONFLICT (user_id, revision_id, logical_key) DO UPDATE SET
        week_start = EXCLUDED.week_start,
        position = EXCLUDED.position,
        metadata = EXCLUDED.metadata,
        updated_at = now(),
        lifecycle_status = CASE
          WHEN public.route_stops.lifecycle_status IN ('completed','rescheduled','skipped')
            THEN public.route_stops.lifecycle_status
          ELSE EXCLUDED.lifecycle_status
        END;
    END LOOP;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM public.route_stops
     WHERE user_id = v_user_id AND revision_id = v_revision_id AND lifecycle_status = 'active'
  ) THEN
    UPDATE public.route_stops
       SET lifecycle_status = 'active', updated_at = now()
     WHERE id = (
       SELECT id FROM public.route_stops
        WHERE user_id = v_user_id AND revision_id = v_revision_id AND lifecycle_status = 'upcoming'
        ORDER BY week_start, position
        LIMIT 1
     );
  END IF;
  RETURN v_revision_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_route_stop(
  p_stop_id UUID,
  p_transition TEXT,
  p_expected_version BIGINT,
  p_client_operation_id UUID,
  p_occurred_at TIMESTAMPTZ DEFAULT now(),
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS SETOF public.route_stops
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := (select auth.uid());
  v_stop public.route_stops%ROWTYPE;
  v_existing_stop_id UUID;
  v_replacement_id UUID;
  v_promoted_id UUID;
  v_from_status TEXT;
  v_allowed BOOLEAN := false;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000'; END IF;
  IF NOT private.has_feature_access(v_user_id, 'route') THEN
    RAISE EXCEPTION 'route access required' USING ERRCODE = '42501';
  END IF;
  IF p_client_operation_id IS NULL THEN RAISE EXCEPTION 'client operation id required' USING ERRCODE = '22023'; END IF;

  SELECT stop_id INTO v_existing_stop_id FROM public.route_stop_events
   WHERE user_id = v_user_id AND client_operation_id = p_client_operation_id;
  IF v_existing_stop_id IS NOT NULL THEN
    RETURN QUERY SELECT * FROM public.route_stops WHERE id = v_existing_stop_id AND user_id = v_user_id;
    RETURN;
  END IF;

  SELECT * INTO v_stop FROM public.route_stops
   WHERE id = p_stop_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'route stop not found' USING ERRCODE = 'P0002'; END IF;
  IF p_expected_version IS NULL OR v_stop.version <> p_expected_version THEN
    RAISE EXCEPTION 'route stop version conflict' USING ERRCODE = '40001';
  END IF;
  v_from_status := v_stop.lifecycle_status;

  v_allowed :=
    (v_stop.lifecycle_status = 'upcoming' AND p_transition IN ('active','skipped','rescheduled')) OR
    (v_stop.lifecycle_status = 'active' AND p_transition IN ('completed','skipped','rescheduled')) OR
    (v_stop.lifecycle_status = 'skipped' AND p_transition = 'rescheduled');
  IF NOT v_allowed THEN RAISE EXCEPTION 'invalid route stop transition' USING ERRCODE = '22023'; END IF;

  UPDATE public.route_stops SET
    lifecycle_status = p_transition,
    version = version + 1,
    status_changed_at = p_occurred_at,
    completed_at = CASE WHEN p_transition = 'completed' THEN p_occurred_at ELSE completed_at END,
    skipped_at = CASE WHEN p_transition = 'skipped' THEN p_occurred_at ELSE skipped_at END,
    rescheduled_at = CASE WHEN p_transition = 'rescheduled' THEN p_occurred_at ELSE rescheduled_at END,
    updated_at = now()
  WHERE id = p_stop_id AND user_id = v_user_id
  RETURNING * INTO v_stop;

  INSERT INTO public.route_stop_events
    (user_id, stop_id, client_operation_id, event_type, from_status, to_status, payload, occurred_at)
  VALUES
    (v_user_id, p_stop_id, p_client_operation_id, p_transition,
     v_from_status,
     p_transition, coalesce(p_payload, '{}'::jsonb), p_occurred_at);

  IF p_transition = 'rescheduled' THEN
    INSERT INTO public.route_stops (
      user_id, revision_id, logical_key, root_key, week_start, position,
      segment_index, subject, subject_label, topic, stop_kind,
      lifecycle_status, predecessor_stop_id, metadata
    ) VALUES (
      v_user_id, v_stop.revision_id,
      v_stop.logical_key || ':r:' || replace(p_client_operation_id::text, '-', ''),
      v_stop.root_key,
      COALESCE((p_payload->>'weekStart')::date, v_stop.week_start + 7),
      v_stop.position, v_stop.segment_index, v_stop.subject,
      v_stop.subject_label, v_stop.topic, v_stop.stop_kind,
      'upcoming', v_stop.id, v_stop.metadata || coalesce(p_payload, '{}'::jsonb)
    ) RETURNING id INTO v_replacement_id;
    UPDATE public.route_stops
       SET replacement_stop_id = v_replacement_id, updated_at = now()
     WHERE id = v_stop.id;
  END IF;

  IF v_from_status = 'active' AND p_transition IN ('completed', 'skipped', 'rescheduled') THEN
    UPDATE public.route_stops
       SET lifecycle_status = 'active', version = version + 1,
           status_changed_at = p_occurred_at, updated_at = now()
     WHERE id = (
       SELECT id FROM public.route_stops
        WHERE user_id = v_user_id AND revision_id = v_stop.revision_id
          AND lifecycle_status = 'upcoming'
        ORDER BY week_start, position, created_at
        LIMIT 1
     )
    RETURNING id INTO v_promoted_id;
    IF v_promoted_id IS NOT NULL THEN
      INSERT INTO public.route_stop_events (
        user_id, stop_id, client_operation_id, event_type,
        from_status, to_status, payload, occurred_at
      ) VALUES (
        v_user_id, v_promoted_id, gen_random_uuid(), 'auto_activated',
        'upcoming', 'active', jsonb_build_object('afterStopId', v_stop.id), p_occurred_at
      );
    END IF;
  END IF;

  SELECT * INTO v_stop FROM public.route_stops WHERE id = p_stop_id;

  RETURN NEXT v_stop;
END;
$$;

REVOKE ALL ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  TO authenticated;
REVOKE ALL ON FUNCTION public.transition_route_stop(UUID, TEXT, BIGINT, UUID, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_route_stop(UUID, TEXT, BIGINT, UUID, TIMESTAMPTZ, JSONB)
  TO authenticated;
