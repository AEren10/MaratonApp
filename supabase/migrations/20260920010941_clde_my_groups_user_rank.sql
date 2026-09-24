-- get_my_groups artik kullanicinin o gruptaki sirasini da donuyor.
--
-- GroupCard "{n}. siradasin" yaziyordu ama bu alani hicbir sey uretmiyordu;
-- guard'li oldugu icin sira sessizce hic gorunmedi.
--
-- Siralama kurali get_group_leaderboard ile BIREBIR AYNI tutulmali
-- (weekly_questions DESC, trials DESC, user_id). Ayrisirsa kart "3.
-- siradasin" derken tablo 4. gosterir ve hangisinin dogru oldugunu kimse
-- bilemez. Ikisi degisecekse birlikte degisir.

DROP FUNCTION IF EXISTS public.get_my_groups();

CREATE OR REPLACE FUNCTION public.get_my_groups()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  code TEXT,
  weekly_target INTEGER,
  created_by UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ,
  role TEXT,
  member_count BIGINT,
  weekly_questions BIGINT,
  user_rank BIGINT
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $fn$
  WITH my_groups AS (
    SELECT g.*, gm.role
      FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
     WHERE gm.user_id = (SELECT auth.uid())
  ),
  week_start AS (
    SELECT date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))::date AS day
  ),
  -- Uyeleri bir kez topla: hem grup toplami hem sira bundan cikiyor.
  member_week AS (
    SELECT
      gm.group_id,
      gm.user_id,
      COALESCE(sum(sl.question_count), 0)::BIGINT AS weekly_questions,
      COALESCE(max(lw.trials), 0)::BIGINT AS trials
    FROM public.group_members gm
    JOIN my_groups mg ON mg.id = gm.group_id
    CROSS JOIN week_start ws
    LEFT JOIN public.study_logs sl
      ON sl.user_id = gm.user_id
     AND sl.study_date >= ws.day
    LEFT JOIN public.leaderboard_weekly lw ON lw.user_id = gm.user_id
    GROUP BY gm.group_id, gm.user_id
  ),
  ranked AS (
    SELECT
      group_id,
      user_id,
      row_number() OVER (
        PARTITION BY group_id
        ORDER BY weekly_questions DESC, trials DESC, user_id
      ) AS rank
    FROM member_week
  )
  SELECT
    g.id,
    g.name,
    g.description,
    g.code,
    g.weekly_target,
    g.created_by,
    g.owner_id,
    g.created_at,
    g.role,
    (SELECT count(*) FROM public.group_members m WHERE m.group_id = g.id) AS member_count,
    COALESCE((
      SELECT sum(mw.weekly_questions)
        FROM member_week mw
       WHERE mw.group_id = g.id
    ), 0)::BIGINT AS weekly_questions,
    (
      SELECT r.rank
        FROM ranked r
       WHERE r.group_id = g.id
         AND r.user_id = (SELECT auth.uid())
    ) AS user_rank
  FROM my_groups g
  ORDER BY g.created_at DESC;
$fn$;

-- DROP yetkileri de dusurur, yeniden verilmeli.
REVOKE ALL ON FUNCTION public.get_my_groups() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_groups() TO authenticated;
