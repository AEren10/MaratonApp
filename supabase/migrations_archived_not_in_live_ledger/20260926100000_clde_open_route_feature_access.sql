-- 2026-09-26: Premium ozellikleri askida iken (PREMIUM_ENABLED = false)
-- rota erisimi (persist_route_revision, transition_route_stop, RLS politikalari)
-- 7 gunu gecmis kullanicilar icin '42501 route access required' hatasi veriyordu.
-- Bu migration ile ozellik kontrolu premium askida oldugu surece tum kullanicilara acilir.

CREATE OR REPLACE FUNCTION private.has_feature_access(
  p_user_id UUID,
  p_feature_key TEXT,
  p_at TIMESTAMPTZ DEFAULT now()
)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $fn$
  -- Premium askida: tum ozellikler acik
  SELECT true;
$fn$;

REVOKE ALL ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) TO authenticated;
