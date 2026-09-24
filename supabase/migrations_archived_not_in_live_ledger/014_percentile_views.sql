-- E) Anonim akran percentile.
-- Her kullanıcının her ders için ortalama neti + tüm kullanıcılar arasındaki yüzdelik dilimi.
-- Hiçbir kullanıcı ID'si dışarı dönmez: sadece toplulaştırılmış sayımlar kullanılır,
-- ve veri yalnızca SECURITY DEFINER fonksiyonu üzerinden auth.uid()'e ait satırlarla verilir.

CREATE MATERIALIZED VIEW IF NOT EXISTS public.subject_percentile AS
WITH user_subject AS (
  SELECT t.user_id, ts.subject, AVG(ts.net) AS avg_net, COUNT(*) AS n
  FROM public.trial_subjects ts
  JOIN public.trials t ON t.id = ts.trial_id
  GROUP BY t.user_id, ts.subject
)
SELECT
  us.user_id,
  us.subject,
  ROUND(us.avg_net::numeric, 2) AS avg_net,
  ROUND(
    100.0 * (
      (SELECT COUNT(*) FROM user_subject u2 WHERE u2.subject = us.subject AND u2.avg_net < us.avg_net)::numeric
      / NULLIF((SELECT COUNT(*) FROM user_subject u3 WHERE u3.subject = us.subject), 0)
    )
  )::int AS percentile
FROM user_subject us;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subject_percentile_pk
  ON public.subject_percentile (user_id, subject);

-- Sadece kendi percentile'ını döndüren güvenli fonksiyon (anonimlik garantisi).
CREATE OR REPLACE FUNCTION public.my_percentiles()
RETURNS TABLE (subject TEXT, avg_net NUMERIC, percentile INT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.subject, sp.avg_net, sp.percentile
  FROM public.subject_percentile sp
  WHERE sp.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.my_percentiles() TO authenticated;

-- Günde bir kez yenilenmeli (pg_cron veya manuel):
--   REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;
