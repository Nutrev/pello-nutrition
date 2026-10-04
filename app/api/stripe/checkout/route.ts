import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe, PRO_PRICE_ID } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription-server";
import { rowIsPro, TRIAL_DAYS } from "@/lib/pro";
import { rateLimit } from "@/lib/rate-limit";

// Starts Stripe Checkout for Pello Pro. Signed-in users only. Sold through Stripe Managed
// Payments: Stripe (as Link) is the merchant of record and handles sales tax, VAT, fraud,
// disputes and billing support. The free trial (TRIAL_DAYS) is offered
// once per account and doesn't ask for a card up front; if no card has been added by the
// end of the trial, Stripe cancels the subscription instead of charging.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "checkout", 10, 60_000);
  if (limited) return limited;

  const stripe = getStripe();
  if (!stripe || !PRO_PRICE_ID) return NextResponse.json({ error: "Pello Pro isn't available yet." }, { status: 503 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const sub = await getSubscription(user.id);
  if (rowIsPro(sub)) return NextResponse.json({ error: "You already have Pello Pro." }, { status: 409 });

  const origin = new URL(req.url).origin;
  const offerTrial = !sub?.had_trial;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      managed_payments: { enabled: true },
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/account?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      ...(sub?.stripe_customer_id ? { customer: sub.stripe_customer_id } : { customer_email: user.email }),
      subscription_data: {
        metadata: { supabase_user_id: user.id },
        ...(offerTrial ? {
          trial_period_days: TRIAL_DAYS,
          trial_settings: { end_behavior: { missing_payment_method: "cancel" as const } },
        } : {}),
      },
      ...(offerTrial ? { payment_method_collection: "if_required" as const } : {}),
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}
