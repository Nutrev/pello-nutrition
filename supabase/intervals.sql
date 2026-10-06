-- supabase/intervals.sql
-- intervals.icu connections: one row per member who has connected their intervals.icu
-- account (lib/intervals.ts). Run once in Supabase → SQL Editor; safe to re-run.
--
-- Security model: the row holds the member's intervals.icu access token, so only the server
-- (service-role key) can read or write it. Members never read it from the browser; the API
-- tells them whether they're connected and to whom.

create table if not exists public.intervals_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  athlete_id text not null,
  athlete_name text,
  access_token text not null,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.intervals_connections enable row level security;
-- No policies: with row-level security on and no policies, only the service role can access it.
revoke all on public.intervals_connections from anon, authenticated;
