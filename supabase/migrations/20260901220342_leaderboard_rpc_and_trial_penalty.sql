-- Leaderboard and trial penalty hardening.
-- The goal is to remove the SECURITY DEFINER leaderboard view without opening
-- raw study/trial/xp rows to other users, and to make trial subject net scores
-- respect LGS' 1/3 wrong-answer penalty at the database layer.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Public leaderboard projection
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard_weekly_entries (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  questions BIGINT NOT NULL DEFAULT 0,
  trials BIGINT NOT NULL DEFAULT 0,
  weekly_xp BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_weekly_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard entries select authenticated" ON public.leaderboard_weekly_entries;
CREATE POLICY "leaderboard entries select authenticated"
  ON public.leaderboard_weekly_entries
  FOR SELECT
  TO authenticated
  USING (true);

REVOKE ALL ON public.leaderboard_weekly_entries FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.leaderboard_weekly_entries TO authenticated;

CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_entries_week_score
  ON public.leaderboard_weekly_entries (week_start, weekly_xp DESC, questions DESC);

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

  SELECT COALESCE(SUM(s.question_count), 0)::BIGINT
    INTO v_questions
  FROM public.study_logs s
  WHERE s.user_id = target_user_id
    AND s.study_date >= v_week_start;

  SELECT COUNT(*)::BIGINT
    INTO v_trials
  FROM public.trials t
  WHERE t.user_id = target_user_id
    AND t.trial_date >= v_week_start;

  SELECT COALESCE(SUM(x.amount), 0)::BIGINT
    INTO v_weekly_xp
  FROM public.xp_events x
  WHERE x.user_id = target_user_id
    AND x.created_at >= v_week_start_at;

  INSERT INTO public.leaderboard_weekly_entries (
    user_id,
    week_start,
    name,
    avatar_url,
    questions,
    trials,
    weekly_xp,
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
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    week_start = EXCLUDED.week_start,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    questions = EXCLUDED.questions,
    trials = EXCLUDED.trials,
    weekly_xp = EXCLUDED.weekly_xp,
    updated_at = EXCLUDED.updated_at;
END;
$fn$;

REVOKE ALL ON FUNCTION private.rebuild_leaderboard_weekly_entry(UUID)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.sync_leaderboard_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.leaderboard_weekly_entries WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM private.rebuild_leaderboard_weekly_entry(NEW.id);
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION private.sync_leaderboard_from_user_fact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM private.rebuild_leaderboard_weekly_entry(OLD.user_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    PERFORM private.rebuild_leaderboard_weekly_entry(OLD.user_id);
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      PERFORM private.rebuild_leaderboard_weekly_entry(NEW.user_id);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM private.rebuild_leaderboard_weekly_entry(NEW.user_id);
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$fn$;

REVOKE ALL ON FUNCTION private.sync_leaderboard_from_profile()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.sync_leaderboard_from_user_fact()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_leaderboard_profiles ON public.profiles;
CREATE TRIGGER trg_sync_leaderboard_profiles
  AFTER INSERT OR UPDATE OF name, avatar_url, show_in_leaderboard OR DELETE
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_leaderboard_from_profile();

DROP TRIGGER IF EXISTS trg_sync_leaderboard_study_logs ON public.study_logs;
CREATE TRIGGER trg_sync_leaderboard_study_logs
  AFTER INSERT OR UPDATE OR DELETE
  ON public.study_logs
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_leaderboard_from_user_fact();

DROP TRIGGER IF EXISTS trg_sync_leaderboard_trials ON public.trials;
CREATE TRIGGER trg_sync_leaderboard_trials
  AFTER INSERT OR UPDATE OR DELETE
  ON public.trials
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_leaderboard_from_user_fact();

DROP TRIGGER IF EXISTS trg_sync_leaderboard_xp_events ON public.xp_events;
CREATE TRIGGER trg_sync_leaderboard_xp_events
  AFTER INSERT OR UPDATE OR DELETE
  ON public.xp_events
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_leaderboard_from_user_fact();

DO $$
DECLARE
  profile_row RECORD;
BEGIN
  FOR profile_row IN SELECT id FROM public.profiles LOOP
    PERFORM private.rebuild_leaderboard_weekly_entry(profile_row.id);
  END LOOP;
END $$;

CREATE OR REPLACE VIEW public.leaderboard_weekly
WITH (security_invoker = true)
AS
SELECT
  p.id AS user_id,
  p.name,
  p.avatar_url,
  COALESCE(e.questions, 0::BIGINT) AS questions,
  COALESCE(e.trials, 0::BIGINT) AS trials,
  COALESCE(e.weekly_xp, 0::BIGINT) AS weekly_xp
FROM public.profiles p
LEFT JOIN public.leaderboard_weekly_entries e
  ON e.user_id = p.id
  AND e.week_start = date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date
WHERE COALESCE(p.show_in_leaderboard, true) = true;

REVOKE ALL ON public.leaderboard_weekly FROM PUBLIC, anon;
GRANT SELECT ON public.leaderboard_weekly TO authenticated;

CREATE OR REPLACE FUNCTION public.get_global_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
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
      lw.user_id,
      lw.name,
      lw.avatar_url,
      lw.questions,
      lw.trials,
      lw.weekly_xp,
      ROW_NUMBER() OVER (
        ORDER BY lw.weekly_xp DESC, lw.questions DESC, lw.trials DESC, lw.user_id
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
    ranked.rank,
    ranked.user_id = (select auth.uid()) AS you
  FROM ranked, safe_limit
  WHERE ranked.rank <= safe_limit.n
     OR ranked.user_id = (select auth.uid())
  ORDER BY ranked.rank;
$fn$;

CREATE OR REPLACE FUNCTION public.get_friends_leaderboard()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  rank BIGINT,
  you BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  WITH friend_ids AS (
    SELECT (select auth.uid()) AS user_id
    UNION
    SELECT CASE
      WHEN f.requester_id = (select auth.uid()) THEN f.addressee_id
      ELSE f.requester_id
    END AS user_id
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = (select auth.uid())) OR (f.addressee_id = (select auth.uid())))
  ),
  ranked AS (
    SELECT
      lw.user_id,
      lw.name,
      lw.avatar_url,
      lw.questions,
      lw.trials,
      lw.weekly_xp,
      ROW_NUMBER() OVER (
        ORDER BY lw.weekly_xp DESC, lw.questions DESC, lw.trials DESC, lw.user_id
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
    ranked.rank,
    ranked.user_id = (select auth.uid()) AS you
  FROM ranked
  ORDER BY ranked.rank;
$fn$;

CREATE OR REPLACE FUNCTION public.get_group_leaderboard(group_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  rank BIGINT,
  you BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  WITH member_ids AS (
    SELECT gm.user_id
    FROM public.group_members gm
    WHERE gm.group_id = group_uuid
  ),
  ranked AS (
    SELECT
      lw.user_id,
      lw.name,
      lw.avatar_url,
      lw.questions,
      lw.trials,
      lw.weekly_xp,
      ROW_NUMBER() OVER (
        ORDER BY lw.weekly_xp DESC, lw.questions DESC, lw.trials DESC, lw.user_id
      ) AS rank
    FROM public.leaderboard_weekly lw
    JOIN member_ids ids ON ids.user_id = lw.user_id
  )
  SELECT
    ranked.user_id,
    ranked.name,
    ranked.avatar_url,
    ranked.questions,
    ranked.trials,
    ranked.weekly_xp,
    ranked.rank,
    ranked.user_id = (select auth.uid()) AS you
  FROM ranked
  ORDER BY ranked.rank;
$fn$;

REVOKE ALL ON FUNCTION public.get_global_leaderboard(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_friends_leaderboard() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_leaderboard(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_global_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Trial net penalty
-- ---------------------------------------------------------------------------
ALTER TABLE public.trial_subjects
  ADD COLUMN IF NOT EXISTS wrong_penalty NUMERIC;

UPDATE public.trial_subjects ts
SET wrong_penalty = CASE
  WHEN t.exam_type = 'LGS' THEN (1.0 / 3.0)
  ELSE 0.25
END
FROM public.trials t
WHERE t.id = ts.trial_id
  AND ts.wrong_penalty IS NULL;

UPDATE public.trial_subjects
SET wrong_penalty = 0.25
WHERE wrong_penalty IS NULL;

ALTER TABLE public.trial_subjects
  ALTER COLUMN wrong_penalty SET DEFAULT 0.25,
  ALTER COLUMN wrong_penalty SET NOT NULL;

ALTER TABLE public.trial_subjects
  DROP CONSTRAINT IF EXISTS trial_subjects_wrong_penalty_check;

ALTER TABLE public.trial_subjects
  ADD CONSTRAINT trial_subjects_wrong_penalty_check
  CHECK (wrong_penalty > 0 AND wrong_penalty <= 1);

DROP FUNCTION IF EXISTS public.my_percentiles();
DROP FUNCTION IF EXISTS public.refresh_percentiles();
DROP MATERIALIZED VIEW IF EXISTS public.subject_percentile;

ALTER TABLE public.trial_subjects DROP COLUMN IF EXISTS net;
ALTER TABLE public.trial_subjects
  ADD COLUMN net NUMERIC GENERATED ALWAYS AS (
    COALESCE(correct_count, 0)::NUMERIC - (COALESCE(wrong_count, 0)::NUMERIC * wrong_penalty)
  ) STORED;

CREATE MATERIALIZED VIEW public.subject_percentile AS
WITH user_subject AS (
  SELECT
    t.user_id,
    ts.subject,
    AVG(ts.net) AS avg_net,
    COUNT(*) AS n
  FROM public.trial_subjects ts
  JOIN public.trials t ON t.id = ts.trial_id
  GROUP BY t.user_id, ts.subject
)
SELECT
  us.user_id,
  us.subject,
  ROUND(us.avg_net, 2) AS avg_net,
  ROUND(
    100.0 * (
      (SELECT COUNT(*) FROM user_subject u2 WHERE u2.subject = us.subject AND u2.avg_net < us.avg_net)::NUMERIC
      / NULLIF((SELECT COUNT(*) FROM user_subject u3 WHERE u3.subject = us.subject), 0)::NUMERIC
    )
  )::INTEGER AS percentile
FROM user_subject us;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subject_percentile_pk
  ON public.subject_percentile (user_id, subject);

REVOKE ALL ON public.subject_percentile FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.my_percentiles()
RETURNS TABLE(subject TEXT, avg_net NUMERIC, percentile INTEGER)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
  SELECT sp.subject, sp.avg_net, sp.percentile
  FROM public.subject_percentile sp
  WHERE sp.user_id = (select auth.uid());
$fn$;

CREATE OR REPLACE FUNCTION public.refresh_percentiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;
END;
$fn$;

REVOKE ALL ON FUNCTION public.my_percentiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.refresh_percentiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_percentiles() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Challenge progress can use normal RLS instead of bypassing it
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_challenge_progress(
  challenge_id UUID,
  side TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  new_val INTEGER;
BEGIN
  IF side NOT IN ('creator', 'opponent') THEN
    RAISE EXCEPTION 'side must be creator or opponent';
  END IF;

  IF increment_value IS NULL OR increment_value < 1 OR increment_value > 1000 THEN
    RAISE EXCEPTION 'increment_value out of range';
  END IF;

  IF side = 'creator' THEN
    UPDATE public.challenges
      SET creator_progress = creator_progress + increment_value
      WHERE id = challenge_id
        AND (select auth.uid()) = creator_id
      RETURNING creator_progress INTO new_val;
  ELSE
    UPDATE public.challenges
      SET opponent_progress = opponent_progress + increment_value
      WHERE id = challenge_id
        AND (select auth.uid()) = opponent_id
      RETURNING opponent_progress INTO new_val;
  END IF;

  IF new_val IS NULL THEN
    RAISE EXCEPTION 'Challenge not found or not authorized';
  END IF;

  RETURN new_val;
END;
$fn$;

REVOKE ALL ON FUNCTION public.bump_challenge_progress(UUID, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bump_challenge_progress(UUID, TEXT, INTEGER) TO authenticated;
