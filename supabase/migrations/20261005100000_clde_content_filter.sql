-- Icerik filtresi: kullanici adi, grup adi ve aciklamasi. Istemci kopyasi
-- src/domain/moderation/ (ayni liste; tests/domain/profanity.test.mjs esitligi kontrol eder).
-- SUBSTRING_WORDS: orospu oruspu siktir sikeyim sikik sikis yarak amcik aminakoy pezevenk kaltak gavat fahise surtuk ibne pust gotveren gotunu anani ananin fuck shit bitch nigga nigger asshole pussy whore faggot porno
-- TOKEN_WORDS: amk aq sik sikim pic dick slut skm tasak tasaq bok cunt

CREATE OR REPLACE FUNCTION private.is_clean_text(p text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $fn$
DECLARE
  folded text;
  part text;
  run text := '';
  toks text[] := '{}';
  t text;
  w text;
  substr_words text[] := ARRAY['orospu', 'oruspu', 'siktir', 'sikeyim', 'sikik', 'sikis', 'yarak', 'amcik', 'aminakoy', 'pezevenk', 'kaltak', 'gavat', 'fahise', 'surtuk', 'ibne', 'pust', 'gotveren', 'gotunu', 'anani', 'ananin', 'fuck', 'shit', 'bitch', 'nigga', 'nigger', 'asshole', 'pussy', 'whore', 'faggot', 'porno'];
  token_words text[] := ARRAY['amk', 'aq', 'sik', 'sikim', 'pic', 'dick', 'slut', 'skm', 'tasak', 'tasaq', 'bok', 'cunt'];
BEGIN
  IF p IS NULL OR btrim(p) = '' THEN RETURN true; END IF;
  folded := translate(p, 'ÇĞİIÖŞÜçğıöşüâîûáàäéèêëíìïóòôúù', 'cgiiosucgiosuaiuaaaeeeeiiiooouu');
  folded := translate(lower(folded), '013457@$!', 'oieastasi');
  folded := regexp_replace(folded, '[^a-z]+', ' ', 'g');
  FOREACH part IN ARRAY string_to_array(btrim(folded), ' ') LOOP
    IF part = '' THEN CONTINUE; END IF;
    IF length(part) = 1 THEN
      run := run || part;
    ELSE
      IF run <> '' THEN toks := toks || run; run := ''; END IF;
      toks := toks || part;
    END IF;
  END LOOP;
  IF run <> '' THEN toks := toks || run; END IF;
  FOREACH t IN ARRAY toks LOOP
    t := regexp_replace(t, '(.)\1+', '\1', 'g');
    IF t = ANY (token_words) THEN RETURN false; END IF;
    FOREACH w IN ARRAY substr_words LOOP
      IF position(w IN t) > 0 THEN RETURN false; END IF;
    END LOOP;
  END LOOP;
  RETURN true;
END
$fn$;

REVOKE ALL ON FUNCTION private.is_clean_text(text) FROM PUBLIC, anon, authenticated;

-- Profil adi: kayitta (handle_new_user) bozmadan "Ogrenci"ye cevrilir, sonradan
-- degistirilirken reddedilir.
CREATE OR REPLACE FUNCTION private.guard_profile_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT private.is_clean_text(NEW.name) THEN NEW.name := 'Öğrenci'; END IF;
  ELSIF NEW.name IS DISTINCT FROM OLD.name AND NOT private.is_clean_text(NEW.name) THEN
    RAISE EXCEPTION 'Bu isim uygun değil' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS guard_profile_name ON public.profiles;
CREATE TRIGGER guard_profile_name
  BEFORE INSERT OR UPDATE OF name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.guard_profile_name();

CREATE OR REPLACE FUNCTION private.guard_group_text()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $fn$
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description)
     AND NOT (private.is_clean_text(NEW.name) AND private.is_clean_text(NEW.description)) THEN
    RAISE EXCEPTION 'Bu ifade uygun değil' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS guard_group_text ON public.groups;
CREATE TRIGGER guard_group_text
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION private.guard_group_text();
