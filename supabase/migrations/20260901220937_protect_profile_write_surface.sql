-- Narrow the Data API write surface for profiles.
-- Profile rows stay readable for authenticated social/search flows, but client
-- writes are limited to non-privileged fields. Sensitive transitions move to RPC.

REVOKE ALL ON public.profiles FROM anon, authenticated;
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

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_uuid UUID := auth.uid();
BEGIN
  IF caller_uuid IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
     SET trial_started_at = now()
   WHERE id = caller_uuid
     AND trial_started_at IS NULL;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.start_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_uuid UUID := auth.uid();
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  existing_code TEXT;
  generated_code TEXT;
  idx INTEGER;
  attempts INTEGER := 0;
BEGIN
  IF caller_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT referral_code
    INTO existing_code
    FROM public.profiles
   WHERE id = caller_uuid;

  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  LOOP
    attempts := attempts + 1;
    generated_code := '';

    FOR idx IN 1..6 LOOP
      generated_code := generated_code ||
        substr(alphabet, floor(random() * length(alphabet) + 1)::INTEGER, 1);
    END LOOP;

    BEGIN
      UPDATE public.profiles
         SET referral_code = generated_code
       WHERE id = caller_uuid
         AND referral_code IS NULL;

      IF FOUND THEN
        RETURN generated_code;
      END IF;
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
    END;

    SELECT referral_code
      INTO existing_code
      FROM public.profiles
     WHERE id = caller_uuid;

    IF existing_code IS NOT NULL THEN
      RETURN existing_code;
    END IF;

    IF attempts >= 10 THEN
      RAISE EXCEPTION 'referral_code_generation_failed';
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;
