DROP FUNCTION IF EXISTS public.get_study_totals();

CREATE OR REPLACE FUNCTION public.get_study_totals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  v_uid UUID := auth.uid();
  v_count INTEGER := 0;
  v_total_questions INTEGER := 0;
  v_total_minutes INTEGER := 0;
  v_active_days INTEGER := 0;
  v_subjects JSONB := NULL;
  v_best_week JSONB := NULL;
  v_last_8_weeks JSONB := NULL;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(COALESCE(question_count, 0)), 0)::INTEGER,
    COALESCE(SUM(COALESCE(duration_minutes, 0)), 0)::INTEGER,
    COUNT(DISTINCT study_date)::INTEGER
  INTO v_count, v_total_questions, v_total_minutes, v_active_days
  FROM public.study_logs
  WHERE user_id = v_uid;

  IF v_count = 0 THEN
    RETURN jsonb_build_object(
      'ok', true,
      'has_data', false,
      'total_questions', NULL,
      'total_minutes', NULL,
      'active_days', NULL,
      'subjects', NULL,
      'best_week', NULL,
      'last_8_weeks', NULL
    );
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.questions DESC, s.minutes DESC, s.subject ASC), '[]'::jsonb)
  INTO v_subjects
  FROM (
    SELECT
      subject,
      COALESCE(SUM(COALESCE(question_count, 0)), 0)::INTEGER AS questions,
      COALESCE(SUM(COALESCE(duration_minutes, 0)), 0)::INTEGER AS minutes
    FROM public.study_logs
    WHERE user_id = v_uid
    GROUP BY subject
  ) s;

  SELECT to_jsonb(w)
  INTO v_best_week
  FROM (
    SELECT
      date_trunc('week', study_date)::DATE AS week_start,
      COALESCE(SUM(COALESCE(question_count, 0)), 0)::INTEGER AS questions,
      COALESCE(SUM(COALESCE(duration_minutes, 0)), 0)::INTEGER AS minutes
    FROM public.study_logs
    WHERE user_id = v_uid AND study_date IS NOT NULL
    GROUP BY 1
    ORDER BY questions DESC, minutes DESC, week_start DESC
    LIMIT 1
  ) w;

  SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.week_start ASC), '[]'::jsonb)
  INTO v_last_8_weeks
  FROM (
    WITH weeks AS (
      SELECT generate_series(
        date_trunc('week', current_date)::DATE - INTERVAL '7 weeks',
        date_trunc('week', current_date)::DATE,
        INTERVAL '1 week'
      )::DATE AS week_start
    ), totals AS (
      SELECT
        date_trunc('week', study_date)::DATE AS week_start,
        COALESCE(SUM(COALESCE(question_count, 0)), 0)::INTEGER AS questions,
        COALESCE(SUM(COALESCE(duration_minutes, 0)), 0)::INTEGER AS minutes
      FROM public.study_logs
      WHERE user_id = v_uid AND study_date IS NOT NULL
      GROUP BY 1
    )
    SELECT
      weeks.week_start,
      COALESCE(totals.questions, 0)::INTEGER AS questions,
      COALESCE(totals.minutes, 0)::INTEGER AS minutes
    FROM weeks
    LEFT JOIN totals ON totals.week_start = weeks.week_start
  ) w;

  RETURN jsonb_build_object(
    'ok', true,
    'has_data', true,
    'total_questions', v_total_questions,
    'total_minutes', v_total_minutes,
    'active_days', v_active_days,
    'subjects', v_subjects,
    'best_week', v_best_week,
    'last_8_weeks', v_last_8_weeks
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.get_study_totals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_study_totals() TO authenticated;
