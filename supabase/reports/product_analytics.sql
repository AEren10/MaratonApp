-- Maraton product analytics — owner-only report bundle
-- Project: zrycqfehhyjrsujmajpf
-- Run individual numbered statements in Supabase Dashboard > SQL Editor.
-- Do not expose these cross-user queries through the mobile authenticated role.

-- 01 — Pipeline health
SELECT
  count(*) AS total_events,
  count(DISTINCT user_id) AS users_seen,
  min(occurred_at) AS first_event_at,
  max(occurred_at) AS last_event_at,
  count(*) FILTER (WHERE client_event_id IS NULL) AS legacy_without_client_id,
  count(*) FILTER (WHERE occurred_at > now() + interval '5 minutes') AS future_dated_events
FROM public.analytics_events;

-- 02 — Daily volume and duplicate health (last 30 Istanbul days)
SELECT
  (occurred_at AT TIME ZONE 'Europe/Istanbul')::date AS day,
  count(*) AS events,
  count(DISTINCT user_id) AS active_users,
  count(*) FILTER (WHERE client_event_id IS NOT NULL) AS idempotent_events,
  count(*) FILTER (WHERE client_event_id IS NOT NULL)
    - count(DISTINCT (user_id, client_event_id)) FILTER (WHERE client_event_id IS NOT NULL)
    AS duplicate_new_format_events
FROM public.analytics_events
WHERE occurred_at >= (now() AT TIME ZONE 'Europe/Istanbul')::date - interval '29 days'
GROUP BY 1
ORDER BY 1 DESC;

-- 03 — Screen usage (last 30 days)
SELECT
  props->>'screen' AS screen,
  count(*) AS views,
  count(DISTINCT user_id) AS unique_users,
  round(count(*)::numeric / NULLIF(count(DISTINCT user_id), 0), 2) AS views_per_user
FROM public.analytics_events
WHERE event = 'screen.view'
  AND occurred_at >= now() - interval '30 days'
  AND NULLIF(props->>'screen', '') IS NOT NULL
GROUP BY 1
ORDER BY views DESC, screen;

-- 04 — Median screen duration and bounce rate (last 30 days)
WITH durations AS (
  SELECT
    props->>'screen' AS screen,
    CASE
      WHEN props->>'durationSec' ~ '^\d+(\.\d+)?$'
        THEN (props->>'durationSec')::numeric
      ELSE NULL
    END AS duration_seconds,
    CASE props->>'isBounce'
      WHEN 'true' THEN true
      WHEN 'false' THEN false
      ELSE false
    END AS is_bounce
  FROM public.analytics_events
  WHERE event = 'screen.duration'
    AND occurred_at >= now() - interval '30 days'
    AND NULLIF(props->>'screen', '') IS NOT NULL
)
SELECT
  screen,
  count(*) AS exits,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_seconds)::numeric, 1) AS median_seconds,
  round(100.0 * count(*) FILTER (WHERE is_bounce) / NULLIF(count(*), 0), 1) AS bounce_percent
FROM durations
GROUP BY screen
ORDER BY exits DESC, screen;

-- 05 — Screen-to-screen paths (last 30 days)
SELECT
  props->>'screen' AS from_screen,
  props->>'nextScreen' AS to_screen,
  count(*) AS transitions,
  count(DISTINCT user_id) AS unique_users
FROM public.analytics_events
WHERE event = 'screen.exit'
  AND occurred_at >= now() - interval '30 days'
  AND NULLIF(props->>'screen', '') IS NOT NULL
  AND NULLIF(props->>'nextScreen', '') IS NOT NULL
GROUP BY 1, 2
ORDER BY transitions DESC, from_screen, to_screen
LIMIT 100;

-- 06 — DAU / WAU / MAU snapshot
SELECT
  count(DISTINCT user_id) FILTER (WHERE occurred_at >= now() - interval '1 day') AS dau_24h,
  count(DISTINCT user_id) FILTER (WHERE occurred_at >= now() - interval '7 days') AS wau_7d,
  count(DISTINCT user_id) FILTER (WHERE occurred_at >= now() - interval '30 days') AS mau_30d
FROM public.analytics_events;

-- 07 — Activation funnel (all-time, ordered completion)
WITH first_event AS (
  SELECT user_id, event, min(occurred_at) AS at
  FROM public.analytics_events
  WHERE event IN (
    'auth.register',
    'onboarding.complete',
    'route.created',
    'study.started',
    'study.completed'
  )
  GROUP BY user_id, event
), stages AS (
  SELECT
    user_id,
    min(at) FILTER (WHERE event = 'auth.register') AS registered_at,
    min(at) FILTER (WHERE event = 'onboarding.complete') AS onboarded_at,
    min(at) FILTER (WHERE event = 'route.created') AS route_created_at,
    min(at) FILTER (WHERE event = 'study.started') AS study_started_at,
    min(at) FILTER (WHERE event = 'study.completed') AS study_completed_at
  FROM first_event
  GROUP BY user_id
)
SELECT stage, users,
  round(100.0 * users / NULLIF(max(users) OVER (), 0), 1) AS percent_of_registered
