-- 039: Canli DB'de eksik olan RPC'lerin geri yuklenmesi (2026-08-18 audit)
--
-- Canli DB uzerinde dogrulandi: asagidaki 3 fonksiyon uygulamada cagriliyor
-- ama veritabaninda YOK (PGRST202). Bu yuzden production'da:
--   - challenge ilerlemesi hic guncellenmiyor   (bump_challenge_progress / 028)
--   - referans kodu hic calismiyor              (apply_referral_code / 033)
--   - percentile view'i hic yenilenmiyor        (refresh_percentiles / 032)
--
-- Hepsi CREATE OR REPLACE — tekrar calistirmak guvenli.

-- ---------------------------------------------------------------------------
-- 028'den eksik kalan: atomic challenge progress
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_challenge_progress(
  challenge_id UUID,
  side TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
      WHERE id = challenge_id AND auth.uid() = creator_id
      RETURNING creator_progress INTO new_val;
  ELSE
    UPDATE public.challenges
      SET opponent_progress = opponent_progress + increment_value
      WHERE id = challenge_id AND auth.uid() = opponent_id
      RETURNING opponent_progress INTO new_val;
  END IF;

  IF new_val IS NULL THEN
    RAISE EXCEPTION 'Challenge not found or not authorized';
  END IF;

  RETURN new_val;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_challenge_progress(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bump_challenge_progress(uuid, text, integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- 032'den eksik kalan: percentile refresh
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refresh_percentiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_percentiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_percentiles() TO authenticated;

-- ---------------------------------------------------------------------------
-- 033'ten eksik kalan: referans kodu uygulama
--
-- 033'teki orijinal imzada invitee_uuid disaridan geliyordu; bu haliyle bir
-- kullanici baskasinin UUID'sini gecerek ona premium yazdirabiliyordu.
-- Artik davet edilen HER ZAMAN auth.uid() — parametre yok sayilir.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_referral_code(
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

  SELECT id INTO inviter_uuid
  FROM public.profiles
  WHERE referral_code = upper(trim(referral_code_input));

  IF inviter_uuid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  IF inviter_uuid = caller_uuid THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self');
  END IF;

  SELECT id INTO existing_ref
  FROM public.referral_logs
  WHERE invitee_id = caller_uuid
  LIMIT 1;

  IF existing_ref IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
  END IF;

  INSERT INTO public.referral_logs (inviter_id, invitee_id)
  VALUES (inviter_uuid, caller_uuid);

  UPDATE public.profiles SET referred_by = inviter_uuid WHERE id = caller_uuid;

  SELECT premium_until INTO invitee_premium FROM public.profiles WHERE id = caller_uuid;
  IF invitee_premium IS NULL OR invitee_premium < now_ts THEN
    invitee_premium := now_ts;
  END IF;
  UPDATE public.profiles
    SET premium_until = invitee_premium + (reward_days || ' days')::INTERVAL
    WHERE id = caller_uuid;

  SELECT premium_until INTO inviter_premium FROM public.profiles WHERE id = inviter_uuid;
  IF inviter_premium IS NULL OR inviter_premium < now_ts THEN
    inviter_premium := now_ts;
  END IF;
  UPDATE public.profiles
    SET premium_until = inviter_premium + (reward_days || ' days')::INTERVAL
    WHERE id = inviter_uuid;

  RETURN jsonb_build_object('ok', true, 'inviter_id', inviter_uuid);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_referral_code(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(uuid, text) TO authenticated;
