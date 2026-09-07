-- Harden the public Data API surface and make offline writes idempotent.
-- RLS remains the primary row-level boundary; grants below remove broad table
-- capabilities such as TRUNCATE/TRIGGER/REFERENCES from client roles.

-- ---------------------------------------------------------------------------
-- 1. Idempotency keys for offline/unstable-network writes
-- ---------------------------------------------------------------------------
ALTER TABLE public.study_logs
  ADD COLUMN IF NOT EXISTS client_operation_id TEXT;

ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS client_operation_id TEXT;

ALTER TABLE public.wrong_questions
  ADD COLUMN IF NOT EXISTS client_operation_id TEXT;

ALTER TABLE public.user_tasks
  ADD COLUMN IF NOT EXISTS client_operation_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_study_logs_client_operation_id
  ON public.study_logs (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_trials_client_operation_id
  ON public.trials (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wrong_questions_client_operation_id
  ON public.wrong_questions (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tasks_client_operation_id
  ON public.user_tasks (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_subjects_trial_subject_unique
  ON public.trial_subjects (trial_id, subject);

-- ---------------------------------------------------------------------------
-- 2. Update policies must preserve ownership after the update
-- ---------------------------------------------------------------------------
ALTER POLICY "Users can update own plans" ON public.daily_plans
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own tasks" ON public.plan_tasks
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own study logs" ON public.study_logs
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own streak" ON public.streaks
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "topic_notes update own" ON public.topic_notes
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users update own progress" ON public.topic_progress
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own trial subjects" ON public.trial_subjects
  USING (EXISTS (
    SELECT 1
    FROM public.trials
    WHERE trials.id = trial_subjects.trial_id
      AND trials.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.trials
    WHERE trials.id = trial_subjects.trial_id
      AND trials.user_id = (select auth.uid())
  ));

ALTER POLICY "Users can update own trials" ON public.trials
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own wrong questions" ON public.wrong_questions
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 3. Least-privilege table grants for anon/authenticated
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.analytics_events FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO authenticated;

REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (
  name,
  exam_type,
  exam_date,
  daily_target,
  avatar_url,
  daily_question_goal,
  target_program_id,
  show_in_leaderboard,
  bio,
  field,
  target_ranking,
  target_department,
  weekly_trials_goal,
  weekly_minutes_goal,
  last_active,
  badges,
  gamification_stats,
  expo_push_token,
  study_session_count,
  login_rewarded_date,
  review_last_asked,
  notification_prefs
) ON public.profiles TO authenticated;

REVOKE ALL ON public.study_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_logs TO authenticated;

REVOKE ALL ON public.daily_plans FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_plans TO authenticated;

REVOKE ALL ON public.plan_tasks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_tasks TO authenticated;

REVOKE ALL ON public.trials FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trials TO authenticated;

REVOKE ALL ON public.trial_subjects FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_subjects TO authenticated;

REVOKE ALL ON public.wrong_questions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wrong_questions TO authenticated;

REVOKE ALL ON public.streaks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.streaks TO authenticated;

REVOKE ALL ON public.friendships FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;

REVOKE ALL ON public.challenges FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;

REVOKE ALL ON public.groups FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;

REVOKE ALL ON public.group_members FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;

REVOKE ALL ON public.shared_questions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.shared_questions TO authenticated;

REVOKE ALL ON public.question_answers FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.question_answers TO authenticated;

REVOKE ALL ON public.user_tasks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tasks TO authenticated;

REVOKE ALL ON public.subjects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subjects TO anon, authenticated;

REVOKE ALL ON public.topics FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.topics TO anon, authenticated;

REVOKE ALL ON public.topic_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.topic_progress TO authenticated;

REVOKE ALL ON public.topic_notes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_notes TO authenticated;

REVOKE ALL ON public.referral_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.referral_logs TO authenticated;

REVOKE ALL ON public.xp_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.xp_events TO authenticated;

REVOKE ALL ON public.leaderboard_weekly_entries FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.leaderboard_weekly_entries TO authenticated;

REVOKE ALL ON public.leaderboard_weekly FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.leaderboard_weekly TO authenticated;

REVOKE ALL ON public.subject_percentile FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
