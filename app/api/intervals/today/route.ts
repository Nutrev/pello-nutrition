import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { INTERVALS_ENABLED, IntervalsAuthError, canUseIntervals, getConnection, plannedWorkouts, removeConnection } from "@/lib/intervals";
import { rateLimit } from "@/lib/rate-limit";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// The member's planned workouts for one day from intervals.icu, each as a .fit file for the
// planner's workout reader. ?date=YYYY-MM-DD (the member's local date). Pello Pro.
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "intervals-today", 10, 60_000);
  if (limited) return limited;
  if (!INTERVALS_ENABLED) return NextResponse.json({ error: "Not available." }, { status: 404 });

  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Invalid date." }, { status: 400 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in.", code: "signin" }, { status: 401 });
  if (!(await canUseIntervals(user.id))) return NextResponse.json({ error: "This is a Pello Pro feature.", code: "pro" }, { status: 403 });
  const conn = await getConnection(user.id);
  if (!conn) return NextResponse.json({ error: "Connect intervals.icu first.", code: "not-connected" }, { status: 409 });

  try {
    return NextResponse.json({ workouts: await plannedWorkouts(conn, date) });
  } catch (e) {
    if (e instanceof IntervalsAuthError) {
      // Access was revoked on intervals.icu: forget the token so they can connect again.
      await removeConnection(user.id);
      return NextResponse.json({ error: "Your intervals.icu connection has expired. Connect it again.", code: "not-connected" }, { status: 409 });
    }
    console.error("intervals.icu fetch error:", e);
    return NextResponse.json({ error: "Couldn't reach intervals.icu. Try again in a moment." }, { status: 502 });
  }
}
