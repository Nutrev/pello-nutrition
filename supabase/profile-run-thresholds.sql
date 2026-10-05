-- supabase/profile-run-thresholds.sql
-- Adds running thresholds to the athlete profile, used to read run workout files (.fit, .tcx)
-- in the planner. Both optional; safe to re-run.
alter table public.user_profiles
  add column if not exists threshold_pace_sec_per_km integer check (threshold_pace_sec_per_km is null or threshold_pace_sec_per_km between 120 and 900),
  add column if not exists threshold_hr integer check (threshold_hr is null or threshold_hr between 80 and 230);
