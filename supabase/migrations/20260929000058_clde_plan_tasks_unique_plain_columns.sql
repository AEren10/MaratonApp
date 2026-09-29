-- PostgREST onConflict "plan_id,subject,topic" ifadeli index'le (COALESCE) eslesmiyordu:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification".
-- Ayni anlam (NULL konu tek sayilir) duz sutunlu NULLS NOT DISTINCT index'le.
create unique index if not exists plan_tasks_unique_plan_subject_topic
  on public.plan_tasks (plan_id, subject, topic) nulls not distinct;
drop index if exists public.plan_tasks_unique_per_plan;
