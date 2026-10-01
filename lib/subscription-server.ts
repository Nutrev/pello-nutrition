// lib/subscription-server.ts
// Server-side subscription checks, using the service-role client so they can't be faked
// from the browser.
import "server-only";
import { supabase as admin } from "./supabase";
import { rowIsPro, type SubscriptionRow } from "./pro";

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { data } = await admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function isProUser(userId: string): Promise<boolean> {
  return rowIsPro(await getSubscription(userId));
}
