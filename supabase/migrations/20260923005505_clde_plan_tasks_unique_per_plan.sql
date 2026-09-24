-- GUNUN AYNI DURAGI BIRDEN COK KEZ YAZILIYORDU.
--
-- syncPlan ayni anda birkac kez calisabiliyor (ekranlar odaklandikca). Ucu de
-- "bu planin gorevi yok" diye okuyup ayni listeyi yaziyordu: 22 Eylul'de uc
-- parti, hepsi 00:14:06 icinde, ikisi birebir ayni.
--
-- Gorunen sonuc daha kotuydu: tik anahtari (ders + konu)'dan uretildigi icin
-- kopyalar ayni anahtari paylasiyor ve BIR tik hepsini birden kapatiyordu.
-- Kullanici uc durak tikledi, ana sayfa "16/16 gunu kapattin" dedi, plan
-- detayi ayni gun icin 3/15 gosterdi.
--
-- Once kopyalar temizleniyor (tamamlanmis olan korunuyor, yoksa en eski
-- satir), sonra tekrarin bir daha mumkun olmamasi icin benzersiz indeks.
--
-- 2026-09-23'te canliya uygulandi: 22 Eylul plani 14 -> 8 satir, uc
-- tamamlanmis durak korundu.

WITH ranked AS (
  SELECT t.id,
         row_number() OVER (
           PARTITION BY t.plan_id, t.subject, coalesce(t.topic, '')
           ORDER BY t.completed DESC, t.created_at ASC, t.id ASC
         ) AS sira
  FROM public.plan_tasks t
)
DELETE FROM public.plan_tasks
WHERE id IN (SELECT id FROM ranked WHERE sira > 1);

CREATE UNIQUE INDEX IF NOT EXISTS plan_tasks_unique_per_plan
  ON public.plan_tasks (plan_id, subject, coalesce(topic, ''));
