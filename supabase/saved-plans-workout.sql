-- supabase/saved-plans-workout.sql
-- Lets saved plans hold "Today's workout" plans (plan_mode 'workout') as well as the other
-- planner types. Run once in the Supabase SQL editor; safe to re-run.
alter table public.saved_plans drop constraint if exists saved_plans_plan_mode_check;
alter table public.saved_plans add constraint saved_plans_plan_mode_check
  check (plan_mode in ('workout', 'event', 'outcome', 'supplement-stack', 'race-week', 'budget-optimiser'));
