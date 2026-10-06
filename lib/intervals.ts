// lib/intervals.ts
// intervals.icu connection (Pello Pro): members connect their intervals.icu account so the
// planner can fetch the workout planned on their calendar for today, or a completed activity
// they choose (to review it and plan recovery).
//
// Switched off until INTERVALS_CLIENT_ID and INTERVALS_CLIENT_SECRET are set (Vercel →
// Settings → Environment Variables, and .env.local). The app is registered at
// https://intervals.icu/oauth/apply with the redirect URL /api/intervals/callback.
// API terms: https://forum.intervals.icu/t/intervals-icu-api-terms-and-conditions/114087
// Garmin-sourced data must be credited where it's shown: completed activities recorded on a
// Garmin device carry recordedWith, which the planner shows. Activities that reached
// intervals.icu from Strava aren't available through its API (Strava's terms).
//
// Access tokens are stored in intervals_connections (supabase/intervals.sql), readable only
// by the server. Pello reads planned workouts or activities only when the member asks; none
// of their calendar or activity data is stored.
import "server-only";
import { supabase as admin } from "./supabase";
import { PRO_ENABLED } from "./pro";
import { isProUser } from "./subscription-server";
import { fromIntervalsActivity, type WorkoutSummary } from "./workout-file";

const CLIENT_ID = process.env.INTERVALS_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.INTERVALS_CLIENT_SECRET?.trim();
export const INTERVALS_ENABLED = !!(CLIENT_ID && CLIENT_SECRET);

const SITE = "https://intervals.icu";
// Read-only access to the calendar (planned workouts) and activities (completed workouts).
// Nothing else is requested. Connections made before activities were added only have
// CALENDAR:READ; they're asked to reconnect before using completed workouts.
export const INTERVALS_SCOPE = "CALENDAR:READ,ACTIVITY:READ";

export const hasActivityAccess = (conn: Pick<IntervalsConnection, "scope">) =>
  (conn.scope ?? "").split(",").some((s) => /^ACTIVITY:(READ|WRITE)$/.test(s.trim()));
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

export interface RecentActivity {
  id: string;
  name: string;
  type: string | null;
  startLocal: string | null;
  movingTimeSec: number | null;
  // Activities from Strava can't be read through intervals.icu's API.
  fromStrava: boolean;
}

const authHeaders = (conn: IntervalsConnection) => ({ Authorization: `Bearer ${conn.access_token}` });

async function getJson(conn: IntervalsConnection, path: string) {
  const res = await fetch(`${SITE}${path}`, { headers: authHeaders(conn), cache: "no-store" });
  if (res.status === 401 || res.status === 403) throw new IntervalsAuthError("intervals.icu access was revoked");
  if (!res.ok) throw new Error(`intervals.icu request failed (${res.status}): ${path.split("?")[0]}`);
  return res.json();
}

// Completed activities between two local dates (YYYY-MM-DD), newest first.
export async function recentActivities(conn: IntervalsConnection, oldest: string, newest: string): Promise<RecentActivity[]> {
  const list = await getJson(conn, `/api/v1/athlete/0/activities?${new URLSearchParams({ oldest, newest, limit: "30" })}`);
  if (!Array.isArray(list)) return [];
  return list
    .filter((a) => a?.id != null)
    .map((a) => ({
      id: String(a.id),
      name: typeof a.name === "string" && a.name.trim() ? a.name.trim().slice(0, 80) : "Activity",
      type: typeof a.type === "string" ? a.type : null,
      startLocal: typeof a.start_date_local === "string" ? a.start_date_local : null,
      movingTimeSec: typeof a.moving_time === "number" ? a.moving_time : null,
      fromStrava: a.source === "STRAVA" || (typeof a._note === "string" && /strava/i.test(a._note)),
    }))
    .sort((x, y) => (y.startLocal ?? "").localeCompare(x.startLocal ?? ""));
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null);

// The Garmin device that recorded an activity, if any, as a short display name.
function garminDevice(a: Record<string, unknown>): string | null {
  const device = typeof a.device_name === "string" ? a.device_name.replace(/[^A-Za-z0-9 \-]/g, "").trim().slice(0, 46) : "";
  if (/^garmin/i.test(device)) return device.replace(/^garmin/i, "Garmin");
  if (typeof a.source === "string" && /garmin/i.test(a.source)) return "Garmin";
  return null;
}

export class StravaActivityError extends Error {}

// One completed activity as the planner's workout summary, built from intervals.icu's own
// figures (normalized power and the FTP it used, heart rate and threshold heart rate) and its
// detected intervals. The activity's file itself isn't downloaded.
export async function activitySummary(conn: IntervalsConnection, id: string): Promise<WorkoutSummary> {
  const a = await getJson(conn, `/api/v1/activity/${encodeURIComponent(id)}`);
  if (a?.source === "STRAVA" || (typeof a?._note === "string" && /strava/i.test(a._note))) throw new StravaActivityError();
  const moving = num(a?.moving_time) ?? num(a?.elapsed_time);
  if (!moving) throw new Error("intervals.icu returned an activity without a duration");

  // Intervals are a nice-to-have: without them the session is one block at its average.
  let intervals: { sec: number; watts: number | null; hr: number | null }[] = [];
  try {
    const raw = await getJson(conn, `/api/v1/activity/${encodeURIComponent(id)}/intervals`);
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.icu_intervals) ? raw.icu_intervals : [];
    intervals = list
      .map((i: Record<string, unknown>) => ({ sec: num(i.moving_time) ?? num(i.elapsed_time) ?? 0, watts: num(i.average_watts), hr: num(i.average_heartrate) }))
      .filter((i: { sec: number }) => i.sec > 0);
  } catch (e) {
    if (e instanceof IntervalsAuthError) throw e;
  }

  return fromIntervalsActivity({
    name: typeof a.name === "string" ? a.name : "Activity",
    type: typeof a.type === "string" ? a.type : null,
    movingTimeSec: moving,
    ftp: num(a.icu_ftp),
    normalizedPower: num(a.icu_weighted_avg_watts),
    averagePower: num(a.icu_average_watts) ?? num(a.average_watts),
    joules: num(a.icu_joules),
    averageHr: num(a.average_heartrate),
    lthr: num(a.icu_lthr) ?? num(a.lthr),
    recordedWith: garminDevice(a),
    intervals,
  });
}
