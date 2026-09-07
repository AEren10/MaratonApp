-- ÜÇ İSTEMCİ-YAZILABİLİR YÜZEYİN SERTLEŞTİRİLMESİ
--
-- 1) challenges: UPDATE politikası "creator VEYA opponent" idi ve sütun
--    sınırı yoktu. Katılımcı hedefi (target), durumu, KAZANANI ve HER İKİ
--    TARAFIN ilerlemesini yazabiliyordu.
-- 2) group_members: INSERT kontrolü yalnızca user_id = auth.uid() idi.
--    Grup UUID'sini bilen, katılım kodu RPC'sine hiç uğramadan gruba
--    girebiliyordu.
-- 3) xp_events: istemci istediği miktarı yazabiliyordu; lig görünümü bu
--    defteri topladığı için sıralama manipüle edilebiliyordu.

-- ---------------------------------------------------------------- challenges
REVOKE UPDATE ON public.challenges FROM authenticated;
DROP POLICY IF EXISTS "Participants update own progress" ON public.challenges;

CREATE OR REPLACE FUNCTION private.respond_to_challenge(p_id UUID, p_accept BOOLEAN)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); c RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  UPDATE public.challenges
     SET status = CASE WHEN p_accept THEN 'active' ELSE 'declined' END
   WHERE id = p_id AND opponent_id = uid AND status = 'pending'
   RETURNING * INTO c;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_pending'); END IF;
  RETURN jsonb_build_object('ok', true, 'status', c.status);
END; $fn$;

CREATE OR REPLACE FUNCTION private.cancel_challenge(p_id UUID)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  UPDATE public.challenges SET status = 'cancelled'
   WHERE id = p_id AND creator_id = uid AND status IN ('pending', 'active');
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_cancellable'); END IF;
  RETURN jsonb_build_object('ok', true);
END; $fn$;

-- İlerleme: yalnızca KENDİ sütunu, yalnızca aktifken, geri gitmeden,
-- hedefi aşmadan. Kazananı sunucu belirler.
CREATE OR REPLACE FUNCTION private.update_challenge_progress(p_id UUID, p_value INT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); c RECORD; v INT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT * INTO c FROM public.challenges WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR c.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_active');
  END IF;
  IF uid <> c.creator_id AND uid <> c.opponent_id THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_participant');
  END IF;

  v := LEAST(GREATEST(COALESCE(p_value, 0), 0), COALESCE(c.target, 0));

  IF uid = c.creator_id THEN
    v := GREATEST(v, COALESCE(c.creator_progress, 0));
    UPDATE public.challenges SET creator_progress = v WHERE id = p_id;
  ELSE
    v := GREATEST(v, COALESCE(c.opponent_progress, 0));
    UPDATE public.challenges SET opponent_progress = v WHERE id = p_id;
  END IF;

  SELECT * INTO c FROM public.challenges WHERE id = p_id;
  IF c.target > 0 AND (c.creator_progress >= c.target OR c.opponent_progress >= c.target) THEN
    UPDATE public.challenges
       SET status = 'completed',
           winner_id = CASE
             WHEN c.creator_progress > c.opponent_progress THEN c.creator_id
             WHEN c.opponent_progress > c.creator_progress THEN c.opponent_id
             ELSE NULL END
     WHERE id = p_id AND status = 'active';
  END IF;

  RETURN jsonb_build_object('ok', true, 'progress', v);
END; $fn$;

CREATE OR REPLACE FUNCTION public.respond_to_challenge(p_id UUID, p_accept BOOLEAN)
RETURNS jsonb LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.respond_to_challenge(p_id, p_accept); $fn$;
CREATE OR REPLACE FUNCTION public.cancel_challenge(p_id UUID)
RETURNS jsonb LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.cancel_challenge(p_id); $fn$;
CREATE OR REPLACE FUNCTION public.update_challenge_progress(p_id UUID, p_value INT)
RETURNS jsonb LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.update_challenge_progress(p_id, p_value); $fn$;

REVOKE ALL ON FUNCTION public.respond_to_challenge(UUID, BOOLEAN) FROM public, anon;
REVOKE ALL ON FUNCTION public.cancel_challenge(UUID) FROM public, anon;
REVOKE ALL ON FUNCTION public.update_challenge_progress(UUID, INT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.respond_to_challenge(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_challenge_progress(UUID, INT) TO authenticated;

-- ------------------------------------------------------------- group_members
REVOKE INSERT ON public.group_members FROM authenticated;
DROP POLICY IF EXISTS "group_members insert self" ON public.group_members;

CREATE OR REPLACE FUNCTION private.create_group(p_name TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); g RECORD; new_code TEXT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF p_name IS NULL OR length(btrim(p_name)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_name');
  END IF;

  LOOP
    new_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE code = new_code);
  END LOOP;

  INSERT INTO public.groups (name, code, owner_id)
  VALUES (btrim(p_name), new_code, uid)
  RETURNING * INTO g;

  INSERT INTO public.group_members (group_id, user_id) VALUES (g.id, uid);

  RETURN jsonb_build_object('ok', true, 'id', g.id, 'name', g.name,
                            'code', g.code, 'owner_id', g.owner_id);
END; $fn$;

CREATE OR REPLACE FUNCTION public.create_group(p_name TEXT)
RETURNS jsonb LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.create_group(p_name); $fn$;
REVOKE ALL ON FUNCTION public.create_group(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_group(TEXT) TO authenticated;

-- ------------------------------------------------------------------ xp_events
-- Tam sunucu hesabı (study_logs'tan yeniden türetme) ayrı bir iş. Buradaki
-- amaç lig manipülasyonunu kapatmak: bilinmeyen eylem reddedilir, miktar
-- eylem başına tavana kırpılır, günlük toplam sınırlanır.
REVOKE INSERT ON public.xp_events FROM authenticated;
DROP POLICY IF EXISTS "xp_events insert own" ON public.xp_events;

CREATE OR REPLACE FUNCTION private.award_xp(p_action TEXT, p_amount INT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE
  uid UUID := auth.uid();
  cap INT;
  daily_total INT;
  DAILY_CAP CONSTANT INT := 3000;
  amt INT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;

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

  INSERT INTO public.xp_events (user_id, amount, action) VALUES (uid, amt, p_action);
  RETURN jsonb_build_object('ok', true, 'amount', amt);
END; $fn$;

CREATE OR REPLACE FUNCTION public.award_xp(p_action TEXT, p_amount INT)
RETURNS jsonb LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.award_xp(p_action, p_amount); $fn$;
REVOKE ALL ON FUNCTION public.award_xp(TEXT, INT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_xp(TEXT, INT) TO authenticated;
