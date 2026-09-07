-- PROFİL SIZINTISINI KAPATIR
--
-- Sorun: profiles üzerindeki SELECT politikası `USING (true)` ve authenticated
-- rolüne 30 sütunun TAMAMI için SELECT verilmişti. Yani giriş yapan herhangi
-- bir kullanıcı, Data API üzerinden `profiles?select=*` çağırarak tüm
-- kullanıcıların expo_push_token, premium_until, referral_code, exam_date,
-- target_ranking, notification_prefs ve last_active alanlarını okuyabiliyordu.
--
-- Neden RLS politikasını `auth.uid() = id` yapmıyoruz: sosyal yüzeylerin
-- tamamı (arkadaş listesi, istekler, challenge, topluluk cevapları) PostgREST
-- FK embed'leriyle BAŞKA kullanıcıların satırlarını okuyor; leaderboard_weekly
-- görünümü de `security_invoker = true`. Satırı kapatmak bunların hepsini
-- kırardı. Sızan şey satır değil SÜTUN olduğu için doğru kesme yeri de sütun.
--
-- Bu tabloda UPDATE zaten sütun bazlı sınırlıydı (premium_until, referral_code,
-- claimed_streak_milestones istemciye kapalı). SELECT aynı desene çekiliyor.

REVOKE SELECT ON public.profiles FROM authenticated;

-- Sosyal yüzeylerin gerçekten ihtiyaç duyduğu asgari küme.
-- show_in_leaderboard yalnızca leaderboard_weekly'nin WHERE'inde kullanılıyor;
-- security_invoker görünüm olduğu için çağıranın bu sütuna erişimi gerekiyor.
GRANT SELECT (id, name, avatar_url, show_in_leaderboard)
  ON public.profiles TO authenticated;

-- Kullanıcının KENDİ tam profili artık definer RPC üzerinden geliyor.
CREATE OR REPLACE FUNCTION private.get_my_profile()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT to_jsonb(p) - 'expo_push_token'
    FROM public.profiles p
   WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT private.get_my_profile();
$$;

REVOKE ALL ON FUNCTION public.get_my_profile() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- Arkadaş kodu araması referral_code okumayı gerektiriyordu. Kod artık
-- istemciye açılmadan sunucuda çözülüyor: yalnızca eşleşen kullanıcının
-- id ve adı dönüyor, kod listelenemiyor / numaralandırılamıyor.
CREATE OR REPLACE FUNCTION private.find_user_by_friend_code(code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  target RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;
  IF code IS NULL OR length(btrim(code)) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  SELECT p.id, p.name INTO target
    FROM public.profiles p
   WHERE p.referral_code = upper(btrim(code))
   LIMIT 1;

  IF target.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF target.id = auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self');
  END IF;

  RETURN jsonb_build_object('ok', true, 'id', target.id, 'name', target.name);
END;
$$;

CREATE OR REPLACE FUNCTION public.find_user_by_friend_code(code TEXT)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT private.find_user_by_friend_code(code);
$$;

REVOKE ALL ON FUNCTION public.find_user_by_friend_code(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.find_user_by_friend_code(TEXT) TO authenticated;
