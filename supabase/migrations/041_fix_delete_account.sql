-- 041: delete_own_account tamamen bozuktu (2026-08-18 audit)
--
-- Canli DB'de gercek bir oturumla test edildiginde iki ayri hata verdi:
--   1) 42883 — operator does not exist: text = uuid
--      storage.objects.owner_id TEXT, auth.uid() UUID. Cast yoktu.
--   2) Cast eklendikten sonra:
--      42501 — "Direct deletion from storage tables is not allowed.
--               Use the Storage API instead."
--      Supabase artik storage.objects uzerinde dogrudan SQL DELETE'i
--      engelliyor.
--
-- Cozum: depolama temizligi SQL'den tamamen cikarildi ve istemciye tasindi
-- (src/supabase/storage.js -> deleteUserStorage, auth.js -> deleteAccount
-- once onu cagiriyor). Bu fonksiyon artik sadece auth.users satirini siliyor;
-- diger tablolar ON DELETE CASCADE ile temizleniyor.
--
-- Etki: Hesap silme HIC calismiyordu. Apple 5.1.1(v) ve Google Play icin
-- zorunlu — bu haliyle magazadan reddedilirdi.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Depolama temizligi istemcide (Storage API) yapiliyor.
  DELETE FROM auth.users WHERE id = uid;
END;
$fn$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
