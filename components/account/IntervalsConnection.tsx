"use client";

// The intervals.icu row in the account's Connected apps section: connect, or disconnect.
import { useState } from "react";
import { useRouter } from "next/navigation";

// needsReconnect: connected before completed activities were added (calendar access only).
export default function IntervalsConnection({ connected, athleteName, locked, needsReconnect = false }: {
  connected: boolean; athleteName: string | null; locked: boolean; needsReconnect?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const disconnect = async () => {
    if (!confirm("Disconnect intervals.icu? Pello will no longer be able to read your planned workouts.")) return;
    setBusy(true);
    await fetch("/api/intervals/disconnect", { method: "POST" }).catch(() => undefined);
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="font-display font-semibold">intervals.icu</div>
        <p className="text-sm text-muted">
          {connected
            ? needsReconnect
              ? `Connected${athleteName ? ` as ${athleteName}` : ""}, for planned workouts only. Reconnect to also plan from your completed activities.`
              : `Connected${athleteName ? ` as ${athleteName}` : ""}. The planner can use the workout planned for today or a completed activity you choose.`
            : "Connect to plan from the workout on your intervals.icu calendar today, or review a completed activity and plan your recovery. Pello only reads what you choose."}
        </p>
      </div>
      {connected ? (
        <div className="flex gap-2">
          {needsReconnect && <a href="/api/intervals/connect?return=%2Faccount" className="btn-primary text-sm whitespace-nowrap">Reconnect</a>}
        <button type="button" onClick={disconnect} disabled={busy} className="btn-secondary text-sm whitespace-nowrap disabled:opacity-50">
          {busy ? "Disconnecting…" : "Disconnect"}
        </button>
        </div>
      ) : locked ? (
        <a href="/pricing" className="btn-secondary text-sm whitespace-nowrap">See Pello Pro</a>
      ) : (
        <a href="/api/intervals/connect?return=%2Faccount" className="btn-primary text-sm whitespace-nowrap">Connect</a>
      )}
    </div>
  );
}
