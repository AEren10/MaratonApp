-- Make every social ranking use the effort metric shown in the UI:
-- weekly questions, then weekly study minutes, then weekly trials.
-- XP remains a tier/progression value and never decides row order.

ALTER TABLE public.leaderboard_weekly_entries
  ADD COLUMN IF NOT EXISTS weekly_minutes BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_entries_week_effort
  ON public.leaderboard_weekly_entries (
    week_start,
    questions DESC,
    weekly_minutes DESC,
    trials DESC,
    user_id
  );

CREATE OR REPLACE FUNCTION private.rebuild_leaderboard_weekly_entry(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_week_start DATE := date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date;
  v_week_start_at TIMESTAMPTZ := (v_week_start::timestamp AT TIME ZONE 'Europe/Istanbul');
  v_name TEXT;
  v_avatar_url TEXT;
  v_show BOOLEAN;
  v_questions BIGINT;
  v_weekly_minutes BIGINT;
  v_trials BIGINT;
  v_weekly_xp BIGINT;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT p.name, p.avatar_url, COALESCE(p.show_in_leaderboard, true)
    INTO v_name, v_avatar_url, v_show
  FROM public.profiles p
  WHERE p.id = target_user_id;

  IF NOT FOUND OR v_show IS NOT TRUE THEN
    DELETE FROM public.leaderboard_weekly_entries WHERE user_id = target_user_id;
    RETURN;
  END IF;

  SELECT
    COALESCE(SUM(s.question_count), 0)::BIGINT,
    COALESCE(SUM(s.duration_minutes), 0)::BIGINT
    INTO v_questions, v_weekly_minutes
  FROM public.study_logs s
  WHERE s.user_id = target_user_id
    AND s.study_date >= v_week_start
    AND s.study_date < v_week_start + 7;

  SELECT COUNT(*)::BIGINT
    INTO v_trials
  FROM public.trials t
  WHERE t.user_id = target_user_id
    AND t.trial_date >= v_week_start
    AND t.trial_date < v_week_start + 7;

  SELECT COALESCE(SUM(x.amount), 0)::BIGINT
    INTO v_weekly_xp
  FROM public.xp_events x
  WHERE x.user_id = target_user_id
    AND x.created_at >= v_week_start_at
    AND x.created_at < v_week_start_at + interval '7 days';

  INSERT INTO public.leaderboard_weekly_entries (
    user_id,
    week_start,
    name,
    avatar_url,
    questions,
    trials,
    weekly_xp,
    weekly_minutes,
    updated_at
  )
  VALUES (
    target_user_id,
    v_week_start,
    COALESCE(v_name, ''),
    v_avatar_url,
    COALESCE(v_questions, 0),
    COALESCE(v_trials, 0),
    COALESCE(v_weekly_xp, 0),
    COALESCE(v_weekly_minutes, 0),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    week_start = EXCLUDED.week_start,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    questions = EXCLUDED.questions,
    trials = EXCLUDED.trials,
    weekly_xp = EXCLUDED.weekly_xp,
    weekly_minutes = EXCLUDED.weekly_minutes,
    updated_at = EXCLUDED.updated_at;
END;
$fn$;

REVOKE ALL ON FUNCTION private.rebuild_leaderboard_weekly_entry(UUID)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE VIEW public.leaderboard_weekly
WITH (security_invoker = true)
AS
SELECT
  p.id AS user_id,
  p.name,
  p.avatar_url,
  COALESCE(e.questions, 0::BIGINT) AS questions,
  COALESCE(e.trials, 0::BIGINT) AS trials,
  COALESCE(e.weekly_xp, 0::BIGINT) AS weekly_xp,
  COALESCE(e.weekly_minutes, 0::BIGINT) AS weekly_minutes
FROM public.profiles p
LEFT JOIN public.leaderboard_weekly_entries e
  ON e.user_id = p.id
  AND e.week_start = date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date
WHERE COALESCE(p.show_in_leaderboard, true) = true;

REVOKE ALL ON public.leaderboard_weekly FROM PUBLIC, anon;
GRANT SELECT ON public.leaderboard_weekly TO authenticated;

DROP FUNCTION IF EXISTS public.get_global_leaderboard(INTEGER);

CREATE FUNCTION public.get_global_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  weekly_minutes BIGINT,
  rank BIGINT,
  you BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  WITH safe_limit AS (
    SELECT LEAST(GREATEST(COALESCE(limit_count, 50), 1), 100) AS n
  ),
  ranked AS (
    SELECT
      lw.*,
      ROW_NUMBER() OVER (
        ORDER BY lw.questions DESC, lw.weekly_minutes DESC, lw.trials DESC, lw.user_id
      ) AS rank
    FROM public.leaderboard_weekly lw
  )
  SELECT
    ranked.user_id,
    ranked.name,
    ranked.avatar_url,
    ranked.questions,
    ranked.trials,
    ranked.weekly_xp,
    ranked.weekly_minutes,
    ranked.rank,
    ranked.user_id = (SELECT auth.uid()) AS you
  FROM ranked, safe_limit
  WHERE ranked.rank <= safe_limit.n
     OR ranked.user_id = (SELECT auth.uid())
  ORDER BY ranked.rank;
$fn$;

DROP FUNCTION IF EXISTS public.get_friends_leaderboard();

CREATE FUNCTION public.get_friends_leaderboard()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  weekly_minutes BIGINT,
  rank BIGINT,
  you BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  WITH friend_ids AS (
    SELECT (SELECT auth.uid()) AS user_id
    UNION
    SELECT CASE
      WHEN f.requester_id = (SELECT auth.uid()) THEN f.addressee_id
      ELSE f.requester_id
    END AS user_id
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (
        f.requester_id = (SELECT auth.uid())
        OR f.addressee_id = (SELECT auth.uid())
      )
  ),
  ranked AS (
    SELECT
      lw.*,
      ROW_NUMBER() OVER (
        ORDER BY lw.questions DESC, lw.weekly_minutes DESC, lw.trials DESC, lw.user_id
      ) AS rank
    FROM public.leaderboard_weekly lw
    JOIN friend_ids ids ON ids.user_id = lw.user_id
  )
  SELECT
    ranked.user_id,
    ranked.name,
    ranked.avatar_url,
    ranked.questions,
    ranked.trials,
    ranked.weekly_xp,
    ranked.weekly_minutes,
    ranked.rank,
    ranked.user_id = (SELECT auth.uid()) AS you
  FROM ranked
  ORDER BY ranked.rank;
$fn$;

DROP FUNCTION IF EXISTS public.get_group_detail(UUID);

CREATE FUNCTION public.get_group_detail(p_group_id UUID)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH group_row AS (
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
      lw.name,
      lw.avatar_url,
      lw.questions AS weekly_questions,
      lw.weekly_minutes,
      lw.trials,
      false AS is_studying_now
    FROM public.group_members gm
    JOIN public.leaderboard_weekly lw ON lw.user_id = gm.user_id
    WHERE gm.group_id = p_group_id
  ),
  ranked AS (
    SELECT
      *,
      ROW_NUMBER() OVER (
        ORDER BY weekly_questions DESC, weekly_minutes DESC, trials DESC, user_id
      ) AS rank
    FROM member_rows
  ),
  totals AS (
    SELECT
      COALESCE(SUM(weekly_questions), 0)::BIGINT AS weekly_questions,
      COALESCE(SUM(weekly_minutes), 0)::BIGINT AS weekly_minutes
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
          'member_count', (
            SELECT COUNT(*) FROM public.group_members member_count
             WHERE member_count.group_id = p_group_id
          )
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
          'trials', trials,
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

CREATE FUNCTION public.get_group_leaderboard(group_uuid UUID)
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
  WITH member_rows AS (
    SELECT
      gm.user_id,
      lw.name,
      lw.avatar_url,
      lw.questions AS weekly_questions,
      lw.weekly_minutes,
      lw.trials,
      lw.weekly_xp
      FROM public.group_members gm
      JOIN public.leaderboard_weekly lw ON lw.user_id = gm.user_id
     WHERE gm.group_id = group_uuid
       AND private.is_group_member(group_uuid)
  ),
  ranked AS (
    SELECT
      *,
      ROW_NUMBER() OVER (
        ORDER BY weekly_questions DESC, weekly_minutes DESC, trials DESC, user_id
      ) AS rank
    FROM member_rows
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

DROP FUNCTION IF EXISTS public.get_my_groups();

CREATE FUNCTION public.get_my_groups()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  code TEXT,
  weekly_target INTEGER,
  created_by UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ,
  role TEXT,
  member_count BIGINT,
  weekly_questions BIGINT,
  user_rank BIGINT,
  member_preview JSONB
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH my_groups AS (
    SELECT g.*, gm.role
      FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
     WHERE gm.user_id = (SELECT auth.uid())
  ),
  member_week AS (
    SELECT
      gm.group_id,
      gm.user_id,
      lw.questions AS weekly_questions,
      lw.weekly_minutes,
      lw.trials
    FROM public.group_members gm
    JOIN my_groups mg ON mg.id = gm.group_id
    JOIN public.leaderboard_weekly lw ON lw.user_id = gm.user_id
  ),
  ranked AS (
    SELECT
      group_id,
      user_id,
      ROW_NUMBER() OVER (
        PARTITION BY group_id
        ORDER BY weekly_questions DESC, weekly_minutes DESC, trials DESC, user_id
      ) AS rank
    FROM member_week
  )
  SELECT
    g.id,
    g.name,
    g.description,
    g.code,
    g.weekly_target,
    g.created_by,
    g.owner_id,
    g.created_at,
    g.role,
    (SELECT COUNT(*) FROM public.group_members m WHERE m.group_id = g.id) AS member_count,
    COALESCE((
      SELECT SUM(mw.weekly_questions)
        FROM member_week mw
       WHERE mw.group_id = g.id
    ), 0)::BIGINT AS weekly_questions,
    (
      SELECT r.rank
        FROM ranked r
       WHERE r.group_id = g.id
         AND r.user_id = (SELECT auth.uid())
    ) AS user_rank,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'user_id', preview.user_id,
        'name', preview.name,
        'avatar_url', preview.avatar_url,
        'rank', preview.rank
      ) ORDER BY preview.rank)
      FROM (
        SELECT
          r.user_id,
          p.name,
          p.avatar_url,
          r.rank
        FROM ranked r
        LEFT JOIN public.profiles p ON p.id = r.user_id
        WHERE r.group_id = g.id
        ORDER BY r.rank
        LIMIT 4
      ) preview
    ), '[]'::jsonb) AS member_preview
  FROM my_groups g
  ORDER BY g.created_at DESC;
