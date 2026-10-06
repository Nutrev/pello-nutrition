import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { INTERVALS_ENABLED, canUseIntervals, getConnection, hasActivityAccess } from "@/lib/intervals";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// Whether the intervals.icu connection is available to this member, and if they're connected.
// Never returns the access token.
export async function GET() {
  if (!INTERVALS_ENABLED) return NextResponse.json({ enabled: false });
  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ enabled: true, signedIn: false, allowed: false, connected: false });
  const [allowed, conn] = await Promise.all([canUseIntervals(user.id), getConnection(user.id)]);
  return NextResponse.json({ enabled: true, signedIn: true, allowed, connected: !!conn, activities: !!conn && hasActivityAccess(conn), athleteName: conn?.athlete_name ?? null });
}
