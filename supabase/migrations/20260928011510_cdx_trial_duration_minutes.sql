ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

ALTER TABLE public.trials
  DROP CONSTRAINT IF EXISTS trials_duration_minutes_check;

ALTER TABLE public.trials
  ADD CONSTRAINT trials_duration_minutes_check
  CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 600);

DROP FUNCTION IF EXISTS public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB
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
  p_duration_minutes INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  result JSONB;
  trial_id UUID;
BEGIN
  IF p_duration_minutes IS NOT NULL
     AND (p_duration_minutes < 1 OR p_duration_minutes > 600) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_duration');
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

  IF COALESCE((result->>'ok')::BOOLEAN, false) AND p_duration_minutes IS NOT NULL THEN
    trial_id := (result->'trial'->>'id')::UUID;
    UPDATE public.trials
       SET duration_minutes = p_duration_minutes
     WHERE id = trial_id
       AND user_id = (SELECT auth.uid());
    result := jsonb_set(result, '{trial,duration_minutes}', to_jsonb(p_duration_minutes), true);
  END IF;

  RETURN result;
END;
$fn$;

REVOKE ALL ON FUNCTION public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB, INTEGER
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_trial(
  TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB, INTEGER
) TO authenticated;
