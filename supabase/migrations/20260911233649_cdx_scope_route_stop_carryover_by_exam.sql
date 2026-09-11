-- Scope carried-over route stop lifecycle state by revision exam type.
--
-- route_stops does not store exam_type directly; it inherits scope through
-- route_revisions. When a new revision is persisted, terminal lifecycle state
-- should be carried only from stops that belong to the same exam type. This is
-- defensive for legacy logical keys and future identity changes.

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
      v_lifecycle_status := CASE
        WHEN v_stop->>'lifecycleStatus' IN ('completed','active','upcoming','rescheduled','skipped')
          THEN v_stop->>'lifecycleStatus'
        ELSE 'upcoming'
      END;
      SELECT rs.lifecycle_status INTO v_lifecycle_status
        FROM public.route_stops rs
        JOIN public.route_revisions rr ON rr.id = rs.revision_id
       WHERE rs.user_id = v_user_id
         AND rs.logical_key = v_stop->>'logicalStopKey'
         AND rs.lifecycle_status IN ('completed', 'rescheduled', 'skipped')
         AND (
           rr.exam_type = p_exam_type
           OR (rr.exam_type IS NULL AND p_exam_type IS NULL)
         )
       ORDER BY rs.updated_at DESC
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

REVOKE ALL ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  TO authenticated;
