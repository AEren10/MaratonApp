-- Premium askida: deneme (ayda 4) ve meydan okuma (1 acik) kotalari da kapali.
-- create_trial / create_challenge kotayi has_feature_access yerine kendileri
-- kontrol ediyordu; YDT migration'i create_trial'i yeniden yazinca kota geri
-- geldi ve deneme kaydi "quota_exhausted" ile reddedildi.
-- GERI ALMAK (Premium acilinca): premium_suspended() govdesini "SELECT false" yap.
-- NOT: create_trial / create_challenge'i yeniden yazan her migration
-- "unlimited := private.premium_suspended() OR ..." satirini korumali.
CREATE OR REPLACE FUNCTION private.premium_suspended()
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO '' AS $$ SELECT true; $$;

DO $$
DECLARE d text; fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY['create_trial', 'create_challenge'] LOOP
    SELECT pg_get_functiondef(p.oid) INTO d
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'private' AND p.proname = fn;
    IF d IS NULL OR position('unlimited := private.is_first_week' in d) = 0 THEN
      RAISE EXCEPTION 'pattern not found in %', fn;
    END IF;
    d := replace(d, 'unlimited := private.is_first_week',
                    'unlimited := private.premium_suspended() OR private.is_first_week');
    EXECUTE d;
  END LOOP;
END $$;
