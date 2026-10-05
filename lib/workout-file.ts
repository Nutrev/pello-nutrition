// lib/workout-file.ts
// Reads workout files in the browser and turns them into a short summary for the planner:
// planned structured workouts (.zwo, .erg, .mrc, .fit) and completed activities (.fit, .tcx),
// for cycling and running. Files never leave the device; only this summary (duration and
// intensity blocks, no GPS or timestamps) is sent with a plan request.
//
// Intensity is a % of the athlete's own threshold, and Pello only works it out when it can:
// - Cycling: power ÷ FTP, as normalised power (the intensity factor).
// - Running: pace ÷ threshold pace (as speed), normalised the same way as power (on the flat,
//   running speed tracks effort much as power does); or heart rate ÷ threshold heart rate, averaged.
//   Completed runs use heart rate when there is some and a threshold HR is set, because pace
//   understates hills; otherwise moving pace, with a note that hills aren't accounted for.
// Anything else keeps its duration and the athlete chooses the intensity. Pello never guesses it.

import type { Intensity } from "./planner";

export type WorkoutKind = "planned" | "completed";
export type WorkoutSport = "bike" | "run" | "other";
// What the percentages are relative to. "relative" = a reference the file doesn't define
// (Zwift run workouts are set against a chosen race pace), so no intensity is worked out.
export type IntensityBasis = "power" | "pace" | "hr" | "relative";

// A block of the workout: minutes and intensity as a % of the basis (null when unknown).
export type WorkoutBlock = [minutes: number, pct: number | null];

export interface Thresholds {
  ftp: number | null;            // watts
  paceSecPerKm: number | null;   // threshold pace
  thresholdHr: number | null;    // bpm
}

export interface WorkoutSummary {
  kind: WorkoutKind;
  sport: WorkoutSport;
  name: string;
  source: "zwo" | "erg" | "mrc" | "fit" | "tcx";
  durationMin: number;
  basis: IntensityBasis | null;    // what blocks and intensityFactor are relative to
  blocks: WorkoutBlock[];          // in order, merged, at most MAX_BLOCKS
  intensityFactor: number | null;  // power/pace: normalised ÷ threshold; HR: average ÷ threshold
  avgPower: number | null;         // completed rides with power
  kj: number | null;               // work done, completed rides with power
  notes: string[];                 // what couldn't be read, shown to the athlete
}

export const MAX_BLOCKS = 120;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

// Session intensity → the planner's levels (easy Z1–Z2, moderate Z2–Z3, hard Z3–Z4, race Z4–Z5).
// Power uses the standard power zones (Z2 to 75%, Z3 76–90%, Z4 91–105% of FTP). Pace and heart
// rate use Joe Friel's running zones as published by TrainingPeaks: pace as % of threshold speed
// (Z2 78–88%, Z3 88–94%, Z4 95–101%) and heart rate as % of threshold HR (Z2 85–89%, Z3 90–94%,
// Z4 95–99%).
export const INTENSITY_BANDS: Record<"power" | "pace" | "hr", { id: Intensity; max: number; label: string }[]> = {
  power: [
    { id: "easy", max: 0.75, label: "under 75% of FTP (Z1–Z2)" },
    { id: "moderate", max: 0.85, label: "75–85% of FTP (Z2–Z3)" },
    { id: "hard", max: 0.95, label: "85–95% of FTP (Z3–Z4)" },
    { id: "race", max: Infinity, label: "95% of FTP or more (Z4–Z5)" },
  ],
  pace: [
    { id: "easy", max: 0.88, label: "under 88% of threshold pace (Z1–Z2)" },
    { id: "moderate", max: 0.91, label: "88–91% of threshold pace (Z3)" },
    { id: "hard", max: 0.98, label: "91–98% of threshold pace (Z3–Z4)" },
    { id: "race", max: Infinity, label: "98% of threshold pace or more (Z4–Z5)" },
  ],
  hr: [
    { id: "easy", max: 0.89, label: "under 89% of threshold heart rate (Z1–Z2)" },
    { id: "moderate", max: 0.92, label: "89–92% of threshold heart rate (Z3)" },
    { id: "hard", max: 0.97, label: "92–97% of threshold heart rate (Z3–Z4)" },
    { id: "race", max: Infinity, label: "97% of threshold heart rate or more (Z4–Z5)" },
  ],
};

export function intensityFrom(value: number | null, basis: IntensityBasis | null): Intensity | null {
  if (value == null || !basis || basis === "relative") return null;
  return INTENSITY_BANDS[basis].find((b) => value < b.max)!.id;
}

