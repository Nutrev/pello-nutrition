// lib/pro.ts
// Pello Pro: the switch, limits and the rule for who counts as Pro. Shared by client and
// server code.
//
// Pro is off until NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is set (.env.local and Vercel → Settings →
// Environment Variables, then redeploy). While it's off nothing is gated: the site works
// exactly as before, /pricing doesn't exist, and no one is asked to upgrade. That way no
// feature is ever locked before people can actually pay for it.

export const PRO_ENABLED = !!process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID?.trim();

// Shown on the pricing page. Must match the price set up in Stripe.
export const PRO_PRICE_LABEL = "$8";
export const TRIAL_DAYS = 8; // over 7 so Managed Payments sends a trial-ending reminder

// What Pro adds over the free plan, shown on the pricing page and to free users on their
// account page. Every line must be true of the site as built; update it with the features.
export const PRO_FEATURES = [
  "Unlimited nutrition plans",
  "Plans built from your workout files (.fit, .zwo, .erg, .mrc, .tcx)",
  "intervals.icu connection: plan from the workout on today's calendar in one tap",
  "Save and revisit plans",
  "Goal-based planner (first marathon, recovery, building muscle and more)",
  "Compare up to 5 products",
  "All advanced filters (G:F ratio, hydrogel, transparency, rating)",
  "Submit community reviews",
  "Supplement stack tracker",
  "Plans pre-filled from your saved athlete profile",
  "Export plans and comparisons as PDF",
];

export const FREE_PLANS_PER_MONTH = 1;
export const FREE_COMPARE_LIMIT = 2;
export const PRO_COMPARE_LIMIT = 5;
export const UNGATED_COMPARE_LIMIT = 3; // while Pro is off, as before

// A row in the subscriptions table (supabase/pro.sql). Written only by the Stripe webhook.
export interface SubscriptionRow {
  user_id: string;
  status: "free" | "pro";
  stripe_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  had_trial: boolean;
}

// Stripe statuses that keep Pro access. past_due covers Stripe's retries of a failed
// payment; if they all fail Stripe cancels the subscription and access ends.
export const PRO_STRIPE_STATUSES = ["active", "trialing", "past_due"];

// Three days' grace after the period end, in case a renewal webhook arrives late.
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function rowIsPro(row: Pick<SubscriptionRow, "status" | "current_period_end"> | null | undefined): boolean {
  if (!row || row.status !== "pro") return false;
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() + GRACE_MS > Date.now();
}

// Start of the current calendar month (UTC), when free plan allowances reset.
export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function nextMonthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}
