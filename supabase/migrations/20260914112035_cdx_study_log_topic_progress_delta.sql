-- CDX: Study log edit/delete must keep topic progress truthful.
--
-- Claude's study history flow now lets users edit and delete study logs.
-- The old trigger only handled INSERT, so topic_progress kept the old
-- questions/minutes/count after an edit/delete. Route scoring, retention
-- recency and topic mastery then read inflated signals.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.latest_topic_progress_studied_at(
  p_user_id UUID,
  p_subject_key TEXT,
  p_topic_id UUID,
  p_custom_topic TEXT
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SET search_path = ''
AS $fn$
  SELECT max(COALESCE(sl.study_date::timestamptz, sl.created_at))
    FROM public.study_logs sl
    LEFT JOIN public.topics t
      ON p_topic_id IS NOT NULL
     AND t.id = p_topic_id
   WHERE sl.user_id = p_user_id
     AND sl.subject = p_subject_key
     AND (
       (p_topic_id IS NOT NULL AND sl.topic = t.name)
       OR
       (p_topic_id IS NULL AND btrim(COALESCE(sl.topic, '')) = p_custom_topic)
     );
$fn$;

CREATE OR REPLACE FUNCTION private.apply_topic_progress_delta(
  p_user_id UUID,
  p_subject_key TEXT,
  p_topic TEXT,
  p_questions INTEGER,
  p_correct INTEGER,
  p_minutes INTEGER,
  p_study_date DATE,
  p_sign INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_topic_id UUID;
  v_name TEXT := btrim(COALESCE(p_topic, ''));
  v_questions INTEGER := GREATEST(COALESCE(p_questions, 0), 0);
  v_correct INTEGER := GREATEST(COALESCE(p_correct, 0), 0);
  v_minutes INTEGER := GREATEST(COALESCE(p_minutes, 0), 0);
  v_at TIMESTAMPTZ := COALESCE(p_study_date::timestamptz, now());
BEGIN
  IF p_user_id IS NULL OR p_subject_key IS NULL OR v_name = '' THEN
    RETURN;
  END IF;

  SELECT t.id INTO v_topic_id
    FROM public.topics t
    JOIN public.subjects s ON t.subject_id = s.id
   WHERE t.name = v_name
     AND s.key = p_subject_key
   LIMIT 1;

  IF p_sign >= 0 THEN
    IF v_topic_id IS NOT NULL THEN
      INSERT INTO public.topic_progress
        (user_id, topic_id, subject_key, total_questions, correct_count, study_count, total_minutes, last_studied_at)
      VALUES
        (p_user_id, v_topic_id, p_subject_key, v_questions, v_correct, 1, v_minutes, v_at)
      ON CONFLICT (user_id, topic_id) WHERE topic_id IS NOT NULL DO UPDATE SET
        total_questions = GREATEST(COALESCE(public.topic_progress.total_questions, 0) + EXCLUDED.total_questions, 0),
        correct_count   = GREATEST(COALESCE(public.topic_progress.correct_count, 0) + EXCLUDED.correct_count, 0),
        study_count     = GREATEST(COALESCE(public.topic_progress.study_count, 0) + 1, 0),
        total_minutes   = GREATEST(COALESCE(public.topic_progress.total_minutes, 0) + EXCLUDED.total_minutes, 0),
        last_studied_at = GREATEST(COALESCE(public.topic_progress.last_studied_at, EXCLUDED.last_studied_at), EXCLUDED.last_studied_at);
    ELSE
      INSERT INTO public.topic_progress
        (user_id, topic_id, custom_topic, subject_key, total_questions, correct_count, study_count, total_minutes, last_studied_at)
      VALUES
        (p_user_id, NULL, v_name, p_subject_key, v_questions, v_correct, 1, v_minutes, v_at)
      ON CONFLICT (user_id, subject_key, custom_topic) WHERE custom_topic IS NOT NULL DO UPDATE SET
        total_questions = GREATEST(COALESCE(public.topic_progress.total_questions, 0) + EXCLUDED.total_questions, 0),
        correct_count   = GREATEST(COALESCE(public.topic_progress.correct_count, 0) + EXCLUDED.correct_count, 0),
        study_count     = GREATEST(COALESCE(public.topic_progress.study_count, 0) + 1, 0),
        total_minutes   = GREATEST(COALESCE(public.topic_progress.total_minutes, 0) + EXCLUDED.total_minutes, 0),
        last_studied_at = GREATEST(COALESCE(public.topic_progress.last_studied_at, EXCLUDED.last_studied_at), EXCLUDED.last_studied_at);
    END IF;
    RETURN;
  END IF;

  IF v_topic_id IS NOT NULL THEN
    UPDATE public.topic_progress
       SET total_questions = GREATEST(COALESCE(total_questions, 0) - v_questions, 0),
           correct_count   = GREATEST(COALESCE(correct_count, 0) - v_correct, 0),
           study_count     = GREATEST(COALESCE(study_count, 0) - 1, 0),
           total_minutes   = GREATEST(COALESCE(total_minutes, 0) - v_minutes, 0),
           last_studied_at = private.latest_topic_progress_studied_at(p_user_id, p_subject_key, v_topic_id, NULL)
     WHERE user_id = p_user_id
       AND topic_id = v_topic_id;
  ELSE
    UPDATE public.topic_progress
       SET total_questions = GREATEST(COALESCE(total_questions, 0) - v_questions, 0),
           correct_count   = GREATEST(COALESCE(correct_count, 0) - v_correct, 0),
           study_count     = GREATEST(COALESCE(study_count, 0) - 1, 0),
           total_minutes   = GREATEST(COALESCE(total_minutes, 0) - v_minutes, 0),
           last_studied_at = private.latest_topic_progress_studied_at(p_user_id, p_subject_key, NULL, v_name)
     WHERE user_id = p_user_id
       AND topic_id IS NULL
       AND subject_key = p_subject_key
       AND custom_topic = v_name;
  END IF;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.update_topic_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM private.apply_topic_progress_delta(
      OLD.user_id,
      OLD.subject,
      OLD.topic,
      OLD.question_count,
      OLD.correct_count,
      OLD.duration_minutes,
      OLD.study_date,
      -1
    );
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM private.apply_topic_progress_delta(
      NEW.user_id,
      NEW.subject,
      NEW.topic,
      NEW.question_count,
      NEW.correct_count,
      NEW.duration_minutes,
      NEW.study_date,
      1
    );
    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$fn$;

DROP TRIGGER IF EXISTS on_study_log_update_progress ON public.study_logs;
CREATE TRIGGER on_study_log_update_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.study_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_progress();

REVOKE ALL ON FUNCTION private.latest_topic_progress_studied_at(UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.apply_topic_progress_delta(UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, DATE, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_topic_progress() FROM PUBLIC, anon, authenticated;
