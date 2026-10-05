// lib/workout-file.ts
// Reads workout files in the browser and turns them into a short summary for the planner:
// planned structured workouts (.zwo, .erg, .mrc, .fit) and completed activities (.fit, .tcx).
// Files never leave the device; only this summary (duration and intensity blocks, no GPS or
// timestamps) is sent with a plan request.
//
// Intensity is only worked out for bike files with power, as a fraction of FTP. Run, pace and
// heart-rate-only files keep their duration and the athlete chooses the intensity, so Pello
// never guesses it.

import type { Intensity } from "./planner";

export type WorkoutKind = "planned" | "completed";
export type WorkoutSport = "bike" | "run" | "other";

// A block of the workout: minutes and intensity as a % of FTP (null when unknown).
export type WorkoutBlock = [minutes: number, pctFtp: number | null];

export interface WorkoutSummary {
  kind: WorkoutKind;
  sport: WorkoutSport;
  name: string;
  source: "zwo" | "erg" | "mrc" | "fit" | "tcx";
  durationMin: number;
  blocks: WorkoutBlock[];          // in order, merged, at most MAX_BLOCKS
  intensityFactor: number | null;  // normalised power ÷ FTP (planned: from the targets)
  avgPower: number | null;         // completed rides with power
  kj: number | null;               // work done, completed rides with power
  notes: string[];                 // what couldn't be read, shown to the athlete
}

export const MAX_BLOCKS = 120;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

// Session intensity → the planner's levels, using the standard power zones
// (Z1 < 55%, Z2 56–75%, Z3 76–90%, Z4 91–105%, Z5 106–120% of FTP).
export const INTENSITY_BANDS: { id: Intensity; maxIf: number; label: string }[] = [
  { id: "easy", maxIf: 0.75, label: "under 75% of FTP (Z1–Z2)" },
  { id: "moderate", maxIf: 0.85, label: "75–85% of FTP (Z2–Z3)" },
  { id: "hard", maxIf: 0.95, label: "85–95% of FTP (Z3–Z4)" },
  { id: "race", maxIf: Infinity, label: "95% of FTP or more (Z4–Z5)" },
];

export function intensityFromIf(intensityFactor: number | null): Intensity | null {
  if (intensityFactor == null) return null;
  return INTENSITY_BANDS.find((b) => intensityFactor < b.maxIf)!.id;
}

// ── Building blocks ──────────────────────────────────────────────────────────

interface Step { sec: number; pct: number | null } // pct as a fraction of FTP

