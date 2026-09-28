-- Premium askida (istemci: src/constants/premium.js PREMIUM_ENABLED = false).
-- Istemci butun ozellikleri acik gosterirken sunucu 'route', 'route_forecast'
-- vb. ozellikleri ilk 7 gunden sonra yalniz Pro'ya aciyordu: 8. gunune gelen
-- her kullanicinin rotasi kaydedilemiyor, durak islemleri reddediliyordu
-- ("route access required"). Kullanici karari (28 Eylul 2026): Premium
-- acilana kadar kilit kapali.
--
-- GERI ALMAK (Premium acilinca) icin onceki govde:
--   SELECT CASE WHEN p_feature_key IN (
--     'route', 'route_forecast', 'route_scenarios', 'route_priorities',
--     'trial_compare', 'ocr', 'monthly_report', 'topic_progress',
--     'department_threshold'
--   ) THEN private.is_first_week(p_user_id, p_at) OR private.has_pro_access(p_user_id, p_at)
--   ELSE true END;

CREATE OR REPLACE FUNCTION private.has_feature_access(
  p_user_id uuid,
  p_feature_key text,
  p_at timestamp with time zone DEFAULT now()
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$ SELECT true; $function$;
