"use client";

// "Upload a workout" on the planner (Pello Pro). Reads .zwo, .erg, .mrc, .fit and .tcx files in
// the browser: nothing is uploaded or stored, only the summary goes into the plan.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser, updateProfile } from "@/lib/auth";
import {
  parseZwo, parseErgMrc, parseTcx, fromFit, fitDataFrom, intensityFromIf, INTENSITY_BANDS, MAX_FILE_BYTES,
  type WorkoutSummary, type WorkoutBlock,
} from "@/lib/workout-file";

const ACCEPT = ".zwo,.erg,.mrc,.fit,.tcx";

async function readWorkout(file: File, ftp: number | null): Promise<WorkoutSummary> {
  if (file.size > MAX_FILE_BYTES) throw new Error("That file is over 25 MB, too big to read here.");
  const ext = file.name.toLowerCase().split(".").pop();
  const base = file.name.replace(/\.[^.]+$/, "");
  const named = (w: WorkoutSummary) => (w.name === "Uploaded workout" ? { ...w, name: base.slice(0, 60) || w.name } : w);
  switch (ext) {
    case "zwo": return named(parseZwo(await file.text()));
    case "erg": return named(parseErgMrc(await file.text(), "erg"));
    case "mrc": return named(parseErgMrc(await file.text(), "mrc"));
    case "tcx": return named(parseTcx(await file.text(), ftp));
    case "fit": {
      const { default: FitParser } = await import("fit-file-parser");
      const parsed = await new FitParser({ force: true, mode: "list" }).parseAsync(await file.arrayBuffer());
      return named(fromFit(fitDataFrom(parsed), ftp));
    }
    default: throw new Error("Upload a .zwo, .erg, .mrc, .fit or .tcx file.");
  }
}

const ZONE_COLOURS = ["#D9D2C3", "#9DB59D", "#5E8C5E", "#C8860A", "#B86B2E", "#B84C2E", "#8A2E1E"];
const zoneColour = (pct: number | null) =>
  pct == null ? ZONE_COLOURS[0] : pct < 56 ? ZONE_COLOURS[1] : pct < 76 ? ZONE_COLOURS[2] : pct < 91 ? ZONE_COLOURS[3] : pct < 106 ? ZONE_COLOURS[4] : pct < 121 ? ZONE_COLOURS[5] : ZONE_COLOURS[6];

// A small profile of the workout: block width = time, height = % of FTP.
export function WorkoutChart({ blocks }: { blocks: WorkoutBlock[] }) {
  const total = blocks.reduce((a, [m]) => a + m, 0) || 1;
  const maxPct = Math.max(120, ...blocks.map(([, p]) => p ?? 0));
  return (
    <div className="flex items-end h-14 gap-px rounded-md overflow-hidden bg-sand/30" role="img" aria-label="Workout intensity profile">
      {blocks.map(([m, p], i) => (
        <div key={i} title={`${m} min · ${p == null ? "no target" : `${p}% FTP`}`}
          style={{ width: `${(m / total) * 100}%`, height: `${p == null ? 30 : Math.max(8, (p / maxPct) * 100)}%`, background: zoneColour(p) }} />
      ))}
    </div>
  );
}

export function workoutIntensityNote(w: WorkoutSummary): string | null {
  const id = intensityFromIf(w.intensityFactor);
  if (!id) return null;
  const band = INTENSITY_BANDS.find((b) => b.id === id)!;
  return `Intensity factor ${w.intensityFactor}: ${band.label}`;
}

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`);

export default function WorkoutUpload({ workout, onChange }: {
  workout: WorkoutSummary | null;
  onChange: (w: WorkoutSummary | null) => void;
}) {
  const { user, profile, refreshProfile } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [ftp, setFtp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (ftp == null && profile?.ftp_watts) setFtp(profile.ftp_watts); }, [profile, ftp]);

  const read = async (f: File, withFtp: number | null) => {
    setBusy(true); setError(null);
    try {
      onChange(await readWorkout(f, withFtp));
    } catch (e) {
      onChange(null);
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "";
      setError(msg ? `Couldn't read that file: ${msg}` : "Couldn't read that file. Check it's a workout file exported from your app or device.");
    }
    setBusy(false);
  };

  const choose = (f: File | undefined) => { if (!f) return; setFile(f); read(f, ftp); };

  // Re-read with the new FTP, and keep it on the profile for next time.
  const applyFtp = async () => {
    if (ftp != null && (ftp < 50 || ftp > 700)) { setError("Enter an FTP between 50 and 700 watts."); return; }
    if (file) await read(file, ftp);
    if (user && ftp != null && ftp !== profile?.ftp_watts) {
      const { error } = await updateProfile({ ftp_watts: Math.round(ftp) });
      if (!error) refreshProfile();
    }
  };

  const needsFtp = workout && workout.notes.some((n) => /FTP/.test(n));
  const intensityNote = workout ? workoutIntensityNote(workout) : null;

  return (
    <div className="card mb-6 border-dashed">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display font-semibold">Plan from a workout file</h2>
        {workout && <button type="button" onClick={() => { onChange(null); setFile(null); setError(null); }} className="text-xs text-muted hover:text-rust">Remove</button>}
      </div>
      <p className="text-xs text-muted mb-4">
        Upload a planned workout (.zwo, .erg, .mrc or .fit, e.g. exported from TrainingPeaks) or a completed ride or run (.fit or .tcx).
        It&apos;s read on your device and never uploaded; only its duration and intensity go into your plan.
      </p>

      {!workout && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files?.[0]); }}
          className="rounded-xl border border-sand bg-white/40 p-5 text-center">
          <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-secondary text-sm disabled:opacity-50">
            {busy ? "Reading…" : "Choose a file"}
          </button>
          <p className="text-[11px] text-muted mt-2">or drag it here · .zwo .erg .mrc .fit .tcx</p>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-rust mt-3">{error}</p>}

      {workout && (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
            <span className={`text-[11px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${workout.kind === "planned" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
              {workout.kind === "planned" ? "Planned" : "Completed"}
            </span>
            <span className="font-medium text-sm">{workout.name}</span>
            <span className="text-xs text-muted">{fmtMin(workout.durationMin)}{workout.sport !== "other" ? ` · ${workout.sport === "bike" ? "cycling" : "running"}` : ""}{workout.avgPower != null ? ` · avg ${workout.avgPower} W` : ""}{workout.kj != null ? ` · ${workout.kj} kJ` : ""}</span>
          </div>
          <WorkoutChart blocks={workout.blocks} />
          {intensityNote && <p className="text-xs text-moss mt-2">{intensityNote}</p>}
          {workout.notes.map((n) => <p key={n} className="text-xs text-muted mt-1">{n}</p>)}
        </div>
      )}

      {(needsFtp || (workout && workout.sport === "bike") || (!workout && file)) && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <label htmlFor="ftp" className="text-xs text-muted">Your FTP</label>
          <input id="ftp" type="number" inputMode="numeric" min={50} max={700} placeholder="e.g. 250" value={ftp ?? ""}
            onChange={(e) => setFtp(e.target.value === "" ? null : Number(e.target.value))}
            className="w-24 text-sm bg-white/60 border border-sand rounded-lg px-2 py-1.5 focus:outline-none focus:border-moss" />
          <span className="text-xs text-muted">W</span>
          <button type="button" onClick={applyFtp} disabled={busy || !file} className="text-xs text-moss hover:underline disabled:opacity-40">Update</button>
          {user && <span className="text-[11px] text-muted">Saved to your <Link href="/account/onboarding?edit=1" className="underline">profile</Link></span>}
        </div>
      )}
    </div>
  );
}