FROM (
  SELECT 1 AS ordering, 'Registered' AS stage, count(*) FILTER (WHERE registered_at IS NOT NULL) AS users FROM stages
  UNION ALL
  SELECT 2, 'Onboarding complete', count(*) FILTER (
    WHERE onboarded_at >= registered_at
  ) FROM stages
  UNION ALL
  SELECT 3, 'Route created', count(*) FILTER (
    WHERE route_created_at >= onboarded_at AND onboarded_at >= registered_at
  ) FROM stages
  UNION ALL
  SELECT 4, 'Study started', count(*) FILTER (
    WHERE study_started_at >= route_created_at
      AND route_created_at >= onboarded_at
      AND onboarded_at >= registered_at
  ) FROM stages
  UNION ALL
  SELECT 5, 'Study completed', count(*) FILTER (
    WHERE study_completed_at >= study_started_at
      AND study_started_at >= route_created_at
      AND route_created_at >= onboarded_at
      AND onboarded_at >= registered_at
  ) FROM stages
) funnel
ORDER BY ordering;

-- 08 — D1 / D7 / D30 meaningful retention
-- Cohort day is a user's first meaningful learning day. Return is measured on
-- the exact Istanbul calendar day, not merely app-open activity.
WITH meaningful_days AS (
  SELECT DISTINCT
    user_id,
    (occurred_at AT TIME ZONE 'Europe/Istanbul')::date AS activity_day
  FROM public.analytics_events
  WHERE event IN (
    'study.completed',
    'route.stop_transitioned',
    'trial.entered',
    'wrong.reviewed'
  )
), cohorts AS (
  SELECT user_id, min(activity_day) AS cohort_day
  FROM meaningful_days
  GROUP BY user_id
), retained AS (
  SELECT
    c.user_id,
    c.cohort_day,
    bool_or(m.activity_day = c.cohort_day + 1) AS d1,
    bool_or(m.activity_day = c.cohort_day + 7) AS d7,
    bool_or(m.activity_day = c.cohort_day + 30) AS d30
  FROM cohorts c
  JOIN meaningful_days m ON m.user_id = c.user_id
  GROUP BY c.user_id, c.cohort_day
)
SELECT
  date_trunc('week', cohort_day)::date AS cohort_week,
  count(*) AS cohort_users,
  round(100.0 * count(*) FILTER (WHERE d1) / NULLIF(count(*), 0), 1) AS d1_percent,
  round(100.0 * count(*) FILTER (WHERE d7) / NULLIF(count(*), 0), 1) AS d7_percent,
  round(100.0 * count(*) FILTER (WHERE d30) / NULLIF(count(*), 0), 1) AS d30_percent
FROM retained
GROUP BY 1
ORDER BY 1 DESC;

-- 09 — Weekly meaningful study days per active learner
WITH study_days AS (
  SELECT DISTINCT
    user_id,
    date_trunc('week', occurred_at AT TIME ZONE 'Europe/Istanbul')::date AS week,
    (occurred_at AT TIME ZONE 'Europe/Istanbul')::date AS day
  FROM public.analytics_events
  WHERE event IN ('study.completed', 'route.stop_transitioned', 'trial.entered', 'wrong.reviewed')
    AND occurred_at >= now() - interval '12 weeks'
), per_user AS (
  SELECT user_id, week, count(*) AS active_days
  FROM study_days
  GROUP BY user_id, week
)
SELECT
  week,
  count(*) AS active_learners,
  round(avg(active_days), 2) AS average_active_days,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY active_days) AS median_active_days
FROM per_user
GROUP BY week
ORDER BY week DESC;

-- 10 — Push opened → meaningful activity within 24 hours
WITH opens AS (
  SELECT user_id, occurred_at AS opened_at
  FROM public.analytics_events
  WHERE event = 'push.opened'
    AND occurred_at >= now() - interval '30 days'
), outcomes AS (
  SELECT
    o.user_id,
    o.opened_at,
    EXISTS (
      SELECT 1
      FROM public.analytics_events a
      WHERE a.user_id = o.user_id
        AND a.event IN ('study.completed', 'route.stop_transitioned', 'trial.entered', 'wrong.reviewed')
        AND a.occurred_at >= o.opened_at
        AND a.occurred_at < o.opened_at + interval '24 hours'
    ) AS converted
  FROM opens o
)
SELECT
  count(*) AS push_opens,
  count(*) FILTER (WHERE converted) AS meaningful_within_24h,
  round(100.0 * count(*) FILTER (WHERE converted) / NULLIF(count(*), 0), 1) AS conversion_percent
FROM outcomes;

-- 11 — Streak transition trend (last 12 Istanbul weeks)
SELECT
  date_trunc('week', occurred_at AT TIME ZONE 'Europe/Istanbul')::date AS week,
  count(*) FILTER (WHERE event = 'streak.continued') AS continued,
  count(*) FILTER (WHERE event = 'streak.broken') AS broken,
  count(DISTINCT user_id) AS affected_users
FROM public.analytics_events
WHERE event IN ('streak.continued', 'streak.broken')
  AND occurred_at >= now() - interval '12 weeks'
GROUP BY 1
ORDER BY 1 DESC;
