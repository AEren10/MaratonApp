-- Defense in depth: private helper functions should not be directly callable
-- by clients. Public wrapper RPCs remain the exposed API.

REVOKE ALL ON FUNCTION private.has_pro_access(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_first_week(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;

-- RLS policies on route tables call this function directly. It stays callable
-- by authenticated users, while the underlying helpers remain hidden.
GRANT EXECUTE ON FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ) TO authenticated;

-- Keep the product snapshot available only through public.get_product_access_snapshot().
REVOKE ALL ON FUNCTION private.get_product_access_snapshot() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_product_access_snapshot()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$ SELECT private.get_product_access_snapshot(); $fn$;

REVOKE ALL ON FUNCTION public.get_product_access_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_product_access_snapshot() TO authenticated;
