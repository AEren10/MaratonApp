-- Existing RLS policy "Participants update own progress" already covers
-- both creator and opponent updates (status changes, progress bumps).
-- No additional challenge policy needed.

-- Atomic referral code apply
CREATE OR REPLACE FUNCTION public.apply_referral_code(
  invitee_uuid UUID,
  referral_code_input TEXT
)
RETURNS JSONB AS $$
DECLARE
  inviter_uuid UUID;
  existing_ref UUID;
  now_ts TIMESTAMPTZ := now();
  inviter_premium TIMESTAMPTZ;
  invitee_premium TIMESTAMPTZ;
  reward_days INTEGER := 7;
BEGIN
  -- Find inviter by referral code
  SELECT id INTO inviter_uuid
  FROM public.profiles
  WHERE referral_code = upper(trim(referral_code_input));

  IF inviter_uuid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  IF inviter_uuid = invitee_uuid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self');
  END IF;

  -- Check if invitee already used a referral
  SELECT id INTO existing_ref
  FROM public.referral_logs
  WHERE invitee_id = invitee_uuid
  LIMIT 1;

  IF existing_ref IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
  END IF;

  -- Insert referral log (prevents double-apply via unique constraint if exists)
  INSERT INTO public.referral_logs (inviter_id, invitee_id)
  VALUES (inviter_uuid, invitee_uuid);

  -- Update referred_by
  UPDATE public.profiles SET referred_by = inviter_uuid WHERE id = invitee_uuid;

  -- Grant premium to invitee
  SELECT premium_until INTO invitee_premium FROM public.profiles WHERE id = invitee_uuid;
  IF invitee_premium IS NULL OR invitee_premium < now_ts THEN
    invitee_premium := now_ts;
  END IF;
  UPDATE public.profiles
    SET premium_until = invitee_premium + (reward_days || ' days')::INTERVAL
    WHERE id = invitee_uuid;

  -- Grant premium to inviter
  SELECT premium_until INTO inviter_premium FROM public.profiles WHERE id = inviter_uuid;
  IF inviter_premium IS NULL OR inviter_premium < now_ts THEN
    inviter_premium := now_ts;
  END IF;
  UPDATE public.profiles
    SET premium_until = inviter_premium + (reward_days || ' days')::INTERVAL
    WHERE id = inviter_uuid;

  RETURN jsonb_build_object('ok', true, 'inviter_id', inviter_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
