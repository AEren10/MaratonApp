-- Store notification preferences in profiles for cross-device sync
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT NULL;
