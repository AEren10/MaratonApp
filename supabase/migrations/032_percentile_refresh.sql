-- Percentile materialized view'ı günlük yenilemek için RPC fonksiyonu.
-- pg_cron yoksa (Free plan) app tarafından throttle'lı çağrılır.

CREATE OR REPLACE FUNCTION public.refresh_percentiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_percentiles() TO authenticated;

-- Supabase Pro plan varsa pg_cron ile günde 1 kez otomatik yenile:
-- SELECT cron.schedule(
--   'refresh-percentiles',
--   '0 4 * * *',
--   'SELECT public.refresh_percentiles()'
-- );
