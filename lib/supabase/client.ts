// lib/supabase/client.ts
// Supabase client for the browser, for signed-in user features (accounts, plans,
// favorites, stack). Uses the public anon key; the session lives in cookies so the
// middleware and server pages can read it. Row-level security limits every account
// table to the signed-in user's own rows (see supabase/accounts.sql).
import { createBrowserClient } from "@supabase/ssr";

export function getBrowserSupabase() {
  // createBrowserClient returns one shared client per page.
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
