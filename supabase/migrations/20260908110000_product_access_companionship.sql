-- Product access, server-authoritative trial quota, normalized trial snapshots,
-- and privacy-safe route companionship.

CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL CHECK (entitlement_key IN ('pro')),
  source TEXT NOT NULL CHECK (source IN ('revenuecat', 'referral', 'streak_reward', 'admin')),
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entitlement_key, source, external_id)
);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_entitlements FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_user_entitlements_access
  ON public.user_entitlements (user_id, entitlement_key, status, valid_until);

CREATE TABLE IF NOT EXISTS public.feature_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL CHECK (feature_key IN ('trial_entry')),
  period_start DATE NOT NULL,
  client_operation_id TEXT NOT NULL,
  resource_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature_key, client_operation_id)
);

ALTER TABLE public.feature_usage_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feature_usage_events FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_feature_usage_period
  ON public.feature_usage_events (user_id, feature_key, period_start);

-- Geçiş ayında daha önce girilen denemeler kotayı sıfırlamış görünmesin.
INSERT INTO public.feature_usage_events (
  user_id, feature_key, period_start, client_operation_id, resource_id, created_at
)
SELECT t.user_id, 'trial_entry',
       date_trunc('month', t.created_at AT TIME ZONE 'Europe/Istanbul')::date,
       'backfill:' || t.id::text, t.id, t.created_at
  FROM public.trials t
 WHERE t.created_at >= date_trunc('month', now() AT TIME ZONE 'Europe/Istanbul')
ON CONFLICT (user_id, feature_key, client_operation_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.trial_publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_publishers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "active trial publishers are readable" ON public.trial_publishers;
CREATE POLICY "active trial publishers are readable" ON public.trial_publishers
  FOR SELECT TO authenticated USING (active = true);
REVOKE ALL ON public.trial_publishers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.trial_publishers TO authenticated;

INSERT INTO public.trial_publishers (key, name) VALUES
  ('karekok', 'Karekök'),
  ('bilgi_sarmal', 'Bilgi Sarmal'),
  ('limit', 'Limit'),
  ('apotemi', 'Apotemi'),
  ('orijinal', 'Orijinal'),
  ('birey', 'Birey'),
  ('other', 'Diğer')
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name;

ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES public.trial_publishers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS publisher_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_multiplier NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS normalization_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS normalization_confidence TEXT NOT NULL DEFAULT 'self_reported',
  ADD COLUMN IF NOT EXISTS raw_total_net NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS normalized_total_net NUMERIC(6,2);

UPDATE public.trials
SET raw_total_net = COALESCE(raw_total_net, total_net),
    normalized_total_net = COALESCE(normalized_total_net, total_net),
    difficulty_level = COALESCE(difficulty_level, 'standard'),
    difficulty_multiplier = COALESCE(difficulty_multiplier, 1.00)
WHERE raw_total_net IS NULL
   OR normalized_total_net IS NULL
   OR difficulty_level IS NULL
   OR difficulty_multiplier IS NULL;

ALTER TABLE public.trials
  ALTER COLUMN raw_total_net SET DEFAULT 0,
  ALTER COLUMN raw_total_net SET NOT NULL,
  ALTER COLUMN normalized_total_net SET DEFAULT 0,
  ALTER COLUMN normalized_total_net SET NOT NULL,
  ALTER COLUMN difficulty_level SET DEFAULT 'standard',
  ALTER COLUMN difficulty_level SET NOT NULL,
  ALTER COLUMN difficulty_multiplier SET DEFAULT 1.00,
  ALTER COLUMN difficulty_multiplier SET NOT NULL;

ALTER TABLE public.trials DROP CONSTRAINT IF EXISTS trials_difficulty_band_check;
ALTER TABLE public.trials ADD CONSTRAINT trials_difficulty_band_check
  CHECK (difficulty_level IN ('easy', 'standard', 'hard', 'very_hard'));
ALTER TABLE public.trials DROP CONSTRAINT IF EXISTS trials_difficulty_factor_check;
ALTER TABLE public.trials ADD CONSTRAINT trials_difficulty_factor_check
  CHECK (difficulty_multiplier IN (0.94, 1.00, 1.12, 1.22));

CREATE OR REPLACE FUNCTION private.has_pro_access(p_user_id UUID, p_at TIMESTAMPTZ DEFAULT now())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.id = p_user_id
       AND (
         p.premium_until > p_at
         OR (p.trial_started_at IS NOT NULL AND p.trial_started_at + interval '7 days' > p_at)
       )
  ) OR EXISTS (
    SELECT 1 FROM public.user_entitlements e
     WHERE e.user_id = p_user_id
       AND e.entitlement_key = 'pro'
       AND e.status = 'active'
       AND e.valid_from <= p_at
       AND (e.valid_until IS NULL OR e.valid_until > p_at)
  );
