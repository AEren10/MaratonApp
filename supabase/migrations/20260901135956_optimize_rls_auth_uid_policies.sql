-- RLS policy performance cleanup.
-- Keeps the same ownership rules while wrapping auth.uid() in SELECT so Postgres
-- can evaluate it once per statement instead of once per row.

ALTER POLICY "analytics insert own" ON public.analytics_events
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Participants update own progress" ON public.challenges
  USING (((select auth.uid()) = creator_id) OR ((select auth.uid()) = opponent_id))
  WITH CHECK (((select auth.uid()) = creator_id) OR ((select auth.uid()) = opponent_id));

ALTER POLICY "Users create challenges" ON public.challenges
  WITH CHECK ((select auth.uid()) = creator_id);

ALTER POLICY "Users see challenges in" ON public.challenges
  USING (((select auth.uid()) = creator_id) OR ((select auth.uid()) = opponent_id));

ALTER POLICY "Users can delete own plans" ON public.daily_plans
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own plans" ON public.daily_plans
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own plans" ON public.daily_plans
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own plans" ON public.daily_plans
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Addressee can accept/decline" ON public.friendships
  USING ((select auth.uid()) = addressee_id)
  WITH CHECK ((select auth.uid()) = addressee_id);

ALTER POLICY "Users create requests" ON public.friendships
  WITH CHECK ((select auth.uid()) = requester_id);

ALTER POLICY "Users delete own" ON public.friendships
  USING (((select auth.uid()) = requester_id) OR ((select auth.uid()) = addressee_id));

ALTER POLICY "Users see own friendships" ON public.friendships
  USING (((select auth.uid()) = requester_id) OR ((select auth.uid()) = addressee_id));

ALTER POLICY "group_members delete self" ON public.group_members
  USING (user_id = (select auth.uid()));

ALTER POLICY "group_members insert self" ON public.group_members
  WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY "groups delete owner" ON public.groups
  USING (owner_id = (select auth.uid()));

ALTER POLICY "groups insert owner" ON public.groups
  WITH CHECK (owner_id = (select auth.uid()));

ALTER POLICY "groups select member or owner" ON public.groups
  USING ((owner_id = (select auth.uid())) OR is_group_member(id));

ALTER POLICY "Users can delete own tasks" ON public.plan_tasks
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own tasks" ON public.plan_tasks
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own tasks" ON public.plan_tasks
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own tasks" ON public.plan_tasks
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Profiles are viewable by authenticated users" ON public.profiles
  TO authenticated
  USING (true);

ALTER POLICY "Users can insert own profile" ON public.profiles
  WITH CHECK ((select auth.uid()) = id);

ALTER POLICY "Users can update own profile" ON public.profiles
  USING ((select auth.uid()) = id);

ALTER POLICY "Authenticated users can answer" ON public.question_answers
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can delete own answers" ON public.question_answers
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert referral logs" ON public.referral_logs
  WITH CHECK ((select auth.uid()) = invitee_id);

ALTER POLICY "Users can read own referral logs" ON public.referral_logs
  USING (((select auth.uid()) = inviter_id) OR ((select auth.uid()) = invitee_id));

ALTER POLICY "Users can delete own shares" ON public.shared_questions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can share own questions" ON public.shared_questions
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "streaks insert own" ON public.streaks;

ALTER POLICY "Users can insert own streak" ON public.streaks
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own streak" ON public.streaks
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own streak" ON public.streaks
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can delete own study logs" ON public.study_logs
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own study logs" ON public.study_logs
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own study logs" ON public.study_logs
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own study logs" ON public.study_logs
  USING ((select auth.uid()) = user_id);

ALTER POLICY "topic_notes delete own" ON public.topic_notes
  USING ((select auth.uid()) = user_id);

ALTER POLICY "topic_notes insert own" ON public.topic_notes
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "topic_notes select own" ON public.topic_notes
  USING ((select auth.uid()) = user_id);

ALTER POLICY "topic_notes update own" ON public.topic_notes
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users insert own progress" ON public.topic_progress
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users update own progress" ON public.topic_progress
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users view own progress" ON public.topic_progress
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own trial subjects" ON public.trial_subjects
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.trials
    WHERE trials.id = trial_subjects.trial_id
      AND trials.user_id = (select auth.uid())
  ));

ALTER POLICY "Users can update own trial subjects" ON public.trial_subjects
  USING (EXISTS (
    SELECT 1
    FROM public.trials
    WHERE trials.id = trial_subjects.trial_id
      AND trials.user_id = (select auth.uid())
  ));

ALTER POLICY "Users can view own trial subjects" ON public.trial_subjects
  USING (EXISTS (
    SELECT 1
    FROM public.trials
    WHERE trials.id = trial_subjects.trial_id
      AND trials.user_id = (select auth.uid())
  ));

ALTER POLICY "Users can delete own trials" ON public.trials
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own trials" ON public.trials
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own trials" ON public.trials
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own trials" ON public.trials
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can manage own tasks" ON public.user_tasks
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can delete own wrong questions" ON public.wrong_questions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can insert own wrong questions" ON public.wrong_questions
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own wrong questions" ON public.wrong_questions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own wrong questions" ON public.wrong_questions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "xp_events insert own" ON public.xp_events
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "xp_events select own" ON public.xp_events
  USING ((select auth.uid()) = user_id);
