-- referral_logs tablosu canlı veritabanına ELLE açılmış; hiçbir migration onu
-- oluşturmuyordu. Buna rağmen 6 migration ona indeks/politika/RPC ekliyor:
--   033, 039  -> INSERT/SELECT
--   20260901135730 -> CREATE INDEX
--   20260901135956 -> ALTER POLICY  (politika yoksa HATA verir)
--   20260902000117 -> RPC gövdesi
--   20260903121406 -> GRANT
-- Yani migration'lardan sıfırdan kurulan bir ortam (staging, felaket kurtarma,
-- yeni geliştirici) bu noktada çöküyordu.
--
-- Bu dosya zinciri onarır. Canlıda tablo/politika zaten var olduğu için
-- tamamen idempotenttir: IF NOT EXISTS + DO bloklarıyla hiçbir şeyi ezmez.
--
-- ÖNEMLİ: Sıra açısından bu dosya, kendisine atıfta bulunan migration'lardan
-- SONRA geliyor. Sıfırdan kurulumda 20260901135956'daki ALTER POLICY yine de
-- patlar. Kalıcı çözüm için bu dosyanın içeriği ileride 033'ten önceki bir
-- numaraya taşınmalı; şimdilik canlıyı bozmadan kaydı doğru hale getiriyoruz.

CREATE TABLE IF NOT EXISTS public.referral_logs (
  id BIGSERIAL PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir kullanıcı yalnızca bir kez davet edilebilir (RPC'deki 'already_used'
-- kontrolünün veritabanı tarafındaki karşılığı — yarış koşuluna karşı).
-- CANLI DOĞRULAMA (2026-09-06): bu indeks canlıda `unique_invitee` adıyla
-- ZATEN VAR. Farklı bir adla tekrar oluşturmak ikinci bir gereksiz indeks
-- yaratırdı, o yüzden var olan ad kontrol ediliyor.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = 'referral_logs'
       AND indexdef ILIKE '%UNIQUE%(invitee_id)%'
  ) THEN
    CREATE UNIQUE INDEX idx_referral_logs_invitee_unique
      ON public.referral_logs (invitee_id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_referral_logs_inviter_id_fk
  ON public.referral_logs (inviter_id);

ALTER TABLE public.referral_logs ENABLE ROW LEVEL SECURITY;

-- Politikalar: CREATE ... IF NOT EXISTS PostgreSQL'de politika için yok,
-- bu yüzden varlık kontrolü DO bloğuyla yapılıyor. Var olanı EZMEZ —
-- 20260901135956'daki ALTER POLICY ayarları korunur.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'referral_logs'
       AND policyname = 'Users can insert referral logs'
  ) THEN
    CREATE POLICY "Users can insert referral logs"
      ON public.referral_logs
      FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = invitee_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'referral_logs'
       AND policyname = 'Users can read own referral logs'
  ) THEN
    CREATE POLICY "Users can read own referral logs"
      ON public.referral_logs
      FOR SELECT
      TO authenticated
      USING (
        ((select auth.uid()) = inviter_id) OR ((select auth.uid()) = invitee_id)
      );
  END IF;
END
$$;

REVOKE ALL ON public.referral_logs FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.referral_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.referral_logs_id_seq TO authenticated;
