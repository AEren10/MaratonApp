-- weekly_xp'yi GERÇEK XP'den hesapla.
-- XP şu ana dek sadece client (Redux) idi; artık xp_events defterine yazılır
-- ve leaderboard_weekly bu defterden haftalık toplamı kullanır.

CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_date ON public.xp_events(user_id, created_at);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_events select own" ON public.xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "xp_events insert own" ON public.xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- leaderboard_weekly'yi gerçek XP ile yeniden tanımla.
-- weekly_xp = bu hafta kazanılan XP toplamı (xp_events).
-- questions/trials sütunları gösterim için study_logs/trials'tan kalır.
CREATE OR REPLACE VIEW public.leaderboard_weekly AS
WITH wk AS (
  SELECT (date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date) AS week_start
),
sl AS (
  SELECT s.user_id, COALESCE(SUM(s.question_count), 0) AS questions
  FROM public.study_logs s, wk
  WHERE s.study_date >= wk.week_start
  GROUP BY s.user_id
),
tr AS (
  SELECT t.user_id, COUNT(*) AS trials
  FROM public.trials t, wk
  WHERE t.trial_date >= wk.week_start
  GROUP BY t.user_id
),
xp AS (
  SELECT e.user_id, COALESCE(SUM(e.amount), 0) AS weekly_xp
  FROM public.xp_events e, wk
  WHERE e.created_at >= (wk.week_start::timestamp AT TIME ZONE 'Europe/Istanbul')
  GROUP BY e.user_id
)
SELECT
  p.id                       AS user_id,
  p.name                     AS name,
  p.avatar_url               AS avatar_url,
  COALESCE(sl.questions, 0)  AS questions,
  COALESCE(tr.trials, 0)     AS trials,
  COALESCE(xp.weekly_xp, 0)  AS weekly_xp
FROM public.profiles p
LEFT JOIN sl ON sl.user_id = p.id
LEFT JOIN tr ON tr.user_id = p.id
LEFT JOIN xp ON xp.user_id = p.id
WHERE COALESCE(p.show_in_leaderboard, TRUE) = TRUE;

GRANT SELECT ON public.leaderboard_weekly TO authenticated;
GRANT SELECT ON public.leaderboard_weekly TO anon;
