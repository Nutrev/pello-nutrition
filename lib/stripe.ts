// lib/stripe.ts
// Server-side Stripe client. STRIPE_SECRET_KEY must never get a NEXT_PUBLIC_ prefix.
import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

// null when Stripe isn't configured, so routes can answer 503 instead of crashing.
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

export const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID?.trim() ?? "";
// Annual billing: set STRIPE_PRICE_PRO_ANNUAL (Vercel → Settings → Environment Variables) to the
// annual price's ID. Without it, only monthly billing is offered.
export const PRO_ANNUAL_PRICE_ID = process.env.STRIPE_PRICE_PRO_ANNUAL?.trim() || null;
export const ANNUAL_ENABLED = !!PRO_ANNUAL_PRICE_ID;
