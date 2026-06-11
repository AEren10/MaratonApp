-- Track per-user, per-topic study progress
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  subject_key TEXT NOT NULL,

  total_questions INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  study_count INT DEFAULT 0,
  total_minutes INT DEFAULT 0,
  last_studied_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON public.topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_subject ON public.topic_progress(user_id, subject_key);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress"
  ON public.topic_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress"
  ON public.topic_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress"
  ON public.topic_progress FOR UPDATE USING (auth.uid() = user_id);

-- Auto-update topic_progress when a study_log is inserted
CREATE OR REPLACE FUNCTION public.update_topic_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_topic_id UUID;
BEGIN
  SELECT t.id INTO v_topic_id
  FROM public.topics t
  JOIN public.subjects s ON t.subject_id = s.id
  WHERE t.name = NEW.topic AND s.key = NEW.subject
  LIMIT 1;

  IF v_topic_id IS NOT NULL THEN
    INSERT INTO public.topic_progress (user_id, topic_id, subject_key, total_questions, correct_count, study_count, total_minutes, last_studied_at)
    VALUES (NEW.user_id, v_topic_id, NEW.subject, COALESCE(NEW.question_count, 0), COALESCE(NEW.correct_count, 0), 1, COALESCE(NEW.duration_minutes, 0), now())
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
      total_questions = topic_progress.total_questions + EXCLUDED.total_questions,
      correct_count = topic_progress.correct_count + EXCLUDED.correct_count,
      study_count = topic_progress.study_count + 1,
      total_minutes = topic_progress.total_minutes + EXCLUDED.total_minutes,
      last_studied_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_log_update_progress
  AFTER INSERT ON public.study_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_progress();
