-- 040: Streak milestone premium odulunu sunucu tarafina tasi (2026-08-18 audit)
--
-- Onceden: client dogrudan grant_premium(user_id, days) cagiriyordu.
-- Bu yuzden grant_premium'un authenticated'a acik kalmasi gerekiyordu ve
-- herkes kendine sinirsiz premium yazabiliyordu.
--
-- Simdi: client sadece "su milestone'u talep ediyorum" diyor; gun sayisini ve
-- hak edip etmedigini veritabani dogruluyor. grant_premium artik sadece
-- service_role'a acik (bkz. 038).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS claimed_streak_milestones INTEGER[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.claim_streak_milestone(milestone_day INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  uid UUID := auth.uid();
  streak INTEGER;
  claimed INTEGER[];
  reward_days INTEGER;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  -- Odul tablosu sunucuda sabit — client'in gonderdigi gun sayisina guvenilmez.
  reward_days := CASE milestone_day
    WHEN 7   THEN 0
    WHEN 14  THEN 1
    WHEN 30  THEN 3
    WHEN 60  THEN 7
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
$fn$;

REVOKE ALL ON FUNCTION public.claim_streak_milestone(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_streak_milestone(integer) TO authenticated;
