-- Scope route pause/resume state by exam type.
--
-- route_state used to be keyed only by user_id. That prevented a frozen YKS
-- route from locking an LGS route in the UI, but every pause/resume write still
-- overwrote the single row. Keep legacy NULL rows readable while allowing one
-- independent state row per user + exam_type.

ALTER TABLE public.route_state
  DROP CONSTRAINT IF EXISTS route_state_pkey;

CREATE UNIQUE INDEX IF NOT EXISTS idx_route_state_user_exam
  ON public.route_state (user_id, exam_type) NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS idx_route_state_user_updated
  ON public.route_state (user_id, updated_at DESC);
