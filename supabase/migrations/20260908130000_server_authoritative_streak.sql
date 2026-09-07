-- STREAK ARTIK SUNUCU OTORİTESİNDE
--
-- Sorun: streaks tablosunda UPDATE politikası `auth.uid() = user_id` idi ve
-- authenticated rolünün UPDATE grant'i vardı. Yani kullanıcı tek bir istekle
-- current_streak = 365 yazabiliyordu. claim_streak_milestone RPC'si (doğru
-- yazılmış, idempotent) bu değeri OTORİTE kabul ettiği için 14/30/60/100/365
-- milestone'ları talep edilerek toplam 55 gün bedava premium alınabiliyordu.
--
-- Çözüm: istemci streak SAYISI yazamaz. Yalnızca "şu tarihte çalıştım" der;
-- sunucu o tarihte GERÇEKTEN çalışma kaydı olup olmadığını doğrular ve
-- geçişi kendisi hesaplar. Hesap mantığı src/lib/streakFreeze.js ile birebir.

-- Geçmişe dönük sahte çalışma kaydıyla streak şişirmeyi sınırla.
-- (Streak'i ilerletmek artık gerçek study_log gerektirdiği için, kaydın
-- tarih aralığı da sınırlanmalı.)
ALTER TABLE public.study_logs DROP CONSTRAINT IF EXISTS study_logs_date_sane;
ALTER TABLE public.study_logs ADD CONSTRAINT study_logs_date_sane
  CHECK (
    study_date >= DATE '2024-01-01'
    AND study_date <= ((now() AT TIME ZONE 'Europe/Istanbul')::date + 1)
  );

CREATE OR REPLACE FUNCTION private.touch_streak(p_study_date DATE)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  uid UUID := auth.uid();
  today_tr DATE := (now() AT TIME ZONE 'Europe/Istanbul')::date;
  d DATE;
  s RECORD;
  has_log BOOLEAN;
  new_streak INT;
  freeze_count INT;
  freeze_reset TIMESTAMPTZ;
  last_freeze TIMESTAMPTZ;
  used_freeze BOOLEAN := false;
  transition TEXT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  d := COALESCE(p_study_date, today_tr);
  -- Gelecek tarih kabul edilmez.
  IF d > today_tr THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'future_date');
  END IF;

  -- EN ÖNEMLİ KONTROL: o gün gerçekten çalışma kaydı yoksa streak ilerlemez.
  -- Bu olmadan istemci gün gün touch_streak çağırarak seriyi uydurabilirdi.
  SELECT EXISTS (
    SELECT 1 FROM public.study_logs
     WHERE user_id = uid AND study_date = d
  ) INTO has_log;

  IF NOT has_log THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_study_log');
  END IF;

  SELECT * INTO s FROM public.streaks WHERE user_id = uid FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (uid, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO s FROM public.streaks WHERE user_id = uid FOR UPDATE;
  END IF;

  -- Haftalık joker yenilemesi
  freeze_count := COALESCE(s.freeze_count, 0);
  freeze_reset := s.freeze_reset_at;
  last_freeze  := s.last_freeze_at;
  IF freeze_reset IS NULL OR freeze_reset <= now() THEN
    freeze_count := 1;
    freeze_reset := date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul')
                    + INTERVAL '7 days';
  END IF;

  IF s.last_study_date = d THEN
    new_streak := GREATEST(COALESCE(s.current_streak, 0), 1);
    transition := 'same_day';
  ELSIF s.last_study_date = d - 1 THEN
    new_streak := COALESCE(s.current_streak, 0) + 1;
    transition := 'continued';
  ELSIF s.last_study_date = d - 2 AND freeze_count > 0 THEN
    new_streak := COALESCE(s.current_streak, 0) + 1;
    freeze_count := freeze_count - 1;
    used_freeze := true;
    last_freeze := now();
    transition := 'freeze_used';
  ELSE
    new_streak := 1;
    transition := CASE WHEN COALESCE(s.current_streak, 0) > 1 THEN 'broken' ELSE 'started' END;
  END IF;

  -- Geriye dönük çağrı seriyi GERİ ALMAMALI.
  IF s.last_study_date IS NOT NULL AND d < s.last_study_date THEN
    RETURN jsonb_build_object('ok', true, 'transition', 'stale',
      'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
      'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
      'freeze_reset_at', s.freeze_reset_at);
  END IF;

  UPDATE public.streaks
     SET current_streak = new_streak,
         longest_streak = GREATEST(new_streak, COALESCE(longest_streak, 0)),
         last_study_date = d,
         freeze_count = freeze_count,
         freeze_reset_at = freeze_reset,
         last_freeze_at = last_freeze
   WHERE user_id = uid
   RETURNING * INTO s;

  RETURN jsonb_build_object(
    'ok', true, 'transition', transition, 'used_freeze', used_freeze,
    'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
    'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
    'freeze_reset_at', s.freeze_reset_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_streak(p_study_date DATE DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT private.touch_streak(p_study_date);
$$;

REVOKE ALL ON FUNCTION public.touch_streak(DATE) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.touch_streak(DATE) TO authenticated;

-- İstemci artık streak sayısı YAZAMAZ.
REVOKE INSERT, UPDATE ON public.streaks FROM authenticated;
DROP POLICY IF EXISTS "Users can update own streak" ON public.streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON public.streaks;
