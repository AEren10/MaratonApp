-- Idempotent, server-resolved challenge progress.
--
-- The client should not choose challenge side or replay increments freely.
-- It now sends only the saved source operation and observed effort; the
-- database resolves active challenges, participant side, and duplicate events.

CREATE TABLE IF NOT EXISTS public.challenge_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('study_log', 'trial_entry')),
  source_operation_id TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('questions', 'study_minutes')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id, source, source_operation_id, metric)
);

ALTER TABLE public.challenge_progress_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge progress events select own" ON public.challenge_progress_events;
CREATE POLICY "challenge progress events select own" ON public.challenge_progress_events
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.challenge_progress_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.challenge_progress_events TO authenticated;

CREATE INDEX IF NOT EXISTS idx_challenge_progress_events_user_time
  ON public.challenge_progress_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_events_challenge
  ON public.challenge_progress_events (challenge_id);

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
  c RECORD;
  metric_amount INTEGER;
  inserted INTEGER;
  applied INTEGER := 0;
  new_val INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '28000';
  END IF;
  IF p_source NOT IN ('study_log', 'trial_entry') THEN
    RAISE EXCEPTION 'invalid source' USING ERRCODE = '22023';
  END IF;
  IF p_source_operation_id IS NULL OR length(btrim(p_source_operation_id)) < 8 THEN
    RAISE EXCEPTION 'source operation id required' USING ERRCODE = '22023';
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
      WHEN 'questions' THEN greatest(coalesce(p_questions, 0), 0)
      WHEN 'study_minutes' THEN greatest(coalesce(p_minutes, 0), 0)
      ELSE 0
    END;
    IF metric_amount <= 0 THEN CONTINUE; END IF;

    WITH ins AS (
      INSERT INTO public.challenge_progress_events (
        user_id, challenge_id, source, source_operation_id, metric, amount
      ) VALUES (
        uid, c.id, p_source, btrim(p_source_operation_id), c.metric, metric_amount
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

REVOKE ALL ON FUNCTION public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
