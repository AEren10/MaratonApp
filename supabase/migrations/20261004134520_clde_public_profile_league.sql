-- Herkese acik profil: lig kademesi icin haftalik lig puani (weekly_xp) eklendi.
-- Kullanici: profilde istatistik, lig, guc haritasi ve fotograf gorunsun (4 Ekim).

CREATE OR REPLACE FUNCTION public.get_public_profile(p_user uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_profile record;
  v_is_friend boolean := false;
  v_same_group boolean := false;
  v_relationship text := 'none';
  v_week_start date := date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul')::date;
  v_questions bigint := 0;
  v_minutes bigint := 0;
  v_streak integer := 0;
  v_progress jsonb := '[]'::jsonb;
  v_weekly_xp bigint := 0;
BEGIN
  IF v_caller IS NULL OR p_user IS NULL THEN
    RAISE EXCEPTION 'public_profile_unavailable' USING ERRCODE = '42501';
  END IF;

  SELECT p.id, p.name, p.avatar_url, p.exam_type, p.public_profile_visibility
    INTO v_profile
    FROM public.profiles p
   WHERE p.id = p_user
     AND p.show_in_leaderboard IS TRUE;

  IF v_profile.id IS NULL OR EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status = 'blocked'
       AND ((f.requester_id = v_caller AND f.addressee_id = p_user)
         OR (f.requester_id = p_user AND f.addressee_id = v_caller))
  ) THEN
    RAISE EXCEPTION 'public_profile_unavailable' USING ERRCODE = '42501';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status = 'accepted'
       AND ((f.requester_id = v_caller AND f.addressee_id = p_user)
         OR (f.requester_id = p_user AND f.addressee_id = v_caller))
  ) INTO v_is_friend;

  SELECT EXISTS (
    SELECT 1
      FROM public.group_members mine
      JOIN public.group_members theirs ON theirs.group_id = mine.group_id
     WHERE mine.user_id = v_caller AND theirs.user_id = p_user
  ) INTO v_same_group;

  IF v_caller <> p_user AND NOT v_is_friend AND (
    v_profile.public_profile_visibility = 'friends_only' OR NOT v_same_group
  ) THEN
    RAISE EXCEPTION 'public_profile_unavailable' USING ERRCODE = '42501';
  END IF;

  SELECT CASE
    WHEN v_is_friend THEN 'accepted'
    WHEN EXISTS (
      SELECT 1 FROM public.friendships f
       WHERE f.requester_id = v_caller AND f.addressee_id = p_user AND f.status = 'pending'
    ) THEN 'outgoing_pending'
    WHEN EXISTS (
      SELECT 1 FROM public.friendships f
       WHERE f.requester_id = p_user AND f.addressee_id = v_caller AND f.status = 'pending'
    ) THEN 'incoming_pending'
    ELSE 'none'
  END INTO v_relationship;

  SELECT COALESCE(sum(sl.question_count), 0), COALESCE(sum(sl.duration_minutes), 0)
    INTO v_questions, v_minutes
    FROM public.study_logs sl
   WHERE sl.user_id = p_user
     AND sl.study_date BETWEEN v_week_start AND v_week_start + 6;

  -- Lig kademesi (istemci getTier) icin bu haftanin lig puani.
  SELECT COALESCE(e.weekly_xp, 0) INTO v_weekly_xp
    FROM public.leaderboard_weekly_entries e
   WHERE e.user_id = p_user
     AND e.week_start = v_week_start;

  SELECT COALESCE(s.current_streak, 0)
    INTO v_streak
    FROM public.streaks s
   WHERE s.user_id = p_user;

  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'subject_key', scores.subject_key,
             'subject_name', scores.subject_name,
             'progress_percent', scores.progress_percent
           ) ORDER BY scores.subject_name
         ), '[]'::jsonb)
    INTO v_progress
    FROM (
      SELECT tp.subject_key,
             COALESCE(max(sub.label), tp.subject_key) AS subject_name,
             round(avg(least(100, round(
               least(COALESCE(tp.total_questions, 0)::numeric / 30, 1) * 40
               + CASE
                   WHEN COALESCE(tp.graded_questions, 0) > 0 THEN
                     least(100, round(COALESCE(tp.correct_count, 0)::numeric /
                       greatest(least(tp.graded_questions, tp.total_questions), tp.correct_count, 1) * 100)) / 100 * 30
                   WHEN COALESCE(tp.correct_count, 0) > 0 THEN
                     least(100, round(tp.correct_count::numeric /
                       greatest(tp.total_questions, tp.correct_count, 1) * 100)) / 100 * 30
                   ELSE 0
                 END
               + least(COALESCE(tp.study_count, 0)::numeric / 3, 1) * 30
             ))))::integer AS progress_percent
        FROM public.topic_progress tp
        LEFT JOIN public.subjects sub ON sub.key = tp.subject_key
       WHERE tp.user_id = p_user
       GROUP BY tp.subject_key
    ) scores;

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'name', COALESCE(v_profile.name, 'Öğrenci'),
    'avatar_url', v_profile.avatar_url,
    'exam_type', v_profile.exam_type,
    'current_streak', COALESCE(v_streak, 0),
    'weekly_questions', COALESCE(v_questions, 0),
    'weekly_minutes', COALESCE(v_minutes, 0),
    'weekly_xp', COALESCE(v_weekly_xp, 0),
    'relationship_status', v_relationship,
    'subject_progress', v_progress
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
