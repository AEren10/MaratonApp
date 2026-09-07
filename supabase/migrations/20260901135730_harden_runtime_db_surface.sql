-- Keep the live database aligned with the runtime architecture audit.
-- This migration intentionally avoids changing product behavior such as
-- leaderboard visibility or exam score formulas.

-- ---------------------------------------------------------------------------
-- 1. Function search_path hardening
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_daily_xp_cap() SET search_path = public, pg_temp;
ALTER FUNCTION public.grant_premium(uuid, integer) SET search_path = public, pg_temp;

-- ---------------------------------------------------------------------------
-- 2. Direct API surface tightening
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.grant_premium(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_premium(uuid, integer) TO service_role;

REVOKE ALL ON FUNCTION public.apply_referral_code(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.bump_challenge_progress(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bump_challenge_progress(uuid, text, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.refresh_percentiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_percentiles() TO authenticated;

-- Trigger functions should not be callable directly from the client API.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_daily_xp_cap() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_topic_progress() FROM PUBLIC, anon, authenticated;

-- The app reads this only through my_percentiles(), which filters by auth.uid().
REVOKE ALL ON public.subject_percentile FROM PUBLIC, anon, authenticated;

-- leaderboard_weekly is still intentionally read by authenticated social screens.
-- Anonymous access is not needed for the app.
REVOKE ALL ON public.leaderboard_weekly FROM PUBLIC, anon;
GRANT SELECT ON public.leaderboard_weekly TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Missing foreign-key indexes from Supabase performance advisor
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_challenges_creator_id_fk
  ON public.challenges (creator_id);

CREATE INDEX IF NOT EXISTS idx_challenges_opponent_id_fk
  ON public.challenges (opponent_id);

CREATE INDEX IF NOT EXISTS idx_challenges_winner_id_fk
  ON public.challenges (winner_id);

CREATE INDEX IF NOT EXISTS idx_groups_owner_id_fk
  ON public.groups (owner_id);

CREATE INDEX IF NOT EXISTS idx_plan_tasks_user_id_fk
  ON public.plan_tasks (user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_fk
  ON public.profiles (referred_by);

CREATE INDEX IF NOT EXISTS idx_question_answers_user_id_fk
  ON public.question_answers (user_id);

CREATE INDEX IF NOT EXISTS idx_referral_logs_inviter_id_fk
  ON public.referral_logs (inviter_id);

CREATE INDEX IF NOT EXISTS idx_shared_questions_user_id_fk
  ON public.shared_questions (user_id);

CREATE INDEX IF NOT EXISTS idx_shared_questions_wrong_question_id_fk
  ON public.shared_questions (wrong_question_id);

CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id_fk
  ON public.topic_progress (topic_id);
