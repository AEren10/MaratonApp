-- touch_streak: "column reference freeze_count is ambiguous".
-- plpgsql degiskeni ile streaks.freeze_count sutunu ayni adi tasiyordu;
-- UPDATE ... SET freeze_count = freeze_count hangisi oldugunu cozemiyordu.
-- Degisken v_ onekiyle yeniden adlandirildi; mantik aynen korunuyor.
CREATE OR REPLACE FUNCTION private.touch_streak(p_study_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  uid UUID := auth.uid();
  today_tr DATE := (now() AT TIME ZONE 'Europe/Istanbul')::date;
  d DATE;
  s RECORD;
  has_log BOOLEAN;
  new_streak INT;
  v_freeze_count INT;
  v_freeze_reset TIMESTAMPTZ;
  v_last_freeze TIMESTAMPTZ;
  used_freeze BOOLEAN := false;
  transition TEXT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  d := COALESCE(p_study_date, today_tr);
  IF d > today_tr THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'future_date');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.study_logs
     WHERE user_id = uid AND study_date = d
  ) INTO has_log;

  IF NOT has_log THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_study_log');
  END IF;

  SELECT * INTO s FROM public.streaks WHERE user_id = uid FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (uid, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO s FROM public.streaks WHERE user_id = uid FOR UPDATE;
  END IF;

  v_freeze_count := COALESCE(s.freeze_count, 0);
  v_freeze_reset := s.freeze_reset_at;
  v_last_freeze  := s.last_freeze_at;
  IF v_freeze_reset IS NULL OR v_freeze_reset <= now() THEN
    v_freeze_count := 1;
    v_freeze_reset := date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul')
                    + INTERVAL '7 days';
  END IF;

  IF s.last_study_date = d THEN
    new_streak := GREATEST(COALESCE(s.current_streak, 0), 1);
    transition := 'same_day';
  ELSIF s.last_study_date = d - 1 THEN
    new_streak := COALESCE(s.current_streak, 0) + 1;
    transition := 'continued';
  ELSIF s.last_study_date = d - 2 AND v_freeze_count > 0 THEN
    new_streak := COALESCE(s.current_streak, 0) + 1;
    v_freeze_count := v_freeze_count - 1;
    used_freeze := true;
    v_last_freeze := now();
    transition := 'freeze_used';
  ELSE
    new_streak := 1;
    transition := CASE WHEN COALESCE(s.current_streak, 0) > 1 THEN 'broken' ELSE 'started' END;
  END IF;

  IF s.last_study_date IS NOT NULL AND d < s.last_study_date THEN
    RETURN jsonb_build_object('ok', true, 'transition', 'stale',
      'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
      'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
      'freeze_reset_at', s.freeze_reset_at);
  END IF;

  UPDATE public.streaks AS st
     SET current_streak = new_streak,
         longest_streak = GREATEST(new_streak, COALESCE(st.longest_streak, 0)),
         last_study_date = d,
         freeze_count = v_freeze_count,
         freeze_reset_at = v_freeze_reset,
         last_freeze_at = v_last_freeze
   WHERE st.user_id = uid
   RETURNING * INTO s;

  RETURN jsonb_build_object(
    'ok', true, 'transition', transition, 'used_freeze', used_freeze,
    'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
    'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
    'freeze_reset_at', s.freeze_reset_at
  );
END;
$function$;
