-- 2026-09-24'te CANLIYA UYGULANDI.
--
-- Ayni icerik 20260920050000_fix_generate_group_code_builtin_random.sql'de
-- 20 Eylul'de yazilmis ama deftere HIC girmemis. Sonucu cihazda goruldu:
-- "Grup Olustur" her denemede
--   [Supabase:createGroup] function gen_random_bytes(integer) does not exist
-- veriyordu. gen_random_bytes 'extensions' semasinda, generate_group_code ise
-- search_path'i 'public, pg_temp' ile kilitliyor -- goremiyor.
--
-- Eski dosya defter temizligi sirasinda kaldirilmali (bkz. docs/CIKMADAN_ONCE_V1.md B1).

-- Migration: 20260920050000_fix_generate_group_code_builtin_random.sql
-- Fixes private.generate_group_code() to use PostgreSQL built-in random()
-- instead of pgcrypto.gen_random_bytes(). Since the function enforces
-- SET search_path TO 'public', 'pg_temp', referencing gen_random_bytes fails with
-- "function gen_random_bytes(integer) does not exist" in Supabase environments where
-- pgcrypto is located in the 'extensions' schema.
-- Using built-in random() guarantees 0 extension dependencies and 100% reliability.

CREATE OR REPLACE FUNCTION private.generate_group_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  alphabet CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_code TEXT;
  i INT;
  attempts INT := 0;
BEGIN
  LOOP
    attempts := attempts + 1;
    out_code := '';
    FOR i IN 1..6 LOOP
      out_code := out_code || substr(alphabet, floor(random() * length(alphabet) + 1)::INTEGER, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE code = out_code);
    IF attempts > 100 THEN
      RAISE EXCEPTION 'group_code_generation_failed';
    END IF;
  END LOOP;
  RETURN out_code;
END;
$fn$;

REVOKE ALL ON FUNCTION private.generate_group_code() FROM PUBLIC, anon, authenticated;
