import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe, PRO_PRICE_ID, PRO_ANNUAL_PRICE_ID } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription-server";
import { rowIsPro } from "@/lib/pro";
import { CHECKOUT_NOTE, checkoutParams, isBillingInterval, priceFor } from "@/lib/billing";
import { rateLimit } from "@/lib/rate-limit";

// Starts Stripe Checkout for Pello Pro, monthly or annual ({ interval: "month" | "year" },
// default monthly). Signed-in users only. Sold through Stripe Managed Payments: Stripe (as Link)
// is the merchant of record and handles sales tax, VAT, fraud, disputes and billing support.
// The session parameters, including the free trial, are in lib/billing.ts.
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "checkout", 10, 60_000);
  if (limited) return limited;

  const stripe = getStripe();
  if (!stripe || !PRO_PRICE_ID) return NextResponse.json({ error: "Pello Pro isn't available yet." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const interval = isBillingInterval(body?.interval) ? body.interval : "month";
  const price = priceFor(interval, { month: PRO_PRICE_ID, year: PRO_ANNUAL_PRICE_ID });
  if (!price) return NextResponse.json({ error: "Annual billing isn't available yet." }, { status: 400 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const sub = await getSubscription(user.id);
  if (rowIsPro(sub)) return NextResponse.json({ error: "You already have Pello Pro." }, { status: 409 });

  const params = checkoutParams({
    price, userId: user.id, email: user.email, customerId: sub?.stripe_customer_id, hadTrial: !!sub?.had_trial,
    origin: new URL(req.url).origin,
  });
  try {
    let session;
    try {
      // The independence note above the pay button; if Stripe won't take custom text for this
      // checkout, it opens without it.
      session = await stripe.checkout.sessions.create({ ...params, custom_text: { submit: { message: CHECKOUT_NOTE } } });
    } catch (e) {
      if (!/custom_text/i.test((e as Error).message ?? "")) throw e;
      session = await stripe.checkout.sessions.create(params);
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}