const clean = (s: string) => s.replace(/[^A-Za-z0-9\u00C0-\u024F\s\-.,:()/&+'#%]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

// Normalised-power-style average of a profile: fourth-power mean of the intensity, weighted by
// time. Ignores steps with unknown intensity; null if under half the time has a target.
function intensityFactorOf(steps: Step[]): number | null {
  const known = steps.filter((s) => s.pct != null && s.sec > 0);
  const total = steps.reduce((a, s) => a + s.sec, 0);
  const knownSec = known.reduce((a, s) => a + s.sec, 0);
  if (!total || knownSec < total / 2) return null;
  const mean4 = known.reduce((a, s) => a + Math.pow(s.pct!, 4) * s.sec, 0) / knownSec;
  return Math.round(Math.pow(mean4, 0.25) * 100) / 100;
}

const zoneOf = (pct: number | null) => (pct == null ? -1 : pct < 0.56 ? 1 : pct < 0.76 ? 2 : pct < 0.91 ? 3 : pct < 1.06 ? 4 : pct < 1.21 ? 5 : 6);

// Merges steps into blocks: neighbours in the same zone join up, then the closest neighbours are
// merged until there are at most MAX_BLOCKS.
function toBlocks(steps: Step[], mergeByZone: boolean): WorkoutBlock[] {
  const merged: { sec: number; work: number; knownSec: number; zone: number }[] = [];
  for (const s of steps) {
    if (s.sec <= 0) continue;
    const zone = zoneOf(s.pct);
    const last = merged[merged.length - 1];
    const same = last && (mergeByZone ? last.zone === zone : last.zone === zone && s.pct != null && last.knownSec > 0 && Math.abs(last.work / last.knownSec - s.pct) < 0.005);
    if (same) { last.sec += s.sec; if (s.pct != null) { last.work += s.pct * s.sec; last.knownSec += s.sec; } }
    else merged.push({ sec: s.sec, work: s.pct != null ? s.pct * s.sec : 0, knownSec: s.pct != null ? s.sec : 0, zone });
  }
  while (merged.length > MAX_BLOCKS) {
    let best = 0, bestCost = Infinity;
    for (let i = 0; i < merged.length - 1; i++) {
      const a = merged[i], b = merged[i + 1];
      const pa = a.knownSec ? a.work / a.knownSec : 0, pb = b.knownSec ? b.work / b.knownSec : 0;
      const cost = Math.abs(pa - pb) * Math.min(a.sec, b.sec);
      if (cost < bestCost) { bestCost = cost; best = i; }
    }
    const a = merged[best], b = merged[best + 1];
    merged.splice(best, 2, { sec: a.sec + b.sec, work: a.work + b.work, knownSec: a.knownSec + b.knownSec, zone: a.zone === b.zone ? a.zone : 0 });
  }
  return merged.map((m) => [Math.round((m.sec / 60) * 10) / 10, m.knownSec >= m.sec / 2 ? Math.round((m.work / m.knownSec) * 100) : null]);
}

function summarise(kind: WorkoutKind, sport: WorkoutSport, name: string, source: WorkoutSummary["source"], steps: Step[], notes: string[], extra?: { avgPower?: number | null; kj?: number | null; intensityFactor?: number | null }): WorkoutSummary {
  const sec = steps.reduce((a, s) => a + s.sec, 0);
  if (sec < 60) throw new Error("This file doesn't contain a workout of at least a minute.");
  const intensityFactor = sport === "bike" ? (extra?.intensityFactor !== undefined ? extra.intensityFactor : intensityFactorOf(steps)) : null;
  if (sport !== "bike") notes.push("Intensity is only worked out for bike workouts with power, so choose it yourself in the next step.");
  else if (intensityFactor == null && !notes.some((n) => /FTP/.test(n))) {
    notes.push(kind === "planned" ? "This file has no power targets, so choose the intensity yourself in the next step." : "This file has no power data, so choose the intensity yourself in the next step.");
  }
  return {
    kind, sport, name: clean(name) || "Uploaded workout", source,
    durationMin: Math.round(sec / 60),
    blocks: toBlocks(steps, kind === "completed"),
    intensityFactor,
    avgPower: extra?.avgPower ?? null,
    kj: extra?.kj ?? null,
    notes,
  };
}

// ── .zwo (Zwift) ─────────────────────────────────────────────────────────────

const attr = (tag: string, name: string): number | null => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"));
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

export function parseZwo(text: string): WorkoutSummary {
  const name = text.match(/<name>([\s\S]*?)<\/name>/i)?.[1] ?? "";
  const sportType = (text.match(/<sportType>([\s\S]*?)<\/sportType>/i)?.[1] ?? "bike").trim().toLowerCase();
  const sport: WorkoutSport = sportType === "run" ? "run" : sportType === "bike" ? "bike" : "other";
  const body = text.match(/<workout>([\s\S]*?)<\/workout>/i)?.[1];
  if (!body) throw new Error("This .zwo file has no <workout> section.");
  const steps: Step[] = [];
  const notes: string[] = [];
  for (const m of Array.from(body.matchAll(/<(\w+)\b([^>]*?)\/?>/g))) {
    const [, el, tag] = m;
    const dur = attr(tag, "Duration");
    switch (el.toLowerCase()) {
      case "steadystate":
        steps.push({ sec: dur ?? 0, pct: attr(tag, "Power") ?? attr(tag, "PowerLow") });
        break;
      case "warmup": case "cooldown": case "ramp": {
        const lo = attr(tag, "PowerLow"), hi = attr(tag, "PowerHigh");
        steps.push({ sec: dur ?? 0, pct: lo != null && hi != null ? (lo + hi) / 2 : lo ?? hi });
        break;
      }
      case "intervalst": {
        const reps = attr(tag, "Repeat") ?? 1;
        for (let i = 0; i < reps; i++) {
          steps.push({ sec: attr(tag, "OnDuration") ?? 0, pct: attr(tag, "OnPower") ?? attr(tag, "PowerOnHigh") });
          steps.push({ sec: attr(tag, "OffDuration") ?? 0, pct: attr(tag, "OffPower") ?? attr(tag, "PowerOffHigh") });
        }
        break;
      }
      case "freeride": case "maxeffort":
        steps.push({ sec: dur ?? 0, pct: null });
        if (!notes.includes("Free-ride sections have no power target.")) notes.push("Free-ride sections have no power target.");
        break;
    }
  }
  return summarise("planned", sport, name, "zwo", steps, notes);
}

// ── .erg / .mrc (TrainingPeaks, TrainerRoad and others) ──────────────────────

export function parseErgMrc(text: string, source: "erg" | "mrc"): WorkoutSummary {
  const header = text.match(/\[COURSE HEADER\]([\s\S]*?)\[END COURSE HEADER\]/i)?.[1] ?? "";
  const data = text.match(/\[COURSE DATA\]([\s\S]*?)\[END COURSE DATA\]/i)?.[1];
  if (!data) throw new Error(`This .${source} file has no [COURSE DATA] section.`);
  const name = header.match(/^\s*(?:DESCRIPTION|FILE NAME)\s*=\s*(.+)$/im)?.[1] ?? "";
  const units = header.match(/MINUTES\s+(WATTS|PERCENT)/i)?.[1]?.toUpperCase() ?? (source === "mrc" ? "PERCENT" : "WATTS");
  const ftp = Number(header.match(/^\s*FTP\s*=\s*(\d+(?:\.\d+)?)/im)?.[1]);
  if (units === "WATTS" && !(ftp > 0)) throw new Error("This .erg file is in watts but doesn't give the FTP it was written for, so its intensity can't be read.");
  const points = data.split(/\r?\n/).map((l) => l.trim().split(/\s+/).map(Number)).filter((p) => p.length >= 2 && p.every(Number.isFinite));
  if (points.length < 2) throw new Error(`This .${source} file has no workout steps.`);
  const steps: Step[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [m0, v0] = points[i], [m1, v1] = points[i + 1];
    const sec = (m1 - m0) * 60;
    if (sec <= 0) continue; // a vertical step: the next point starts the next level
    const avg = (v0 + v1) / 2;
    steps.push({ sec, pct: units === "WATTS" ? avg / ftp : avg / 100 });
  }
  return summarise("planned", "bike", name, source, steps, []);
}

// ── .tcx (Garmin Training Center, completed) ─────────────────────────────────

export function parseTcx(text: string, ftp: number | null): WorkoutSummary {
  const sportAttr = text.match(/<Activity\s+Sport="([^"]+)"/i)?.[1]?.toLowerCase() ?? "";
  const sport: WorkoutSport = sportAttr.startsWith("bik") ? "bike" : sportAttr.startsWith("run") ? "run" : "other";
  const points = Array.from(text.matchAll(/<Trackpoint>([\s\S]*?)<\/Trackpoint>/gi)).map((m) => ({
    t: Date.parse(m[1].match(/<Time>([^<]+)<\/Time>/i)?.[1] ?? ""),
    w: Number(m[1].match(/<(?:\w+:)?Watts>([\d.]+)<\/(?:\w+:)?Watts>/i)?.[1] ?? NaN),
  })).filter((p) => Number.isFinite(p.t));
  if (points.length < 2) {
    const sec = Array.from(text.matchAll(/<TotalTimeSeconds>([\d.]+)<\/TotalTimeSeconds>/gi)).reduce((a, m) => a + Number(m[1]), 0);
    return summarise("completed", sport, "", "tcx", [{ sec, pct: null }], []);
  }
  const power = points.map((p, i) => ({ sec: i === 0 ? 0 : Math.min(30, Math.max(0, (p.t - points[i - 1].t) / 1000)), w: Number.isFinite(p.w) ? p.w : null }));
  return fromPowerSamples("completed", sport, "", "tcx", power, ftp);
}

// ── Completed rides from samples (FIT records or TCX trackpoints) ────────────

// samples: seconds since the previous sample, and watts (null when not recorded).
export function fromPowerSamples(kind: WorkoutKind, sport: WorkoutSport, name: string, source: WorkoutSummary["source"],
  samples: { sec: number; w: number | null }[], ftp: number | null, totals?: { sec?: number }): WorkoutSummary {
  const notes: string[] = [];
  const withPower = samples.filter((s) => s.w != null);
  const hasPower = withPower.length > samples.length / 2;
  const totalSec = totals?.sec ?? samples.reduce((a, s) => a + s.sec, 0);
  if (!hasPower) return summarise(kind, sport, name, source, [{ sec: totalSec, pct: null }], notes);

  const powerSec = withPower.reduce((a, s) => a + s.sec, 0);
  const avgPower = Math.round(withPower.reduce((a, s) => a + s.w! * s.sec, 0) / powerSec);
  const kj = Math.round(withPower.reduce((a, s) => a + s.w! * s.sec, 0) / 1000);

  // Normalised power: 30-second rolling average of 1-second power, to the fourth power.
  const perSecond: number[] = [];
  for (const s of samples) for (let i = 0; i < Math.round(s.sec); i++) perSecond.push(s.w ?? 0);
  let np: number | null = null;
  if (perSecond.length >= 30) {
    let sum = 0, acc = 0, n = 0;
    for (let i = 0; i < perSecond.length; i++) {
      sum += perSecond[i];
      if (i >= 30) sum -= perSecond[i - 30];
      if (i >= 29) { acc += Math.pow(sum / 30, 4); n++; }
    }
    np = Math.pow(acc / n, 0.25);
  }
  if (!ftp) notes.push("Add your FTP to work out this ride's intensity.");
  // One-minute blocks as % of FTP, merged by zone.
  const steps: Step[] = [];
  for (let i = 0; i < perSecond.length; i += 60) {
    const chunk = perSecond.slice(i, i + 60);
    steps.push({ sec: chunk.length, pct: ftp ? chunk.reduce((a, w) => a + w, 0) / chunk.length / ftp : null });
  }
  return summarise(kind, sport, name, source, steps, notes, {
    avgPower, kj,
    intensityFactor: ftp && np ? Math.round((np / ftp) * 100) / 100 : null,
  });
}

// ── .fit (planned workouts and completed activities) ─────────────────────────

// The fields of a parsed FIT file this reader uses (from fit-file-parser, mode "list").
export interface FitData {
  file_id?: { type?: string };
  sport?: { sport?: string; name?: string }[] | { sport?: string; name?: string };
  sessions?: { sport?: string; total_timer_time?: number; total_elapsed_time?: number }[];
  records?: { timestamp?: string | Date; power?: number }[];
  workout?: { wkt_name?: string; sport?: string } | { wkt_name?: string; sport?: string }[];
  workout_step?: { duration_type?: string; duration_value?: number; duration_time?: number; target_type?: string; target_value?: number; custom_target_value_low?: number; custom_target_value_high?: number; custom_target_power_low?: number; custom_target_power_high?: number }[];
}

// Adapts fit-file-parser's output (mode "list"). Its top-level workout_step keeps only the last
// step, so the steps come from `messages`, which keeps every message in order.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fitDataFrom(parsed: any): FitData {
  const m = parsed?.messages ?? {};
  return {
    file_id: (m.file_id ?? parsed?.file_ids)?.[0],
    workout: m.workout?.[0] ?? parsed?.workout,
    workout_step: m.workout_step ?? (parsed?.workout_step ? [parsed.workout_step] : []),
    sessions: parsed?.sessions,
    records: parsed?.records,
    sport: parsed?.sports?.[0] ?? m.sport?.[0],
  };
}

