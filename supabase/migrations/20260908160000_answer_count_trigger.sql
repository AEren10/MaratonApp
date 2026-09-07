-- shared_questions.answer_count HİÇ GÜNCELLENMİYORDU
--
-- Kolon 020_community_sharing.sql'de DEFAULT 0 ile tanımlanmış ama onu
-- güncelleyen ne bir tetikleyici, ne bir RPC, ne de istemci kodu var.
-- CommunityTab feed'de `{answer_count} cevap` yazısını `> 0` koşuluyla
-- gösterdiği için, cevabı olan sorular dahil TÜM sorular "cevapsız"
-- görünüyordu. Topluluk ölü gibi duruyor, kimse başlığı açmıyor.

CREATE OR REPLACE FUNCTION private.sync_answer_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shared_questions
       SET answer_count = COALESCE(answer_count, 0) + 1
     WHERE id = NEW.shared_question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shared_questions
       SET answer_count = GREATEST(COALESCE(answer_count, 0) - 1, 0)
     WHERE id = OLD.shared_question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_answer_count ON public.question_answers;
CREATE TRIGGER trg_answer_count
AFTER INSERT OR DELETE ON public.question_answers
FOR EACH ROW EXECUTE FUNCTION private.sync_answer_count();

-- Mevcut satırları gerçek sayıyla doldur.
UPDATE public.shared_questions s
   SET answer_count = (
     SELECT count(*) FROM public.question_answers a
      WHERE a.shared_question_id = s.id
   );
