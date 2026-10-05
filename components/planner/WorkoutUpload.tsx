"use client";

// "Plan from a workout file" on the planner (Pello Pro). Reads .zwo, .erg, .mrc, .fit and .tcx
// files in the browser: nothing is uploaded or stored, only the summary goes into the plan.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser, updateProfile } from "@/lib/auth";
import {
  parseZwo, parseErgMrc, parseTcx, fromFit, fitDataFrom, intensityLabel, zoneOf, MAX_FILE_BYTES,
  type WorkoutSummary, type WorkoutBlock, type Thresholds, type IntensityBasis,
} from "@/lib/workout-file";

const ACCEPT = ".zwo,.erg,.mrc,.fit,.tcx";
const KM_PER_MILE = 1.609344;

async function readWorkout(file: File, t: Thresholds): Promise<WorkoutSummary> {
  if (file.size > MAX_FILE_BYTES) throw new Error("That file is over 25 MB, too big to read here.");
  const ext = file.name.toLowerCase().split(".").pop();
  const base = file.name.replace(/\.[^.]+$/, "");
  const named = (w: WorkoutSummary) => (w.name === "Uploaded workout" ? { ...w, name: base.slice(0, 60) || w.name } : w);
  switch (ext) {
    case "zwo": return named(parseZwo(await file.text()));
    case "erg": return named(parseErgMrc(await file.text(), "erg"));
    case "mrc": return named(parseErgMrc(await file.text(), "mrc"));
    case "tcx": return named(parseTcx(await file.text(), t));
    case "fit": {
      const { default: FitParser } = await import("fit-file-parser");
      const parsed = await new FitParser({ force: true, mode: "list", speedUnit: "m/s" }).parseAsync(await file.arrayBuffer());
      return named(fromFit(fitDataFrom(parsed), t));
    }
    default: throw new Error("Upload a .zwo, .erg, .mrc, .fit or .tcx file.");
  }
}

const ZONE_COLOURS = ["#D9D2C3", "#9DB59D", "#5E8C5E", "#C8860A", "#B86B2E", "#B84C2E", "#8A2E1E"];

// A small profile of the workout: block width = time, height = intensity.
export function WorkoutChart({ blocks, basis }: { blocks: WorkoutBlock[]; basis: IntensityBasis | null }) {
  const total = blocks.reduce((a, [m]) => a + m, 0) || 1;
  const maxPct = Math.max(120, ...blocks.map(([, p]) => p ?? 0));
  return (
    <div className="flex items-end h-14 gap-px rounded-md overflow-hidden bg-sand/30" role="img" aria-label="Workout intensity profile">
      {blocks.map(([m, p], i) => (
        <div key={i} title={`${m} min · ${p == null ? "no target" : `${p}%`}`}
          style={{ width: `${(m / total) * 100}%`, height: `${p == null ? 30 : Math.max(8, (p / maxPct) * 100)}%`, background: ZONE_COLOURS[Math.max(0, zoneOf(p == null ? null : p / 100, basis))] ?? ZONE_COLOURS[6] }} />
      ))}
    </div>
  );
}

