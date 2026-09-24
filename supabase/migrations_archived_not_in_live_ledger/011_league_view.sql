-- A) League: gerçek veri için haftalık leaderboard view.
-- XP olayları Supabase'de tutulmadığından haftalık skor study_logs + trials'tan üretilir:
--   weekly_xp = haftalık çözülen soru + 5 * haftalık deneme sayısı
-- Hafta: TR saatiyle (Europe/Istanbul) içinde bulunulan haftanın pazartesi gününden itibaren.
-- (study_date/trial_date DATE olduğu için 04:00 hassasiyeti gün bazına yuvarlanır.)

-- İsteğe bağlı gizlilik: kullanıcı sıralamada görünmek istemezse kapatabilir.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_in_leaderboard BOOLEAN DEFAULT TRUE;

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
)
SELECT
  p.id                                              AS user_id,
  p.name                                            AS name,
  p.avatar_url                                      AS avatar_url,
  COALESCE(sl.questions, 0)                         AS questions,
  COALESCE(tr.trials, 0)                            AS trials,
  COALESCE(sl.questions, 0) + COALESCE(tr.trials, 0) * 5 AS weekly_xp
FROM public.profiles p
LEFT JOIN sl ON sl.user_id = p.id
LEFT JOIN tr ON tr.user_id = p.id
WHERE COALESCE(p.show_in_leaderboard, TRUE) = TRUE;

-- Leaderboard herkese açık okunur (view owner privileges ile underlying RLS bypass edilir).
GRANT SELECT ON public.leaderboard_weekly TO authenticated;
GRANT SELECT ON public.leaderboard_weekly TO anon;
