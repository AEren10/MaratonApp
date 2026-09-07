-- ============================================================================
-- DİKKAT: Bu migration UYGULANDIĞI AN gerçek kullanıcılara push bildirimi
-- göndermeye başlar. Bilerek uygulanmalı.
--
-- 20260624_push_reengagement_cron.sql sunucu tarafı re-engagement sistemini
-- TAMAMEN YORUM SATIRINDA bırakmıştı. send-push Edge Function'ı eksiksiz
-- yazılmış (kullanıcı tercihlerini süzüyor, sadece hedef kitleyi çekiyor),
-- ama onu çağıran hiçbir şey yoktu. Yani sistem hiç çalışmadı.
--
-- ÖN KOŞULLAR (uygulamadan önce doğrula):
--   1. pg_cron ve pg_net eklentileri açık olmalı (Supabase Pro gerektirir):
--        Dashboard > Database > Extensions
--   2. Ayarlar tanımlı olmalı — service_role_key GİZLİDİR, migration'a yazma:
--        ALTER DATABASE postgres SET app.settings.supabase_url = 'https://<ref>.supabase.co';
--        ALTER DATABASE postgres SET app.settings.service_role_key = '<service_role_key>';
--   3. send-push fonksiyonu deploy edilmiş olmalı:
--        supabase functions deploy send-push
--
-- GERİ ALMA: her job için  SELECT cron.unschedule('<job_adı>');
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Aynı isimli job varsa önce kaldır — migration tekrar çalıştırılabilir olsun.
DO $$
DECLARE
  job TEXT;
BEGIN
  FOREACH job IN ARRAY ARRAY[
    'push-inactive-3d',
    'push-streak-risk',
    'push-weekly-summary'
  ] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = job) THEN
      PERFORM cron.unschedule(job);
    END IF;
  END LOOP;
END
$$;

-- Tek yerden çağrı: her job aynı gövdeyi farklı type ile yolluyor.
CREATE OR REPLACE FUNCTION public.trigger_send_push(push_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('type', push_type)
  );
END
$$;

REVOKE ALL ON FUNCTION public.trigger_send_push(TEXT) FROM PUBLIC, anon, authenticated;

-- 3 gündür girmeyenler — 18:00 UTC = 21:00 TR
SELECT cron.schedule(
  'push-inactive-3d',
  '0 18 * * *',
  $$SELECT public.trigger_send_push('inactive_3d')$$
);

-- Seri riski — 19:00 UTC = 22:00 TR.
-- Edge Function yalnızca BUGÜN aktif OLMAYANLARI hedefliyor, yani çalışmış
-- kullanıcıya gitmez. İstemci tarafındaki tek seferlik hatırlatma ile
-- çakışmaz: o da çalışıldıysa kendini yarına atıyor.
SELECT cron.schedule(
  'push-streak-risk',
  '0 19 * * *',
  $$SELECT public.trigger_send_push('streak_risk')$$
);

-- Haftalık özet — Pazartesi 10:00 UTC = 13:00 TR
SELECT cron.schedule(
  'push-weekly-summary',
  '0 10 * * 1',
  $$SELECT public.trigger_send_push('weekly_summary')$$
);
