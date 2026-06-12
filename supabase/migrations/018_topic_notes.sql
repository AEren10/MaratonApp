-- Konu notları: kullanıcının bir konu hakkında tuttuğu kalıcı not.
-- Yanlış defterinden bağımsız; "bu konuda şuna dikkat" tarzı.

CREATE TABLE IF NOT EXISTS public.topic_notes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_key TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, subject_key, topic_name)
);

ALTER TABLE public.topic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topic_notes select own" ON public.topic_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "topic_notes insert own" ON public.topic_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topic_notes update own" ON public.topic_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "topic_notes delete own" ON public.topic_notes FOR DELETE USING (auth.uid() = user_id);
