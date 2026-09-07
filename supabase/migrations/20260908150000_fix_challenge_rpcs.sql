-- CHALLENGE RPC'LERİNİN DÜZELTİLMESİ
--
-- Bir önceki migration challenges üzerindeki UPDATE iznini istemciden aldı.
-- Ama mevcut bump_challenge_progress SECURITY INVOKER'dı — yani çağıranın
-- yetkisiyle çalışıyordu ve izin kalkınca challenge ilerlemesi TAMAMEN
-- kırılacaktı. Definer'a çevriliyor.
--
-- Aynı fonksiyona iki eksik de ekleniyor:
--   * ilerleme hedefi AŞAMAZ (eskiden target'ın üstüne çıkabiliyordu)
--   * hedefe ulaşınca kazananı SUNUCU belirler (eskiden istemci winner_id
--     yazıyordu; katılımcı kendini kazanan ilan edebiliyordu)
--
-- Böylece tek bir ilerleme yolu kalıyor; önceki migration'da eklenen
-- update_challenge_progress ikinci bir yol olmasın diye kaldırılıyor.

DROP FUNCTION IF EXISTS public.update_challenge_progress(UUID, INT);
DROP FUNCTION IF EXISTS private.update_challenge_progress(UUID, INT);

CREATE OR REPLACE FUNCTION public.bump_challenge_progress(
  challenge_id UUID, side TEXT, increment_value INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := auth.uid();
  c RECORD;
  new_val INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF side NOT IN ('creator', 'opponent') THEN
    RAISE EXCEPTION 'side must be creator or opponent';
  END IF;
  IF increment_value IS NULL OR increment_value < 1 OR increment_value > 1000 THEN
    RAISE EXCEPTION 'increment_value out of range';
  END IF;

  SELECT * INTO c FROM public.challenges WHERE id = challenge_id FOR UPDATE;
  IF NOT FOUND OR c.status <> 'active' THEN
    RAISE EXCEPTION 'Challenge not found or not active';
  END IF;

  -- Taraf, ÇAĞIRANIN gerçek tarafı olmalı; istemcinin iddiası yetmez.
  IF side = 'creator' AND uid <> c.creator_id THEN
    RAISE EXCEPTION 'Challenge not found or not authorized';
  END IF;
  IF side = 'opponent' AND uid <> c.opponent_id THEN
    RAISE EXCEPTION 'Challenge not found or not authorized';
  END IF;

  IF side = 'creator' THEN
    new_val := LEAST(COALESCE(c.creator_progress, 0) + increment_value,
                     GREATEST(COALESCE(c.target, 0), 0));
    UPDATE public.challenges SET creator_progress = new_val WHERE id = challenge_id;
  ELSE
    new_val := LEAST(COALESCE(c.opponent_progress, 0) + increment_value,
                     GREATEST(COALESCE(c.target, 0), 0));
    UPDATE public.challenges SET opponent_progress = new_val WHERE id = challenge_id;
  END IF;

  -- Hedefe ulaşıldıysa kazananı sunucu yazar.
  SELECT * INTO c FROM public.challenges WHERE id = challenge_id;
  IF COALESCE(c.target, 0) > 0
     AND (c.creator_progress >= c.target OR c.opponent_progress >= c.target) THEN
    UPDATE public.challenges
       SET status = 'completed',
           winner_id = CASE
             WHEN c.creator_progress > c.opponent_progress THEN c.creator_id
             WHEN c.opponent_progress > c.creator_progress THEN c.opponent_id
             ELSE NULL END
     WHERE id = challenge_id AND status = 'active';
  END IF;

  RETURN new_val;
END;
$fn$;

REVOKE ALL ON FUNCTION public.bump_challenge_progress(UUID, TEXT, INTEGER) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bump_challenge_progress(UUID, TEXT, INTEGER) TO authenticated;

-- Süresi geçmiş challenge'ları kapatır. Kazananı istemci BİLDİRMEZ;
-- sunucu ilerlemelere bakarak karar verir.
CREATE OR REPLACE FUNCTION private.finalize_expired_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := auth.uid();
  affected INTEGER := 0;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  WITH done AS (
    UPDATE public.challenges
       SET status = 'completed',
           winner_id = CASE
             WHEN COALESCE(creator_progress,0) > COALESCE(opponent_progress,0) THEN creator_id
             WHEN COALESCE(opponent_progress,0) > COALESCE(creator_progress,0) THEN opponent_id
             ELSE NULL END
     WHERE status = 'active'
       AND ends_on < (now() AT TIME ZONE 'Europe/Istanbul')::date
       AND (creator_id = uid OR opponent_id = uid)
    RETURNING 1
  )
  SELECT count(*) INTO affected FROM done;
  RETURN affected;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.finalize_expired_challenges()
RETURNS INTEGER LANGUAGE sql SET search_path TO 'public','pg_temp'
AS $fn$ SELECT private.finalize_expired_challenges(); $fn$;
REVOKE ALL ON FUNCTION public.finalize_expired_challenges() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.finalize_expired_challenges() TO authenticated;
