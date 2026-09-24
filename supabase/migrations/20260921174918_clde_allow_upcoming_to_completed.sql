-- BULGU (2026-09-21, canli hata): Ana Sayfa'da "Bugünün Durakları"ndaki tike
-- basinca istemci konsolu
--   [Supabase:transitionRouteStop] invalid route stop transition
-- veriyordu (ERRCODE 22023).
--
-- SEBEP: izin verilen gecisler sunlardi
--   upcoming -> active | skipped | rescheduled
--   active   -> completed | skipped | rescheduled
--   skipped  -> rescheduled
-- 'upcoming -> completed' YOKTU. Ana Sayfa'daki tik ise durumu ne olursa
-- olsun dogrudan 'completed' gonderiyor (lib/studyPlanCompletion.js).
-- Kullanici bir duragi "baslat" demeden bitirdiginde -- ki Ana Sayfa'dan tek
-- dokunusla tamamlamak tam olarak bu -- gecis reddediliyordu.
--
-- KARAR: 'active' bir UI kolayligi, is kurali degil. Calisip bitirmis bir
-- kullaniciyi once "basla"ya basmadigi icin geri cevirmek yanlis. Gecis
-- ekleniyor. Diger kurallar AYNEN korunuyor (completed hala terminal:
-- tamamlanmis durak geri alinamaz, o ayri bir tasarim karari).
--
-- Fonksiyonun geri kalani 20260920020000_clde_route_stop_conflict_not_retryable
-- ile ayni; yalnizca v_allowed satiri degisti.
CREATE OR REPLACE FUNCTION public.transition_route_stop(
  p_stop_id uuid,
  p_transition text,
  p_expected_version bigint,
  p_client_operation_id uuid,
  p_occurred_at timestamptz DEFAULT now(),
  p_payload jsonb DEFAULT '{}'::jsonb
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
    (v_stop.lifecycle_status = 'upcoming' AND p_transition IN ('active','completed','skipped','rescheduled')) OR
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

  -- Siradaki duragi otomatik aktiflestirme. Artik 'upcoming'ten dogrudan
  -- bitirilen duraklar da zinciri ilerletiyor, yoksa Ana Sayfa'dan tik
  -- atildiginda sonraki durak hic aktiflesmezdi.
  IF v_from_status IN ('upcoming', 'active') AND p_transition IN ('completed', 'skipped', 'rescheduled') THEN
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
