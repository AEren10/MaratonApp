ALTER FUNCTION private.create_challenge(UUID, TEXT, INTEGER, INTEGER)
  SET search_path = '';

ALTER FUNCTION public.create_challenge(UUID, TEXT, INTEGER, INTEGER)
  SET search_path = '';
