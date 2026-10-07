import { NextRequest, NextResponse } from "next/server";
import { StravaActivityError, activitySummary, hasActivityAccess } from "@/lib/intervals";
import { intervalsMember, intervalsError } from "@/lib/intervals-route";
import { rateLimit } from "@/lib/rate-limit";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// One completed activity from intervals.icu as the planner's workout summary. ?id=<activity id>.
// Pello Pro.
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "intervals-activity", 10, 60_000);
  if (limited) return limited;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return NextResponse.json({ error: "Invalid activity." }, { status: 400 });
  const member = await intervalsMember();
  if (member instanceof NextResponse) return member;
  if (!hasActivityAccess(member.conn)) {
    return NextResponse.json({ error: "Reconnect intervals.icu to allow Pello to read your completed activities.", code: "needs-reconnect" }, { status: 409 });
  }
  try {
    return NextResponse.json({ workout: await activitySummary(member.conn, id) });
  } catch (e) {
    if (e instanceof StravaActivityError) {
      return NextResponse.json({ error: "This activity came to intervals.icu from Strava, and Strava doesn't allow it to be shared with other apps. Connect your device to intervals.icu directly, or upload the activity file instead.", code: "strava" }, { status: 422 });
    }
    return intervalsError(member.userId, e);
  }
}
