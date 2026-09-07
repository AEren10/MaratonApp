-- Move privileged RPC bodies out of the exposed public schema.
-- Public functions keep the app contract, but run as SECURITY INVOKER wrappers.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.apply_referral_code(
  invitee_uuid UUID,
  referral_code_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_uuid UUID := auth.uid();
  inviter_uuid UUID;
  existing_ref UUID;
  now_ts TIMESTAMPTZ := now();
  inviter_premium TIMESTAMPTZ;
  invitee_premium TIMESTAMPTZ;
  reward_days INTEGER := 7;
BEGIN
  IF caller_uuid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  IF invitee_uuid IS NOT NULL AND invitee_uuid <> caller_uuid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT id
    INTO inviter_uuid
    FROM public.profiles
   WHERE referral_code = upper(trim(referral_code_input));

  IF inviter_uuid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  IF inviter_uuid = caller_uuid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self');
  END IF;

  SELECT id
    INTO existing_ref
    FROM public.referral_logs
   WHERE invitee_id = caller_uuid
   LIMIT 1;

  IF existing_ref IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
  END IF;

  INSERT INTO public.referral_logs (inviter_id, invitee_id)
  VALUES (inviter_uuid, caller_uuid);

  UPDATE public.profiles
     SET referred_by = inviter_uuid
   WHERE id = caller_uuid;

  SELECT premium_until
    INTO invitee_premium
    FROM public.profiles
   WHERE id = caller_uuid;

  IF invitee_premium IS NULL OR invitee_premium < now_ts THEN
    invitee_premium := now_ts;
  END IF;

  UPDATE public.profiles
     SET premium_until = invitee_premium + (reward_days || ' days')::INTERVAL
   WHERE id = caller_uuid;

  SELECT premium_until
    INTO inviter_premium
    FROM public.profiles
   WHERE id = inviter_uuid;

  IF inviter_premium IS NULL OR inviter_premium < now_ts THEN
    inviter_premium := now_ts;
  END IF;

  UPDATE public.profiles
     SET premium_until = inviter_premium + (reward_days || ' days')::INTERVAL
   WHERE id = inviter_uuid;

  RETURN jsonb_build_object('ok', true, 'inviter_id', inviter_uuid);
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(
  invitee_uuid UUID,
  referral_code_input TEXT
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.apply_referral_code(invitee_uuid, referral_code_input);
$$;

CREATE OR REPLACE FUNCTION private.claim_streak_milestone(milestone_day INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID := auth.uid();
  streak INTEGER;
  claimed INTEGER[];
  reward_days INTEGER;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  reward_days := CASE milestone_day
    WHEN 7 THEN 0
    WHEN 14 THEN 1
    WHEN 30 THEN 3
    WHEN 60 THEN 7
    WHEN 100 THEN 14
    WHEN 365 THEN 30
    ELSE NULL
  END;

  IF reward_days IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_milestone');
  END IF;

  SELECT GREATEST(COALESCE(current_streak, 0), COALESCE(longest_streak, 0))
    INTO streak
    FROM public.streaks
   WHERE user_id = uid;

  IF streak IS NULL OR streak < milestone_day THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_reached');
  END IF;

  SELECT COALESCE(claimed_streak_milestones, '{}')
    INTO claimed
    FROM public.profiles
   WHERE id = uid;

  IF milestone_day = ANY(claimed) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  UPDATE public.profiles
     SET claimed_streak_milestones =
           array_append(COALESCE(claimed_streak_milestones, '{}'), milestone_day),
         premium_until = CASE
           WHEN reward_days > 0
             THEN GREATEST(COALESCE(premium_until, now()), now())
                  + (reward_days || ' days')::INTERVAL
           ELSE premium_until
         END
   WHERE id = uid;

  RETURN jsonb_build_object('ok', true, 'premium_days', reward_days);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_streak_milestone(milestone_day INTEGER)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.claim_streak_milestone(milestone_day);
$$;

CREATE OR REPLACE FUNCTION private.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.delete_own_account();
$$;

CREATE OR REPLACE FUNCTION private.is_group_member(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.group_members
     WHERE group_id = gid
       AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.is_group_member(gid);
$$;

CREATE OR REPLACE FUNCTION private.join_group_by_code(group_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  gid UUID;
  caller_uuid UUID := auth.uid();
BEGIN
  IF caller_uuid IS NULL THEN
    RAISE EXCEPTION 'Oturum yok';
  END IF;

  SELECT id
    INTO gid
    FROM public.groups
   WHERE code = upper(trim(group_code))
   LIMIT 1;

  IF gid IS NULL THEN
    RAISE EXCEPTION 'Grup bulunamadı';
  END IF;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (gid, caller_uuid)
  ON CONFLICT DO NOTHING;

  RETURN gid;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_group_by_code(group_code TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.join_group_by_code(group_code);
$$;

CREATE OR REPLACE FUNCTION private.my_percentiles()
RETURNS TABLE(subject TEXT, avg_net NUMERIC, percentile INTEGER)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT sp.subject, sp.avg_net, sp.percentile
    FROM public.subject_percentile sp
   WHERE sp.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_percentiles()
RETURNS TABLE(subject TEXT, avg_net NUMERIC, percentile INTEGER)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM private.my_percentiles();
$$;

CREATE OR REPLACE FUNCTION private.refresh_percentiles()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_percentiles()
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.refresh_percentiles();
$$;

CREATE OR REPLACE FUNCTION private.start_trial()
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

CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.start_trial();
$$;

CREATE OR REPLACE FUNCTION private.get_or_create_referral_code()
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

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.get_or_create_referral_code();
$$;

REVOKE ALL ON FUNCTION private.apply_referral_code(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.claim_streak_milestone(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.delete_own_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_group_member(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.join_group_by_code(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.my_percentiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.refresh_percentiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.start_trial() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.get_or_create_referral_code() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION private.apply_referral_code(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION private.claim_streak_milestone(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION private.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.join_group_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION private.my_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION private.refresh_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION private.start_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_or_create_referral_code() TO authenticated;

REVOKE ALL ON FUNCTION public.apply_referral_code(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_streak_milestone(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_group_member(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_percentiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.refresh_percentiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.start_trial() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.apply_referral_code(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_streak_milestone(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;
