import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription-server";
import { rateLimit } from "@/lib/rate-limit";

// Opens the Stripe customer portal, where subscribers update their card, see invoices
// and cancel. { flow: "payment_method_update" } opens straight at adding a card; if Stripe
// won't start that flow, the portal's home page opens instead.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "portal", 10, 60_000);
  if (limited) return limited;

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Pello Pro isn't available yet." }, { status: 503 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const sub = await getSubscription(user.id);
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: "No subscription found for this account." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const base = { customer: sub.stripe_customer_id, return_url: `${new URL(req.url).origin}/account` };
  try {
    if (body?.flow === "payment_method_update") {
      try {
        const session = await stripe.billingPortal.sessions.create({ ...base, flow_data: { type: "payment_method_update" } });
        return NextResponse.json({ url: session.url });
      } catch (e) {
        console.error("Portal payment-method flow unavailable, opening the portal home:", e);
      }
    }
    const session = await stripe.billingPortal.sessions.create(base);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Portal error:", e);
    return NextResponse.json({ error: "Couldn't open subscription settings. Please try again." }, { status: 500 });
  }
}
