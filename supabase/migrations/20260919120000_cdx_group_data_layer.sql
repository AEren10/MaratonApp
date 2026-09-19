-- Group data layer for the social group UI.
-- Live DB already had groups/group_members and leaderboard triggers; this
-- migration preserves that surface while adding the UI contract fields and
-- hardened RPCs/RLS around membership-only reads.

ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS weekly_target INTEGER NOT NULL DEFAULT 1000 CHECK (weekly_target >= 0),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.groups
   SET created_by = owner_id
 WHERE created_by IS NULL;

ALTER TABLE public.groups
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE public.group_members
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member'));

UPDATE public.group_members gm
   SET role = 'admin'
  FROM public.groups g
 WHERE g.id = gm.group_id
   AND g.created_by = gm.user_id
   AND gm.role <> 'admin';

CREATE INDEX IF NOT EXISTS idx_group_members_group_role
  ON public.group_members (group_id, role);

CREATE OR REPLACE FUNCTION private.generate_group_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  alphabet CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes BYTEA;
  out_code TEXT;
  i INT;
BEGIN
  LOOP
    bytes := gen_random_bytes(6);
    out_code := '';
    FOR i IN 0..5 LOOP
      out_code := out_code || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE code = out_code);
  END LOOP;
  RETURN out_code;
END;
$fn$;

CREATE OR REPLACE FUNCTION private.sync_group_owner_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $fn$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := NEW.owner_id;
  END IF;
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := NEW.created_by;
  END IF;
  IF NEW.created_by <> NEW.owner_id THEN
    NEW.owner_id := NEW.created_by;
  END IF;
  NEW.code := upper(trim(NEW.code));
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_sync_group_owner_columns ON public.groups;
CREATE TRIGGER trg_sync_group_owner_columns
BEFORE INSERT OR UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION private.sync_group_owner_columns();

CREATE OR REPLACE FUNCTION private.is_group_member(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT EXISTS (
    SELECT 1
      FROM public.group_members
     WHERE group_id = gid
       AND user_id = (SELECT auth.uid())
  );
$fn$;

CREATE OR REPLACE FUNCTION private.is_group_admin(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT EXISTS (
    SELECT 1
      FROM public.group_members
     WHERE group_id = gid
       AND user_id = (SELECT auth.uid())
       AND role = 'admin'
  );
$fn$;

CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.is_group_member(gid);
$fn$;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "groups select member or owner" ON public.groups;
DROP POLICY IF EXISTS "groups insert owner" ON public.groups;
DROP POLICY IF EXISTS "groups delete owner" ON public.groups;
DROP POLICY IF EXISTS "groups update admin" ON public.groups;
DROP POLICY IF EXISTS "groups update owner" ON public.groups;

CREATE POLICY "groups select member"
  ON public.groups FOR SELECT TO authenticated
  USING (private.is_group_member(id));

CREATE POLICY "groups insert owner"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(created_by, owner_id) = (SELECT auth.uid())
    AND owner_id = (SELECT auth.uid())
  );

CREATE POLICY "groups update admin"
  ON public.groups FOR UPDATE TO authenticated
  USING (private.is_group_admin(id))
  WITH CHECK (
    private.is_group_admin(id)
    AND created_by = owner_id
  );

CREATE POLICY "groups delete admin"
  ON public.groups FOR DELETE TO authenticated
  USING (private.is_group_admin(id));

DROP POLICY IF EXISTS "group_members select same group" ON public.group_members;
DROP POLICY IF EXISTS "group_members delete self" ON public.group_members;
DROP POLICY IF EXISTS "group_members insert self" ON public.group_members;

CREATE POLICY "group_members select same group"
  ON public.group_members FOR SELECT TO authenticated
  USING (private.is_group_member(group_id));

CREATE POLICY "group_members delete self"
  ON public.group_members FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND role <> 'admin');

REVOKE ALL ON public.groups FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.groups TO authenticated;
GRANT UPDATE (name, description, weekly_target) ON public.groups TO authenticated;

REVOKE ALL ON public.group_members FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.group_members TO authenticated;

