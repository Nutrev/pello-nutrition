import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { removeConnection } from "@/lib/intervals";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// Disconnects intervals.icu: revokes Pello's access there and deletes the stored token.
export async function POST() {
  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  await removeConnection(user.id);
  return NextResponse.json({ ok: true });
}
