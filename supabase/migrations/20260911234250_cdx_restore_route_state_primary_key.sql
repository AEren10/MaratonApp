-- Keep route_state compatible with tools that expect a primary key.
--
-- The route state write scope is still enforced by the unique
-- (user_id, exam_type) index created in the previous migration. This surrogate
-- id only prevents the table from remaining primary-keyless after moving away
-- from user_id as the sole key.

ALTER TABLE public.route_state
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

UPDATE public.route_state
   SET id = gen_random_uuid()
 WHERE id IS NULL;

ALTER TABLE public.route_state
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.route_state
  ADD CONSTRAINT route_state_pkey PRIMARY KEY (id);
