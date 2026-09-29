-- supabase/accounts.sql
-- User accounts: profiles, saved plans, favourite products and supplement stacks.
-- Run once in Supabase → SQL Editor. Safe to re-run: it only creates what's missing
-- and replaces the policies.
--
-- Security model: the browser talks to these tables with the public anon key plus the
-- signed-in user's session. Row-level security limits every row to its owner
-- (auth.uid()), so one user can never read or change another user's data. Deleting a
-- user in Supabase Auth deletes all of their rows (on delete cascade).

-- ── user_profiles ──────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  username text check (username is null or char_length(username) between 1 and 40),
  weight_kg double precision check (weight_kg is null or weight_kg between 20 and 300),
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  age integer check (age is null or age between 16 and 100),
  sex text check (sex is null or sex in ('male', 'female')),
  training_days_per_week integer check (training_days_per_week is null or training_days_per_week between 1 and 7),
  caffeine_preference text check (caffeine_preference is null or caffeine_preference in ('none', 'moderate', 'high')),
  dietary text[] not null default '{}' check (dietary <@ array['vegan', 'gluten-free', 'dairy-free']::text[]),
  goals text[] not null default '{}' check (cardinality(goals) <= 10)
);

-- ── saved_plans ────────────────────────────────────────────────────────────────
create table if not exists public.saved_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  plan_name text not null check (char_length(plan_name) between 1 and 100),
  plan_mode text not null check (plan_mode in ('event', 'outcome')),
  inputs jsonb not null,
  plan_content jsonb not null check (pg_column_size(plan_content) < 200000),
  notes text check (notes is null or char_length(notes) <= 2000)
);
create index if not exists saved_plans_user_created on public.saved_plans (user_id, created_at desc);

-- ── favourite_products ─────────────────────────────────────────────────────────
create table if not exists public.favourite_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null check (char_length(product_id) between 1 and 200),
  created_at timestamptz not null default now(),
  notes text check (notes is null or char_length(notes) <= 2000),
  unique (user_id, product_id)
);

-- ── supplement_stack ───────────────────────────────────────────────────────────
create table if not exists public.supplement_stack (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null check (char_length(product_id) between 1 and 200),
  created_at timestamptz not null default now(),
  daily_dose text check (daily_dose is null or char_length(daily_dose) <= 200),
  timing text check (timing is null or char_length(timing) <= 200),
  notes text check (notes is null or char_length(notes) <= 2000),
  is_active boolean not null default true
);
create index if not exists supplement_stack_user on public.supplement_stack (user_id, created_at desc);

-- ── Keep updated_at current on profile edits ──────────────────────────────────
create or replace function public.pello_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_profiles_touch on public.user_profiles;
create trigger user_profiles_touch before update on public.user_profiles
  for each row execute function public.pello_touch_updated_at();

-- ── Row-level security: every row belongs to its user ─────────────────────────
alter table public.user_profiles      enable row level security;
alter table public.saved_plans        enable row level security;
alter table public.favourite_products enable row level security;
alter table public.supplement_stack   enable row level security;

drop policy if exists "own profile" on public.user_profiles;
create policy "own profile" on public.user_profiles
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own plans" on public.saved_plans;
create policy "own plans" on public.saved_plans
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own favourites" on public.favourite_products;
create policy "own favourites" on public.favourite_products
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own stack" on public.supplement_stack;
create policy "own stack" on public.supplement_stack
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Signed-out visitors (anon) get no access to any of these tables.
revoke all on public.user_profiles, public.saved_plans, public.favourite_products, public.supplement_stack from anon;
grant select, insert, update, delete on public.user_profiles, public.saved_plans, public.favourite_products, public.supplement_stack to authenticated;
