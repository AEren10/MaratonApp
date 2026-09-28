DROP FUNCTION IF EXISTS public.get_group_detail(UUID);

CREATE OR REPLACE FUNCTION public.get_group_detail(p_group_id UUID)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  ),
  group_row AS (
    SELECT g.*, gm.role AS my_role
      FROM public.groups g
      JOIN public.group_members gm ON gm.group_id = g.id AND gm.user_id = (SELECT auth.uid())
     WHERE g.id = p_group_id
  ),
  member_rows AS (
    SELECT
      gm.user_id,
      gm.role,
      gm.joined_at,
      p.name,
      p.avatar_url,
      COALESCE(sum(sl.question_count), 0)::BIGINT AS weekly_questions,
      COALESCE(sum(sl.duration_minutes), 0)::BIGINT AS weekly_minutes,
      false AS is_studying_now
    FROM public.group_members gm
    LEFT JOIN public.profiles p ON p.id = gm.user_id
    CROSS JOIN week_start ws
    LEFT JOIN public.study_logs sl
      ON sl.user_id = gm.user_id
     AND sl.study_date >= ws.day
    WHERE gm.group_id = p_group_id
    GROUP BY gm.user_id, gm.role, gm.joined_at, p.name, p.avatar_url
  ),
  ranked AS (
    SELECT
      *,
      row_number() OVER (ORDER BY weekly_questions DESC, joined_at ASC, user_id) AS rank
    FROM member_rows
  ),
  totals AS (
    SELECT
      COALESCE(sum(weekly_questions), 0)::BIGINT AS weekly_questions,
      COALESCE(sum(weekly_minutes), 0)::BIGINT AS weekly_minutes
    FROM member_rows
  )
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM group_row) THEN jsonb_build_object('ok', false, 'reason', 'not_member')
    ELSE jsonb_build_object(
      'ok', true,
      'group', (
        SELECT jsonb_build_object(
          'id', id,
          'name', name,
          'description', description,
          'code', code,
          'weekly_target', weekly_target,
          'created_by', created_by,
          'owner_id', owner_id,
          'created_at', created_at,
          'role', my_role,
          'weekly_questions', (SELECT weekly_questions FROM totals),
          'weekly_minutes', (SELECT weekly_minutes FROM totals),
          'member_count', (SELECT count(*) FROM member_rows)
        )
        FROM group_row
      ),
      'members', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'user_id', user_id,
          'name', name,
          'avatar_url', avatar_url,
          'role', role,
          'joined_at', joined_at,
          'weekly_questions', weekly_questions,
          'weekly_minutes', weekly_minutes,
          'rank', rank,
          'is_studying_now', is_studying_now,
          'you', user_id = (SELECT auth.uid())
        ) ORDER BY rank)
        FROM ranked
      ), '[]'::jsonb)
    )
  END;
$fn$;

DROP FUNCTION IF EXISTS public.get_group_leaderboard(UUID);

CREATE OR REPLACE FUNCTION public.get_group_leaderboard(group_uuid UUID)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  weekly_questions BIGINT,
  weekly_minutes BIGINT,
  rank BIGINT,
  you BOOLEAN,
  is_studying_now BOOLEAN
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  ),
  member_ids AS (
    SELECT gm.user_id
      FROM public.group_members gm
     WHERE gm.group_id = group_uuid
       AND private.is_group_member(group_uuid)
  ),
  weekly AS (
    SELECT
      ids.user_id,
      p.name,
      p.avatar_url,
      COALESCE(sum(sl.question_count), 0)::BIGINT AS weekly_questions,
      COALESCE(sum(sl.duration_minutes), 0)::BIGINT AS weekly_minutes,
      COALESCE(lw.trials, 0)::BIGINT AS trials,
      COALESCE(lw.weekly_xp, 0)::BIGINT AS weekly_xp
    FROM member_ids ids
    LEFT JOIN public.profiles p ON p.id = ids.user_id
    CROSS JOIN week_start ws
    LEFT JOIN public.study_logs sl
      ON sl.user_id = ids.user_id
     AND sl.study_date >= ws.day
    LEFT JOIN public.leaderboard_weekly lw ON lw.user_id = ids.user_id
    GROUP BY ids.user_id, p.name, p.avatar_url, lw.trials, lw.weekly_xp
  ),
  ranked AS (
    SELECT
      *,
      row_number() OVER (ORDER BY weekly_questions DESC, trials DESC, user_id) AS rank
    FROM weekly
  )
  SELECT
    ranked.user_id,
    ranked.name,
    ranked.avatar_url,
    ranked.weekly_questions AS questions,
    ranked.trials,
    ranked.weekly_xp,
    ranked.weekly_questions,
    ranked.weekly_minutes,
    ranked.rank,
    ranked.user_id = (SELECT auth.uid()) AS you,
    false AS is_studying_now
  FROM ranked
  ORDER BY ranked.rank;
$fn$;

REVOKE ALL ON FUNCTION public.get_group_detail(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_leaderboard(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(UUID) TO authenticated;
