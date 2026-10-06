// lib/intervals.ts
// intervals.icu connection (Pello Pro): members connect their intervals.icu account so the
// "Today's workout" planner can fetch the workout planned on their calendar for today.
//
// Switched off until INTERVALS_CLIENT_ID and INTERVALS_CLIENT_SECRET are set (Vercel →
// Settings → Environment Variables, and .env.local). The app is registered at
// https://intervals.icu/oauth/apply with the redirect URL /api/intervals/callback.
// API terms: https://forum.intervals.icu/t/intervals-icu-api-terms-and-conditions/114087
// (Garmin-sourced data must be attributed if shown; planned workouts aren't Garmin data.)
//
// Access tokens are stored in intervals_connections (supabase/intervals.sql), readable only
// by the server. Pello reads one day's planned workouts when the member asks; nothing from
// their calendar is stored.
import "server-only";
import { supabase as admin } from "./supabase";
import { PRO_ENABLED } from "./pro";
import { isProUser } from "./subscription-server";

const CLIENT_ID = process.env.INTERVALS_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.INTERVALS_CLIENT_SECRET?.trim();
export const INTERVALS_ENABLED = !!(CLIENT_ID && CLIENT_SECRET);

const SITE = "https://intervals.icu";
// Read-only access to the calendar (planned workouts). Nothing else is requested.
export const INTERVALS_SCOPE = "CALENDAR:READ";
export const STATE_COOKIE = "intervals_oauth";

export interface IntervalsConnection {
  user_id: string;
  athlete_id: string;
  athlete_name: string | null;
  access_token: string;
  scope: string | null;
}

// Like other Pro features, it's open to everyone while Pro is switched off.
export async function canUseIntervals(userId: string): Promise<boolean> {
  return !PRO_ENABLED || isProUser(userId);
}

export const redirectUri = (origin: string) => `${origin}/api/intervals/callback`;

export function authorizeUrl(origin: string, state: string): string {
  const q = new URLSearchParams({ client_id: CLIENT_ID!, redirect_uri: redirectUri(origin), scope: INTERVALS_SCOPE, state });
  return `${SITE}/oauth/authorize?${q}`;
}

// Exchanges the code from the callback for an access token (within 2 minutes of issue).
export async function exchangeCode(code: string): Promise<{ accessToken: string; scope: string | null; athleteId: string; athleteName: string | null }> {
  const res = await fetch(`${SITE}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID!, client_secret: CLIENT_SECRET!, code }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`intervals.icu token exchange failed (${res.status})`);
  const data = await res.json();
  if (typeof data?.access_token !== "string" || data?.athlete?.id == null) throw new Error("intervals.icu returned an unexpected token response");
  return {
    accessToken: data.access_token,
    scope: typeof data.scope === "string" ? data.scope : null,
    athleteId: String(data.athlete.id),
    athleteName: typeof data.athlete.name === "string" ? data.athlete.name.slice(0, 120) : null,
  };
}

export async function getConnection(userId: string): Promise<IntervalsConnection | null> {
  const { data } = await admin.from("intervals_connections").select("*").eq("user_id", userId).maybeSingle();
  return (data as IntervalsConnection | null) ?? null;
}

export async function saveConnection(userId: string, c: Awaited<ReturnType<typeof exchangeCode>>) {
  const { error } = await admin.from("intervals_connections").upsert({
    user_id: userId, athlete_id: c.athleteId, athlete_name: c.athleteName, access_token: c.accessToken, scope: c.scope,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// Revokes Pello's access on intervals.icu (best effort) and forgets the token.
export async function removeConnection(userId: string) {
  const conn = await getConnection(userId);
  if (conn) {
    await fetch(`${SITE}/api/v1/disconnect-app`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${conn.access_token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  await admin.from("intervals_connections").delete().eq("user_id", userId);
}

export interface PlannedWorkout {
  id: string;
  name: string;
  type: string | null;        // e.g. "Ride", "Run"
  startLocal: string | null;  // "2026-10-07T00:00:00"
  movingTimeSec: number | null;
  filename: string;
  fileBase64: string;         // the workout as a .fit file
}

export class IntervalsAuthError extends Error {}

// The planned workouts on the member's calendar for one day (their local date, YYYY-MM-DD),
// each with its workout file in .fit format, ready for the planner's workout reader.
export async function plannedWorkouts(conn: IntervalsConnection, date: string): Promise<PlannedWorkout[]> {
  const q = new URLSearchParams({ oldest: date, newest: date, category: "WORKOUT", ext: "fit" });
  const res = await fetch(`${SITE}/api/v1/athlete/0/events?${q}`, {
    headers: { Authorization: `Bearer ${conn.access_token}` },
    cache: "no-store",
  });
  // A revoked or expired token: the member needs to connect again.
  if (res.status === 401 || res.status === 403) throw new IntervalsAuthError("intervals.icu access was revoked");
  if (!res.ok) throw new Error(`intervals.icu events request failed (${res.status})`);
  const events = await res.json();
  if (!Array.isArray(events)) return [];
  return events
    .filter((e) => typeof e?.workout_file_base64 === "string" && e.workout_file_base64.length > 0)
    .map((e) => ({
      id: String(e.id),
      name: typeof e.name === "string" && e.name.trim() ? e.name.trim().slice(0, 80) : "Planned workout",
      type: typeof e.type === "string" ? e.type : null,
      startLocal: typeof e.start_date_local === "string" ? e.start_date_local : null,
      movingTimeSec: typeof e.moving_time === "number" ? e.moving_time : null,
      filename: typeof e.workout_filename === "string" && e.workout_filename.endsWith(".fit") ? e.workout_filename : `${String(e.id)}.fit`,
      fileBase64: e.workout_file_base64,
    }));
}
