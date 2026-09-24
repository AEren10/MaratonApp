-- PAYWALL OZELLIK ANAHTARLARI: topic_progress + department_threshold
--
-- NEDEN: Tasarim ("Deneme Kotasi Doldu" artboardindaki "PAYWALL NEREDE CIKAR"
-- listesi) sekiz tetik noktasi tanimliyor. Ikisinin sunucu tarafinda ozellik
-- anahtari yoktu:
--   4 · "Ucten fazla oncelikli alan gorulmek istendiginde" -> topicProgress
--   8 · "Hedef bolum karsilastirmasi istendiginde"          -> departmentThreshold
--
-- Istemci (src/constants/premium.js) bu anahtarlari BILEREK tanimlamiyordu:
-- canAccessProductFeature fail-closed calisiyor, sunucu anahtari dondurmezse
-- ozellik premium kullanici icin de kapali kalir. Sira: once sunucu, sonra istemci.
--
-- Ikisi de rota zekasi sinifinda, yani route_priorities ile AYNI kural:
-- ilk hafta muafiyeti VEYA pro.
--
-- CANLI DOGRULAMA (2026-09-11, SQL editoru, proje zrycqfehhyjrsujmajpf):
--   private.get_product_access_snapshot uzunlugu 1795 karakter, 'monthlyReport'
--   iceriyor, 'topicProgress' ICERMIYOR, 'first_week OR pro' 9 kez geciyor.
--   Yani canli tanim 20260909100000_product_access_companionship.sql ile
--   birebir ayni; asagidaki govde o dosyadan cogaltildi, drift yok.
--
-- DIKKAT: degisiklik PRIVATE fonksiyona yapilir. public.get_product_access_snapshot
-- yalnizca 212 karakterlik sarmalayici, ona dokunulmaz.

CREATE OR REPLACE FUNCTION private.has_feature_access(
  p_user_id UUID,
  p_feature_key TEXT,
  p_at TIMESTAMPTZ DEFAULT now()
)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
  SELECT CASE
    WHEN p_feature_key IN (
      'route', 'route_forecast', 'route_scenarios', 'route_priorities',
      'trial_compare', 'ocr', 'monthly_report',
      'topic_progress', 'department_threshold'
    ) THEN private.is_first_week(p_user_id, p_at) OR private.has_pro_access(p_user_id, p_at)
    ELSE true
  END;
$fn$;

CREATE OR REPLACE FUNCTION private.get_product_access_snapshot()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE
  uid UUID := auth.uid();
  now_tr TIMESTAMPTZ := now();
  v_period_start DATE := date_trunc('month', now_tr AT TIME ZONE 'Europe/Istanbul')::date;
  next_period DATE := (date_trunc('month', now_tr AT TIME ZONE 'Europe/Istanbul') + interval '1 month')::date;
  trial_used INTEGER := 0;
  first_week BOOLEAN;
  pro BOOLEAN;
  mode TEXT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  first_week := private.is_first_week(uid, now_tr);
  pro := private.has_pro_access(uid, now_tr);
  mode := CASE WHEN pro THEN 'premium' WHEN first_week THEN 'onboarding_grace' ELSE 'free' END;

  SELECT count(*) INTO trial_used
    FROM public.feature_usage_events
   WHERE user_id = uid AND feature_key = 'trial_entry' AND period_start = v_period_start;

  RETURN jsonb_build_object(
    'ok', true,
    'accessMode', mode,
    'isPremium', pro,
    'isFirstWeek', first_week,
    'features', jsonb_build_object(
      'route', first_week OR pro,
      'routeForecast', first_week OR pro,
      'routeScenarios', first_week OR pro,
      'routePriorities', first_week OR pro,
      'trialCompare', first_week OR pro,
      'ocr', first_week OR pro,
      'monthlyReport', first_week OR pro,
      'topicProgress', first_week OR pro,
      'departmentThreshold', first_week OR pro
    ),
    'quotas', jsonb_build_object(
      'trialEntry', jsonb_build_object(
        'used', trial_used,
        'limit', 4,
        'remaining', CASE WHEN first_week OR pro THEN NULL ELSE greatest(0, 4 - trial_used) END,
        'unlimited', first_week OR pro,
        'resetsAt', (next_period::timestamp AT TIME ZONE 'Europe/Istanbul')
      )
    )
  );
END; $fn$;

REVOKE ALL ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) TO authenticated;
REVOKE ALL ON FUNCTION private.get_product_access_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_product_access_snapshot() TO authenticated;
