-- Add missing weekly goal columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_trials_goal INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS weekly_minutes_goal INTEGER DEFAULT 1200;
