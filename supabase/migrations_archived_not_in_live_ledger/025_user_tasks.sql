-- User-created study tasks (to-do list)
CREATE TABLE public.user_tasks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  subject       TEXT NOT NULL,
  topic         TEXT,
  question_count INTEGER NOT NULL DEFAULT 20,
  note          TEXT,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_tasks_user_date ON public.user_tasks(user_id, task_date);

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON public.user_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
