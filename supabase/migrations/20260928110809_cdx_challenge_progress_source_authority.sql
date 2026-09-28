-- Challenge progress must be derived from saved user-owned records.
-- Client-provided question/minute numbers are kept in the public RPC
-- signature for backwards compatibility, but ignored for authority.

REVOKE ALL ON FUNCTION public.bump_challenge_progress(UUID, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_challenge_progress(
  p_source TEXT,
  p_source_operation_id TEXT,
  p_questions INTEGER DEFAULT 0,
  p_minutes INTEGER DEFAULT 0
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := auth.uid();
  normalized_source TEXT := lower(btrim(coalesce(p_source, '')));
  normalized_operation_id TEXT := btrim(coalesce(p_source_operation_id, ''));
  c RECORD;
  source_questions INTEGER := 0;
  source_minutes INTEGER := 0;
  metric_amount INTEGER;
  inserted INTEGER;
  applied INTEGER := 0;
  new_val INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '28000';
  END IF;
  IF normalized_source NOT IN ('study_log', 'trial_entry') THEN
    RAISE EXCEPTION 'invalid source' USING ERRCODE = '22023';
  END IF;
  IF length(normalized_operation_id) < 8 THEN
    RAISE EXCEPTION 'source operation id required' USING ERRCODE = '22023';
  END IF;

  IF normalized_source = 'study_log' THEN
    SELECT
      greatest(coalesce(sl.question_count, 0), 0),
      greatest(coalesce(sl.duration_minutes, 0), 0)
    INTO source_questions, source_minutes
    FROM public.study_logs sl
    WHERE sl.user_id = uid
      AND sl.client_operation_id = normalized_operation_id
    LIMIT 1;
  ELSIF normalized_source = 'trial_entry' THEN
    SELECT
      greatest(coalesce(sum(
        coalesce(ts.correct_count, 0)
        + coalesce(ts.wrong_count, 0)
        + coalesce(ts.empty_count, 0)
      ), 0), 0)::INTEGER,
      greatest(coalesce(t.duration_minutes, 0), 0)
    INTO source_questions, source_minutes
    FROM public.trials t
    LEFT JOIN public.trial_subjects ts ON ts.trial_id = t.id
    WHERE t.user_id = uid
      AND t.client_operation_id = normalized_operation_id
    GROUP BY t.id, t.duration_minutes
    LIMIT 1;
  END IF;

  IF coalesce(source_questions, 0) <= 0 AND coalesce(source_minutes, 0) <= 0 THEN
    RETURN 0;
  END IF;

  FOR c IN
    SELECT *
      FROM public.challenges
     WHERE status = 'active'
       AND (creator_id = uid OR opponent_id = uid)
       AND metric IN ('questions', 'study_minutes')
     FOR UPDATE
  LOOP
    metric_amount := CASE c.metric
      WHEN 'questions' THEN greatest(coalesce(source_questions, 0), 0)
      WHEN 'study_minutes' THEN greatest(coalesce(source_minutes, 0), 0)
      ELSE 0
    END;
    IF metric_amount <= 0 THEN CONTINUE; END IF;

    WITH ins AS (
      INSERT INTO public.challenge_progress_events (
        user_id, challenge_id, source, source_operation_id, metric, amount
      ) VALUES (
        uid, c.id, normalized_source, normalized_operation_id, c.metric, metric_amount
      )
      ON CONFLICT (user_id, challenge_id, source, source_operation_id, metric)
      DO NOTHING
      RETURNING 1
    )
    SELECT count(*) INTO inserted FROM ins;

    IF inserted = 0 THEN CONTINUE; END IF;

    IF uid = c.creator_id THEN
      new_val := LEAST(COALESCE(c.creator_progress, 0) + metric_amount,
                       GREATEST(COALESCE(c.target, 0), 0));
      UPDATE public.challenges
         SET creator_progress = new_val
       WHERE id = c.id;
      c.creator_progress := new_val;
    ELSE
      new_val := LEAST(COALESCE(c.opponent_progress, 0) + metric_amount,
                       GREATEST(COALESCE(c.target, 0), 0));
      UPDATE public.challenges
         SET opponent_progress = new_val
       WHERE id = c.id;
      c.opponent_progress := new_val;
    END IF;

    IF COALESCE(c.target, 0) > 0
       AND (c.creator_progress >= c.target OR c.opponent_progress >= c.target) THEN
      UPDATE public.challenges
         SET status = 'completed',
             winner_id = CASE
               WHEN c.creator_progress > c.opponent_progress THEN c.creator_id
               WHEN c.opponent_progress > c.creator_progress THEN c.opponent_id
               ELSE NULL END
       WHERE id = c.id
         AND status = 'active';
    END IF;

    applied := applied + 1;
  END LOOP;

  RETURN applied;
END;
$fn$;

REVOKE ALL ON FUNCTION public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER)
  TO authenticated;