export function intensityLabel(w: Pick<WorkoutSummary, "intensityFactor" | "basis">): string | null {
  const id = intensityFrom(w.intensityFactor, w.basis);
  if (!id || !w.basis || w.basis === "relative") return null;
  const band = INTENSITY_BANDS[w.basis].find((b) => b.id === id)!;
  const pct = Math.round(w.intensityFactor! * 100);
  return w.basis === "power" ? `Intensity factor ${w.intensityFactor}: ${band.label}`
    : w.basis === "pace" ? `Normalised pace ${pct}% of threshold (weighted towards the hardest efforts): ${band.label}`
    : `Average heart rate ${pct}% of threshold: ${band.label}`;
}

export const BASIS_UNIT: Record<IntensityBasis, string> = {
  power: "% FTP", pace: "% threshold pace", hr: "% threshold HR", relative: "% of the file's reference pace",
};

// ── Building blocks ──────────────────────────────────────────────────────────

interface Step { sec: number; pct: number | null } // pct as a fraction of the basis

const clean = (s: string) => s.replace(/[^A-Za-z0-9À-ɏ\s\-.,:()/&+'#%]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

// Session intensity from steps. Power and pace: fourth-power mean (normalised). Heart rate:
// time-weighted average. Null if under half the time has a known intensity.
function sessionIntensity(steps: Step[], basis: IntensityBasis | null): number | null {
  if (!basis || basis === "relative") return null;
  const known = steps.filter((s) => s.pct != null && s.sec > 0);
  const total = steps.reduce((a, s) => a + s.sec, 0);
  const knownSec = known.reduce((a, s) => a + s.sec, 0);
  if (!total || knownSec < total / 2) return null;
  const v = basis === "power" || basis === "pace"
    ? Math.pow(known.reduce((a, s) => a + Math.pow(s.pct!, 4) * s.sec, 0) / knownSec, 0.25)
    : known.reduce((a, s) => a + s.pct! * s.sec, 0) / knownSec;
  return Math.round(v * 100) / 100;
}

const ZONE_EDGES: Record<IntensityBasis, number[]> = {
  power: [0.56, 0.76, 0.91, 1.06, 1.21],
  pace: [0.78, 0.88, 0.95, 1.01],
  hr: [0.85, 0.90, 0.95, 1.0],
  relative: [0.56, 0.76, 0.91, 1.06, 1.21],
};
export function zoneOf(pct: number | null, basis: IntensityBasis | null): number {
  if (pct == null) return -1;
  const edges = ZONE_EDGES[basis ?? "power"];
  const i = edges.findIndex((e) => pct < e);
  return i === -1 ? edges.length + 1 : i + 1;
}

// Merges steps into blocks: neighbours in the same zone join up, then the closest neighbours are
// merged until there are at most MAX_BLOCKS.
function toBlocks(steps: Step[], basis: IntensityBasis | null, mergeByZone: boolean): WorkoutBlock[] {
  const merged: { sec: number; work: number; knownSec: number; zone: number }[] = [];
  for (const s of steps) {
    if (s.sec <= 0) continue;
    const zone = zoneOf(s.pct, basis);
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

function summarise(kind: WorkoutKind, sport: WorkoutSport, name: string, source: WorkoutSummary["source"], steps: Step[],
  basis: IntensityBasis | null, notes: string[], extra?: { avgPower?: number | null; kj?: number | null; intensityFactor?: number | null }): WorkoutSummary {
  const sec = steps.reduce((a, s) => a + s.sec, 0);
  if (sec < 60) throw new Error("This file doesn't contain a workout of at least a minute.");
  const hasKnown = steps.some((s) => s.pct != null);
  const b = hasKnown ? basis : null;
  const intensityFactor = extra?.intensityFactor !== undefined ? extra.intensityFactor : sessionIntensity(steps, b);
  if (intensityFactor == null && !notes.some((n) => /FTP|threshold|reference/.test(n))) {
    notes.push(kind === "planned"
      ? "This file has no targets Pello can read, so choose the intensity yourself in the next step."
      : "This file has no power, pace or heart-rate data Pello can use, so choose the intensity yourself in the next step.");
  }
  return {
    kind, sport, name: clean(name) || "Uploaded workout", source,
    durationMin: Math.round(sec / 60),
    basis: b,
    blocks: toBlocks(steps, b, kind === "completed"),
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
        if (!notes.includes("Free-ride sections have no target.")) notes.push("Free-ride sections have no target.");
        break;
    }
  }
  if (sport === "run") {
    // Zwift run targets are relative to a reference race pace that isn't in the file.
    notes.push("Run workouts from Zwift set targets against a reference race pace that isn't in the file, so choose the intensity yourself in the next step.");
    return summarise("planned", sport, name, "zwo", steps, "relative", notes, { intensityFactor: null });
  }
  return summarise("planned", sport, name, "zwo", steps, "power", notes);
}

// ── .erg / .mrc (TrainingPeaks, TrainerRoad and others; cycling power) ───────

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
  return summarise("planned", "bike", name, source, steps, "power", []);
}

// ── Completed activities from samples (FIT records or TCX trackpoints) ───────

// One sample: seconds since the previous sample, and what was recorded (null when not).
export interface Sample { sec: number; w: number | null; speed: number | null; hr: number | null }

function perSecond<T>(samples: Sample[], pick: (s: Sample) => T): T[] {
  const out: T[] = [];
  for (const s of samples) for (let i = 0; i < Math.round(s.sec); i++) out.push(pick(s));
  return out;
}

function minuteSteps(values: (number | null)[], scale: number | null): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < values.length; i += 60) {
    const chunk = values.slice(i, i + 60);
    const known = chunk.filter((v): v is number => v != null);
    steps.push({ sec: chunk.length, pct: scale && known.length >= chunk.length / 2 ? known.reduce((a, v) => a + v, 0) / known.length / scale : null });
  }
  return steps;
}

