-- supabase/check-rls.sql
-- Read-only check of row-level security. Changes nothing; safe to run any time in
-- Supabase → SQL Editor.
--
-- 1. Every table in the public schema, whether RLS is on, and how many policies it has.
--    Every row should show rls_enabled = true. A table with RLS on and 0 policies is
--    server-only (only the service-role key can use it), which is intended for
--    price_alerts, intervals_connections and similar.
select
  c.relname                                   as table_name,
  c.relrowsecurity                            as rls_enabled,
  count(p.policyname)                         as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname
where n.nspname = 'public' and c.relkind in ('r', 'p')
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;

-- 2. Every policy: which table, which action, who it applies to, and its rule.
--    Policies are combined with OR, so any permissive policy with "true" as its rule
--    opens that action to everyone it applies to. Expected ones: reading reviews.
select
  tablename,
  policyname,
  cmd                      as action,
  roles,
  qual                     as using_rule,
  with_check               as check_rule
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;
