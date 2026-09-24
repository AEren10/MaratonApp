-- Server-only function to grant premium days (called by RevenueCat webhook)
CREATE OR REPLACE FUNCTION public.grant_premium(target_user_id UUID, days INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_until TIMESTAMPTZ;
  base_time TIMESTAMPTZ;
BEGIN
  SELECT premium_until INTO current_until
  FROM public.profiles WHERE id = target_user_id;

  IF current_until IS NOT NULL AND current_until > NOW() THEN
    base_time := current_until;
  ELSE
    base_time := NOW();
  END IF;

  UPDATE public.profiles
  SET premium_until = base_time + (days || ' days')::INTERVAL
  WHERE id = target_user_id;
END;
$$;

-- Revoke direct execute from anon/authenticated — only service_role can call
REVOKE EXECUTE ON FUNCTION public.grant_premium FROM anon, authenticated;
