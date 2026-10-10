-- supabase/pro-v2.sql
-- Annual billing, the "Supporting independent research since…" line and the personalized
-- sodium plan. Run once in Supabase → SQL Editor; safe to re-run. Run it before deploying the
-- code that uses these columns (the webhook also works without them, saving everything else).

-- Subscriptions: monthly or annual, and when the subscription began (Stripe's start_date).
-- Filled in by the Stripe webhook; existing members fill in on their next subscription event.
alter table public.subscriptions add column if not exists billing_interval text
  check (billing_interval in ('month', 'year'));
alter table public.subscriptions add column if not exists started_at timestamptz;

-- Athlete profile: self-reported salty sweater (white residue on skin or kit), used by the
-- sodium plan. Members edit their own profile under the existing row-level security policy.
alter table public.user_profiles add column if not exists salty_sweater boolean;
