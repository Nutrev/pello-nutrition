import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { INTERVALS_ENABLED, STATE_COOKIE, authorizeUrl, canUseIntervals } from "@/lib/intervals";
import { safeRedirect } from "@/lib/safe-redirect";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// Starts connecting intervals.icu: /api/intervals/connect?return=/quiz?mode=workout
// Sends the member to intervals.icu to approve read access to their calendar.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const back = safeRedirect(req.nextUrl.searchParams.get("return"), "/account");
  if (!INTERVALS_ENABLED) return NextResponse.redirect(new URL(back, origin));

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) {
    const here = `/api/intervals/connect?return=${encodeURIComponent(back)}`;
    return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(here)}`, origin));
  }
  if (!(await canUseIntervals(user.id))) return NextResponse.redirect(new URL("/pricing", origin));

  // The state ties the callback to this browser and this request.
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(origin, state));
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, back }), {
    httpOnly: true, secure: origin.startsWith("https"), sameSite: "lax", maxAge: 10 * 60, path: "/api/intervals",
  });
  return res;
}
