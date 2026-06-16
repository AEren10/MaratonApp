-- Community question sharing + answers

CREATE TABLE IF NOT EXISTS public.shared_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wrong_question_id UUID REFERENCES public.wrong_questions NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  subject TEXT NOT NULL,
  topic TEXT,
  image_path TEXT,
  note TEXT,
  answer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_question_id UUID REFERENCES public.shared_questions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_path TEXT,
  text TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shared_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared questions" ON public.shared_questions FOR SELECT USING (true);
CREATE POLICY "Users can share own questions" ON public.shared_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON public.shared_questions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view answers" ON public.question_answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can answer" ON public.question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON public.question_answers FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_shared_questions_created ON public.shared_questions(created_at DESC);
CREATE INDEX idx_shared_questions_subject ON public.shared_questions(subject);
CREATE INDEX idx_question_answers_shared ON public.question_answers(shared_question_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('community-answers', 'community-answers', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload answer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-answers' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view answer images" ON storage.objects FOR SELECT USING (bucket_id = 'community-answers');
CREATE POLICY "Users can delete own answer images" ON storage.objects FOR DELETE USING (bucket_id = 'community-answers' AND (auth.uid())::text = (storage.foldername(name))[1]);

ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_answers;
