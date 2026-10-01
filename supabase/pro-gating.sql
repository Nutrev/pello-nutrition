-- supabase/pro-gating.sql
-- Run at Pro launch, after pro.sql, when NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is set in Vercel.
-- Safe to re-run.
--
-- Free users keep full access to what they already saved: they can still read and delete
-- saved plans and stack items. Saving new plans, and adding or editing stack items, need
-- Pro. Favourites stay free. This enforces in the database what the site's UI shows, so it
-- can't be bypassed by calling Supabase directly.

-- saved_plans: read and delete own; create needs Pro
drop policy if exists "own plans" on public.saved_plans;
drop policy if exists "read own plans" on public.saved_plans;
drop policy if exists "delete own plans" on public.saved_plans;
drop policy if exists "pro can save plans" on public.saved_plans;
drop policy if exists "pro can edit plans" on public.saved_plans;
create policy "read own plans" on public.saved_plans for select to authenticated using (user_id = auth.uid());
create policy "delete own plans" on public.saved_plans for delete to authenticated using (user_id = auth.uid());
create policy "pro can save plans" on public.saved_plans for insert to authenticated
  with check (user_id = auth.uid() and public.pello_is_pro(auth.uid()));
create policy "pro can edit plans" on public.saved_plans for update to authenticated
  using (user_id = auth.uid() and public.pello_is_pro(auth.uid()))
  with check (user_id = auth.uid() and public.pello_is_pro(auth.uid()));

-- supplement_stack: read and delete own; add and edit need Pro
drop policy if exists "own stack" on public.supplement_stack;
drop policy if exists "read own stack" on public.supplement_stack;
drop policy if exists "delete own stack" on public.supplement_stack;
drop policy if exists "pro can add to stack" on public.supplement_stack;
drop policy if exists "pro can edit stack" on public.supplement_stack;
create policy "read own stack" on public.supplement_stack for select to authenticated using (user_id = auth.uid());
create policy "delete own stack" on public.supplement_stack for delete to authenticated using (user_id = auth.uid());
create policy "pro can add to stack" on public.supplement_stack for insert to authenticated
  with check (user_id = auth.uid() and public.pello_is_pro(auth.uid()));
create policy "pro can edit stack" on public.supplement_stack for update to authenticated
  using (user_id = auth.uid() and public.pello_is_pro(auth.uid()))
  with check (user_id = auth.uid() and public.pello_is_pro(auth.uid()));
