import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabase as admin } from "@/lib/supabase";
import { PRO_STRIPE_STATUSES } from "@/lib/pro";

// Stripe → Supabase: keeps the subscriptions table in step with Stripe. Every event is
// verified with STRIPE_WEBHOOK_SECRET. Subscription events carry the Supabase user id in
// their metadata (set at checkout); older ones fall back to the stored customer id.
//
// In Stripe → Developers → Webhooks, point an endpoint at /api/stripe/webhook with:
// checkout.session.completed, customer.subscription.created, customer.subscription.updated,
// customer.subscription.deleted.

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription" || !session.subscription) break;
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncSubscription(stripe, subId, session.metadata?.supabase_user_id ?? session.client_reference_id ?? undefined);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(stripe, event.data.object.id);
        break;
    }
  } catch (e) {
    console.error(`Webhook ${event.type} failed:`, e);
    // A 500 makes Stripe retry the event later.
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

// Events can arrive out of order, so this always reads the subscription's current state
// from Stripe rather than the copy in the event.
async function syncSubscription(stripe: Stripe, subscriptionId: string, userIdHint?: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = sub.metadata?.supabase_user_id || userIdHint;
  if (!userId) {
    const { data } = await admin.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.user_id;
  }
  if (!userId) {
    console.warn(`Stripe subscription ${sub.id} has no matching Pello user; skipped.`);
    return;
  }

  // The current billing period is set per subscription item.
  const periodEnd = Math.max(0, ...sub.items.data.map((i) => i.current_period_end ?? 0));
  const isPro = PRO_STRIPE_STATUSES.includes(sub.status);
  const toIso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

  // An old subscription ending must not overwrite a newer one that's still running.
  const { data: existing } = await admin.from("subscriptions")
    .select("stripe_subscription_id, status").eq("user_id", userId).maybeSingle();
  if (!isPro && existing?.status === "pro" && existing.stripe_subscription_id && existing.stripe_subscription_id !== sub.id) return;

  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    status: isPro ? "pro" : "free",
    stripe_status: sub.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    current_period_end: toIso(periodEnd),
    cancel_at_period_end: sub.cancel_at_period_end || sub.cancel_at != null,
    trial_end: toIso(sub.trial_end),
    // Once a trial has started, the account doesn't get another.
    ...(sub.trial_start ? { had_trial: true } : {}),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw error;
}
