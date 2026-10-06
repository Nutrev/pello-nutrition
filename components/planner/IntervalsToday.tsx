"use client";

// intervals.icu inside the planner's workout-file panel (Pello Pro):
// - "Use today's planned workout": fetches the workouts planned on the member's calendar for
//   today and hands the chosen one to the panel as a .fit file, read like an upload.
// - "Use a completed workout": lists the last 7 days of activities; the chosen one comes back
//   already summarized from intervals.icu's own figures (lib/intervals.ts).
// Shows nothing until the connection is switched on.
import { useEffect, useState } from "react";
import type { WorkoutSummary } from "@/lib/workout-file";

type Status = { enabled: boolean; signedIn?: boolean; allowed?: boolean; connected?: boolean; activities?: boolean; athleteName?: string | null };
type Planned = { id: string; name: string; type: string | null; movingTimeSec: number | null; filename: string; fileBase64: string };
type Activity = { id: string; name: string; type: string | null; startLocal: string | null; movingTimeSec: number | null; fromStrava: boolean };

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

function toFile(w: Planned): File {
  const bytes = Uint8Array.from(atob(w.fileBase64), (c) => c.charCodeAt(0));
  return new File([bytes], `${w.name.replace(/[^\w\s-]/g, "").trim() || "workout"}.fit`, { type: "application/octet-stream" });
}

const minutes = (sec: number | null) => (sec ? `${Math.round(sec / 60)} min` : null);
const when = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  const today = ymd(new Date()), yesterday = ymd(daysAgo(1)), day = ymd(d);
  return day === today ? "Today" : day === yesterday ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export default function IntervalsToday({ onFile, onSummary, disabled }: {
  onFile: (f: File) => void; onSummary: (w: WorkoutSummary) => void; disabled?: boolean;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<"planned" | "completed" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [planned, setPlanned] = useState<Planned[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/intervals/status").then((r) => r.json()).then((s) => { if (active) setStatus(s); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!status?.enabled || !status.signedIn || !status.allowed) return null;

  const returnTo = typeof window === "undefined" ? "/quiz" : window.location.pathname + window.location.search;
  const connectHref = `/api/intervals/connect?return=${encodeURIComponent(returnTo)}`;
  if (!status.connected) {
    return (
      <p className="text-xs text-muted mt-3">
        Plan with intervals.icu? <a href={connectHref} className="text-moss hover:underline">Connect your account</a> to use
        today&apos;s planned workout or a completed one.
      </p>
    );
  }

  const reset = () => { setMessage(null); setPlanned(null); setActivities(null); };
  // Shared handling for errors from the intervals.icu routes.
  const failed = (data: { code?: string; error?: string }) => {
    if (data.code === "not-connected") setStatus({ ...status, connected: false });
    if (data.code === "needs-reconnect") setStatus({ ...status, activities: false });
    setMessage(data.error ?? "Couldn't reach intervals.icu. Try again in a moment.");
  };

  const fetchPlanned = async () => {
    reset(); setBusy("planned");
    try {
      const res = await fetch(`/api/intervals/today?date=${ymd(new Date())}`);
      const data = await res.json();
      if (!res.ok) failed(data);
      else if (!data.workouts?.length) setMessage("There's no planned workout on your intervals.icu calendar today.");
      else if (data.workouts.length === 1) onFile(toFile(data.workouts[0]));
      else setPlanned(data.workouts);
    } catch { failed({}); }
    setBusy(null);
  };

  const fetchActivities = async () => {
    reset(); setBusy("completed");
    try {
      const res = await fetch(`/api/intervals/activities?oldest=${ymd(daysAgo(6))}&newest=${ymd(new Date())}`);
      const data = await res.json();
      if (!res.ok) failed(data);
      else if (!data.activities?.length) setMessage("There are no activities on intervals.icu from the last 7 days.");
      else setActivities(data.activities);
    } catch { failed({}); }
    setBusy(null);
  };

  const chooseActivity = async (a: Activity) => {
    setMessage(null); setBusy("completed");
    try {
      const res = await fetch(`/api/intervals/activity?id=${encodeURIComponent(a.id)}`);
      const data = await res.json();
      if (!res.ok) failed(data);
      else { setActivities(null); onSummary(data.workout); }
    } catch { failed({}); }
    setBusy(null);
  };

  const option = "w-full text-left text-sm px-3 py-2 rounded-lg border border-sand bg-white/60 hover:border-moss transition-colors disabled:opacity-50 disabled:hover:border-sand";
  return (
    <div className="mt-3 text-left">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button type="button" onClick={fetchPlanned} disabled={!!busy || disabled} className="text-sm text-moss hover:underline disabled:opacity-50">
          {busy === "planned" ? "Loading today's workout…" : "Use today's planned workout"}
        </button>
        {status.activities ? (
          <button type="button" onClick={fetchActivities} disabled={!!busy || disabled} className="text-sm text-moss hover:underline disabled:opacity-50">
            {busy === "completed" ? "Loading activities…" : "Use a completed workout"}
          </button>
        ) : (
          <a href={connectHref} className="text-sm text-moss hover:underline">Reconnect to use completed workouts</a>
        )}
      </div>
      <p className="text-[11px] text-muted text-center mt-1">From intervals.icu{status.athleteName ? ` · connected as ${status.athleteName}` : ""}</p>
      {message && <p role="status" className="text-xs text-muted mt-2 text-center">{message}</p>}

      {planned && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-muted">You have {planned.length} workouts planned today. Which one?</p>
          {planned.map((w) => (
            <button key={w.id} type="button" onClick={() => { setPlanned(null); onFile(toFile(w)); }} className={option}>
              {w.name}
              <span className="text-xs text-muted">{[w.type, minutes(w.movingTimeSec)].filter(Boolean).map((x) => ` · ${x}`).join("")}</span>
            </button>
          ))}
        </div>
      )}

      {activities && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-muted">Your activities from the last 7 days. Which one?</p>
          {activities.map((a) => (
            <button key={a.id} type="button" disabled={a.fromStrava || !!busy} onClick={() => chooseActivity(a)} className={option}
              title={a.fromStrava ? "Strava doesn't allow its activities to be shared with other apps" : undefined}>
              {a.name}
              <span className="text-xs text-muted">{[when(a.startLocal), a.type, minutes(a.movingTimeSec)].filter(Boolean).map((x) => ` · ${x}`).join("")}</span>
              {a.fromStrava && <span className="block text-[11px] text-muted">From Strava, which doesn&apos;t allow sharing with other apps. Upload the file instead.</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