$fn$;

REVOKE ALL ON FUNCTION public.get_global_leaderboard(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_friends_leaderboard() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_detail(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_leaderboard(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_groups() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_global_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_groups() TO authenticated;

-- Existing rows receive the new minute total in one set-based pass; future
-- writes continue to use the already-installed study/trial/xp/profile triggers.
WITH bounds AS (
  SELECT
    date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS week_start,
    (
      date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date::timestamp
      AT TIME ZONE 'Europe/Istanbul'
    ) AS week_start_at
),
study AS (
  SELECT
    s.user_id,
    COALESCE(SUM(s.question_count), 0)::BIGINT AS questions,
    COALESCE(SUM(s.duration_minutes), 0)::BIGINT AS weekly_minutes
  FROM public.study_logs s
  CROSS JOIN bounds b
  WHERE s.study_date >= b.week_start
    AND s.study_date < b.week_start + 7
  GROUP BY s.user_id
),
trial_counts AS (
  SELECT t.user_id, COUNT(*)::BIGINT AS trials
  FROM public.trials t
  CROSS JOIN bounds b
  WHERE t.trial_date >= b.week_start
    AND t.trial_date < b.week_start + 7
  GROUP BY t.user_id
),
xp AS (
  SELECT x.user_id, COALESCE(SUM(x.amount), 0)::BIGINT AS weekly_xp
  FROM public.xp_events x
  CROSS JOIN bounds b
  WHERE x.created_at >= b.week_start_at
    AND x.created_at < b.week_start_at + interval '7 days'
  GROUP BY x.user_id
)
INSERT INTO public.leaderboard_weekly_entries (
  user_id,
  week_start,
  name,
  avatar_url,
  questions,
  trials,
  weekly_xp,
  weekly_minutes,
  updated_at
)
SELECT
  p.id,
  b.week_start,
  COALESCE(p.name, ''),
  p.avatar_url,
  COALESCE(s.questions, 0),
  COALESCE(t.trials, 0),
  COALESCE(x.weekly_xp, 0),
  COALESCE(s.weekly_minutes, 0),
  now()
FROM public.profiles p
CROSS JOIN bounds b
LEFT JOIN study s ON s.user_id = p.id
LEFT JOIN trial_counts t ON t.user_id = p.id
LEFT JOIN xp x ON x.user_id = p.id
WHERE COALESCE(p.show_in_leaderboard, true) = true
ON CONFLICT (user_id) DO UPDATE SET
  week_start = EXCLUDED.week_start,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  questions = EXCLUDED.questions,
  trials = EXCLUDED.trials,
  weekly_xp = EXCLUDED.weekly_xp,
  weekly_minutes = EXCLUDED.weekly_minutes,
  updated_at = EXCLUDED.updated_at;

DELETE FROM public.leaderboard_weekly_entries e
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles p
  WHERE p.id = e.user_id
    AND COALESCE(p.show_in_leaderboard, true) = true
);
