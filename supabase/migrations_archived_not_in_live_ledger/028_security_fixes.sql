-- Security fixes migration
-- Applied: 2026-06-18

-- #6: XP server-side cap — günlük max 500 XP
CREATE OR REPLACE FUNCTION public.check_daily_xp_cap()
RETURNS TRIGGER AS $$
DECLARE
  today_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO today_total
  FROM public.xp_events
  WHERE user_id = NEW.user_id
    AND created_at >= (CURRENT_DATE AT TIME ZONE 'Europe/Istanbul');

  IF today_total + NEW.amount > 500 THEN
    NEW.amount := GREATEST(0, 500 - today_total);
  END IF;

  IF NEW.amount <= 0 THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_xp_cap ON public.xp_events;
CREATE TRIGGER check_xp_cap
  BEFORE INSERT ON public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.check_daily_xp_cap();

-- #8: friendships UPDATE — sadece addressee status güncelleyebilsin
DROP POLICY IF EXISTS "Users update own" ON public.friendships;

CREATE POLICY "Addressee can accept/decline"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

-- #9: challenges UPDATE — sadece katılımcılar
DROP POLICY IF EXISTS "Users update challenges in" ON public.challenges;

CREATE POLICY "Participants update own progress"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id)
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = opponent_id);

-- #10: leaderboard anon erişimini kaldır
REVOKE SELECT ON public.leaderboard_weekly FROM anon;

-- #3: Atomic challenge progress increment RPC
CREATE OR REPLACE FUNCTION public.bump_challenge_progress(
  challenge_id UUID,
  side TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  new_val INTEGER;
BEGIN
  IF side NOT IN ('creator', 'opponent') THEN
    RAISE EXCEPTION 'side must be creator or opponent';
  END IF;

  IF side = 'creator' THEN
    UPDATE public.challenges
      SET creator_progress = creator_progress + increment_value
      WHERE id = challenge_id
        AND (auth.uid() = creator_id)
      RETURNING creator_progress INTO new_val;
  ELSE
    UPDATE public.challenges
      SET opponent_progress = opponent_progress + increment_value
      WHERE id = challenge_id
        AND (auth.uid() = opponent_id)
      RETURNING opponent_progress INTO new_val;
  END IF;

  IF new_val IS NULL THEN
    RAISE EXCEPTION 'Challenge not found or not authorized';
  END IF;

  RETURN new_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