export function fromSamples(kind: WorkoutKind, sport: WorkoutSport, name: string, source: WorkoutSummary["source"],
  samples: Sample[], t: Thresholds, totals?: { sec?: number }): WorkoutSummary {
  const notes: string[] = [];
  const totalSec = totals?.sec ?? samples.reduce((a, s) => a + s.sec, 0);
  const share = (k: "w" | "speed" | "hr") => samples.filter((s) => s[k] != null).length / Math.max(1, samples.length);

  if (sport === "run") {
    const hasHr = share("hr") > 0.5, hasSpeed = share("speed") > 0.5;
    // Stopped time (speed under 0.5 m/s, where speed is recorded) doesn't count.
    const stopped = (s: Sample) => s.speed != null && s.speed < 0.5;
    if (hasHr && t.thresholdHr) {
      return summarise(kind, sport, name, source, minuteSteps(perSecond(samples, (s) => (stopped(s) ? null : s.hr)), t.thresholdHr), "hr", notes);
    }
    if (hasSpeed && t.paceSecPerKm) {
      const thresholdSpeed = 1000 / t.paceSecPerKm;
      const speeds = perSecond(samples, (s) => (stopped(s) ? null : s.speed));
      // Normalised like power: 30-second rolling average of moving speed, to the fourth power.
      const moving = speeds.filter((v): v is number => v != null);
      let normalised: number | null = null;
      if (moving.length >= 30) {
        let sum = 0, acc = 0, n = 0;
        for (let i = 0; i < moving.length; i++) {
          sum += moving[i];
          if (i >= 30) sum -= moving[i - 30];
          if (i >= 29) { acc += Math.pow(sum / 30, 4); n++; }
        }
        normalised = Math.pow(acc / n, 0.25);
      }
      notes.push(hasHr ? "Judged by pace; add your threshold heart rate to judge it by heart rate, which reflects hills." : "Judged by moving pace, which doesn't account for hills.");
      return summarise(kind, sport, name, source, minuteSteps(speeds, thresholdSpeed), "pace", notes,
        { intensityFactor: normalised ? Math.round((normalised / thresholdSpeed) * 100) / 100 : null });
    }
    if (hasHr) notes.push("Add your threshold heart rate to work out this run's intensity.");
    else if (hasSpeed) notes.push("Add your threshold pace to work out this run's intensity.");
    return summarise(kind, sport, name, source, [{ sec: totalSec, pct: null }], null, notes);
  }

  // Cycling (and other sports with power).
  if (share("w") <= 0.5) return summarise(kind, sport, name, source, [{ sec: totalSec, pct: null }], null, notes);
  const withPower = samples.filter((s) => s.w != null);
  const powerSec = withPower.reduce((a, s) => a + s.sec, 0);
  const work = withPower.reduce((a, s) => a + s.w! * s.sec, 0);
  const watts = perSecond(samples, (s) => s.w ?? 0);
  // Normalised power: 30-second rolling average of 1-second power, to the fourth power.
  let np: number | null = null;
  if (watts.length >= 30) {
    let sum = 0, acc = 0, n = 0;
    for (let i = 0; i < watts.length; i++) {
      sum += watts[i];
      if (i >= 30) sum -= watts[i - 30];
      if (i >= 29) { acc += Math.pow(sum / 30, 4); n++; }
    }
    np = Math.pow(acc / n, 0.25);
  }
  if (!t.ftp) notes.push("Add your FTP to work out this ride's intensity.");
  return summarise(kind, sport, name, source, minuteSteps(watts, t.ftp), t.ftp ? "power" : null, notes, {
    avgPower: Math.round(work / powerSec), kj: Math.round(work / 1000),
    intensityFactor: t.ftp && np ? Math.round((np / t.ftp) * 100) / 100 : null,
  });
}

