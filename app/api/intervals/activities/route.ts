import { NextRequest, NextResponse } from "next/server";
import { hasActivityAccess, recentActivities } from "@/lib/intervals";
import { intervalsMember, intervalsError, isDate } from "@/lib/intervals-route";
import { rateLimit } from "@/lib/rate-limit";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// The member's recent completed activities from intervals.icu, for choosing one to plan
// from. ?oldest=YYYY-MM-DD&newest=YYYY-MM-DD (local dates). Pello Pro.
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "intervals-activities", 10, 60_000);
  if (limited) return limited;
  const oldest = req.nextUrl.searchParams.get("oldest");
  const newest = req.nextUrl.searchParams.get("newest");
  if (!isDate(oldest) || !isDate(newest)) return NextResponse.json({ error: "Invalid dates." }, { status: 400 });
  const member = await intervalsMember();
  if (member instanceof NextResponse) return member;
  if (!hasActivityAccess(member.conn)) {
    return NextResponse.json({ error: "Reconnect intervals.icu to allow Pello to read your completed activities.", code: "needs-reconnect" }, { status: 409 });
  }
  try {
    return NextResponse.json({ activities: await recentActivities(member.conn, oldest, newest) });
  } catch (e) {
    return intervalsError(member.userId, e);
  }
}
