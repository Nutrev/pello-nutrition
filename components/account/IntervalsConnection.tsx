"use client";

// The intervals.icu row in the account's Connected apps section: connect, or disconnect.
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntervalsConnection({ connected, athleteName, locked }: {
  connected: boolean; athleteName: string | null; locked: boolean;
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
            ? `Connected${athleteName ? ` as ${athleteName}` : ""}. The Today's workout planner can use the workout planned on your calendar.`
            : "Connect to use the workout planned on your intervals.icu calendar in the Today's workout planner. Pello only reads your planned workouts."}
        </p>
      </div>
      {connected ? (
        <button type="button" onClick={disconnect} disabled={busy} className="btn-secondary text-sm whitespace-nowrap disabled:opacity-50">
          {busy ? "Disconnecting…" : "Disconnect"}
        </button>
      ) : locked ? (
        <a href="/pricing" className="btn-secondary text-sm whitespace-nowrap">See Pello Pro</a>
      ) : (
        <a href="/api/intervals/connect?return=%2Faccount" className="btn-primary text-sm whitespace-nowrap">Connect</a>
      )}
    </div>
  );
}
