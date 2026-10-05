-- supabase/saved-plans-modes.sql
-- Lets saved plans hold the newer planner types (supplement stack, race week, budget optimiser)
-- as well as event and outcome plans. Safe to re-run.
alter table public.saved_plans drop constraint if exists saved_plans_plan_mode_check;
alter table public.saved_plans add constraint saved_plans_plan_mode_check
  check (plan_mode in ('event', 'outcome', 'supplement-stack', 'race-week', 'budget-optimiser'));
