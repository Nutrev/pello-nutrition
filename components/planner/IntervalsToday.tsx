"use client";

// "Use today's workout from intervals.icu", inside the planner's workout-file panel (Pello Pro).
// Fetches the workouts planned on the member's intervals.icu calendar for today and hands the
// chosen one to the panel as a .fit file, so it goes through the same reader as an upload.
// Shows nothing until the connection is switched on (lib/intervals.ts).
import { useEffect, useState } from "react";

type Status = { enabled: boolean; signedIn?: boolean; allowed?: boolean; connected?: boolean; athleteName?: string | null };
type Planned = { id: string; name: string; type: string | null; movingTimeSec: number | null; filename: string; fileBase64: string };

const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function toFile(w: Planned): File {
  const bytes = Uint8Array.from(atob(w.fileBase64), (c) => c.charCodeAt(0));
  return new File([bytes], `${w.name.replace(/[^\w\s-]/g, "").trim() || "workout"}.fit`, { type: "application/octet-stream" });
}

const minutes = (sec: number | null) => (sec ? `${Math.round(sec / 60)} min` : null);

export default function IntervalsToday({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [options, setOptions] = useState<Planned[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/intervals/status").then((r) => r.json()).then((s) => { if (active) setStatus(s); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!status?.enabled || !status.signedIn || !status.allowed) return null;

  const returnTo = typeof window === "undefined" ? "/quiz" : window.location.pathname + window.location.search;
  if (!status.connected) {
    return (
      <p className="text-xs text-muted mt-3">
        Plan with intervals.icu?{" "}
        <a href={`/api/intervals/connect?return=${encodeURIComponent(returnTo)}`} className="text-moss hover:underline">Connect your account</a>{" "}
        to use the workout on today&apos;s calendar.
      </p>
    );
  }

  const fetchToday = async () => {
    setBusy(true); setMessage(null); setOptions(null);
    try {
      const res = await fetch(`/api/intervals/today?date=${localDate()}`);
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "not-connected") setStatus({ ...status, connected: false });
        setMessage(data.error ?? "Couldn't load today's workout.");
      } else if (!data.workouts?.length) {
        setMessage("There's no planned workout on your intervals.icu calendar today.");
      } else if (data.workouts.length === 1) {
        onFile(toFile(data.workouts[0]));
      } else {
        setOptions(data.workouts);
      }
    } catch {
      setMessage("Couldn't reach intervals.icu. Try again in a moment.");
    }
    setBusy(false);
  };

  return (
    <div className="mt-3">
      <button type="button" onClick={fetchToday} disabled={busy || disabled}
        className="text-sm text-moss hover:underline disabled:opacity-50">
        {busy ? "Loading today's workout…" : "Use today's workout from intervals.icu"}
      </button>
      {status.athleteName && <span className="text-[11px] text-muted ml-2">Connected as {status.athleteName}</span>}
      {message && <p role="status" className="text-xs text-muted mt-2">{message}</p>}
      {options && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-muted">You have {options.length} workouts planned today. Which one?</p>
          {options.map((w) => (
            <button key={w.id} type="button" onClick={() => { setOptions(null); onFile(toFile(w)); }}
              className="w-full text-left text-sm px-3 py-2 rounded-lg border border-sand bg-white/60 hover:border-moss transition-colors">
              {w.name}
              <span className="text-xs text-muted">{[w.type, minutes(w.movingTimeSec)].filter(Boolean).map((x) => ` · ${x}`).join("")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
