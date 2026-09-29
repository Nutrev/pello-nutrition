// lib/account-server.ts
// Server-side reads for the account pages, as the signed-in user (row-level security
// applies), joined to the product catalogue.
import "server-only";
import { redirect } from "next/navigation";
import { getServerSupabase } from "./supabase/server";
import { getProductSummaries } from "./catalog";
import type { ProductSummary } from "./catalog-types";

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