$fn$;

CREATE OR REPLACE FUNCTION private.is_first_week(p_user_id UUID, p_at TIMESTAMPTZ DEFAULT now())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.id = p_user_id
       AND p.created_at IS NOT NULL
       AND p.created_at <= p_at
       AND p.created_at + interval '7 days' > p_at
  );
$fn$;

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
      'trial_compare', 'ocr', 'monthly_report'
    ) THEN private.is_first_week(p_user_id, p_at) OR private.has_pro_access(p_user_id, p_at)
    ELSE true
  END;
$fn$;

REVOKE ALL ON FUNCTION private.has_pro_access(UUID, TIMESTAMPTZ) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_first_week(UUID, TIMESTAMPTZ) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_pro_access(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_first_week(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) TO authenticated;

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
      'monthlyReport', first_week OR pro
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

CREATE OR REPLACE FUNCTION public.get_product_access_snapshot()
RETURNS JSONB LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $fn$ SELECT private.get_product_access_snapshot(); $fn$;
REVOKE ALL ON FUNCTION public.get_product_access_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_product_access_snapshot() TO authenticated;

CREATE OR REPLACE FUNCTION private.create_trial(
  p_client_operation_id TEXT,
  p_name TEXT,
  p_trial_date DATE,
  p_exam_type TEXT,
  p_field TEXT,
  p_branch_subject TEXT,
  p_mood TEXT,
  p_publisher_id UUID,
  p_difficulty_level TEXT,
  p_subjects JSONB
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE
  uid UUID := auth.uid();
  period_key DATE := date_trunc('month', now() AT TIME ZONE 'Europe/Istanbul')::date;
  existing_id UUID;
  trial_id UUID;
  publisher_name TEXT;
  factor NUMERIC(4,2);
  penalty NUMERIC := CASE WHEN upper(p_exam_type) = 'LGS' THEN (1.0 / 3.0) ELSE 0.25 END;
  raw_net NUMERIC := 0;
  normalized_net NUMERIC := 0;
  subject JSONB;
  subject_key TEXT;
  subject_max INTEGER;
  allowed_subjects TEXT[] := ARRAY[]::TEXT[];
  correct_count INTEGER;
  wrong_count INTEGER;
  empty_count INTEGER;
  total_questions INTEGER := 0;
  total_max_questions INTEGER := 0;
  max_questions INTEGER := CASE upper(p_exam_type) WHEN 'LGS' THEN 90 WHEN 'TYT' THEN 120 WHEN 'BRANCH' THEN 120 ELSE 80 END;
  used_count INTEGER;
  unlimited BOOLEAN;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF p_client_operation_id IS NULL OR length(btrim(p_client_operation_id)) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_operation_id');
  END IF;

  SELECT id INTO existing_id FROM public.trials
   WHERE user_id = uid AND client_operation_id = p_client_operation_id;
  IF existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', true, 'idempotent', true,
      'trial', (SELECT to_jsonb(t) || jsonb_build_object(
        'trial_subjects', COALESCE((SELECT jsonb_agg(to_jsonb(ts)) FROM public.trial_subjects ts WHERE ts.trial_id = t.id), '[]'::jsonb)
      ) FROM public.trials t WHERE t.id = existing_id)
    );
  END IF;

  IF p_name IS NULL OR length(btrim(p_name)) < 1 OR p_trial_date IS NULL
     OR upper(p_exam_type) NOT IN ('TYT','AYT','AYT_SAY','AYT_EA','AYT_SOZ','BRANCH','LGS')
     OR (p_mood IS NOT NULL AND p_mood NOT IN ('good', 'okay', 'bad'))
     OR jsonb_typeof(p_subjects) <> 'array' OR jsonb_array_length(p_subjects) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_trial');
  END IF;

  factor := CASE COALESCE(p_difficulty_level, 'standard')
    WHEN 'easy' THEN 0.94 WHEN 'standard' THEN 1.00
    WHEN 'hard' THEN 1.12 WHEN 'very_hard' THEN 1.22 ELSE NULL END;
  IF factor IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_difficulty'); END IF;

  IF p_publisher_id IS NOT NULL THEN
    SELECT name INTO publisher_name FROM public.trial_publishers
     WHERE id = p_publisher_id AND active = true;
    IF publisher_name IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_publisher'); END IF;
  END IF;

  FOR subject IN SELECT value FROM jsonb_array_elements(p_subjects) LOOP
    IF jsonb_typeof(subject->'correct_count') <> 'number'
       OR jsonb_typeof(subject->'wrong_count') <> 'number'
       OR jsonb_typeof(subject->'empty_count') <> 'number' THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'invalid_subject_counts');
    END IF;
    subject_key := subject->>'subject';
    correct_count := COALESCE((subject->>'correct_count')::INTEGER, 0);
    wrong_count := COALESCE((subject->>'wrong_count')::INTEGER, 0);
    empty_count := COALESCE((subject->>'empty_count')::INTEGER, 0);
    subject_max := CASE subject_key
      WHEN 'tyt_turkce' THEN 40 WHEN 'tyt_matematik' THEN 40
      WHEN 'tyt_fen' THEN 20 WHEN 'tyt_sosyal' THEN 20
      WHEN 'ayt_matematik' THEN 40 WHEN 'ayt_fizik' THEN 14
      WHEN 'ayt_kimya' THEN 13 WHEN 'ayt_biyoloji' THEN 13
      WHEN 'ayt_edebiyat' THEN 24 WHEN 'ayt_tarih1' THEN 10
      WHEN 'ayt_cografya1' THEN 6 WHEN 'ayt_tarih2' THEN 11
      WHEN 'ayt_cografya2' THEN 11 WHEN 'ayt_felsefe' THEN 12
      WHEN 'ayt_din' THEN 6 WHEN 'lgs_turkce' THEN 20
      WHEN 'lgs_matematik' THEN 20 WHEN 'lgs_fen' THEN 20
      WHEN 'lgs_inkilap' THEN 10 WHEN 'lgs_din' THEN 10
      WHEN 'lgs_ingilizce' THEN 10 ELSE NULL END;
    IF subject_key IS NULL OR subject_max IS NULL
       OR subject_key = ANY(allowed_subjects)
       OR correct_count < 0 OR wrong_count < 0 OR empty_count < 0
       OR correct_count + wrong_count + empty_count > subject_max THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'invalid_subject');
    END IF;
    IF (upper(p_exam_type) = 'TYT' AND subject_key NOT LIKE 'tyt_%')
       OR (upper(p_exam_type) = 'LGS' AND subject_key NOT LIKE 'lgs_%')
       OR (upper(p_exam_type) LIKE 'AYT%' AND subject_key NOT LIKE 'ayt_%')
       OR (upper(p_exam_type) = 'AYT_SAY' AND subject_key NOT IN
         ('ayt_matematik','ayt_fizik','ayt_kimya','ayt_biyoloji'))
       OR (upper(p_exam_type) = 'AYT_EA' AND subject_key NOT IN
         ('ayt_matematik','ayt_edebiyat','ayt_tarih1','ayt_cografya1'))
       OR (upper(p_exam_type) = 'AYT_SOZ' AND subject_key NOT IN
         ('ayt_edebiyat','ayt_tarih1','ayt_cografya1','ayt_tarih2',
          'ayt_cografya2','ayt_felsefe','ayt_din')) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'subject_exam_mismatch');
    END IF;
    allowed_subjects := array_append(allowed_subjects, subject_key);
    total_questions := total_questions + correct_count + wrong_count + empty_count;
    total_max_questions := total_max_questions + subject_max;
    raw_net := raw_net + correct_count - wrong_count * penalty;
  END LOOP;
  IF upper(p_exam_type) = 'BRANCH'
     AND (cardinality(allowed_subjects) <> 1 OR p_branch_subject IS DISTINCT FROM allowed_subjects[1]) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_branch_subjects');
  END IF;
  IF total_questions <= 0 OR total_questions > least(max_questions, total_max_questions) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_question_total');
  END IF;
  max_questions := least(max_questions, total_max_questions);
  raw_net := round(least(max_questions::NUMERIC, raw_net), 2);
  normalized_net := round(least(max_questions::NUMERIC, raw_net * factor), 2);

  unlimited := private.is_first_week(uid, now()) OR private.has_pro_access(uid, now());
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':trial_entry:' || period_key::text, 0));
  SELECT count(*) INTO used_count FROM public.feature_usage_events
   WHERE user_id = uid AND feature_key = 'trial_entry' AND period_start = period_key;
  IF NOT unlimited AND used_count >= 4 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'quota_exhausted',
      'used', used_count, 'limit', 4,
      'resetsAt', ((period_key + interval '1 month')::timestamp AT TIME ZONE 'Europe/Istanbul'));
  END IF;

  INSERT INTO public.trials (
    user_id, name, trial_date, exam_type, field, branch_subject, total_net, mood,
    client_operation_id, publisher_id, publisher_name_snapshot, difficulty_level,
    difficulty_multiplier, normalization_version, normalization_confidence,
    raw_total_net, normalized_total_net
  ) VALUES (
    uid, btrim(p_name), p_trial_date, upper(p_exam_type), p_field, p_branch_subject,
    raw_net, p_mood, p_client_operation_id, p_publisher_id, publisher_name,
    COALESCE(p_difficulty_level, 'standard'), factor, 1, 'self_reported',
    raw_net, normalized_net
  ) RETURNING id INTO trial_id;

  FOR subject IN SELECT value FROM jsonb_array_elements(p_subjects) LOOP
    INSERT INTO public.trial_subjects (
      trial_id, subject, correct_count, wrong_count, empty_count, wrong_penalty
    ) VALUES (
      trial_id, subject->>'subject', COALESCE((subject->>'correct_count')::INTEGER, 0),
      COALESCE((subject->>'wrong_count')::INTEGER, 0), COALESCE((subject->>'empty_count')::INTEGER, 0), penalty
    );
  END LOOP;

  IF NOT unlimited THEN
    INSERT INTO public.feature_usage_events
      (user_id, feature_key, period_start, client_operation_id, resource_id)
    VALUES (uid, 'trial_entry', period_key, p_client_operation_id, trial_id);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'trial', (SELECT to_jsonb(t) || jsonb_build_object(
      'trial_subjects', COALESCE((SELECT jsonb_agg(to_jsonb(ts)) FROM public.trial_subjects ts WHERE ts.trial_id = t.id), '[]'::jsonb)
    ) FROM public.trials t WHERE t.id = trial_id),
    'quota', jsonb_build_object('used', used_count + CASE WHEN unlimited THEN 0 ELSE 1 END,
      'limit', 4, 'unlimited', unlimited)
  );
