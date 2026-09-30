-- HESAP SILME ENGELLERI (Apple 5.1.1(v): uygulama ici hesap silme calismali)
--
-- private.delete_own_account() yalniz `DELETE FROM auth.users WHERE id = uid`
-- yapiyor; gerisini CASCADE zinciri siler. Asagidaki FK'lar ON DELETE
-- belirtmedigi (NO ACTION) icin, satiri olan kullanicinin silmesi FK
-- ihlaliyle patliyor ve "Hesap silinemedi" goruyordu. Canli DB'de dogrulandi
-- (2026-10-01, pg_constraint confdeltype = 'a'):
--
--   shared_questions.user_id           -> auth.users       NOT NULL, 7 satir var
--   shared_questions.wrong_question_id -> wrong_questions  NOT NULL
--   question_answers.user_id           -> auth.users       NOT NULL
--   profiles.referred_by               -> profiles         NULL olabilir
--   referral_logs.inviter_id           -> profiles         NOT NULL
--   referral_logs.invitee_id           -> profiles         NOT NULL
--
-- Kararlar:
--   - shared_questions / question_answers: kullanicinin kendi icerigi, onunla
--     gider (CASCADE). question_answers.shared_question_id zaten CASCADE.
--   - shared_questions.wrong_question_id: paylasilan soru kaynak yanlis
--     sorusuz anlamsiz; CASCADE. Yan kazanc: paylasilmis bir yanlis soruyu
--     tek basina silmek de artik engellenmiyor.
--   - profiles.referred_by: davet EDILEN kullanicinin profili kalir, yalniz
--     "kim davet etti" bilgisi bosalir (SET NULL; kolon zaten NULL olabilir).
--   - referral_logs: iki kolon da NOT NULL, SET NULL kisiti bozar. Kayit iki
--     taraf arasindaki bir olay; taraflardan biri yoksa kayit da kisisel veri
--     kalintisidir. CASCADE (hangi taraf silinirse silinsin satir gider).
--
-- Diger tum auth.users / public.profiles FK'lari CASCADE ya da SET NULL
-- (challenges.winner_id SET NULL). Bu dosya lead tarafindan uygulanir.


ALTER TABLE public.shared_questions
  DROP CONSTRAINT IF EXISTS shared_questions_user_id_fkey,
  ADD CONSTRAINT shared_questions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.shared_questions
  DROP CONSTRAINT IF EXISTS shared_questions_wrong_question_id_fkey,
  ADD CONSTRAINT shared_questions_wrong_question_id_fkey
    FOREIGN KEY (wrong_question_id) REFERENCES public.wrong_questions(id) ON DELETE CASCADE;

ALTER TABLE public.question_answers
  DROP CONSTRAINT IF EXISTS question_answers_user_id_fkey,
  ADD CONSTRAINT question_answers_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_referred_by_fkey,
  ADD CONSTRAINT profiles_referred_by_fkey
    FOREIGN KEY (referred_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.referral_logs
  DROP CONSTRAINT IF EXISTS referral_logs_inviter_id_fkey,
  ADD CONSTRAINT referral_logs_inviter_id_fkey
    FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referral_logs
  DROP CONSTRAINT IF EXISTS referral_logs_invitee_id_fkey,
  ADD CONSTRAINT referral_logs_invitee_id_fkey
    FOREIGN KEY (invitee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

