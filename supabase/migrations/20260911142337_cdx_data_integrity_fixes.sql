-- CDX data integrity fixes.
--
-- Scope:
-- - target/baseline net can be persisted after profile column-level grants
-- - plan_tasks has an explicit owner for offline queue/account isolation
-- - route week + revision persistence happens inside one RPC transaction
-- - private export-only data is exposed through a narrow RPC, not table grants
-- - missing foreign-key indexes from Supabase advisors

GRANT UPDATE (target_net, baseline_net) ON public.profiles TO authenticated;

ALTER TABLE public.plan_tasks
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.plan_tasks pt
   SET user_id = dp.user_id
  FROM public.daily_plans dp
 WHERE pt.plan_id = dp.id
   AND pt.user_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plan_tasks WHERE user_id IS NULL) THEN
    ALTER TABLE public.plan_tasks ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_plan_tasks_user_id_fk
  ON public.plan_tasks (user_id);

DROP POLICY IF EXISTS "Users can view own plan tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can insert own plan tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can update own plan tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can delete own plan tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.plan_tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.plan_tasks;

CREATE POLICY "Users can view own plan tasks" ON public.plan_tasks
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own plan tasks" ON public.plan_tasks
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own plan tasks" ON public.plan_tasks
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own plan tasks" ON public.plan_tasks
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_route_companionships_requested_by
  ON public.route_companionships (requested_by);
CREATE INDEX IF NOT EXISTS idx_route_companionships_user_high_id
  ON public.route_companionships (user_high_id);
CREATE INDEX IF NOT EXISTS idx_route_companionships_user_low_id
  ON public.route_companionships (user_low_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_revision_id
  ON public.route_stops (revision_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_predecessor_stop_id
  ON public.route_stops (predecessor_stop_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_replacement_stop_id
  ON public.route_stops (replacement_stop_id);
CREATE INDEX IF NOT EXISTS idx_trials_publisher_id
  ON public.trials (publisher_id);

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
    ON CONFLICT (user_id, week_start) DO UPDATE SET
      planned_questions = EXCLUDED.planned_questions,
      planned_minutes = EXCLUDED.planned_minutes,
      stops = EXCLUDED.stops,
      exam_type = EXCLUDED.exam_type,
      generated_at = EXCLUDED.generated_at;

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

REVOKE ALL ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  TO authenticated;

CREATE OR REPLACE FUNCTION private.get_private_export_data()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  RETURN jsonb_build_object(
    'user_entitlements',
      COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.updated_at DESC)
        FROM public.user_entitlements e
       WHERE e.user_id = v_user_id), '[]'::jsonb),
    'feature_usage_events',
      COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.created_at DESC)
        FROM public.feature_usage_events f
       WHERE f.user_id = v_user_id), '[]'::jsonb),
    'route_companionships',
      COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC)
        FROM public.route_companionships c
       WHERE v_user_id IN (c.user_low_id, c.user_high_id)), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_private_export_data()
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$ SELECT private.get_private_export_data(); $$;

REVOKE ALL ON FUNCTION private.get_private_export_data() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_private_export_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_private_export_data() TO authenticated;