END; $fn$;

REVOKE ALL ON FUNCTION private.create_trial(TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.create_trial(TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_trial(
  p_client_operation_id TEXT, p_name TEXT, p_trial_date DATE, p_exam_type TEXT,
  p_field TEXT, p_branch_subject TEXT, p_mood TEXT, p_publisher_id UUID,
  p_difficulty_level TEXT, p_subjects JSONB
)
RETURNS JSONB LANGUAGE sql SET search_path TO 'public', 'pg_temp'
AS $fn$ SELECT private.create_trial(
  p_client_operation_id, p_name, p_trial_date, p_exam_type, p_field,
  p_branch_subject, p_mood, p_publisher_id, p_difficulty_level, p_subjects
); $fn$;

REVOKE ALL ON FUNCTION public.create_trial(TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_trial(TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;
REVOKE INSERT ON public.trials FROM authenticated;
REVOKE INSERT, UPDATE ON public.trial_subjects FROM authenticated;

CREATE TABLE IF NOT EXISTS public.route_companionships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_low_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_high_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  CHECK (user_low_id < user_high_id),
  CHECK (requested_by IN (user_low_id, user_high_id)),
  UNIQUE (user_low_id, user_high_id)
);

ALTER TABLE public.route_companionships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "companionship participants read" ON public.route_companionships;
CREATE POLICY "companionship participants read" ON public.route_companionships
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (user_low_id, user_high_id));
REVOKE ALL ON public.route_companionships FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.route_companionships TO authenticated;

-- Eski geniş policy requester'ın kendi isteğini kabul etmesine de izin veriyordu.
-- Companionship iki taraflı onaya dayandığı için tam adını kullanarak kaldırılır.
DROP POLICY IF EXISTS "Users update friendships they are part of" ON public.friendships;

CREATE OR REPLACE FUNCTION private.request_route_companion(p_other_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); low_id UUID; high_id UUID; row_data RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF p_other_id IS NULL OR p_other_id = uid THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_user'); END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.friendships f WHERE f.status = 'accepted'
      AND ((f.requester_id = uid AND f.addressee_id = p_other_id)
        OR (f.requester_id = p_other_id AND f.addressee_id = uid))
  ) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_friends'); END IF;
  IF EXISTS (
    SELECT 1 FROM public.route_companionships c
     WHERE c.status = 'active'
       AND (uid IN (c.user_low_id, c.user_high_id)
         OR p_other_id IN (c.user_low_id, c.user_high_id))
  ) THEN RETURN jsonb_build_object('ok', false, 'reason', 'companion_limit'); END IF;
  low_id := least(uid, p_other_id); high_id := greatest(uid, p_other_id);
  INSERT INTO public.route_companionships (user_low_id, user_high_id, requested_by)
  VALUES (low_id, high_id, uid)
  ON CONFLICT (user_low_id, user_high_id) DO UPDATE
    SET status = CASE WHEN route_companionships.status IN ('declined','ended') THEN 'pending' ELSE route_companionships.status END,
        requested_by = CASE WHEN route_companionships.status IN ('declined','ended') THEN uid ELSE route_companionships.requested_by END,
        ended_at = NULL
  RETURNING * INTO row_data;
  RETURN jsonb_build_object('ok', true, 'companion', to_jsonb(row_data));
END; $fn$;

CREATE OR REPLACE FUNCTION private.respond_route_companion(p_id UUID, p_accept BOOLEAN)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); other_id UUID; row_data RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT * INTO row_data FROM public.route_companionships
   WHERE id = p_id AND status = 'pending' AND uid IN (user_low_id, user_high_id)
     AND requested_by <> uid
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_pending'); END IF;
  other_id := CASE WHEN uid = row_data.user_low_id THEN row_data.user_high_id ELSE row_data.user_low_id END;
  PERFORM pg_advisory_xact_lock(hashtextextended(least(uid, other_id)::text || ':companion', 0));
  PERFORM pg_advisory_xact_lock(hashtextextended(greatest(uid, other_id)::text || ':companion', 0));
  IF p_accept AND EXISTS (
    SELECT 1 FROM public.route_companionships c
     WHERE c.status = 'active'
       AND (uid IN (c.user_low_id, c.user_high_id)
         OR other_id IN (c.user_low_id, c.user_high_id))
  ) THEN RETURN jsonb_build_object('ok', false, 'reason', 'companion_limit'); END IF;
  UPDATE public.route_companionships
     SET status = CASE WHEN p_accept THEN 'active' ELSE 'declined' END,
         accepted_at = CASE WHEN p_accept THEN now() ELSE NULL END,
         ended_at = CASE WHEN p_accept THEN NULL ELSE now() END
   WHERE id = p_id
   RETURNING * INTO row_data;
  RETURN jsonb_build_object('ok', true, 'companion', to_jsonb(row_data));
