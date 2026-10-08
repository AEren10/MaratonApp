-- Replace the catalog's generic "Other" choice with an optional private
-- publisher-name snapshot supplied by the trial owner.
DROP FUNCTION IF EXISTS public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB, INTEGER
);

CREATE OR REPLACE FUNCTION public.create_trial(
  p_client_operation_id TEXT,
  p_name TEXT,
  p_trial_date DATE,
  p_exam_type TEXT,
  p_field TEXT,
  p_branch_subject TEXT,
  p_mood TEXT,
  p_publisher_id UUID,
  p_difficulty_level TEXT,
  p_subjects JSONB,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_publisher_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  result JSONB;
  trial_id UUID;
  custom_publisher_name TEXT := NULLIF(btrim(p_publisher_name), '');
BEGIN
  IF p_duration_minutes IS NOT NULL
     AND (p_duration_minutes < 1 OR p_duration_minutes > 600) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_duration');
  END IF;

  IF custom_publisher_name IS NOT NULL
     AND (char_length(custom_publisher_name) > 60
       OR custom_publisher_name ~ '[[:cntrl:]]') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_publisher');
  END IF;

  IF p_publisher_id IS NOT NULL AND custom_publisher_name IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_publisher');
  END IF;

  result := private.create_trial(
    p_client_operation_id,
    p_name,
    p_trial_date,
    p_exam_type,
    p_field,
    p_branch_subject,
    p_mood,
    p_publisher_id,
    p_difficulty_level,
    p_subjects
  );

  IF COALESCE((result->>'ok')::BOOLEAN, false)
     AND NOT COALESCE((result->>'idempotent')::BOOLEAN, false) THEN
    trial_id := (result->'trial'->>'id')::UUID;

    IF p_duration_minutes IS NOT NULL OR custom_publisher_name IS NOT NULL THEN
      UPDATE public.trials
         SET duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
             publisher_name_snapshot = COALESCE(custom_publisher_name, publisher_name_snapshot)
       WHERE id = trial_id
         AND user_id = (SELECT auth.uid());
    END IF;

    IF p_duration_minutes IS NOT NULL THEN
      result := jsonb_set(result, '{trial,duration_minutes}', to_jsonb(p_duration_minutes), true);
    END IF;
    IF custom_publisher_name IS NOT NULL THEN
      result := jsonb_set(result, '{trial,publisher_name_snapshot}', to_jsonb(custom_publisher_name), true);
    END IF;
  END IF;

  RETURN result;
END;
$fn$;

REVOKE ALL ON FUNCTION public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB, INTEGER, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB, INTEGER, TEXT
) TO authenticated;
