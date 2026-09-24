-- Global sıralamada yarışmacı sayısı.
--
-- Sorun: get_global_leaderboard en fazla 100 (varsayılan 50) satır döndürüyor.
-- İstemci "toplam yarışmacı"yı bu listenin uzunluğu sanıyordu, dolayısıyla
-- düşme bölgesi `rank > 50 - 5` diye hesaplanıyordu. Sonuç: global ilk 50'ye
-- girmiş 46–50. sıradaki kullanıcıya "düşme bölgesi" yazıyordu — oysa on
-- binlerce kişi arasında 47. olmak en iyi sonuçlardan biri.
--
-- Bu RPC gerçek kohort büyüklüğünü döndürüyor. Additive: mevcut fonksiyon
-- imzalarına dokunmuyor.

CREATE OR REPLACE FUNCTION public.get_leaderboard_total()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  SELECT COUNT(*)::BIGINT FROM public.leaderboard_weekly;
$fn$;

REVOKE ALL ON FUNCTION public.get_leaderboard_total() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_total() TO authenticated;
