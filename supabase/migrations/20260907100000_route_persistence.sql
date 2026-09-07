-- ROTA KALICILIĞI — "Konu Borcu" ve "Plan vs Gerçek" bunsuz çalışamaz.
--
-- routeEngine planı hesaplıyor ama hiçbir yere yazmıyordu. Borç = planlanan −
-- gerçekleşen olduğu için, plan saklanmadan borç her zaman SIFIR çıkıyordu.
-- Tasarımdaki AKIŞ 7 ekranları (Konu Borcu, Borç Dağıtıldı, Plan vs Gerçek,
-- Boşluğu Kapatma Planı) bu tabloya dayanır.
--
-- daily_plans/plan_tasks ile ÇAKIŞMAZ: onlar GÜNLÜK plan, bu HAFTALIK rota.
--
-- exam_type kolonu bilinçli: kullanıcı YKS↔LGS değiştirirse eski rota
-- haftaları başka bir müfredata aittir ve geçersizdir. Borç hesabı yanlış
-- müfredatın planını kullanmasın diye filtrelenebilir olmalı.

CREATE TABLE IF NOT EXISTS public.route_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  planned_questions INTEGER NOT NULL DEFAULT 0,
  planned_minutes INTEGER NOT NULL DEFAULT 0,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  exam_type TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir kullanıcı + bir hafta = tek satır. Rota yeniden çizilince UPSERT edilir.
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_weeks_user_week
  ON public.route_weeks (user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_route_weeks_user_time
  ON public.route_weeks (user_id, week_start DESC);

ALTER TABLE public.route_weeks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "route weeks select own" ON public.route_weeks;
CREATE POLICY "route weeks select own" ON public.route_weeks
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "route weeks insert own" ON public.route_weeks;
CREATE POLICY "route weeks insert own" ON public.route_weeks
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "route weeks update own" ON public.route_weeks;
CREATE POLICY "route weeks update own" ON public.route_weeks
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "route weeks delete own" ON public.route_weeks;
CREATE POLICY "route weeks delete own" ON public.route_weeks
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.route_weeks FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_weeks TO authenticated;


-- ROTA DURUMU — ara verme / dondurma / son çizim.
-- Tasarım AKIŞ 2: "Ara Verme → Rota Donduruldu → Rotayı Yeniden Çiz".
CREATE TABLE IF NOT EXISTS public.route_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  capacity JSONB,
  exam_type TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.route_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "route state select own" ON public.route_state;
CREATE POLICY "route state select own" ON public.route_state
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "route state upsert own" ON public.route_state;
CREATE POLICY "route state upsert own" ON public.route_state
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "route state update own" ON public.route_state;
CREATE POLICY "route state update own" ON public.route_state
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

REVOKE ALL ON public.route_state FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON public.route_state TO authenticated;
