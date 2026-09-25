-- XP awards are server-authoritative, but the RPC used to be non-idempotent:
-- if the same logical reward reached PostgREST twice, it inserted two rows up
-- to the daily cap. Keep the old two-argument client contract working while
-- allowing callers to send a stable client_operation_id.

ALTER TABLE public.xp_events
  ADD COLUMN IF NOT EXISTS client_operation_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS xp_events_user_client_operation_id_key
  ON public.xp_events (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL;

CREATE OR REPLACE FUNCTION private.award_xp(
  p_action TEXT,
  p_amount INTEGER,
  p_client_operation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID := auth.uid();
  cap INT;
  daily_total INT;
  DAILY_CAP CONSTANT INT := 3000;
  amt INT;
  op_id TEXT := NULLIF(btrim(COALESCE(p_client_operation_id, '')), '');
  existing RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;

  IF op_id IS NOT NULL THEN
    SELECT id, amount, action, created_at INTO existing
      FROM public.xp_events
     WHERE user_id = uid AND client_operation_id = op_id
     LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'amount', existing.amount,
        'action', existing.action,
        'id', existing.id,
        'created_at', existing.created_at
      );
    END IF;
  END IF;

  cap := CASE p_action
    WHEN 'study_log'           THEN 240
    WHEN 'question_solved'     THEN 600
    WHEN 'trial_entry'         THEN 150
    WHEN 'wrong_resolved'      THEN 45
    WHEN 'daily_login'         THEN 60
    WHEN 'streak_bonus'        THEN 500
    WHEN 'plan_task_done'      THEN 15
    WHEN 'perfect_plan'        THEN 300
    WHEN 'daily_goal_complete' THEN 120
    WHEN 'comeback_bonus'      THEN 150
    WHEN 'referral_applied'    THEN 150
    WHEN 'streak_milestone'    THEN 500
    ELSE NULL
  END;

  IF cap IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unknown_action'); END IF;

  amt := LEAST(GREATEST(COALESCE(p_amount, 0), 0), cap);
  IF amt = 0 THEN RETURN jsonb_build_object('ok', true, 'amount', 0); END IF;

  SELECT COALESCE(SUM(amount), 0) INTO daily_total
    FROM public.xp_events
   WHERE user_id = uid
     AND created_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul');

  IF daily_total >= DAILY_CAP THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'daily_cap', 'amount', 0);
  END IF;
  amt := LEAST(amt, DAILY_CAP - daily_total);

  INSERT INTO public.xp_events (user_id, amount, action, client_operation_id)
  VALUES (uid, amt, p_action, op_id)
  ON CONFLICT (user_id, client_operation_id)
  WHERE client_operation_id IS NOT NULL
  DO UPDATE SET client_operation_id = EXCLUDED.client_operation_id
  RETURNING id, amount, action, created_at INTO existing;

  RETURN jsonb_build_object(
    'ok', true,
    'amount', existing.amount,
    'action', existing.action,
    'id', existing.id,
    'created_at', existing.created_at,
    'idempotent', existing.amount <> amt
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.award_xp(
  p_action TEXT,
  p_amount INTEGER,
  p_client_operation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
SET search_path = public, pg_temp
AS $$
  SELECT private.award_xp(p_action, p_amount, p_client_operation_id);
$$;

REVOKE ALL ON FUNCTION private.award_xp(TEXT, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.award_xp(TEXT, INTEGER, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.award_xp(TEXT, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_xp(TEXT, INTEGER, TEXT) TO authenticated;

-- Avoid PostgREST overload ambiguity. The 3-argument functions have a default
-- value for p_client_operation_id, so SQL callers can still omit it.
DROP FUNCTION IF EXISTS public.award_xp(TEXT, INTEGER);
DROP FUNCTION IF EXISTS private.award_xp(TEXT, INTEGER);
