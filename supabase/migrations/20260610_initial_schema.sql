-- Maraton Initial Schema
-- Study & Trial Tracking with RLS
-- Created: 2026-06-10

-- =====================
-- PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  exam_type TEXT DEFAULT 'TYT' CHECK (exam_type IN ('TYT', 'AYT', 'LGS')),
  exam_date DATE,
  daily_target INTEGER DEFAULT 100,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- STUDY LOGS
-- =====================
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- DAILY PLANS
-- =====================
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_questions INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

-- =====================
-- PLAN TASKS
-- =====================
CREATE TABLE IF NOT EXISTS public.plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  priority INTEGER DEFAULT 1,
  reason TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- TRIALS (Deneme Sinavlari)
-- =====================
CREATE TABLE IF NOT EXISTS public.trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trial_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exam_type TEXT DEFAULT 'TYT' CHECK (exam_type IN ('TYT', 'AYT', 'LGS')),
  total_net DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- TRIAL SUBJECTS
-- =====================
CREATE TABLE IF NOT EXISTS public.trial_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES public.trials(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  empty_count INTEGER NOT NULL DEFAULT 0,
  net DECIMAL(6,2) GENERATED ALWAYS AS (correct_count - wrong_count * 0.25) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- WRONG QUESTIONS
-- =====================
CREATE TABLE IF NOT EXISTS public.wrong_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  image_url TEXT,
  note TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- STREAKS
-- =====================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON public.study_logs(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_study_logs_subject ON public.study_logs(subject);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_trials_user_date ON public.trials(user_id, trial_date);
CREATE INDEX IF NOT EXISTS idx_trial_subjects_trial ON public.trial_subjects(trial_id);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_user ON public.wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_subject ON public.wrong_questions(user_id, subject);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wrong_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can CRUD their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Study logs: users can CRUD their own logs
CREATE POLICY "Users can view own study logs" ON public.study_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study logs" ON public.study_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study logs" ON public.study_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study logs" ON public.study_logs FOR DELETE USING (auth.uid() = user_id);

-- Daily plans: users can CRUD their own plans
CREATE POLICY "Users can view own plans" ON public.daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.daily_plans FOR DELETE USING (auth.uid() = user_id);

-- Plan tasks: users can CRUD tasks on their own plans
CREATE POLICY "Users can view own plan tasks" ON public.plan_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.daily_plans WHERE daily_plans.id = plan_tasks.plan_id AND daily_plans.user_id = auth.uid())
);
CREATE POLICY "Users can insert own plan tasks" ON public.plan_tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.daily_plans WHERE daily_plans.id = plan_tasks.plan_id AND daily_plans.user_id = auth.uid())
);
CREATE POLICY "Users can update own plan tasks" ON public.plan_tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.daily_plans WHERE daily_plans.id = plan_tasks.plan_id AND daily_plans.user_id = auth.uid())
);
CREATE POLICY "Users can delete own plan tasks" ON public.plan_tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.daily_plans WHERE daily_plans.id = plan_tasks.plan_id AND daily_plans.user_id = auth.uid())
);

-- Trials: users can CRUD their own trials
CREATE POLICY "Users can view own trials" ON public.trials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trials" ON public.trials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trials" ON public.trials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trials" ON public.trials FOR DELETE USING (auth.uid() = user_id);

-- Trial subjects: users can CRUD subjects on their own trials
CREATE POLICY "Users can view own trial subjects" ON public.trial_subjects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trials WHERE trials.id = trial_subjects.trial_id AND trials.user_id = auth.uid())
);
CREATE POLICY "Users can insert own trial subjects" ON public.trial_subjects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.trials WHERE trials.id = trial_subjects.trial_id AND trials.user_id = auth.uid())
);
CREATE POLICY "Users can update own trial subjects" ON public.trial_subjects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.trials WHERE trials.id = trial_subjects.trial_id AND trials.user_id = auth.uid())
);
CREATE POLICY "Users can delete own trial subjects" ON public.trial_subjects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.trials WHERE trials.id = trial_subjects.trial_id AND trials.user_id = auth.uid())
);

-- Wrong questions: users can CRUD their own wrong questions
CREATE POLICY "Users can view own wrong questions" ON public.wrong_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wrong questions" ON public.wrong_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wrong questions" ON public.wrong_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wrong questions" ON public.wrong_questions FOR DELETE USING (auth.uid() = user_id);

-- Streaks: users can CRUD their own streaks
CREATE POLICY "Users can view own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- =====================
-- TRIGGERS
-- =====================

-- Auto-create profile and streak on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_streaks_updated_at ON public.streaks;
CREATE TRIGGER set_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