// ── .tcx (Garmin Training Center, completed) ─────────────────────────────────

export function parseTcx(text: string, t: Thresholds): WorkoutSummary {
  const sportAttr = text.match(/<Activity\s+Sport="([^"]+)"/i)?.[1]?.toLowerCase() ?? "";
  const sport: WorkoutSport = sportAttr.startsWith("bik") ? "bike" : sportAttr.startsWith("run") ? "run" : "other";
  const pts = Array.from(text.matchAll(/<Trackpoint>([\s\S]*?)<\/Trackpoint>/gi)).map((m) => ({
    t: Date.parse(m[1].match(/<Time>([^<]+)<\/Time>/i)?.[1] ?? ""),
    w: Number(m[1].match(/<(?:\w+:)?Watts>([\d.]+)<\/(?:\w+:)?Watts>/i)?.[1] ?? NaN),
    hr: Number(m[1].match(/<HeartRateBpm>\s*<Value>(\d+)<\/Value>/i)?.[1] ?? NaN),
    d: Number(m[1].match(/<DistanceMeters>([\d.]+)<\/DistanceMeters>/i)?.[1] ?? NaN),
    v: Number(m[1].match(/<(?:\w+:)?Speed>([\d.]+)<\/(?:\w+:)?Speed>/i)?.[1] ?? NaN),
  })).filter((p) => Number.isFinite(p.t));
  if (pts.length < 2) {
    const sec = Array.from(text.matchAll(/<TotalTimeSeconds>([\d.]+)<\/TotalTimeSeconds>/gi)).reduce((a, m) => a + Number(m[1]), 0);
    return summarise("completed", sport, "", "tcx", [{ sec, pct: null }], null, []);
  }
  const samples: Sample[] = pts.map((p, i) => {
    const dt = i === 0 ? 0 : Math.min(30, Math.max(0, (p.t - pts[i - 1].t) / 1000));
    const dd = i > 0 && Number.isFinite(p.d) && Number.isFinite(pts[i - 1].d) && dt > 0 ? (p.d - pts[i - 1].d) / dt : NaN;
    const speed = Number.isFinite(p.v) ? p.v : dd;
    return { sec: dt, w: Number.isFinite(p.w) ? p.w : null, hr: Number.isFinite(p.hr) && p.hr > 0 ? p.hr : null, speed: Number.isFinite(speed) && speed >= 0 ? speed : null };
  });
  return fromSamples("completed", sport, "", "tcx", samples, t);
}

// ── .fit (planned workouts and completed activities) ─────────────────────────

