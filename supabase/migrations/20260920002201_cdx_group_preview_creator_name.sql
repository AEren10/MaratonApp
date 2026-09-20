-- Add a non-sensitive creator display label to the limited group-code preview.
-- The RPC still does not expose owner ids, member rows, or full group details.

CREATE OR REPLACE FUNCTION private.preview_group_by_code(group_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  g RECORD;
  member_total BIGINT := 0;
  creator_name TEXT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT id, name, code, weekly_target, created_by, owner_id
    INTO g
    FROM public.groups
   WHERE code = upper(trim(group_code))
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  SELECT count(*)::BIGINT
    INTO member_total
    FROM public.group_members
   WHERE group_id = g.id;

  SELECT p.name
    INTO creator_name
    FROM public.profiles p
   WHERE p.id = COALESCE(g.created_by, g.owner_id)
   LIMIT 1;

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'code', g.code,
    'member_count', member_total,
    'weekly_target', g.weekly_target,
    'creator_name', COALESCE(creator_name, 'Öğrenci')
  );
END;
$fn$;

REVOKE ALL ON FUNCTION private.preview_group_by_code(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.preview_group_by_code(TEXT) TO authenticated;
