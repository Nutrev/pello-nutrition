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

// Annual billing (shown when STRIPE_PRICE_PRO_ANNUAL is set). Must match the price in Stripe:
// $80 a year, which is $6.67 a month and saves $16 on twelve monthly payments of $8.
export const PRO_ANNUAL_PRICE_LABEL = "$80";
export const PRO_ANNUAL_MONTHLY_LABEL = "$6.67";
export const PRO_ANNUAL_SAVING_LABEL = "$16";

// The independence line, in full under the Pro card and short in upgrade prompts.
export const INDEPENDENCE_LINE = "Pello takes no money from brands. Pro members help keep our scores independent.";
export const INDEPENDENCE_SHORT = "No brand money. Members keep Pello independent.";

// What Pro adds over the free plan, grouped as on the pricing page. Every line must be true of
// the site as built; update it with the features.
export const PRO_PROMISE = "Fuel plans for every session, built from your actual training.";
export const PRO_FEATURE_GROUPS: { heading: string | null; collapsed?: boolean; items: string[] }[] = [
  {
    heading: null,
    items: [
      "Plans built from your workout files (.fit, .zwo, .erg, .mrc, .tcx)",
      "intervals.icu connection: plan from today's scheduled workout or a completed one in one tap. intervals.icu syncs with Garmin, Strava and other devices (activities imported from Strava can't be shared with other apps)",
    ],
  },
  {
    heading: "Train your gut and race-day fueling",
    items: [
      "Gut-training program: build from about 60g toward 90g of carbs per hour over several weeks",
      "Race-day plan: a gel, fluid and sodium timeline from a saved event plan, printable",
      "Personalized sodium plan from your session length, conditions and sweat",
    ],
  },
  {
    heading: "Plus everything you need to go deeper",
    collapsed: true,
    items: [
      "Unlimited nutrition plans",
      "Save and revisit plans",
      "Goal-based planner (first marathon, recovery, building muscle and more)",
      "Supplement stack and race week planners",
      "Compare up to 5 products",
      "All advanced filters (G:F ratio, hydrogel, transparency, rating)",
      "Submit community reviews",
      "Supplement stack tracker",
      "Plans pre-filled from your saved athlete profile",
      "Export plans and comparisons as PDF",
      "Fueling cost per session and event, with the cheapest equivalent product and its Pello Score",
    ],
  },
];
export const PRO_FEATURES = PRO_FEATURE_GROUPS.flatMap((g) => g.items);

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
  billing_interval?: "month" | "year" | null;  // supabase/pro-v2.sql
  started_at?: string | null;                   // supabase/pro-v2.sql
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
