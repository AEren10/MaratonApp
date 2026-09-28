-- Separate TYT + second-exam targets are user-owned profile fields.
-- `target_net` stays as the total/backward-compatible value.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_net_tyt numeric(5,2),
  ADD COLUMN IF NOT EXISTS target_net_second numeric(5,2);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_target_net_tyt_range,
  DROP CONSTRAINT IF EXISTS profiles_target_net_second_range;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_target_net_tyt_range
    CHECK (target_net_tyt IS NULL OR (target_net_tyt >= 0 AND target_net_tyt <= 120)),
  ADD CONSTRAINT profiles_target_net_second_range
    CHECK (target_net_second IS NULL OR (target_net_second >= 0 AND target_net_second <= 120));

GRANT UPDATE (target_net_tyt, target_net_second) ON public.profiles TO authenticated;

ALTER TABLE public.trials
  DROP CONSTRAINT IF EXISTS trials_exam_type_check;

ALTER TABLE public.trials
  ADD CONSTRAINT trials_exam_type_check
  CHECK (exam_type IN ('TYT', 'AYT_SAY', 'AYT_EA', 'AYT_SOZ', 'YDT', 'BRANCH', 'AYT', 'LGS'));

ALTER TABLE public.trial_subjects
  DROP CONSTRAINT IF EXISTS trial_subjects_subject_check;

ALTER TABLE public.trial_subjects
  ADD CONSTRAINT trial_subjects_subject_check CHECK (
    subject IN (
      'tyt_turkce', 'tyt_matematik', 'tyt_fen', 'tyt_sosyal',
      'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
      'ayt_edebiyat', 'ayt_tarih1', 'ayt_cografya1',
      'ayt_tarih2', 'ayt_cografya2', 'ayt_felsefe', 'ayt_din',
      'ydt_ingilizce',
      'lgs_turkce', 'lgs_matematik', 'lgs_fen',
      'lgs_inkilap', 'lgs_din', 'lgs_ingilizce'
    )
  );

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
     OR upper(p_exam_type) NOT IN ('TYT','AYT','AYT_SAY','AYT_EA','AYT_SOZ','YDT','BRANCH','LGS')
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
      WHEN 'ayt_din' THEN 6 WHEN 'ydt_ingilizce' THEN 80
      WHEN 'lgs_turkce' THEN 20 WHEN 'lgs_matematik' THEN 20
      WHEN 'lgs_fen' THEN 20 WHEN 'lgs_inkilap' THEN 10
      WHEN 'lgs_din' THEN 10 WHEN 'lgs_ingilizce' THEN 10 ELSE NULL END;
    IF subject_key IS NULL OR subject_max IS NULL
       OR subject_key = ANY(allowed_subjects)
       OR correct_count < 0 OR wrong_count < 0 OR empty_count < 0
       OR correct_count + wrong_count + empty_count > subject_max THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'invalid_subject');
    END IF;
    IF (upper(p_exam_type) = 'TYT' AND subject_key NOT LIKE 'tyt_%')
       OR (upper(p_exam_type) = 'LGS' AND subject_key NOT LIKE 'lgs_%')
       OR (upper(p_exam_type) = 'YDT' AND subject_key NOT LIKE 'ydt_%')
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
