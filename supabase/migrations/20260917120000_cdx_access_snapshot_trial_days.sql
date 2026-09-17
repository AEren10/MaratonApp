-- Keep the client premium snapshot contract in sync with PremiumContext.
-- PremiumContext reads trialDaysLeft/trialEndsAt; older RPC bodies returned
-- only accessMode/isPremium/isFirstWeek, so trial UI could show 0 days.

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
  trial_ends_at TIMESTAMPTZ;
  trial_days_left INTEGER := 0;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  first_week := private.is_first_week(uid, now_tr);
  pro := private.has_pro_access(uid, now_tr);
  mode := CASE WHEN pro THEN 'premium' WHEN first_week THEN 'onboarding_grace' ELSE 'free' END;

  SELECT p.trial_started_at + interval '7 days'
    INTO trial_ends_at
    FROM public.profiles p
   WHERE p.id = uid
     AND p.trial_started_at IS NOT NULL
     AND p.trial_started_at + interval '7 days' > now_tr;

  IF trial_ends_at IS NOT NULL THEN
    trial_days_left := greatest(0, ceil(extract(epoch FROM (trial_ends_at - now_tr)) / 86400.0)::int);
  END IF;

  SELECT count(*) INTO trial_used
    FROM public.feature_usage_events
   WHERE user_id = uid AND feature_key = 'trial_entry' AND period_start = v_period_start;

  RETURN jsonb_build_object(
    'ok', true,
    'accessMode', mode,
    'isPremium', pro,
    'isFirstWeek', first_week,
    'trialEndsAt', trial_ends_at,
    'trialDaysLeft', trial_days_left,
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

REVOKE ALL ON FUNCTION private.get_product_access_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_product_access_snapshot() TO authenticated;
