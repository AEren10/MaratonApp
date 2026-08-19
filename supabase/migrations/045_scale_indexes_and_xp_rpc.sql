-- 045: Olcek riskleri (2026-08-18 audit)

-- ---------------------------------------------------------------------------
-- 1. Lig tablosu icin eksik indeksler
--
-- leaderboard_weekly view'i haftalik filtreyi KULLANICIYA GORE degil, tarihe
-- gore yapiyor (WHERE study_date >= week_start). Mevcut (user_id, study_date)
-- bilesik indeksi bu sorguda kullanilamiyor, her acilista tam tarama oluyor.
-- Lig en cok acilan ekran oldugu icin bu ilk patlayacak yer.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON public.study_logs (study_date);
CREATE INDEX IF NOT EXISTS idx_trials_date    ON public.trials (trial_date);

-- ---------------------------------------------------------------------------
-- 2. group_members(group_id) indeksi
--
-- is_group_member(gid) fonksiyonu group_id'ye gore ariyor ve bu fonksiyon
-- gruplarla ilgili HER RLS kontrolunde calisiyor. Sadece (user_id) indeksi
-- vardi, group_id tarafi taraniyordu.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members (group_id);

-- ---------------------------------------------------------------------------
-- 3. XP toplami sunucu tarafinda
--
-- PostREST'te aggregate kapali oldugu icin toplama istemciye alinmisti
-- (5000 satira kadar cekip topluyordu). Bir yil aktif kullanan birinde bu
-- her uygulama acilisinda binlerce satir indirmek demek.
-- Artik tek RPC hem toplam hem haftalik degeri donuyor.
--
-- SECURITY INVOKER: RLS gecerli kalir, kullanici yalnizca kendi satirlarini
-- toplayabilir. auth.uid() filtresi ikinci guvence.
--
-- Hafta basi leaderboard_weekly ile ayni: Europe/Istanbul pazartesi.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.my_xp_totals()
RETURNS TABLE (total BIGINT, weekly BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $fn$
  SELECT
    COALESCE(SUM(amount), 0)::BIGINT AS total,
    COALESCE(SUM(amount) FILTER (
      WHERE created_at >= (
        date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))
        AT TIME ZONE 'Europe/Istanbul'
      )
    ), 0)::BIGINT AS weekly
  FROM public.xp_events
  WHERE user_id = auth.uid();
$fn$;

REVOKE ALL ON FUNCTION public.my_xp_totals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_xp_totals() TO authenticated;
