-- Surum catismasi artik "tekrar dene" demiyor.
--
-- 40001 = serialization_failure: SQL dunyasinda "gecici catisma, ayni istegi
-- tekrar gonder" demek. PostgREST bu koda uyup istegi yeniden deniyordu. Ama
-- surum catismasi gecici DEGIL: istemcinin elindeki beklenen surum eskimis,
-- ayni surumle bin kere denese bin kere ayni cevabi alir.
--
-- Sonuc: PostgREST 19 gundur saniyede ~100 kez ayni cagriyi tekrarliyordu.
-- 302 milyon geri alinan islem, veritabani suresinin %98,7'si, ve Supabase'in
-- "kaynaklar tukeniyor" uyarisi.
--
-- PT409 -> PostgREST bunu dogrudan HTTP 409 Conflict'e cevirir ve TEKRAR
-- ETMEZ. Istemci taze surumu cekip yeniden denemeli; bu onun isi.

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
    RAISE EXCEPTION 'route stop version conflict' USING ERRCODE = 'PT409';
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
