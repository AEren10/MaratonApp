-- 043: Serbest yazilan konular da ustalik analizine girsin (2026-08-18 audit)
--
-- TopicPicker'da "Listede yok, elle yaz" secenegi var. Boyle bir konu
-- yazildiginda calisma kaydi sorunsuz kaydediliyor (sure, soru, XP, streak
-- hepsi sayiliyor) ama update_topic_progress trigger'i konuyu topics
-- tablosunda bulamayip atliyordu. Sonuc: kullanicinin emegi Dersler
-- ekranindaki konu ustaligina hic yansimiyordu.
--
-- Cozum: topic_progress artik iki tur satir tutuyor —
--   mufredat konusu  -> topic_id dolu,     custom_topic NULL
--   serbest konu     -> topic_id NULL,     custom_topic dolu

ALTER TABLE public.topic_progress ALTER COLUMN topic_id DROP NOT NULL;
ALTER TABLE public.topic_progress ADD COLUMN IF NOT EXISTS custom_topic TEXT;

-- Eski tekil kisit yerine iki kismi tekil indeks.
ALTER TABLE public.topic_progress
  DROP CONSTRAINT IF EXISTS topic_progress_user_id_topic_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tp_user_topic
  ON public.topic_progress (user_id, topic_id)
  WHERE topic_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tp_user_custom
  ON public.topic_progress (user_id, subject_key, custom_topic)
  WHERE custom_topic IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_topic_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_topic_id UUID;
  v_name TEXT := btrim(COALESCE(NEW.topic, ''));
BEGIN
  IF v_name = '' THEN
    RETURN NEW;
  END IF;

  SELECT t.id INTO v_topic_id
  FROM public.topics t
  JOIN public.subjects s ON t.subject_id = s.id
  WHERE t.name = NEW.topic AND s.key = NEW.subject
  LIMIT 1;

  IF v_topic_id IS NOT NULL THEN
    INSERT INTO public.topic_progress
      (user_id, topic_id, subject_key, total_questions, correct_count, study_count, total_minutes, last_studied_at)
    VALUES
      (NEW.user_id, v_topic_id, NEW.subject, COALESCE(NEW.question_count, 0),
       COALESCE(NEW.correct_count, 0), 1, COALESCE(NEW.duration_minutes, 0), now())
    ON CONFLICT (user_id, topic_id) WHERE topic_id IS NOT NULL DO UPDATE SET
      total_questions = topic_progress.total_questions + EXCLUDED.total_questions,
      correct_count   = topic_progress.correct_count   + EXCLUDED.correct_count,
      study_count     = topic_progress.study_count     + 1,
      total_minutes   = topic_progress.total_minutes   + EXCLUDED.total_minutes,
      last_studied_at = now();
  ELSE
    -- Serbest yazilan konu: mufredatta yok ama emegi kaybetmiyoruz.
    INSERT INTO public.topic_progress
      (user_id, topic_id, custom_topic, subject_key, total_questions, correct_count, study_count, total_minutes, last_studied_at)
    VALUES
      (NEW.user_id, NULL, v_name, NEW.subject, COALESCE(NEW.question_count, 0),
       COALESCE(NEW.correct_count, 0), 1, COALESCE(NEW.duration_minutes, 0), now())
    ON CONFLICT (user_id, subject_key, custom_topic) WHERE custom_topic IS NOT NULL DO UPDATE SET
      total_questions = topic_progress.total_questions + EXCLUDED.total_questions,
      correct_count   = topic_progress.correct_count   + EXCLUDED.correct_count,
      study_count     = topic_progress.study_count     + 1,
      total_minutes   = topic_progress.total_minutes   + EXCLUDED.total_minutes,
      last_studied_at = now();
  END IF;

  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.update_topic_progress() FROM PUBLIC, anon;
