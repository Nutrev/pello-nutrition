// lib/account-server.ts
// Server-side reads for the account pages, as the signed-in user (row-level security
// applies), joined to the product catalogue.
import "server-only";
import { redirect } from "next/navigation";
import { getServerSupabase } from "./supabase/server";
import { getProductSummaries } from "./catalog";
import type { ProductSummary } from "./catalog-types";
import { PRO_ENABLED, rowIsPro, type SubscriptionRow } from "./pro";

type ServerSupabase = ReturnType<typeof getServerSupabase>;

// Pello Pro status for the account pages. While Pro is off, everything is allowed.
export async function accountAccess(supabase: ServerSupabase, userId: string) {
  if (!PRO_ENABLED) return { gating: false, isPro: false, allowed: true, subscription: null as SubscriptionRow | null };
  const { data } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  const subscription = (data as SubscriptionRow | null) ?? null;
  const isPro = rowIsPro(subscription);
  return { gating: true, isPro, allowed: isPro, subscription };
}

// The signed-in user, or a redirect to sign in (the middleware normally does this first).
export async function requireAccountUser(path: string) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=${encodeURIComponent(path)}`);
  return { supabase, user };
}

let byId: Map<string, ProductSummary> | null = null;
export function productById(id: string): ProductSummary | undefined {
  byId ??= new Map(getProductSummaries().map((p) => [p.id, p]));
  return byId.get(id);
}