END; $fn$;

CREATE OR REPLACE FUNCTION private.end_route_companion(p_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE uid UUID := auth.uid(); row_data RECORD;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  UPDATE public.route_companionships
     SET status = 'ended', ended_at = now()
   WHERE id = p_id AND status IN ('pending', 'active')
     AND uid IN (user_low_id, user_high_id)
   RETURNING * INTO row_data;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  RETURN jsonb_build_object('ok', true, 'companion', to_jsonb(row_data));
END; $fn$;

REVOKE ALL ON FUNCTION private.request_route_companion(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.respond_route_companion(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.end_route_companion(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.request_route_companion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.respond_route_companion(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION private.end_route_companion(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION private.get_route_companion_dashboard(p_id UUID, p_week_start DATE DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
DECLARE
  uid UUID := auth.uid(); c RECORD; other_id UUID;
  week_start DATE := COALESCE(p_week_start, date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul')::date);
  self_effort JSONB; other_effort JSONB; other_profile JSONB; shared_active_days INTEGER;
BEGIN
  SELECT * INTO c FROM public.route_companionships
   WHERE id = p_id AND status = 'active' AND uid IN (user_low_id, user_high_id);
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  other_id := CASE WHEN uid = c.user_low_id THEN c.user_high_id ELSE c.user_low_id END;
  IF EXISTS (
    SELECT 1 FROM public.friendships f WHERE f.status = 'blocked'
      AND ((f.requester_id = uid AND f.addressee_id = other_id)
        OR (f.requester_id = other_id AND f.addressee_id = uid))
  ) THEN RETURN jsonb_build_object('ok', false, 'reason', 'blocked'); END IF;

  SELECT jsonb_build_object(
    'questions', COALESCE(sum(d.questions), 0), 'minutes', COALESCE(sum(d.minutes), 0),
    'activeDays', count(*),
    'daily', COALESCE(jsonb_agg(jsonb_build_object('date', d.day, 'questions', d.questions, 'minutes', d.minutes) ORDER BY d.day), '[]'::jsonb)
  ) INTO self_effort FROM (
    SELECT study_date AS day, sum(question_count) AS questions, sum(duration_minutes) AS minutes
      FROM public.study_logs WHERE user_id = uid AND study_date BETWEEN week_start AND week_start + 6
     GROUP BY study_date
  ) d;

  SELECT jsonb_build_object(
    'questions', COALESCE(sum(d.questions), 0), 'minutes', COALESCE(sum(d.minutes), 0),
    'activeDays', count(*),
    'daily', COALESCE(jsonb_agg(jsonb_build_object('date', d.day, 'questions', d.questions, 'minutes', d.minutes) ORDER BY d.day), '[]'::jsonb)
  ) INTO other_effort FROM (
    SELECT study_date AS day, sum(question_count) AS questions, sum(duration_minutes) AS minutes
      FROM public.study_logs WHERE user_id = other_id AND study_date BETWEEN week_start AND week_start + 6
     GROUP BY study_date
  ) d;

  SELECT count(*) INTO shared_active_days FROM (
    SELECT study_date FROM public.study_logs
     WHERE user_id = uid AND study_date BETWEEN week_start AND week_start + 6
    INTERSECT
    SELECT study_date FROM public.study_logs
     WHERE user_id = other_id AND study_date BETWEEN week_start AND week_start + 6
  ) shared_days;

  SELECT jsonb_build_object('id', id, 'name', name, 'avatarUrl', avatar_url)
    INTO other_profile FROM public.profiles WHERE id = other_id;
  RETURN jsonb_build_object('ok', true, 'id', c.id, 'weekStart', week_start,
    'companion', other_profile, 'self', self_effort, 'other', other_effort,
    'together', jsonb_build_object(
      'activeDays', shared_active_days,
      'questions', (self_effort->>'questions')::int + (other_effort->>'questions')::int,
      'minutes', (self_effort->>'minutes')::int + (other_effort->>'minutes')::int
    ));
END; $fn$;

REVOKE ALL ON FUNCTION private.get_route_companion_dashboard(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_route_companion_dashboard(UUID, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION public.request_route_companion(p_other_id UUID)
RETURNS JSONB LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.request_route_companion(p_other_id); $fn$;
CREATE OR REPLACE FUNCTION public.respond_route_companion(p_id UUID, p_accept BOOLEAN)
RETURNS JSONB LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.respond_route_companion(p_id, p_accept); $fn$;
CREATE OR REPLACE FUNCTION public.end_route_companion(p_id UUID)
RETURNS JSONB LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.end_route_companion(p_id); $fn$;
CREATE OR REPLACE FUNCTION public.get_route_companion_dashboard(p_id UUID, p_week_start DATE DEFAULT NULL)
RETURNS JSONB LANGUAGE sql STABLE SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.get_route_companion_dashboard(p_id, p_week_start); $fn$;

REVOKE ALL ON FUNCTION public.request_route_companion(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_route_companion(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.end_route_companion(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_route_companion_dashboard(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_route_companion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_route_companion(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_route_companion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_route_companion_dashboard(UUID, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION private.end_companionship_on_block()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp' AS $fn$
BEGIN
  IF NEW.status = 'blocked' THEN
    UPDATE public.route_companionships
       SET status = 'ended', ended_at = now()
     WHERE status IN ('pending', 'active')
       AND user_low_id = least(NEW.requester_id, NEW.addressee_id)
       AND user_high_id = greatest(NEW.requester_id, NEW.addressee_id);
  END IF;
  RETURN NEW;
END; $fn$;

REVOKE ALL ON FUNCTION private.end_companionship_on_block() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS friendships_end_route_companion_on_block ON public.friendships;
CREATE TRIGGER friendships_end_route_companion_on_block
AFTER INSERT OR UPDATE OF status ON public.friendships
FOR EACH ROW EXECUTE FUNCTION private.end_companionship_on_block();

-- The route remains stored when access ends, but the Data API no longer exposes it.
DROP POLICY IF EXISTS "route weeks select own" ON public.route_weeks;
CREATE POLICY "route weeks select own" ON public.route_weeks FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
DROP POLICY IF EXISTS "route weeks insert own" ON public.route_weeks;
CREATE POLICY "route weeks insert own" ON public.route_weeks FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
DROP POLICY IF EXISTS "route weeks update own" ON public.route_weeks;
CREATE POLICY "route weeks update own" ON public.route_weeks FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'))
  WITH CHECK ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
DROP POLICY IF EXISTS "route weeks delete own" ON public.route_weeks;
CREATE POLICY "route weeks delete own" ON public.route_weeks FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));

DROP POLICY IF EXISTS "route state select own" ON public.route_state;
CREATE POLICY "route state select own" ON public.route_state FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
DROP POLICY IF EXISTS "route state upsert own" ON public.route_state;
CREATE POLICY "route state upsert own" ON public.route_state FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
DROP POLICY IF EXISTS "route state update own" ON public.route_state;
CREATE POLICY "route state update own" ON public.route_state FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'))
  WITH CHECK ((select auth.uid()) = user_id AND private.has_feature_access(user_id, 'route'));
