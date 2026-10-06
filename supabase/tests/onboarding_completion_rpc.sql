-- Run after migrations against a disposable/local database only.
-- Every fixture and assertion is rolled back.
BEGIN;

DO $test$
DECLARE
  completed_user uuid := '31000000-0000-4000-8000-000000000001';
  pending_user uuid := '31000000-0000-4000-8000-000000000002';
  first_value timestamptz;
  second_value timestamptz;
BEGIN
  INSERT INTO auth.users
    (id, aud, role, email, encrypted_password, email_confirmed_at,
     raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (completed_user, 'authenticated', 'authenticated', 'completed-onboarding@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
    (pending_user, 'authenticated', 'authenticated', 'pending-onboarding@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, name, exam_type, target_net, onboarding_completed_at)
  VALUES
    (completed_user, 'Completed', 'tyt', 75, now()),
    (pending_user, 'Pending', 'tyt', null, null);

  PERFORM set_config('request.jwt.claim.sub', pending_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  first_value := public.complete_onboarding();
  second_value := public.complete_onboarding();

  IF first_value IS NULL OR second_value IS DISTINCT FROM first_value THEN
    RAISE EXCEPTION 'complete_onboarding is not idempotent: %, %', first_value, second_value;
  END IF;

  IF (SELECT onboarding_completed_at FROM public.profiles WHERE id = completed_user) IS NULL THEN
    RAISE EXCEPTION 'existing completed user lost onboarding state';
  END IF;

  PERFORM set_config('request.jwt.claim.sub', '', true);
  BEGIN
    PERFORM public.complete_onboarding();
    RAISE EXCEPTION 'anonymous onboarding completion succeeded';
  EXCEPTION WHEN invalid_authorization_specification THEN NULL;
  END;
END;
$test$;

ROLLBACK;
