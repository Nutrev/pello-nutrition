// lib/subscription-server.ts
// Server-side subscription checks, using the service-role client so they can't be faked
// from the browser.
import "server-only";
import { supabase as admin } from "./supabase";
import { rowIsPro, type SubscriptionRow } from "./pro";
import { getStripe } from "./stripe";

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { data } = await admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function isProUser(userId: string): Promise<boolean> {
  return rowIsPro(await getSubscription(userId));
}

// Whether a subscription in its free trial has a payment method to continue with once the
// trial ends (without one, Stripe cancels it and the account goes back to the free plan).
// Asked of Stripe each time so a card added a moment ago counts. null if Stripe can't say.
export async function trialHasPaymentMethod(row: SubscriptionRow): Promise<boolean | null> {
  const stripe = getStripe();
  if (!stripe || !row.stripe_subscription_id || !row.stripe_customer_id) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    if (sub.default_payment_method) return true;
    const customer = await stripe.customers.retrieve(row.stripe_customer_id);
    if (!customer.deleted && customer.invoice_settings?.default_payment_method) return true;
    const methods = await stripe.customers.listPaymentMethods(row.stripe_customer_id, { limit: 1 });
    return methods.data.length > 0;
  } catch (e) {
    console.error("Payment method check failed:", e);
    return null;
  }
}
