DROP FUNCTION IF EXISTS public.transfer_group_admin(UUID, UUID);
DROP FUNCTION IF EXISTS private.transfer_group_admin(UUID, UUID);

CREATE OR REPLACE FUNCTION private.transfer_group_admin(p_group_id UUID, p_new_admin UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  v_uid UUID := auth.uid();
  v_current_role TEXT;
  v_new_role TEXT;
  v_group public.groups%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  IF p_group_id IS NULL OR p_new_admin IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_new_admin');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_group_id::TEXT, 0));

  SELECT role INTO v_current_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = v_uid
  FOR UPDATE;

  IF v_current_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_member');
  END IF;

  IF v_current_role <> 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_admin');
  END IF;

  SELECT role INTO v_new_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_new_admin
  FOR UPDATE;

  IF v_new_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'new_admin_not_member');
  END IF;

  IF p_new_admin = v_uid OR v_new_role = 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_admin');
  END IF;

  UPDATE public.group_members
  SET role = 'member'
  WHERE group_id = p_group_id AND user_id = v_uid;

  UPDATE public.group_members
  SET role = 'admin'
  WHERE group_id = p_group_id AND user_id = p_new_admin;

  UPDATE public.groups
  SET owner_id = p_new_admin,
      created_by = p_new_admin
  WHERE id = p_group_id
  RETURNING * INTO v_group;

  IF v_group.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'group', to_jsonb(v_group),
    'new_admin', p_new_admin,
    'previous_admin', v_uid
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.transfer_group_admin(p_group_id UUID, p_new_admin UUID)
RETURNS JSONB
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.transfer_group_admin(p_group_id, p_new_admin);
$fn$;

REVOKE ALL ON FUNCTION private.transfer_group_admin(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transfer_group_admin(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_group_admin(UUID, UUID) TO authenticated;
