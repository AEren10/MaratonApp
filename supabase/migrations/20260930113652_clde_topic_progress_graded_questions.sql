-- Dogrulugu bilinen soru sayisi.
--
-- Kayitlarin cogunda correct_count = 0 ("bilinmiyor"). Kayit formlari artik
-- dogru sayisini soruyor; bilinen ve bilinmeyen kayitlar ayni konuda karisinca
-- correct_count / total_questions dogrulugu yanlis dusurur (100 sorunun
-- 20'sinde 15 dogru -> %15, oysa %75). Payda: yalniz dogru sayisi girilmis
-- kayitlarin sorulari.

ALTER TABLE public.topic_progress
  ADD COLUMN IF NOT EXISTS graded_questions integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION private.apply_topic_progress_delta(p_user_id uuid, p_subject_key text, p_topic text, p_questions integer, p_correct integer, p_minutes integer, p_study_date date, p_sign integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_topic_id UUID;
  v_name TEXT := btrim(COALESCE(p_topic, ''));
  v_questions INTEGER := GREATEST(COALESCE(p_questions, 0), 0);
  v_correct INTEGER := GREATEST(COALESCE(p_correct, 0), 0);
  v_graded INTEGER := CASE WHEN GREATEST(COALESCE(p_correct, 0), 0) > 0 THEN GREATEST(COALESCE(p_questions, 0), 0) ELSE 0 END;
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
        (user_id, topic_id, subject_key, total_questions, correct_count, graded_questions, study_count, total_minutes, last_studied_at)
      VALUES
        (p_user_id, v_topic_id, p_subject_key, v_questions, v_correct, v_graded, 1, v_minutes, v_at)
      ON CONFLICT (user_id, topic_id) WHERE topic_id IS NOT NULL DO UPDATE SET
        total_questions  = GREATEST(COALESCE(public.topic_progress.total_questions, 0) + EXCLUDED.total_questions, 0),
        correct_count    = GREATEST(COALESCE(public.topic_progress.correct_count, 0) + EXCLUDED.correct_count, 0),
        graded_questions = GREATEST(COALESCE(public.topic_progress.graded_questions, 0) + EXCLUDED.graded_questions, 0),
        study_count      = GREATEST(COALESCE(public.topic_progress.study_count, 0) + 1, 0),
        total_minutes    = GREATEST(COALESCE(public.topic_progress.total_minutes, 0) + EXCLUDED.total_minutes, 0),
        last_studied_at  = GREATEST(COALESCE(public.topic_progress.last_studied_at, EXCLUDED.last_studied_at), EXCLUDED.last_studied_at);
    ELSE
      INSERT INTO public.topic_progress
        (user_id, topic_id, custom_topic, subject_key, total_questions, correct_count, graded_questions, study_count, total_minutes, last_studied_at)
      VALUES
        (p_user_id, NULL, v_name, p_subject_key, v_questions, v_correct, v_graded, 1, v_minutes, v_at)
      ON CONFLICT (user_id, subject_key, custom_topic) WHERE custom_topic IS NOT NULL DO UPDATE SET
        total_questions  = GREATEST(COALESCE(public.topic_progress.total_questions, 0) + EXCLUDED.total_questions, 0),
        correct_count    = GREATEST(COALESCE(public.topic_progress.correct_count, 0) + EXCLUDED.correct_count, 0),
        graded_questions = GREATEST(COALESCE(public.topic_progress.graded_questions, 0) + EXCLUDED.graded_questions, 0),
        study_count      = GREATEST(COALESCE(public.topic_progress.study_count, 0) + 1, 0),
        total_minutes    = GREATEST(COALESCE(public.topic_progress.total_minutes, 0) + EXCLUDED.total_minutes, 0),
        last_studied_at  = GREATEST(COALESCE(public.topic_progress.last_studied_at, EXCLUDED.last_studied_at), EXCLUDED.last_studied_at);
    END IF;
    RETURN;
  END IF;

  IF v_topic_id IS NOT NULL THEN
    UPDATE public.topic_progress
       SET total_questions  = GREATEST(COALESCE(total_questions, 0) - v_questions, 0),
           correct_count    = GREATEST(COALESCE(correct_count, 0) - v_correct, 0),
           graded_questions = GREATEST(COALESCE(graded_questions, 0) - v_graded, 0),
           study_count      = GREATEST(COALESCE(study_count, 0) - 1, 0),
           total_minutes    = GREATEST(COALESCE(total_minutes, 0) - v_minutes, 0),
           last_studied_at  = private.latest_topic_progress_studied_at(p_user_id, p_subject_key, v_topic_id, NULL)
     WHERE user_id = p_user_id
       AND topic_id = v_topic_id;
  ELSE
    UPDATE public.topic_progress
       SET total_questions  = GREATEST(COALESCE(total_questions, 0) - v_questions, 0),
           correct_count    = GREATEST(COALESCE(correct_count, 0) - v_correct, 0),
           graded_questions = GREATEST(COALESCE(graded_questions, 0) - v_graded, 0),
           study_count      = GREATEST(COALESCE(study_count, 0) - 1, 0),
           total_minutes    = GREATEST(COALESCE(total_minutes, 0) - v_minutes, 0),
           last_studied_at  = private.latest_topic_progress_studied_at(p_user_id, p_subject_key, NULL, v_name)
     WHERE user_id = p_user_id
       AND topic_id IS NULL
       AND subject_key = p_subject_key
       AND custom_topic = v_name;
  END IF;
END;
$function$;

-- Mevcut satirlarin payini kayitlardan doldur.
WITH g AS (
  SELECT l.user_id, l.subject, btrim(l.topic) AS topic,
         SUM(GREATEST(COALESCE(l.question_count, 0), 0)) AS graded
    FROM public.study_logs l
   WHERE COALESCE(l.correct_count, 0) > 0
   GROUP BY 1, 2, 3
)
UPDATE public.topic_progress tp
   SET graded_questions = g.graded
  FROM g
  LEFT JOIN public.subjects s ON s.key = g.subject
  LEFT JOIN public.topics t ON t.subject_id = s.id AND t.name = g.topic
 WHERE tp.user_id = g.user_id
   AND tp.subject_key = g.subject
   AND ((tp.topic_id IS NOT NULL AND tp.topic_id = t.id)
     OR (tp.topic_id IS NULL AND tp.custom_topic = g.topic));

-- topic_progress kayitlardan biraz sapmis (eski satirlar): payi tutarli sinirla.
UPDATE public.topic_progress
   SET graded_questions = CASE WHEN COALESCE(correct_count, 0) = 0 THEN 0
                               ELSE LEAST(GREATEST(graded_questions, correct_count), total_questions) END
 WHERE graded_questions > 0 OR correct_count > 0;
