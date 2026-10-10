// lib/billing.ts
// Pello Pro billing rules as pure functions: which Stripe price a checkout uses, the Checkout
// Session parameters, and how a Stripe subscription maps to a row in the subscriptions table.
// Kept free of server-only imports so lib/billing.test.ts can test them directly; the API routes
// (app/api/stripe/*) pass in the price IDs and the Stripe objects.
import type Stripe from "stripe";
import { PRO_STRIPE_STATUSES, TRIAL_DAYS } from "./pro";

export type BillingInterval = "month" | "year";
export const isBillingInterval = (v: unknown): v is BillingInterval => v === "month" || v === "year";

export interface PriceIds { month: string; year: string | null }

// The Stripe price for an interval; null when annual billing isn't set up (no price ID).
export function priceFor(interval: BillingInterval, prices: PriceIds): string | null {
  return interval === "year" ? prices.year : prices.month || null;
}

// Shown on Stripe's checkout page above the pay button.
export const CHECKOUT_NOTE = "No brand money. Members keep Pello independent.";

export interface CheckoutInput {
  price: string;
  userId: string;
  email: string | null | undefined;
  customerId: string | null | undefined;
  hadTrial: boolean;
  origin: string;
}

// Checkout Session parameters for Pello Pro, the same for monthly and annual prices. Sold through
// Stripe Managed Payments. The free trial (TRIAL_DAYS) is offered once per account and doesn't ask
// for a card up front; if no card has been added by the end of the trial, Stripe cancels the
// subscription instead of charging.
export function checkoutParams(c: CheckoutInput): Stripe.Checkout.SessionCreateParams {
  const offerTrial = !c.hadTrial;
  return {
    mode: "subscription",
    managed_payments: { enabled: true },
    line_items: [{ price: c.price, quantity: 1 }],
    success_url: `${c.origin}/account?upgraded=true`,
    cancel_url: `${c.origin}/pricing`,
    client_reference_id: c.userId,
    metadata: { supabase_user_id: c.userId },
    ...(c.customerId ? { customer: c.customerId } : c.email ? { customer_email: c.email } : {}),
    subscription_data: {
      metadata: { supabase_user_id: c.userId },
      ...(offerTrial ? {
        trial_period_days: TRIAL_DAYS,
        trial_settings: { end_behavior: { missing_payment_method: "cancel" as const } },
      } : {}),
    },
    ...(offerTrial ? { payment_method_collection: "if_required" as const } : {}),
    allow_promotion_codes: true,
  } as Stripe.Checkout.SessionCreateParams;
}

const toIso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

// The subscriptions-table fields for a Stripe subscription. Monthly and annual subscriptions map
// the same way: Pro while Stripe's status is active, trialing or past_due, until the period end
// (renewals move current_period_end on; cancellation ends it). billing_interval and started_at
// need supabase/pro-v2.sql.
export function subscriptionRow(sub: Stripe.Subscription, userId: string) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  // The current billing period is set per subscription item.
  const periodEnd = Math.max(0, ...sub.items.data.map((i) => i.current_period_end ?? 0));
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  const isPro = PRO_STRIPE_STATUSES.includes(sub.status);
  return {
    base: {
      user_id: userId,
      status: (isPro ? "pro" : "free") as "pro" | "free",
      stripe_status: sub.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      current_period_end: toIso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end || sub.cancel_at != null,
      trial_end: toIso(sub.trial_end),
      // Once a trial has started, the account doesn't get another.
      ...(sub.trial_start ? { had_trial: true } : {}),
    },
    extra: {
      billing_interval: interval === "year" || interval === "month" ? interval : null,
      started_at: toIso(sub.start_date),
    },
  };
}