const fitSport = (s: string | undefined): WorkoutSport => (s === "cycling" ? "bike" : s === "running" ? "run" : "other");
const one = <T,>(x: T | T[] | undefined): T | undefined => (Array.isArray(x) ? x[0] : x);

// FIT power targets: 0–1000 = % of FTP, above 1000 = watts + 1000.
function fitPowerPct(v: number | undefined, ftp: number | null): number | null {
  if (v == null || v <= 0) return null;
  if (v <= 1000) return v / 100;
  return ftp ? (v - 1000) / ftp : null;
}

export function fromFit(fit: FitData, ftp: number | null): WorkoutSummary {
  const steps = fit.workout_step ?? [];
  const isWorkout = fit.file_id?.type === "workout" || (steps.length > 0 && !(fit.records?.length));
  if (isWorkout) {
    const wkt = one(fit.workout);
    const sport = fitSport(wkt?.sport);
    const out: Step[] = [];
    const notes: string[] = [];
    let openEnded = false, wattsWithoutFtp = false;
    const expand = (from: number, to: number) => {
      for (let i = from; i < to; i++) {
        const s = steps[i];
        if (s.duration_type === "repeat_until_steps_cmplt") {
          const start = s.duration_value ?? 0;
          if (start >= i) continue; // malformed: a repeat must point back to an earlier step
          const reps = (s.target_value ?? 1) - 1; // the steps already ran once
          for (let r = 0; r < reps; r++) expand(start, i);
          continue;
        }
        const sec = s.duration_type === "time" ? (s.duration_time ?? (s.duration_value != null ? s.duration_value / 1000 : 0)) : 0;
        if (s.duration_type !== "time") openEnded = true;
        let pct: number | null = null;
        if (s.target_type === "power") {
          const lo = s.custom_target_power_low ?? s.custom_target_value_low, hi = s.custom_target_power_high ?? s.custom_target_value_high;
          const pLo = fitPowerPct(lo, ftp), pHi = fitPowerPct(hi, ftp);
          pct = pLo != null && pHi != null ? (pLo + pHi) / 2 : pLo ?? pHi;
          if (pct == null && ((lo ?? 0) > 1000 || (hi ?? 0) > 1000)) wattsWithoutFtp = true;
        }
        out.push({ sec, pct });
      }
    };
    expand(0, steps.length);
    if (openEnded) notes.push("Some steps end on distance or a lap press, not time, so the total duration is a minimum.");
    if (wattsWithoutFtp) notes.push("Some targets are in watts; add your FTP to read them.");
    return summarise("planned", sport, wkt?.wkt_name ?? "", "fit", out, notes);
  }

  const session = fit.sessions?.[0];
  const sport = fitSport(session?.sport ?? one(fit.sport)?.sport);
  const records = (fit.records ?? []).filter((r) => r.timestamp != null);
  if (records.length < 2) return summarise("completed", sport, "", "fit", [{ sec: session?.total_timer_time ?? 0, pct: null }], []);
  const t = (r: { timestamp?: string | Date }) => new Date(r.timestamp as string).getTime();
  const samples = records.map((r, i) => ({ sec: i === 0 ? 0 : Math.min(30, Math.max(0, (t(r) - t(records[i - 1])) / 1000)), w: typeof r.power === "number" ? r.power : null }));
  return fromPowerSamples("completed", sport, "", "fit", samples, ftp, { sec: session?.total_timer_time });
}

// Short text of the structure, for the plan prompt and the results page, e.g.
// "0:00–0:15 55% FTP · 0:15–1:15 92% FTP · …".
export function describeBlocks(blocks: WorkoutBlock[]): string {
  let t = 0;
  const hm = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")}`;
  return blocks.map(([min, pct]) => {
    const s = `${hm(t)}–${hm(t + min)} ${pct == null ? "no target" : `${pct}% FTP`}`;
    t += min;
    return s;
  }).join(" · ");
}
