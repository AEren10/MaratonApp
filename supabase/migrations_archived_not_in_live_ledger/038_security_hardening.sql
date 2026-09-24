-- 038: Security Advisor bulgularinin kapatilmasi (2026-08-18 audit)
--
-- Canli DB uzerinde dogrulanan 3 acik:
--   1) grant_premium anon + authenticated tarafindan cagrilabiliyordu
--      -> herkes kendine premium verebilirdi (037 canliya uygulanmamis).
--   2) profiles_public view'i anon'a aciktı -> girissiz tum kullanici listesi.
--   3) 5 fonksiyonda search_path sabitlenmemis.

-- ---------------------------------------------------------------------------
-- 1. Fonksiyon yetkileri: varsayilan PUBLIC EXECUTE'u kaldir
-- ---------------------------------------------------------------------------

-- Sadece service_role cagirabilmeli (RevenueCat webhook).
REVOKE ALL ON FUNCTION public.grant_premium(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_premium(uuid, integer) TO service_role;

-- Trigger fonksiyonlari: hicbir client cagirmamali.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_daily_xp_cap() FROM PUBLIC, anon, authenticated;

-- Kullanici fonksiyonlari: anon'a kapali, sadece giris yapmis kullanici.
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

REVOKE ALL ON FUNCTION public.my_percentiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_percentiles() TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.join_group_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_topic_progress() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_topic_progress() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. profiles_public: anon erisimini kes
--    Girissiz kullanici tum profilleri (isim, sinav tipi, alan) cekebiliyordu.
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.profiles_public FROM anon, PUBLIC;
GRANT SELECT ON public.profiles_public TO authenticated;

-- subject_percentile materialized view'i de Data API uzerinden aciktı.
REVOKE ALL ON public.subject_percentile FROM anon, PUBLIC;
GRANT SELECT ON public.subject_percentile TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. search_path sabitleme (search_path injection'a karsi)
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.handle_new_user()        SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_updated_at()      SET search_path = public, pg_temp;
ALTER FUNCTION public.update_topic_progress()  SET search_path = public, pg_temp;
ALTER FUNCTION public.check_daily_xp_cap()     SET search_path = public, pg_temp;
ALTER FUNCTION public.grant_premium(uuid, integer) SET search_path = public, pg_temp;
