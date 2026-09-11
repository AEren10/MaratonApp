-- Durak Ekle · "NE ZAMAN" bolumu
--
-- Tasarim (AKIS 7 · "Durak Ekle") uc alan gosteriyor: Tarih, Saat,
-- "Her hafta tekrarla". Bugun user_tasks'ta yalnizca `task_date` var,
-- bu yuzden ekran Tarih ile sinirli yazildi -- karsiligi olmayan bir
-- saat alani gostermek kaydedilmeyen veri demek olurdu.
--
-- UYGULANDI: 2026-09-11, Supabase SQL editoru, proje zrycqfehhyjrsujmajpf.
-- "Success. No rows returned". REST ile dogrulandi: task_time ve series_id
-- sorgusu 42703 (kolon yok) yerine 42501 (anon yetkisi yok) donuyor --
-- yani kolonlar mevcut ve RLS hala kapali.

ALTER TABLE public.user_tasks
  ADD COLUMN IF NOT EXISTS task_time TIME;

-- Haftalik tekrar: seriyi olusturan gorevlerin ortak kimligi.
-- Tekrar, olusturma aninda N hafta ileri satir uretilerek kuruluyor;
-- boylece okuma tarafinda tekrar kurali cozmeye gerek kalmiyor ve
-- kullanici tek bir gunu silip serinin kalanini koruyabiliyor.
ALTER TABLE public.user_tasks
  ADD COLUMN IF NOT EXISTS series_id UUID;

CREATE INDEX IF NOT EXISTS idx_user_tasks_series
  ON public.user_tasks(user_id, series_id)
  WHERE series_id IS NOT NULL;
