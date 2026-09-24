-- Lock down row-level security for Pello's tables.
-- Run in Supabase → SQL Editor AFTER the site is deployed with SUPABASE_SERVICE_ROLE_KEY,
-- otherwise saving reviews and price alerts will fail until it is.
--
-- Result:
--   reviews       public (anon) key can read; only the server can write
--   price_alerts  public key has no access at all; only the server can read/write
-- The server uses the service-role key, which bypasses RLS, so the API routes keep working.

begin;

alter table public.reviews enable row level security;
alter table public.price_alerts enable row level security;

-- Remove every existing policy on these tables, including any permissive
-- "allow insert for anon" ones created earlier.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('reviews', 'price_alerts')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Anyone can read reviews (they're shown on product pages).
create policy "Public can read reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- Belt and braces: remove table privileges RLS would otherwise be guarding.
revoke insert, update, delete on public.reviews from anon, authenticated;
revoke all on public.price_alerts from anon, authenticated;

commit;

-- Check the result: expect exactly one row, the SELECT policy on reviews.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('reviews', 'price_alerts');
