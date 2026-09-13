-- Server-authoritative challenge creation.
--
-- Client-side gates are UX only. The database must enforce friendship,
-- free quota, and the absence of direct table writes.

CREATE OR REPLACE FUNCTION private.create_challenge(
  p_opponent_id UUID,
  p_metric TEXT,
  p_target INTEGER,
  p_days INTEGER DEFAULT 7
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $fn$
DECLARE
  uid UUID := auth.uid();
  today_tr DATE := (now() AT TIME ZONE 'Europe/Istanbul')::date;
  used_count INTEGER := 0;
  unlimited BOOLEAN := false;
  challenge_row RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF p_opponent_id IS NULL OR p_opponent_id = uid THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_opponent'); END IF;
  IF p_metric NOT IN ('questions', 'study_minutes') THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_metric'); END IF;
  IF p_target IS NULL OR p_target <= 0 THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_target'); END IF;
  IF p_days IS NULL OR p_days < 1 OR p_days > 30 THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_days'); END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status = 'accepted'
       AND ((f.requester_id = uid AND f.addressee_id = p_opponent_id)
         OR (f.requester_id = p_opponent_id AND f.addressee_id = uid))
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_friends');
  END IF;

  unlimited := private.is_first_week(uid, now()) OR private.has_pro_access(uid, now());
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':challenge_create:' || today_tr::text, 0));

  SELECT count(*) INTO used_count
    FROM public.challenges
   WHERE creator_id = uid
     AND status IN ('pending', 'active');

  IF NOT unlimited AND used_count >= 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'quota_exhausted', 'used', used_count, 'limit', 1);
  END IF;

  INSERT INTO public.challenges (
    creator_id, opponent_id, metric, target, status, starts_on, ends_on
  ) VALUES (
    uid, p_opponent_id, p_metric, p_target, 'pending', today_tr, today_tr + p_days
  ) RETURNING * INTO challenge_row;

  RETURN jsonb_build_object(
    'ok', true,
    'challenge', to_jsonb(challenge_row),
    'quota', jsonb_build_object(
      'used', used_count + CASE WHEN unlimited THEN 0 ELSE 1 END,
      'limit', 1,
      'unlimited', unlimited
    )
  );
END; $fn$;

CREATE OR REPLACE FUNCTION public.create_challenge(
  p_opponent_id UUID,
  p_metric TEXT,
  p_target INTEGER,
  p_days INTEGER DEFAULT 7
)
RETURNS JSONB LANGUAGE sql SET search_path = ''
AS $fn$ SELECT private.create_challenge(p_opponent_id, p_metric, p_target, p_days); $fn$;

ALTER FUNCTION private.create_challenge(UUID, TEXT, INTEGER, INTEGER)
  SET search_path = '';
ALTER FUNCTION public.create_challenge(UUID, TEXT, INTEGER, INTEGER)
  SET search_path = '';

REVOKE ALL ON FUNCTION private.create_challenge(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_challenge(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.create_challenge(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_challenge(UUID, TEXT, INTEGER, INTEGER) TO authenticated;

REVOKE INSERT, DELETE ON public.challenges FROM authenticated;
DROP POLICY IF EXISTS "Users create challenges" ON public.challenges;
