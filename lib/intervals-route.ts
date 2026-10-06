// lib/intervals-route.ts
// Shared checks for the intervals.icu API routes that read a member's data: the connection is
// switched on, they're signed in, they have Pro (while Pro is on) and they're connected.
import "server-only";
import { NextResponse } from "next/server";
import { getServerSupabase } from "./supabase/server";
import { INTERVALS_ENABLED, IntervalsAuthError, canUseIntervals, getConnection, removeConnection, type IntervalsConnection } from "./intervals";

export async function intervalsMember(): Promise<{ userId: string; conn: IntervalsConnection } | NextResponse> {
  if (!INTERVALS_ENABLED) return NextResponse.json({ error: "Not available." }, { status: 404 });
  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in.", code: "signin" }, { status: 401 });
  if (!(await canUseIntervals(user.id))) return NextResponse.json({ error: "This is a Pello Pro feature.", code: "pro" }, { status: 403 });
  const conn = await getConnection(user.id);
  if (!conn) return NextResponse.json({ error: "Connect intervals.icu first.", code: "not-connected" }, { status: 409 });
  return { userId: user.id, conn };
}

// Turns an error from intervals.icu into a response. A revoked token is forgotten, so the
// member can connect again.
export async function intervalsError(userId: string, e: unknown): Promise<NextResponse> {
  if (e instanceof IntervalsAuthError) {
    await removeConnection(userId);
    return NextResponse.json({ error: "Your intervals.icu connection has expired. Connect it again.", code: "not-connected" }, { status: 409 });
  }
  console.error("intervals.icu fetch error:", e);
  return NextResponse.json({ error: "Couldn't reach intervals.icu. Try again in a moment." }, { status: 502 });
}

export const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
