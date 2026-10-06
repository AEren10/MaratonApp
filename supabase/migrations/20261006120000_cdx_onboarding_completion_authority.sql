-- Onboarding completion is server-owned and independent from targets or
-- gamification JSON. Existing users are backfilled before clients switch to
-- the new column so nobody is sent through setup again during rollout.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

UPDATE public.profiles AS p
   SET onboarding_completed_at = COALESCE(p.onboarding_completed_at, now())
 WHERE p.onboarding_completed_at IS NULL
   AND (
     COALESCE((p.gamification_stats ->> 'setup_completed')::boolean, false)
     OR p.target_net IS NOT NULL
     OR p.target_net_tyt IS NOT NULL
     OR COALESCE(p.study_session_count, 0) > 0
     OR EXISTS (
       SELECT 1
         FROM public.study_logs AS sl
        WHERE sl.user_id = p.id
     )
   );

CREATE OR REPLACE FUNCTION public.complete_onboarding()
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  completed_at timestamptz;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING errcode = '28000';
  END IF;

  UPDATE public.profiles
     SET onboarding_completed_at = COALESCE(onboarding_completed_at, now())
   WHERE id = uid
   RETURNING onboarding_completed_at INTO completed_at;

  IF completed_at IS NULL THEN
    RAISE EXCEPTION 'profile_not_found' USING errcode = 'P0002';
  END IF;

  RETURN completed_at;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_onboarding() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.complete_onboarding() TO authenticated;

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'Server authority for completed onboarding; null means setup is incomplete.';
COMMENT ON FUNCTION public.complete_onboarding() IS
  'Idempotently marks the authenticated user onboarding as complete.';