export const workoutIntensityNote = (w: WorkoutSummary) => intensityLabel(w);

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`);
const paceText = (secPerKm: number | null, unit: "km" | "mi") => {
  if (!secPerKm) return "";
  const s = Math.round(unit === "mi" ? secPerKm * KM_PER_MILE : secPerKm);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const parsePace = (text: string, unit: "km" | "mi"): number | null => {
  const m = text.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  const sec = Number(m[1]) * 60 + Number(m[2]);
  return unit === "mi" ? Math.round(sec / KM_PER_MILE) : sec;
};

export default function WorkoutUpload({ workout, onChange }: {
  workout: WorkoutSummary | null;
  onChange: (w: WorkoutSummary | null) => void;
}) {
  const { user, profile, refreshProfile } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [ftp, setFtp] = useState<number | null>(null);
  const [paceUnit, setPaceUnit] = useState<"km" | "mi">("km");
  const [paceInput, setPaceInput] = useState("");
  const [thresholdHr, setThresholdHr] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  // Start from the athlete profile.
  useEffect(() => {
    if (loaded.current || !profile) return;
    loaded.current = true;
    const unit = profile.weight_unit === "lbs" ? "mi" : "km";
    setPaceUnit(unit);
    if (profile.ftp_watts) setFtp(profile.ftp_watts);
    if (profile.threshold_pace_sec_per_km) setPaceInput(paceText(profile.threshold_pace_sec_per_km, unit));
    if (profile.threshold_hr) setThresholdHr(profile.threshold_hr);
  }, [profile]);

  const thresholds = (): Thresholds => ({ ftp, paceSecPerKm: parsePace(paceInput, paceUnit), thresholdHr });

  const read = async (f: File, t: Thresholds) => {
    setBusy(true); setError(null);
    try {
      onChange(await readWorkout(f, t));
    } catch (e) {
      onChange(null);
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "";
      setError(msg ? `Couldn't read that file: ${msg}` : "Couldn't read that file. Check it's a workout file exported from your app or device.");
    }
    setBusy(false);
  };

  const choose = (f: File | undefined) => { if (!f) return; setFile(f); read(f, thresholds()); };

  // Re-read with the new thresholds, and keep them on the profile for next time.
  const applyThresholds = async () => {
    const t = thresholds();
    if (t.ftp != null && (t.ftp < 50 || t.ftp > 700)) { setError("Enter an FTP between 50 and 700 watts."); return; }
    if (paceInput && (t.paceSecPerKm == null || t.paceSecPerKm < 120 || t.paceSecPerKm > 900)) { setError(`Enter your threshold pace as minutes:seconds per ${paceUnit}, e.g. ${paceUnit === "km" ? "4:30" : "7:15"}.`); return; }
    if (t.thresholdHr != null && (t.thresholdHr < 80 || t.thresholdHr > 230)) { setError("Enter a threshold heart rate between 80 and 230 bpm."); return; }
    if (file) await read(file, t);
    if (!user) return;
    const changes = {
      ...(t.ftp != null && t.ftp !== profile?.ftp_watts ? { ftp_watts: Math.round(t.ftp) } : {}),
      ...(t.paceSecPerKm != null && t.paceSecPerKm !== profile?.threshold_pace_sec_per_km ? { threshold_pace_sec_per_km: t.paceSecPerKm } : {}),
      ...(t.thresholdHr != null && t.thresholdHr !== profile?.threshold_hr ? { threshold_hr: Math.round(t.thresholdHr) } : {}),
    };
    if (Object.keys(changes).length) {
      const { error } = await updateProfile(changes);
      if (!error) refreshProfile();
    }
  };

  const sport = workout?.sport;
  const showBike = sport === "bike" || (!workout && !!file);
  const showRun = sport === "run" || (!workout && !!file);
  const intensityNote = workout ? intensityLabel(workout) : null;
  const field = "text-sm bg-white/60 border border-sand rounded-lg px-2 py-1.5 focus:outline-none focus:border-moss";

  return (
    <div className="card mb-6 border-dashed">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display font-semibold">Plan from a workout file</h2>
        {workout && <button type="button" onClick={() => { onChange(null); setFile(null); setError(null); }} className="text-xs text-muted hover:text-rust">Remove</button>}
      </div>
      <p className="text-xs text-muted mb-4">
        Upload a planned ride or run (.zwo, .erg, .mrc or .fit, e.g. exported from TrainingPeaks) or a completed one (.fit or .tcx).
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
          <WorkoutChart blocks={workout.blocks} basis={workout.basis} />
          {intensityNote && <p className="text-xs text-moss mt-2">{intensityNote}</p>}
          {workout.notes.map((n) => <p key={n} className="text-xs text-muted mt-1">{n}</p>)}
        </div>
      )}

      {(showBike || showRun) && (
        <div className="mt-4 space-y-2">
          {showBike && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="ftp" className="text-xs text-muted w-36">Cycling FTP</label>
              <input id="ftp" type="number" inputMode="numeric" min={50} max={700} placeholder="e.g. 250" value={ftp ?? ""}
                onChange={(e) => setFtp(e.target.value === "" ? null : Number(e.target.value))} className={`${field} w-24`} />
              <span className="text-xs text-muted">W</span>
            </div>
          )}
          {showRun && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="pace" className="text-xs text-muted w-36">Threshold pace</label>
                <input id="pace" inputMode="numeric" placeholder={paceUnit === "km" ? "4:30" : "7:15"} value={paceInput}
                  onChange={(e) => setPaceInput(e.target.value)} className={`${field} w-20`} />
                <select aria-label="Pace unit" value={paceUnit} onChange={(e) => {
                  const unit = e.target.value as "km" | "mi";
                  const sec = parsePace(paceInput, paceUnit);
                  setPaceUnit(unit);
                  if (sec) setPaceInput(paceText(sec, unit));
                }} className={field}>
                  <option value="km">/km</option>
                  <option value="mi">/mi</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="thr" className="text-xs text-muted w-36">Threshold heart rate</label>
                <input id="thr" type="number" inputMode="numeric" min={80} max={230} placeholder="e.g. 168" value={thresholdHr ?? ""}
                  onChange={(e) => setThresholdHr(e.target.value === "" ? null : Number(e.target.value))} className={`${field} w-20`} />
                <span className="text-xs text-muted">bpm</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={applyThresholds} disabled={busy || !file} className="text-xs text-moss hover:underline disabled:opacity-40">Update</button>
            {user && <span className="text-[11px] text-muted">Saved to your <Link href="/account/onboarding?edit=1" className="underline">profile</Link></span>}
          </div>
          {showRun && (
            <p className="text-[11px] text-muted">
              Threshold pace and heart rate are what you could hold for about an hour of hard running. Completed runs are judged by heart rate
              when there is some, because pace doesn&apos;t reflect hills.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
