-- Public profile privacy and server-authoritative friend request notifications.
-- IMPORTANT: deploy friend-actions before applying this migration. This file does
-- not invoke the Edge Function itself; the authenticated client invokes the Edge
-- endpoint, and only that endpoint can execute the service-role mutation RPCs.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_profile_visibility text NOT NULL DEFAULT 'group_and_friends';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_public_profile_visibility_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_public_profile_visibility_check
  CHECK (public_profile_visibility IN ('group_and_friends', 'friends_only'));

GRANT UPDATE (public_profile_visibility) ON public.profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.friend_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Rate-limit history must survive request cancellation/removal; otherwise a
  -- sender could cancel and resend forever. The relationship reference is only
  -- diagnostic and becomes null when the friendship row is removed.
  friendship_id uuid REFERENCES public.friendships(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS friend_request_events_actor_created_idx
  ON public.friend_request_events (actor_id, created_at DESC);

ALTER TABLE public.friend_request_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.friend_request_events FROM PUBLIC, anon, authenticated;

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
    'relationship_status', v_relationship,
    'subject_progress', v_progress
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.send_friend_request_server(p_actor uuid, p_addressee uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_friendship_id uuid;
  v_actor_name text;
  v_day_start timestamptz := date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul';
BEGIN
  IF p_actor IS NULL OR p_addressee IS NULL OR p_actor = p_addressee THEN
    RAISE EXCEPTION 'invalid_friend_request' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_actor::text, 0));
  PERFORM pg_advisory_xact_lock(hashtextextended(
    least(p_actor::text, p_addressee::text) || greatest(p_actor::text, p_addressee::text), 1
  ));

  IF EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status = 'blocked'
       AND ((f.requester_id = p_actor AND f.addressee_id = p_addressee)
         OR (f.requester_id = p_addressee AND f.addressee_id = p_actor))
  ) THEN
    RAISE EXCEPTION 'friend_interaction_blocked' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status IN ('pending', 'accepted')
       AND ((f.requester_id = p_actor AND f.addressee_id = p_addressee)
         OR (f.requester_id = p_addressee AND f.addressee_id = p_actor))
  ) THEN
    RAISE EXCEPTION 'friendship_already_exists' USING ERRCODE = '23505';
  END IF;

  IF (SELECT count(*) FROM public.friend_request_events e
       WHERE e.actor_id = p_actor AND e.created_at >= v_day_start) >= 20 THEN
    RAISE EXCEPTION 'friend_request_daily_limit' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.friendships f
   WHERE f.status = 'declined'
     AND ((f.requester_id = p_actor AND f.addressee_id = p_addressee)
       OR (f.requester_id = p_addressee AND f.addressee_id = p_actor));

  INSERT INTO public.friendships (requester_id, addressee_id, status, created_at, responded_at)
  VALUES (p_actor, p_addressee, 'pending', now(), NULL)
  RETURNING id INTO v_friendship_id;

  INSERT INTO public.friend_request_events (actor_id, recipient_id, friendship_id)
  VALUES (p_actor, p_addressee, v_friendship_id);

  SELECT COALESCE(p.name, 'Bir öğrenci') INTO v_actor_name
    FROM public.profiles p WHERE p.id = p_actor;

  INSERT INTO public.notifications
    (user_id, kind, title, body, route_name, route_params, metadata)
  VALUES
    (p_addressee, 'friend_request', 'Arkadaşlık isteği',
     v_actor_name || ' seni arkadaş olarak eklemek istiyor', 'Friends',
     jsonb_build_object('section', 'requests'),
     jsonb_build_object('actor_id', p_actor, 'friendship_id', v_friendship_id));

  RETURN jsonb_build_object(
    'friendship_id', v_friendship_id,
    'recipient_id', p_addressee,
    'actor_name', v_actor_name,
    'notification_kind', 'friend_request'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_friend_request_server(
  p_actor uuid,
  p_friendship_id uuid,
  p_accept boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request record;
  v_actor_name text;
BEGIN
  SELECT f.id, f.requester_id, f.addressee_id, f.status
    INTO v_request
    FROM public.friendships f
   WHERE f.id = p_friendship_id
   FOR UPDATE;

  IF v_request.id IS NULL OR v_request.addressee_id <> p_actor OR v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'friend_request_unavailable' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.friendships f
     WHERE f.status = 'blocked'
       AND f.id <> p_friendship_id
       AND ((f.requester_id = p_actor AND f.addressee_id = v_request.requester_id)
         OR (f.requester_id = v_request.requester_id AND f.addressee_id = p_actor))
  ) THEN
    RAISE EXCEPTION 'friend_interaction_blocked' USING ERRCODE = '42501';
  END IF;

  UPDATE public.friendships
     SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,
         responded_at = now()
   WHERE id = p_friendship_id;

  SELECT COALESCE(p.name, 'Bir öğrenci') INTO v_actor_name
    FROM public.profiles p WHERE p.id = p_actor;

  IF p_accept THEN
    INSERT INTO public.notifications
      (user_id, kind, title, body, route_name, route_params, metadata)
    VALUES
      (v_request.requester_id, 'friend_accepted', 'Arkadaşlık isteği kabul edildi',
       v_actor_name || ' isteğini kabul etti', 'Friends', '{}'::jsonb,
       jsonb_build_object('actor_id', p_actor, 'friendship_id', p_friendship_id));
  END IF;

  RETURN jsonb_build_object(
    'friendship_id', p_friendship_id,
    'accepted', p_accept,
    'recipient_id', CASE WHEN p_accept THEN v_request.requester_id ELSE NULL END,
    'actor_name', v_actor_name,
    'notification_kind', CASE WHEN p_accept THEN 'friend_accepted' ELSE NULL END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.send_friend_request_server(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.respond_friend_request_server(uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_friend_request_server(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.respond_friend_request_server(uuid, uuid, boolean) TO service_role;

-- The Edge Function re-checks this immediately before contacting Expo. The
-- request/accept mutation commits before the network call, so a block created
-- in that gap must prevent delivery as well.
CREATE OR REPLACE FUNCTION public.friend_notification_allowed(
  p_actor uuid,
  p_recipient uuid,
  p_friendship_id uuid,
  p_kind text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
           SELECT 1 FROM public.friendships blocked
            WHERE blocked.status = 'blocked'
              AND ((blocked.requester_id = p_actor AND blocked.addressee_id = p_recipient)
                OR (blocked.requester_id = p_recipient AND blocked.addressee_id = p_actor))
         )
     AND EXISTS (
           SELECT 1 FROM public.friendships current_relation
            WHERE current_relation.id = p_friendship_id
              AND current_relation.requester_id IN (p_actor, p_recipient)
              AND current_relation.addressee_id IN (p_actor, p_recipient)
              AND current_relation.requester_id <> current_relation.addressee_id
              AND current_relation.status = CASE
                    WHEN p_kind = 'friend_request' THEN 'pending'
                    WHEN p_kind = 'friend_accepted' THEN 'accepted'
                    ELSE '__invalid__'
                  END
         );
$$;

REVOKE ALL ON FUNCTION public.friend_notification_allowed(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.friend_notification_allowed(uuid, uuid, uuid, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.block_user(p_target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL OR p_target IS NULL OR v_caller = p_target THEN
    RAISE EXCEPTION 'invalid_block_target' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(
    least(v_caller::text, p_target::text) || greatest(v_caller::text, p_target::text), 2
  ));

  DELETE FROM public.friendships f
   WHERE (f.requester_id = v_caller AND f.addressee_id = p_target)
      OR (f.requester_id = p_target AND f.addressee_id = v_caller);

  INSERT INTO public.friendships (requester_id, addressee_id, status, created_at, responded_at)
  VALUES (v_caller, p_target, 'blocked', now(), now());
END;
$$;

REVOKE ALL ON FUNCTION public.block_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_friend_request(p_friendship_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.friendships f
   WHERE f.id = p_friendship_id
     AND f.requester_id = auth.uid()
     AND f.status = 'pending';
$$;

CREATE OR REPLACE FUNCTION public.remove_friend(p_friendship_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.friendships f
   WHERE f.id = p_friendship_id
     AND f.status = 'accepted'
     AND auth.uid() IN (f.requester_id, f.addressee_id);
$$;

CREATE OR REPLACE FUNCTION public.unblock_user(p_target uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.friendships f
   WHERE f.requester_id = auth.uid()
     AND f.addressee_id = p_target
     AND f.status = 'blocked';
$$;

REVOKE ALL ON FUNCTION public.cancel_friend_request(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_friend(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unblock_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_friend_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friend(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_user(uuid) TO authenticated;

-- All friendship mutations now pass through purpose-limited server functions.
-- In particular, a blocked user cannot DELETE the block row to unblock themself.
REVOKE INSERT, UPDATE, DELETE ON public.friendships FROM authenticated;
