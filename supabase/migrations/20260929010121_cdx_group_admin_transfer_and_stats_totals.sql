-- Group admin handoff and server-authoritative all-time stats.

DROP FUNCTION IF EXISTS public.transfer_group_admin(UUID, UUID);

CREATE OR REPLACE FUNCTION public.transfer_group_admin(
  p_group_id UUID,
  p_new_admin UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := (SELECT auth.uid());
  g RECORD;
  caller_role TEXT;
  target_role TEXT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF p_group_id IS NULL OR p_new_admin IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_request');
  END IF;
  IF uid = p_new_admin THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'cannot_transfer_to_self');
  END IF;

  SELECT * INTO g
    FROM public.groups
   WHERE id = p_group_id
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;

  SELECT role INTO caller_role
    FROM public.group_members
   WHERE group_id = p_group_id
     AND user_id = uid
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_member'); END IF;
  IF caller_role <> 'admin' THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_admin'); END IF;

  SELECT role INTO target_role
    FROM public.group_members
   WHERE group_id = p_group_id
     AND user_id = p_new_admin
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'new_admin_not_member'); END IF;

  UPDATE public.group_members
     SET role = CASE
       WHEN user_id = uid THEN 'member'
       WHEN user_id = p_new_admin THEN 'admin'
       ELSE role
     END
   WHERE group_id = p_group_id
     AND user_id IN (uid, p_new_admin);

  UPDATE public.groups
     SET created_by = p_new_admin,
         owner_id = p_new_admin
   WHERE id = p_group_id
   RETURNING * INTO g;

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'description', g.description,
    'code', g.code,
    'weekly_target', g.weekly_target,
    'created_by', g.created_by,
    'owner_id', g.owner_id,
    'created_at', g.created_at,
    'role', 'member'
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.transfer_group_admin(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_group_admin(UUID, UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.get_study_totals(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_study_totals(
  p_exam_type TEXT DEFAULT NULL,
  p_field TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := (SELECT auth.uid());
  normalized_exam TEXT := lower(btrim(coalesce(p_exam_type, '')));
  normalized_field TEXT := lower(btrim(coalesce(p_field, '')));
  result jsonb;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;

  WITH study_base AS (
    SELECT *
      FROM public.study_logs
     WHERE user_id = uid
  ),
  study_totals AS (
    SELECT
      COALESCE(sum(greatest(coalesce(question_count, 0), 0)), 0)::BIGINT AS total_questions,
      COALESCE(sum(greatest(coalesce(duration_minutes, 0), 0)), 0)::BIGINT AS total_minutes,
      count(DISTINCT study_date)::BIGINT AS active_days
    FROM study_base
  ),
  subject_rows AS (
    SELECT
      subject,
      COALESCE(sum(greatest(coalesce(question_count, 0), 0)), 0)::BIGINT AS questions,
      COALESCE(sum(greatest(coalesce(duration_minutes, 0), 0)), 0)::BIGINT AS minutes
    FROM study_base
    GROUP BY subject
    HAVING COALESCE(sum(greatest(coalesce(question_count, 0), 0)), 0) > 0
        OR COALESCE(sum(greatest(coalesce(duration_minutes, 0), 0)), 0) > 0
  ),
  week_rows AS (
    SELECT
      date_trunc('week', study_date::timestamp)::date AS week_start,
      COALESCE(sum(greatest(coalesce(question_count, 0), 0)), 0)::BIGINT AS questions,
      COALESCE(sum(greatest(coalesce(duration_minutes, 0), 0)), 0)::BIGINT AS minutes
    FROM study_base
    GROUP BY 1
  ),
  last_weeks AS (
    SELECT generate_series(
      date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date - interval '7 weeks',
      date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date,
      interval '1 week'
    )::date AS week_start
  ),
  scoped_trials AS (
    SELECT *
      FROM public.trials t
     WHERE t.user_id = uid
       AND (
         normalized_exam = ''
         OR CASE
           WHEN normalized_exam = 'lgs' THEN
             upper(t.exam_type) = 'LGS'
             OR (upper(t.exam_type) = 'BRANCH' AND lower(coalesce(t.branch_subject, '')) LIKE 'lgs_%')
           WHEN normalized_exam = 'tyt' THEN
             upper(t.exam_type) = 'TYT'
             OR (upper(t.exam_type) = 'BRANCH' AND lower(coalesce(t.branch_subject, '')) NOT LIKE 'lgs_%')
           WHEN normalized_exam = 'dil' THEN
             upper(t.exam_type) IN ('TYT', 'YDT')
             OR (upper(t.exam_type) = 'BRANCH' AND lower(coalesce(t.branch_subject, '')) NOT LIKE 'lgs_%')
           WHEN normalized_exam = 'tyt_ayt' THEN
             upper(t.exam_type) = 'TYT'
             OR upper(t.exam_type) = 'AYT'
             OR (normalized_field = 'sayisal' AND upper(t.exam_type) = 'AYT_SAY')
             OR (normalized_field = 'ea' AND upper(t.exam_type) = 'AYT_EA')
             OR (normalized_field = 'sozel' AND upper(t.exam_type) = 'AYT_SOZ')
             OR (normalized_field NOT IN ('sayisal', 'ea', 'sozel') AND upper(t.exam_type) IN ('AYT_SAY', 'AYT_EA', 'AYT_SOZ'))
             OR (upper(t.exam_type) = 'BRANCH' AND lower(coalesce(t.branch_subject, '')) NOT LIKE 'lgs_%')
           ELSE true
         END
       )
  ),
  best_net_rows AS (
    SELECT
      upper(exam_type) AS exam_type,
      max(coalesce(normalized_total_net, total_net))::numeric AS best_net
    FROM scoped_trials
    WHERE coalesce(normalized_total_net, total_net) IS NOT NULL
    GROUP BY upper(exam_type)
  )
  SELECT jsonb_build_object(
    'ok', true,
    'totalQuestions', NULLIF((SELECT total_questions FROM study_totals), 0),
    'totalMinutes', NULLIF((SELECT total_minutes FROM study_totals), 0),
    'activeDays', NULLIF((SELECT active_days FROM study_totals), 0),
    'subjects', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'subject', subject,
        'questions', questions,
        'minutes', minutes
      ) ORDER BY questions DESC, minutes DESC, subject)
      FROM subject_rows
    ), '[]'::jsonb),
    'bestWeek', (
      SELECT jsonb_build_object(
        'weekStart', week_start,
        'questions', questions,
        'minutes', minutes
      )
      FROM week_rows
      WHERE questions > 0 OR minutes > 0
      ORDER BY questions DESC, minutes DESC, week_start DESC
      LIMIT 1
    ),
    'weeklyTotals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'weekStart', lw.week_start,
        'questions', COALESCE(wr.questions, 0),
        'minutes', COALESCE(wr.minutes, 0)
      ) ORDER BY lw.week_start)
      FROM last_weeks lw
      LEFT JOIN week_rows wr ON wr.week_start = lw.week_start
    ), '[]'::jsonb),
    'trialCount', NULLIF((SELECT count(*) FROM scoped_trials), 0),
    'bestNetByType', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'examType', exam_type,
        'bestNet', best_net
      ) ORDER BY exam_type)
      FROM best_net_rows
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$fn$;

REVOKE ALL ON FUNCTION public.get_study_totals(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_study_totals(TEXT, TEXT) TO authenticated;
