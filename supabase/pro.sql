-- supabase/pro.sql
-- Pello Pro: subscription status and free-plan usage. Run once in Supabase → SQL Editor
-- (safe to re-run). It only adds tables and a column; nothing is gated until you also run
-- pro-gating.sql at launch.
--
-- Security model: subscription rows are written only by the Stripe webhook (service-role
-- key). Signed-in users can read their own row but can't change it, so nobody can make
-- themselves Pro from the browser. That's why these fields live here and not in
-- user_profiles, which users can edit.

-- ── subscriptions ──────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'free' check (status in ('free', 'pro')),
  stripe_status text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  had_trial boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

-- ── planner_uses: one row per plan generated, for the free monthly allowance ──
create table if not exists public.planner_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists planner_uses_user_created on public.planner_uses (user_id, created_at desc);

alter table public.planner_uses enable row level security;
drop policy if exists "read own planner uses" on public.planner_uses;
create policy "read own planner uses" on public.planner_uses
  for select to authenticated using (user_id = auth.uid());
revoke all on public.planner_uses from anon, authenticated;
grant select on public.planner_uses to authenticated;

-- ── Is this user Pro? Used by the policies in pro-gating.sql ──────────────────
-- Matches rowIsPro in lib/pro.ts, including three days' grace after the period end.
create or replace function public.pello_is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid and s.status = 'pro'
      and (s.current_period_end is null or s.current_period_end > now() - interval '3 days')
  );
$$;
revoke all on function public.pello_is_pro(uuid) from public, anon;
grant execute on function public.pello_is_pro(uuid) to authenticated;

-- ── reviews: remember which account wrote each new review ─────────────────────
-- Reviews are only submitted through the API (service-role key). The API never returns
-- this column publicly.
alter table public.reviews add column if not exists user_id uuid references auth.users (id) on delete set null;

-- The site reads reviews only through its API, never directly with the public key, so
-- direct reads are closed too. That keeps user_id from ever being visible publicly.
revoke select on public.reviews from anon, authenticated;
