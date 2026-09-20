-- Limited join-code preview for the two-step group join UX.
-- This intentionally does not relax public.groups RLS. A signed-in user can
-- only resolve a valid code to the minimal confirmation fields below; full
-- group and member data still requires membership.

DROP FUNCTION IF EXISTS public.preview_group_by_code(TEXT);
DROP FUNCTION IF EXISTS private.preview_group_by_code(TEXT);

CREATE OR REPLACE FUNCTION private.preview_group_by_code(group_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  g RECORD;
  member_total BIGINT := 0;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT id, name, code, weekly_target
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

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'code', g.code,
    'member_count', member_total,
    'weekly_target', g.weekly_target
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.preview_group_by_code(group_code TEXT)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.preview_group_by_code(group_code);
$fn$;

REVOKE ALL ON FUNCTION public.preview_group_by_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_group_by_code(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION private.preview_group_by_code(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.preview_group_by_code(TEXT) TO authenticated;
