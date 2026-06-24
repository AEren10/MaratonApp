-- Enable pg_cron if not already enabled (requires Supabase Pro plan)
-- create extension if not exists pg_cron;

-- Add last_active column if it does not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

-- Create index for efficient inactive user queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_active
  ON profiles (last_active)
  WHERE expo_push_token IS NOT NULL;

-- Cron: inactive 3 days re-engagement (runs daily at 18:00 UTC = 21:00 Turkey)
-- Invokes the send-push Edge Function via pg_net
-- Uncomment after enabling pg_cron on Supabase dashboard:

-- SELECT cron.schedule(
--   'push-inactive-3d',
--   '0 18 * * *',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{"type":"inactive_3d"}'::jsonb
--   );
--   $$
-- );

-- Cron: streak risk (runs daily at 19:00 UTC = 22:00 Turkey)
-- SELECT cron.schedule(
--   'push-streak-risk',
--   '0 19 * * *',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{"type":"streak_risk"}'::jsonb
--   );
--   $$
-- );

-- Cron: weekly summary (runs every Monday at 10:00 UTC = 13:00 Turkey)
-- SELECT cron.schedule(
--   'push-weekly-summary',
--   '0 10 * * 1',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{"type":"weekly_summary"}'::jsonb
--   );
--   $$
-- );
