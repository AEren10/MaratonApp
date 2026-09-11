-- Lock SECURITY DEFINER function search paths for CDX-owned RPC surfaces.
--
-- Supabase advisors flag mutable search_path on SECURITY DEFINER functions.
-- These functions already schema-qualify public/private table/function access,
-- so an empty search_path keeps behavior stable while reducing hijack risk.

ALTER FUNCTION public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER)
  SET search_path = '';

ALTER FUNCTION public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)
  SET search_path = '';

ALTER FUNCTION private.has_feature_access(UUID, TEXT, TIMESTAMPTZ)
  SET search_path = '';

ALTER FUNCTION private.get_product_access_snapshot()
  SET search_path = '';

ALTER FUNCTION private.get_private_export_data()
  SET search_path = '';
