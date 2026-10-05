-- supabase/profile-ftp.sql
-- Adds the athlete's cycling FTP to their profile, used to read power-based workout files
-- (.zwo, .erg, .mrc, .fit) in the planner. Optional; safe to re-run.
alter table public.user_profiles
  add column if not exists ftp_watts integer check (ftp_watts is null or ftp_watts between 50 and 700);
