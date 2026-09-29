// lib/supabase/load.ts
// Loads the Supabase browser client only when it's needed, so signed-out visitors
// (most of them) never download it.
import type { SupabaseClient } from "@supabase/supabase-js";

export function loadBrowserSupabase(): Promise<SupabaseClient> {
  return import("./client").then((m) => m.getBrowserSupabase());
}

// Supabase keeps the session in "sb-<project>-auth-token" cookies (split into .0, .1… when long).
export function hasAuthCookie(): boolean {
  return typeof document !== "undefined" && /(^|;\s*)sb-[^=]+-auth-token(\.\d+)?=/.test(document.cookie);
}

// Fired after sign-in, sign-up or sign-out so AuthProvider re-checks the session.
export const AUTH_EVENT = "pello:auth";
export function announceAuthChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}