DROP FUNCTION IF EXISTS public.create_group(TEXT);
DROP FUNCTION IF EXISTS public.create_group(TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS private.create_group(TEXT);
DROP FUNCTION IF EXISTS private.create_group(TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION private.create_group(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_weekly_target INTEGER DEFAULT 1000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := (SELECT auth.uid());
  g RECORD;
  new_code TEXT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;
  IF p_name IS NULL OR length(btrim(p_name)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_name');
  END IF;

  new_code := private.generate_group_code();

  INSERT INTO public.groups (name, description, code, weekly_target, owner_id, created_by)
  VALUES (
    btrim(p_name),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    new_code,
    GREATEST(COALESCE(p_weekly_target, 1000), 0),
    uid,
    uid
  )
  RETURNING * INTO g;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (g.id, uid, 'admin');

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'description', g.description,
    'code', g.code,
    'weekly_target', g.weekly_target,
    'created_by', g.created_by,
    'owner_id', g.owner_id,
    'role', 'admin',
    'created_at', g.created_at
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.create_group(
  p_name TEXT,
  p_description TEXT,
  p_weekly_target INTEGER
)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.create_group(p_name, p_description, p_weekly_target);
$fn$;

-- Backwards-compatible wrapper for older callers that pass only p_name.
CREATE OR REPLACE FUNCTION public.create_group(p_name TEXT)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.create_group(p_name, NULL, 1000);
$fn$;

DROP FUNCTION IF EXISTS public.join_group_by_code(TEXT);
DROP FUNCTION IF EXISTS private.join_group_by_code(TEXT);

CREATE OR REPLACE FUNCTION private.join_group_by_code(group_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  gid UUID;
  caller_uuid UUID := (SELECT auth.uid());
  g RECORD;
BEGIN
  IF caller_uuid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT *
    INTO g
    FROM public.groups
   WHERE code = upper(trim(group_code))
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  gid := g.id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (gid, caller_uuid, 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'description', g.description,
    'code', g.code,
    'weekly_target', g.weekly_target,
    'created_by', g.created_by,
    'owner_id', g.owner_id
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.join_group_by_code(group_code TEXT)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.join_group_by_code(group_code);
$fn$;

DROP FUNCTION IF EXISTS public.leave_group(UUID);
DROP FUNCTION IF EXISTS private.leave_group(UUID);

CREATE OR REPLACE FUNCTION private.leave_group(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := (SELECT auth.uid());
  member_role TEXT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;

  SELECT role INTO member_role
    FROM public.group_members
   WHERE group_id = p_group_id AND user_id = uid;

  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_member'); END IF;
  IF member_role = 'admin' THEN RETURN jsonb_build_object('ok', false, 'reason', 'admin_cannot_leave'); END IF;

  DELETE FROM public.group_members WHERE group_id = p_group_id AND user_id = uid;
  RETURN jsonb_build_object('ok', true);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.leave_group(p_group_id UUID)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.leave_group(p_group_id);
$fn$;

DROP FUNCTION IF EXISTS public.remove_group_member(UUID, UUID);
DROP FUNCTION IF EXISTS private.remove_group_member(UUID, UUID);

CREATE OR REPLACE FUNCTION private.remove_group_member(p_group_id UUID, p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  uid UUID := (SELECT auth.uid());
  target_role TEXT;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF NOT private.is_group_admin(p_group_id) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_admin'); END IF;
  IF uid = p_user_id THEN RETURN jsonb_build_object('ok', false, 'reason', 'cannot_remove_self'); END IF;

  SELECT role INTO target_role
    FROM public.group_members
   WHERE group_id = p_group_id AND user_id = p_user_id;

  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_member'); END IF;
  IF target_role = 'admin' THEN RETURN jsonb_build_object('ok', false, 'reason', 'cannot_remove_admin'); END IF;

  DELETE FROM public.group_members WHERE group_id = p_group_id AND user_id = p_user_id;
  RETURN jsonb_build_object('ok', true);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.remove_group_member(p_group_id UUID, p_user_id UUID)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.remove_group_member(p_group_id, p_user_id);
$fn$;

DROP FUNCTION IF EXISTS public.regenerate_group_code(UUID);
DROP FUNCTION IF EXISTS private.regenerate_group_code(UUID);

CREATE OR REPLACE FUNCTION private.regenerate_group_code(p_group_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  new_code TEXT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF NOT private.is_group_admin(p_group_id) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_admin'); END IF;

  new_code := private.generate_group_code();
  UPDATE public.groups
     SET code = new_code
   WHERE id = p_group_id;

  RETURN jsonb_build_object('ok', true, 'code', new_code);
END;
$fn$;

CREATE OR REPLACE FUNCTION public.regenerate_group_code(p_group_id UUID)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.regenerate_group_code(p_group_id);
$fn$;

DROP FUNCTION IF EXISTS public.update_group_settings(UUID, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS private.update_group_settings(UUID, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION private.update_group_settings(
  p_group_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_weekly_target INTEGER DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  g RECORD;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  IF NOT private.is_group_admin(p_group_id) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_admin'); END IF;

  UPDATE public.groups
     SET name = COALESCE(NULLIF(btrim(p_name), ''), name),
         description = CASE WHEN p_description IS NULL THEN description ELSE NULLIF(btrim(p_description), '') END,
         weekly_target = COALESCE(GREATEST(p_weekly_target, 0), weekly_target)
   WHERE id = p_group_id
   RETURNING * INTO g;

  RETURN jsonb_build_object(
    'ok', true,
    'id', g.id,
    'name', g.name,
    'description', g.description,
    'code', g.code,
    'weekly_target', g.weekly_target,
    'created_by', g.created_by,
    'owner_id', g.owner_id,
    'created_at', g.created_at
  );
END;
$fn$;

CREATE OR REPLACE FUNCTION public.update_group_settings(
  p_group_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_weekly_target INTEGER
)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $fn$
  SELECT private.update_group_settings(p_group_id, p_name, p_description, p_weekly_target);
$fn$;

DROP FUNCTION IF EXISTS public.get_my_groups();

CREATE OR REPLACE FUNCTION public.get_my_groups()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  code TEXT,
  weekly_target INTEGER,
  created_by UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ,
  role TEXT,
  member_count BIGINT,
  weekly_questions BIGINT
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH my_groups AS (
    SELECT g.*, gm.role
      FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
     WHERE gm.user_id = (SELECT auth.uid())
  ),
  week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  )
  SELECT
    g.id,
    g.name,
    g.description,
    g.code,
    g.weekly_target,
    g.created_by,
    g.owner_id,
    g.created_at,
    g.role,
    (SELECT count(*) FROM public.group_members m WHERE m.group_id = g.id) AS member_count,
    COALESCE((
      SELECT sum(sl.question_count)::BIGINT
      FROM public.group_members m
      JOIN public.study_logs sl ON sl.user_id = m.user_id
      CROSS JOIN week_start ws
      WHERE m.group_id = g.id
        AND sl.study_date >= ws.day
    ), 0) AS weekly_questions
  FROM my_groups g
  ORDER BY g.created_at DESC;
$fn$;

DROP FUNCTION IF EXISTS public.get_group_detail(UUID);

CREATE OR REPLACE FUNCTION public.get_group_detail(p_group_id UUID)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  ),
  group_row AS (
    SELECT g.*, gm.role AS my_role
      FROM public.groups g
      JOIN public.group_members gm ON gm.group_id = g.id AND gm.user_id = (SELECT auth.uid())
     WHERE g.id = p_group_id
  ),
  member_rows AS (
    SELECT
      gm.user_id,
      gm.role,
      gm.joined_at,
      p.name,
      p.avatar_url,
      COALESCE(sum(sl.question_count), 0)::BIGINT AS weekly_questions,
      false AS is_studying_now
    FROM public.group_members gm
    LEFT JOIN public.profiles p ON p.id = gm.user_id
    CROSS JOIN week_start ws
    LEFT JOIN public.study_logs sl
      ON sl.user_id = gm.user_id
     AND sl.study_date >= ws.day
    WHERE gm.group_id = p_group_id
    GROUP BY gm.user_id, gm.role, gm.joined_at, p.name, p.avatar_url
  ),
  ranked AS (
    SELECT
      *,
      row_number() OVER (ORDER BY weekly_questions DESC, joined_at ASC, user_id) AS rank
    FROM member_rows
  ),
  totals AS (
    SELECT COALESCE(sum(weekly_questions), 0)::BIGINT AS weekly_questions FROM member_rows
  )
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM group_row) THEN jsonb_build_object('ok', false, 'reason', 'not_member')
    ELSE jsonb_build_object(
      'ok', true,
      'group', (
        SELECT jsonb_build_object(
          'id', id,
          'name', name,
          'description', description,
          'code', code,
          'weekly_target', weekly_target,
          'created_by', created_by,
          'owner_id', owner_id,
          'created_at', created_at,
          'role', my_role,
          'weekly_questions', (SELECT weekly_questions FROM totals),
          'member_count', (SELECT count(*) FROM member_rows)
        )
        FROM group_row
      ),
      'members', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'user_id', user_id,
          'name', name,
          'avatar_url', avatar_url,
          'role', role,
          'joined_at', joined_at,
          'weekly_questions', weekly_questions,
          'rank', rank,
          'is_studying_now', is_studying_now,
          'you', user_id = (SELECT auth.uid())
        ) ORDER BY rank)
        FROM ranked
      ), '[]'::jsonb)
    )
  END;
$fn$;

DROP FUNCTION IF EXISTS public.get_group_leaderboard(UUID);

CREATE OR REPLACE FUNCTION public.get_group_leaderboard(group_uuid UUID)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  questions BIGINT,
  trials BIGINT,
  weekly_xp BIGINT,
  weekly_questions BIGINT,
  rank BIGINT,
  you BOOLEAN,
  is_studying_now BOOLEAN
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  ),
  member_ids AS (
    SELECT gm.user_id
      FROM public.group_members gm
     WHERE gm.group_id = group_uuid
       AND private.is_group_member(group_uuid)
  ),
  weekly AS (
    SELECT
      ids.user_id,
      p.name,
      p.avatar_url,
      COALESCE(sum(sl.question_count), 0)::BIGINT AS weekly_questions,
      COALESCE(lw.trials, 0)::BIGINT AS trials,
      COALESCE(lw.weekly_xp, 0)::BIGINT AS weekly_xp
    FROM member_ids ids
    LEFT JOIN public.profiles p ON p.id = ids.user_id
    CROSS JOIN week_start ws
    LEFT JOIN public.study_logs sl
      ON sl.user_id = ids.user_id
     AND sl.study_date >= ws.day
    LEFT JOIN public.leaderboard_weekly lw ON lw.user_id = ids.user_id
    GROUP BY ids.user_id, p.name, p.avatar_url, lw.trials, lw.weekly_xp
  ),
  ranked AS (
    SELECT
      *,
      row_number() OVER (ORDER BY weekly_questions DESC, trials DESC, user_id) AS rank
    FROM weekly
  )
  SELECT
    ranked.user_id,
    ranked.name,
    ranked.avatar_url,
    ranked.weekly_questions AS questions,
    ranked.trials,
    ranked.weekly_xp,
    ranked.weekly_questions,
    ranked.rank,
    ranked.user_id = (SELECT auth.uid()) AS you,
    false AS is_studying_now
  FROM ranked
  ORDER BY ranked.rank;
$fn$;

REVOKE ALL ON FUNCTION public.create_group(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_group(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_group(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_group_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.regenerate_group_code(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_group_settings(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_groups() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_detail(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_group_leaderboard(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_group_member(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_group(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_group(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_group_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_group_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_group_settings(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_groups() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;

REVOKE ALL ON FUNCTION private.generate_group_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.create_group(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.join_group_by_code(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.leave_group(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.remove_group_member(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.regenerate_group_code(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.update_group_settings(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_group_member(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_group_admin(UUID) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.create_group(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION private.join_group_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION private.leave_group(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.remove_group_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.regenerate_group_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.update_group_settings(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_group_admin(UUID) TO authenticated;
