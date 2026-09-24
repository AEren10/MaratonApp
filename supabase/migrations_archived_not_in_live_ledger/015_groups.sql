-- F) Grup ligi: 5-10 kişilik özel gruplar, haftalık leaderboard.

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);

-- Recursion'sız üyelik kontrolü için güvenli yardımcı.
CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid()
  );
$$;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- groups: üye veya sahip görebilir; herkes koda göre arayabilsin diye code ile select serbest değil,
-- katılım joinByCode fonksiyonu üzerinden yapılır (aşağıda).
CREATE POLICY "groups select member or owner"
  ON public.groups FOR SELECT
  USING (owner_id = auth.uid() OR public.is_group_member(id));

CREATE POLICY "groups insert owner"
  ON public.groups FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "groups delete owner"
  ON public.groups FOR DELETE
  USING (owner_id = auth.uid());

-- group_members: aynı gruptaki üyeler birbirini görür.
CREATE POLICY "group_members select same group"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id));

CREATE POLICY "group_members insert self"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members delete self"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- Koda göre gruba katılma (RLS select'i baypas etmeden katılım sağlar).
CREATE OR REPLACE FUNCTION public.join_group_by_code(group_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gid UUID;
BEGIN
  SELECT id INTO gid FROM public.groups WHERE code = upper(group_code) LIMIT 1;
  IF gid IS NULL THEN
    RAISE EXCEPTION 'Grup bulunamadı';
  END IF;
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (gid, auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN gid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;
