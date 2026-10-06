import { NextRequest, NextResponse } from "next/server";
import { plannedWorkouts } from "@/lib/intervals";
import { intervalsMember, intervalsError, isDate } from "@/lib/intervals-route";
import { rateLimit } from "@/lib/rate-limit";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// The member's planned workouts for one day from intervals.icu, each as a .fit file for the
// planner's workout reader. ?date=YYYY-MM-DD (the member's local date). Pello Pro.
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "intervals-today", 10, 60_000);
  if (limited) return limited;
  const date = req.nextUrl.searchParams.get("date");
  if (!isDate(date)) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  const member = await intervalsMember();
  if (member instanceof NextResponse) return member;
  try {
    return NextResponse.json({ workouts: await plannedWorkouts(member.conn, date) });
  } catch (e) {
    return intervalsError(member.userId, e);
  }
}