// The fields of a parsed FIT file this reader uses (see fitDataFrom).
export interface FitData {
  file_id?: { type?: string };
  sport?: { sport?: string; name?: string };
  sessions?: { sport?: string; total_timer_time?: number; total_elapsed_time?: number }[];
  records?: { timestamp?: string | Date; power?: number; heart_rate?: number; speed?: number; enhanced_speed?: number }[];
  workout?: { wkt_name?: string; sport?: string };
  workout_step?: { duration_type?: string; duration_value?: number; duration_time?: number; target_type?: string; target_value?: number; custom_target_value_low?: number; custom_target_value_high?: number }[];
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

export function fromFit(fit: FitData, t: Thresholds): WorkoutSummary {
  const steps = fit.workout_step ?? [];
  const isWorkout = fit.file_id?.type === "workout" || (steps.length > 0 && !(fit.records?.length));
  if (isWorkout) return fromFitWorkout(fit, t);

  const session = fit.sessions?.[0];
  const sport = fitSport(session?.sport ?? fit.sport?.sport);
  const records = (fit.records ?? []).filter((r) => r.timestamp != null);
  if (records.length < 2) return summarise("completed", sport, "", "fit", [{ sec: session?.total_timer_time ?? 0, pct: null }], null, []);
  const ts = (r: { timestamp?: string | Date }) => new Date(r.timestamp as string).getTime();
  // Speed in m/s (fitDataFrom's caller parses with speedUnit "m/s").
  const ms = (v: number | undefined) => (typeof v === "number" ? v : null);
  const samples: Sample[] = records.map((r, i) => ({
    sec: i === 0 ? 0 : Math.min(30, Math.max(0, (ts(r) - ts(records[i - 1])) / 1000)),
    w: typeof r.power === "number" ? r.power : null,
    hr: typeof r.heart_rate === "number" && r.heart_rate > 0 ? r.heart_rate : null,
    speed: ms(r.enhanced_speed ?? r.speed),
  }));
  return fromSamples("completed", sport, "", "fit", samples, t, { sec: session?.total_timer_time });
}

// Planned FIT workouts. Raw target values, per the FIT profile:
//  power:       0–1000 = % of FTP; above 1000 = watts + 1000
//  speed:       metres per second × 1000
//  heart rate:  0–100 = % of max heart rate; above 100 = bpm + 100
function fromFitWorkout(fit: FitData, t: Thresholds): WorkoutSummary {
  const steps = fit.workout_step ?? [];
  const sport = fitSport(fit.workout?.sport);
  const out: (Step & { basis: IntensityBasis | null })[] = [];
  const notes = new Set<string>();
  let openEnded = false;
  const thresholdSpeed = t.paceSecPerKm ? 1000 / t.paceSecPerKm : null;

  const stepTarget = (s: (typeof steps)[number]): { pct: number | null; basis: IntensityBasis | null } => {
    const lo = s.custom_target_value_low, hi = s.custom_target_value_high;
    const mid = (f: (v: number) => number | null) => {
      const a = lo ? f(lo) : null, b = hi ? f(hi) : null;
      return a != null && b != null ? (a + b) / 2 : a ?? b;
    };
    if (s.target_type === "power") {
      if ((lo ?? 0) > 1000 || (hi ?? 0) > 1000) {
        if (!t.ftp) notes.add("Some targets are in watts; add your FTP to read them.");
        return { pct: t.ftp ? mid((v) => (v > 1000 ? (v - 1000) / t.ftp! : v / 100)) : null, basis: "power" };
      }
      return { pct: mid((v) => v / 100), basis: "power" };
    }
    if (s.target_type === "speed") {
      if (!thresholdSpeed) { notes.add("This workout has pace targets; add your threshold pace to read them."); return { pct: null, basis: "pace" }; }
      return { pct: mid((v) => v / 1000 / thresholdSpeed), basis: "pace" };
    }
    if (s.target_type === "heart_rate") {
      if ((lo ?? 0) <= 100 && (hi ?? 0) <= 100) {
        if (lo || hi) notes.add("Some heart-rate targets are a % of maximum heart rate, which Pello can't convert to your threshold, so they aren't used.");
        return { pct: null, basis: "hr" };
      }
      if (!t.thresholdHr) { notes.add("This workout has heart-rate targets; add your threshold heart rate to read them."); return { pct: null, basis: "hr" }; }
      return { pct: mid((v) => (v > 100 ? (v - 100) / t.thresholdHr! : null)), basis: "hr" };
    }
    return { pct: null, basis: null };
  };

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
      const { pct, basis } = stepTarget(s);
      out.push({ sec, pct, basis });
    }
  };
  expand(0, steps.length);
  if (openEnded) notes.add("Some steps end on distance or a lap press, not time, so the total duration is a minimum.");

  // Use the basis that covers the most time; steps on another basis count as unknown.
  const timeBy = new Map<IntensityBasis, number>();
  for (const s of out) if (s.basis && s.pct != null) timeBy.set(s.basis, (timeBy.get(s.basis) ?? 0) + s.sec);
  const basis = Array.from(timeBy.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const unified: Step[] = out.map((s) => ({ sec: s.sec, pct: s.basis === basis ? s.pct : null }));
  return summarise("planned", sport, fit.workout?.wkt_name ?? "", "fit", unified, basis, Array.from(notes));
}

// Short text of the structure, for the plan prompt and the results page, e.g.
// "0:00–0:15 55% FTP · 0:15–1:15 92% FTP · …".
export function describeBlocks(blocks: WorkoutBlock[], basis: IntensityBasis | null): string {
  let t = 0;
  const unit = basis ? BASIS_UNIT[basis] : "";
  const hm = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")}`;
  return blocks.map(([min, pct]) => {
    const s = `${hm(t)}–${hm(t + min)} ${pct == null ? "no target" : `${pct}${unit}`}`;
    t += min;
    return s;
  }).join(" · ");
}
