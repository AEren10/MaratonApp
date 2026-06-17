-- Add direct FK from shared_questions/question_answers to profiles
-- so PostgREST can resolve the join `profiles:user_id(name, avatar_url)`
-- (original FK targets auth.users, PostgREST can't always resolve through-joins)

ALTER TABLE public.shared_questions
  ADD CONSTRAINT shared_questions_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.question_answers
  ADD CONSTRAINT question_answers_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
