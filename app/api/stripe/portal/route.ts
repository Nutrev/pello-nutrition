import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription-server";
import { rateLimit } from "@/lib/rate-limit";

// Opens the Stripe customer portal, where subscribers update their card, see invoices
// and cancel.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "portal", 10, 60_000);
  if (limited) return limited;

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Pello Pro isn't available yet." }, { status: 503 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const sub = await getSubscription(user.id);
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: "No subscription found for this account." }, { status: 404 });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${new URL(req.url).origin}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Portal error:", e);
    return NextResponse.json({ error: "Couldn't open subscription settings. Please try again." }, { status: 500 });
  }
}
