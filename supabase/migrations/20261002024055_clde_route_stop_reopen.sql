-- DURAK TIKI GERI ALINABILIR (AYNI GUN)
-- Yanlislikla tiklenen durak geri acilamiyordu: completed terminaldi.
-- Artik completed -> upcoming yalniz bitirildigi gun (TR) icinde olur;
-- bitis zamani silinir, olay 'reopened' diye yazilir. Dunun duragi
-- gecmistir, geri acilmaz.
--
-- persist_route_revision eski durumu "en son bitmis/atlanmis satir"dan
-- aliyordu; geri acilan durak bir sonraki rota cizimde eski revizyondaki
-- 'completed' satirdan yeniden bitmis gelirdi. Artik ayni duragin EN SON
-- satirina bakilir, yalniz o satir bitmis/atlanmis/ertelenmisse tasinir.

CREATE OR REPLACE FUNCTION public.transition_route_stop(p_stop_id uuid, p_transition text, p_expected_version bigint, p_client_operation_id uuid, p_occurred_at timestamp with time zone DEFAULT now(), p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS SETOF route_stops
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user_id UUID := (select auth.uid());
  v_stop public.route_stops%ROWTYPE;
  v_existing_stop_id UUID;
  v_replacement_id UUID;
  v_promoted_id UUID;
  v_from_status TEXT;
  v_allowed BOOLEAN := false;
  v_reopen BOOLEAN := false;
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
    RAISE EXCEPTION 'route stop version conflict' USING ERRCODE = 'PT409';
  END IF;
  v_from_status := v_stop.lifecycle_status;

  v_reopen :=
    v_stop.lifecycle_status = 'completed' AND p_transition = 'upcoming'
    AND v_stop.completed_at IS NOT NULL
    AND (v_stop.completed_at AT TIME ZONE 'Europe/Istanbul')::date
        = (now() AT TIME ZONE 'Europe/Istanbul')::date;

  v_allowed := v_reopen OR
    (v_stop.lifecycle_status = 'upcoming' AND p_transition IN ('active','completed','skipped','rescheduled')) OR
    (v_stop.lifecycle_status = 'active' AND p_transition IN ('completed','skipped','rescheduled')) OR
    (v_stop.lifecycle_status = 'skipped' AND p_transition = 'rescheduled');
  IF NOT v_allowed THEN RAISE EXCEPTION 'invalid route stop transition' USING ERRCODE = '22023'; END IF;

  UPDATE public.route_stops SET
    lifecycle_status = p_transition,
    version = version + 1,
    status_changed_at = p_occurred_at,
    completed_at = CASE
      WHEN v_reopen THEN NULL
      WHEN p_transition = 'completed' THEN p_occurred_at
      ELSE completed_at END,
    skipped_at = CASE WHEN p_transition = 'skipped' THEN p_occurred_at ELSE skipped_at END,
    rescheduled_at = CASE WHEN p_transition = 'rescheduled' THEN p_occurred_at ELSE rescheduled_at END,
    updated_at = now()
  WHERE id = p_stop_id AND user_id = v_user_id
  RETURNING * INTO v_stop;

  INSERT INTO public.route_stop_events
    (user_id, stop_id, client_operation_id, event_type, from_status, to_status, payload, occurred_at)
  VALUES
    (v_user_id, p_stop_id, p_client_operation_id,
     CASE WHEN v_reopen THEN 'reopened' ELSE p_transition END,
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

  IF v_from_status IN ('upcoming', 'active')
     AND p_transition IN ('completed', 'skipped', 'rescheduled')
     AND NOT EXISTS (
       SELECT 1 FROM public.route_stops
        WHERE user_id = v_user_id AND revision_id = v_stop.revision_id
          AND lifecycle_status = 'active'
     )
  THEN
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
$function$;

CREATE OR REPLACE FUNCTION public.persist_route_revision(
  p_revision_key text, p_exam_type text, p_algorithm_version text, p_input_hash text, p_weeks jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id UUID := (select auth.uid());
  v_revision_id UUID;
  v_week JSONB;
  v_stop JSONB;
  v_lifecycle_status TEXT;
  v_prev_status TEXT;
  v_completed_at TIMESTAMPTZ;
  v_skipped_at TIMESTAMPTZ;
  v_rescheduled_at TIMESTAMPTZ;
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
    INSERT INTO public.route_weeks (
      user_id, week_start, planned_questions, planned_minutes, stops, exam_type, generated_at
    ) VALUES (
      v_user_id,
      (v_week->>'week_start')::date,
      greatest(0, coalesce((v_week->>'planned_questions')::integer, 0)),
      greatest(0, coalesce((v_week->>'planned_minutes')::integer, 0)),
      coalesce(v_week->'stops', '[]'::jsonb),
      p_exam_type,
      coalesce((v_week->>'generated_at')::timestamptz, now())
    )
    ON CONFLICT (user_id, exam_type, week_start) DO UPDATE SET
      planned_questions = EXCLUDED.planned_questions,
      planned_minutes = EXCLUDED.planned_minutes,
      stops = EXCLUDED.stops,
      generated_at = EXCLUDED.generated_at;

    FOR v_stop IN SELECT value FROM jsonb_array_elements(coalesce(v_week->'stops', '[]'::jsonb))
    LOOP
      IF coalesce(v_stop->>'logicalStopKey', '') = '' THEN CONTINUE; END IF;
      v_prev_status := NULL;
      v_completed_at := NULL;
      v_skipped_at := NULL;
      v_rescheduled_at := NULL;
      SELECT rs.lifecycle_status, rs.completed_at, rs.skipped_at, rs.rescheduled_at
        INTO v_prev_status, v_completed_at, v_skipped_at, v_rescheduled_at
        FROM public.route_stops rs
        JOIN public.route_revisions rr ON rr.id = rs.revision_id
       WHERE rs.user_id = v_user_id
         AND rs.logical_key = v_stop->>'logicalStopKey'
         AND (
           rr.exam_type = p_exam_type
           OR (rr.exam_type IS NULL AND p_exam_type IS NULL)
         )
       ORDER BY rs.updated_at DESC, rs.created_at DESC
       LIMIT 1;
      IF v_prev_status IS NULL OR v_prev_status NOT IN ('completed', 'rescheduled', 'skipped') THEN
        v_prev_status := NULL;
        v_completed_at := NULL;
        v_skipped_at := NULL;
        v_rescheduled_at := NULL;
      END IF;
      v_lifecycle_status := coalesce(v_prev_status,
        CASE WHEN v_stop->>'lifecycleStatus' IN ('completed','active','upcoming','rescheduled','skipped')
          THEN v_stop->>'lifecycleStatus' ELSE 'upcoming' END);
      INSERT INTO public.route_stops (
        user_id, revision_id, logical_key, root_key, week_start, position,
        segment_index, subject, subject_label, topic, stop_kind,
        lifecycle_status, metadata, completed_at, skipped_at, rescheduled_at
      ) VALUES (
        v_user_id, v_revision_id, v_stop->>'logicalStopKey',
        coalesce(v_stop->>'rootStopKey', v_stop->>'logicalStopKey'),
        (v_week->>'week_start')::date,
        greatest(0, coalesce((v_stop->>'position')::integer, 0)),
        greatest(0, coalesce((v_stop->>'segmentIndex')::integer, 0)),
        v_stop->>'subject', v_stop->>'subjectLabel', v_stop->>'topic',
        CASE WHEN coalesce((v_stop->>'isReview')::boolean, false) THEN 'review' ELSE 'learn' END,
        v_lifecycle_status,
        v_stop,
        v_completed_at, v_skipped_at, v_rescheduled_at
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
        END,
        completed_at = coalesce(public.route_stops.completed_at, EXCLUDED.completed_at),
        skipped_at = coalesce(public.route_stops.skipped_at, EXCLUDED.skipped_at),
        rescheduled_at = coalesce(public.route_stops.rescheduled_at, EXCLUDED.rescheduled_at);
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
$function$;
