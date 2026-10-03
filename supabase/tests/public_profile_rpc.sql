-- Run after migrations against a disposable/local database only.
-- Every fixture and assertion is rolled back.
BEGIN;

DO $test$
DECLARE
  viewer uuid := '10000000-0000-4000-8000-000000000001';
  target uuid := '10000000-0000-4000-8000-000000000002';
  outsider uuid := '10000000-0000-4000-8000-000000000003';
  gid uuid := '20000000-0000-4000-8000-000000000001';
  result jsonb;
BEGIN
  INSERT INTO auth.users
    (id, aud, role, email, encrypted_password, email_confirmed_at,
     raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (viewer, 'authenticated', 'authenticated', 'viewer-public-profile@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
    (target, 'authenticated', 'authenticated', 'target-public-profile@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
    (outsider, 'authenticated', 'authenticated', 'outsider-public-profile@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, name, exam_type, show_in_leaderboard, public_profile_visibility)
  VALUES
    (viewer, 'Viewer', 'TYT', true, 'group_and_friends'),
    (target, 'Target', 'TYT', true, 'group_and_friends'),
    (outsider, 'Outsider', 'TYT', true, 'group_and_friends');

  INSERT INTO public.groups (id, name, code, owner_id) VALUES (gid, 'Test Group', 'PUBLICPROFILETEST', viewer);
  INSERT INTO public.group_members (group_id, user_id) VALUES (gid, viewer), (gid, target);

  PERFORM set_config('request.jwt.claim.sub', viewer::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  result := public.get_public_profile(target);
  IF NOT result ?& ARRAY[
    'id', 'name', 'avatar_url', 'exam_type', 'current_streak',
    'weekly_questions', 'weekly_minutes', 'relationship_status', 'subject_progress'
  ] THEN
    RAISE EXCEPTION 'public profile is missing allowlisted keys: %', result;
  END IF;
  IF result - ARRAY[
    'id', 'name', 'avatar_url', 'exam_type', 'current_streak',
    'weekly_questions', 'weekly_minutes', 'relationship_status', 'subject_progress'
  ] <> '{}'::jsonb THEN
    RAISE EXCEPTION 'public profile leaked extra keys: %', result;
  END IF;
  IF result ?| ARRAY['total_net', 'target_net', 'baseline_net', 'trials'] THEN
    RAISE EXCEPTION 'public profile leaked private exam data';
  END IF;

  UPDATE public.profiles SET public_profile_visibility = 'friends_only' WHERE id = target;
  BEGIN
    PERFORM public.get_public_profile(target);
    RAISE EXCEPTION 'friends_only profile was visible to group member';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.friendships (requester_id, addressee_id, status)
  VALUES (viewer, target, 'accepted');
  result := public.get_public_profile(target);
  IF result->>'relationship_status' <> 'accepted' THEN
    RAISE EXCEPTION 'accepted relationship was not returned';
  END IF;

  UPDATE public.friendships SET status = 'blocked'
   WHERE requester_id = viewer AND addressee_id = target;
  BEGIN
    PERFORM public.get_public_profile(target);
    RAISE EXCEPTION 'blocked profile was visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  DELETE FROM public.friendships WHERE requester_id = viewer AND addressee_id = target;
  UPDATE public.profiles SET public_profile_visibility = 'group_and_friends', show_in_leaderboard = false WHERE id = target;
  BEGIN
    PERFORM public.get_public_profile(target);
    RAISE EXCEPTION 'leaderboard-hidden profile was visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  UPDATE public.profiles SET show_in_leaderboard = true WHERE id = target;
  BEGIN
    PERFORM public.get_public_profile(outsider);
    RAISE EXCEPTION 'unrelated profile was visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  PERFORM set_config('request.jwt.claim.sub', '', true);
  BEGIN
    PERFORM public.get_public_profile(target);
    RAISE EXCEPTION 'anonymous profile access succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$test$;

ROLLBACK;
