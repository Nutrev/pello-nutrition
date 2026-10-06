// lib/planner.ts
// Planner inputs and prompt building, shared by the quiz page and /api/plan.
// The prompt is built on the server so the API can't be used as an open proxy to Claude.

import { STANDARD_CHOICES, STANDARD_CHOICE_IDS, type StandardChoice } from "./quality-standards";
import { describeBlocks, MAX_BLOCKS, type WorkoutBlock, type IntensityBasis } from "./workout-file";

// ── TYPES ─────────────────────────────────────────────────────

export type PlanMode = "event" | "outcome";
export type EventType = "road-cycling" | "gravel" | "triathlon" | "running" | "trail-running" | "gym" | "training-day" | "recovery";
export type OutcomeType = "finish-first-marathon" | "finish-first-triathlon" | "improve-cycling-endurance" | "improve-recovery" | "build-muscle-endurance" | "lose-weight-perform" | "race-faster" | "gut-health";
export type Intensity = "easy" | "moderate" | "hard" | "race";
export type CaffeinePreference = "none" | "moderate" | "high";
export type DietaryRestriction = "vegan" | "gluten-free" | "dairy-free";
export type FormatPreference = "Energy Gel" | "Energy Chew" | "Energy Bar" | "Carbohydrate Mix" | "Hydration";
export type Retailer = "REI" | "Amazon" | "The Feed" | "Running Warehouse";
export type WeightUnit = "kg" | "lbs";
export type Sex = "male" | "female";

// A summary of an uploaded workout file (lib/workout-file.ts). Pello Pro.
export interface WorkoutPlanInput {
  kind: "planned" | "completed";
  sport: "bike" | "run" | "other";
  name: string;
  durationMin: number;
  basis: IntensityBasis | null;   // what the block percentages and intensityFactor are relative to
  intensityFactor: number | null;
  blocks: WorkoutBlock[];
  avgPower: number | null;
  kj: number | null;
}

export interface PlannerInputs {
  mode: PlanMode;
  eventType: EventType | null;
  outcomeType: OutcomeType | null;
  durationHours: number;
  intensity: Intensity;
  caffeinePreference: CaffeinePreference;
  budget: number;
  dietary: DietaryRestriction[];
  formats: FormatPreference[];
  retailers: Retailer[];          // no longer offered (no per-retailer stock data); kept so saved plans still parse
  standards: StandardChoice[];   // quality standards every recommended product must meet
  workout?: WorkoutPlanInput | null;
  weightKg: number;              // always kg; weightUnit only changes how it's shown
  weightUnit: WeightUnit;
  age: number;
  sex: Sex;
  trainingDaysPerWeek: number;
}

export const DEFAULT_INPUTS: PlannerInputs = {
  mode: "event", eventType: null, outcomeType: null,
  durationHours: 2, intensity: "moderate", caffeinePreference: "moderate",
  budget: 50, dietary: [], formats: [], retailers: [], standards: [],
  weightKg: 70, weightUnit: "kg", age: 30, sex: "male", trainingDaysPerWeek: 4,
};

// ── CONSTANTS ─────────────────────────────────────────────────

export const EVENT_TYPES: { id: EventType; label: string; desc: string }[] = [
  { id: "road-cycling", label: "Road cycling", desc: "Sportive, gran fondo, road race" },
  { id: "gravel", label: "Gravel / MTB", desc: "Gravel race, mountain bike event" },
  { id: "triathlon", label: "Triathlon", desc: "Sprint, Olympic, 70.3, Ironman" },
  { id: "running", label: "Running", desc: "5K, 10K, half marathon, marathon" },
  { id: "trail-running", label: "Trail running", desc: "Trail race, ultra marathon" },
  { id: "gym", label: "Gym / Strength", desc: "Lifting, CrossFit, resistance training" },
  { id: "training-day", label: "Training day", desc: "General training session" },
  { id: "recovery", label: "Recovery day", desc: "Post-race or hard session recovery" },
];

export const OUTCOME_TYPES: { id: OutcomeType; label: string; desc: string; timeframe: string }[] = [
  { id: "finish-first-marathon", label: "Finish my first marathon", desc: "Complete 26.2 miles feeling strong", timeframe: "Race-day + training nutrition" },
  { id: "finish-first-triathlon", label: "Finish my first triathlon", desc: "Swim, bike, run nutrition strategy", timeframe: "Multi-sport fueling" },
  { id: "improve-cycling-endurance", label: "Improve cycling endurance", desc: "Go longer and stronger on the bike", timeframe: "Training + event nutrition" },
  { id: "improve-recovery", label: "Improve my recovery", desc: "Bounce back faster between sessions", timeframe: "Daily recovery protocol" },
  { id: "build-muscle-endurance", label: "Build muscle while training", desc: "Strength + endurance combined goals", timeframe: "Hybrid nutrition strategy" },
  { id: "lose-weight-perform", label: "Lose weight and perform", desc: "Body composition without losing power", timeframe: "Periodized nutrition" },
  { id: "race-faster", label: "Race faster", desc: "Optimize nutrition for peak performance", timeframe: "Performance nutrition" },
  { id: "gut-health", label: "Fix my gut health", desc: "Reduce GI issues during training", timeframe: "GI protocol" },
];

export const INTENSITY_OPTIONS = [
  { id: "easy" as Intensity, label: "Easy / recovery", desc: "Conversational pace, Z1-Z2", carbsPerHr: 30 },
  { id: "moderate" as Intensity, label: "Moderate", desc: "Steady effort, Z2-Z3", carbsPerHr: 50 },
  { id: "hard" as Intensity, label: "Hard", desc: "Threshold / tempo, Z3-Z4", carbsPerHr: 70 },
  { id: "race" as Intensity, label: "Race pace", desc: "Maximum effort, Z4-Z5", carbsPerHr: 90 },
];

// ── HELPERS ───────────────────────────────────────────────────

export const KG_PER_LB = 1 / 2.205;

// Body weight in the athlete's chosen unit, e.g. "70kg" or "154lbs".
export function formatWeight(weightKg: number, unit: WeightUnit): string {
  return unit === "lbs" ? `${Math.round(weightKg * 2.205)}lbs` : `${Math.round(weightKg)}kg`;
}

export function carbsNeeded(durationHours: number, intensity: Intensity): number {
  const rates: Record<Intensity, number> = { easy: 30, moderate: 50, hard: 70, race: 90 };
  if (durationHours < 1) return Math.round(rates[intensity] * durationHours * 0.5);
  return Math.round(rates[intensity] * durationHours);
}

// Estimated sodium lost in sweat (mg). Sweat rates are liters per hour for a 70kg athlete,
// scaled by body weight; 500mg of sodium per liter of sweat. An average, not a personal figure
// (a sweat test gives the real one).
export function sodiumNeeded(durationHours: number, intensity: Intensity, weightKg: number, sex: Sex = "male"): number {
  const sweatLitresPerHour: Record<Intensity, number> = { easy: 0.5, moderate: 0.8, hard: 1.1, race: 1.4 };
  const SODIUM_MG_PER_LITRE = 500;
  // Women sweat less on average, so lose roughly 15% less sodium.
  const sexFactor = sex === "female" ? 0.85 : 1;
  const litres = sweatLitresPerHour[intensity] * (weightKg / 70) * durationHours;
  return Math.round(litres * SODIUM_MG_PER_LITRE * sexFactor);
}

// ── VALIDATION ────────────────────────────────────────────────

const PLAN_MODES: PlanMode[] = ["event", "outcome"];
const CAFFEINE_PREFERENCES: CaffeinePreference[] = ["none", "moderate", "high"];
const DIETARY_RESTRICTIONS: DietaryRestriction[] = ["vegan", "gluten-free", "dairy-free"];
const FORMAT_PREFERENCES: FormatPreference[] = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];
const RETAILERS: Retailer[] = ["REI", "Amazon", "The Feed", "Running Warehouse"];
const WEIGHT_UNITS: WeightUnit[] = ["kg", "lbs"];
const SEXES: Sex[] = ["male", "female"];

function oneOf<T>(value: unknown, allowed: readonly T[]): value is T {
  return allowed.includes(value as T);
}

function listOf<T>(value: unknown, allowed: readonly T[]): T[] | null {
  if (!Array.isArray(value) || !value.every((v) => oneOf(v, allowed))) return null;
  return Array.from(new Set(value as T[]));
}

function numberIn(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

// Checks an uploaded-workout summary. undefined = invalid, null = none.
function parseWorkout(raw: unknown): WorkoutPlanInput | null | undefined {
  if (raw == null) return null;
  if (typeof raw !== "object") return undefined;
  const w = raw as Record<string, unknown>;
  if (w.kind !== "planned" && w.kind !== "completed") return undefined;
  if (w.sport !== "bike" && w.sport !== "run" && w.sport !== "other") return undefined;
  const basis = w.basis == null ? null : (["power", "pace", "hr", "relative"] as const).find((b) => b === w.basis);
  if (basis === undefined) return undefined;
  const durationMin = numberIn(w.durationMin, 1, 24 * 60);
  const intensityFactor = w.intensityFactor == null ? null : numberIn(w.intensityFactor, 0.2, 2);
  const avgPower = w.avgPower == null ? null : numberIn(w.avgPower, 0, 2500);
  const kj = w.kj == null ? null : numberIn(w.kj, 0, 50000);
  if (durationMin === null || intensityFactor === undefined || avgPower === undefined || kj === undefined) return undefined;
  if (w.intensityFactor != null && intensityFactor === null) return undefined;
  if (!Array.isArray(w.blocks) || w.blocks.length > MAX_BLOCKS) return undefined;
  const blocks: WorkoutBlock[] = [];
  for (const b of w.blocks) {
    if (!Array.isArray(b) || b.length !== 2) return undefined;
    const min = numberIn(b[0], 0, 24 * 60);
    const pct = b[1] == null ? null : numberIn(b[1], 0, 300);
    if (min === null || (b[1] != null && pct === null)) return undefined;
    blocks.push([Math.round(min * 10) / 10, pct == null ? null : Math.round(pct)]);
  }
  // The name goes into the prompt, so keep only plain characters.
  const name = typeof w.name === "string" ? w.name.replace(/[^A-Za-z0-9\u00C0-\u024F\s\-.,:()/&+'#%]/g, "").replace(/\s+/g, " ").trim().slice(0, 60) : "";
  return { kind: w.kind, sport: w.sport, name: name || "Uploaded workout", durationMin: Math.round(durationMin), basis, intensityFactor: basis === "relative" ? null : intensityFactor, blocks, avgPower, kj };
}

// Checks untrusted request data from the browser. Returns null if anything is out of range.
export function parsePlannerInputs(raw: unknown): PlannerInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (!oneOf(r.mode, PLAN_MODES)) return null;
  const eventType = r.eventType ?? null;
  const outcomeType = r.outcomeType ?? null;
  if (eventType !== null && !EVENT_TYPES.some((e) => e.id === eventType)) return null;
  if (outcomeType !== null && !OUTCOME_TYPES.some((o) => o.id === outcomeType)) return null;
  if (r.mode === "event" ? eventType === null : outcomeType === null) return null;
  if (!INTENSITY_OPTIONS.some((i) => i.id === r.intensity)) return null;
  if (!oneOf(r.caffeinePreference, CAFFEINE_PREFERENCES)) return null;
  if (!oneOf(r.weightUnit, WEIGHT_UNITS) || !oneOf(r.sex, SEXES)) return null;

  const durationHours = numberIn(r.durationHours, 0.25, 24);
  const budget = numberIn(r.budget, 0, 10000);
  const weightKg = numberIn(r.weightKg, 20, 300);
  const dietary = listOf(r.dietary, DIETARY_RESTRICTIONS);
  const formats = listOf(r.formats, FORMAT_PREFERENCES);
  const retailers = listOf(r.retailers, RETAILERS);
  // Optional, so plans saved before standards existed still parse.
  const standards = r.standards === undefined ? [] : listOf(r.standards, STANDARD_CHOICE_IDS);
  const workout = parseWorkout(r.workout);
  if (workout === undefined) return null;
  const age = numberIn(r.age, 16, 70);
  const trainingDaysPerWeek = numberIn(r.trainingDaysPerWeek, 1, 7);
  if (durationHours === null || budget === null || weightKg === null || !dietary || !formats || !retailers || !standards) return null;
  if (age === null || trainingDaysPerWeek === null || !Number.isInteger(trainingDaysPerWeek)) return null;

  return {
    mode: r.mode,
    eventType: eventType as EventType | null,
    outcomeType: outcomeType as OutcomeType | null,
    durationHours,
    intensity: r.intensity as Intensity,
    caffeinePreference: r.caffeinePreference,
    budget,
    dietary,
    formats,
    retailers,
    standards,
    workout,
    weightKg,
    weightUnit: r.weightUnit,
    age: Math.round(age),
    sex: r.sex,
    trainingDaysPerWeek,
  };
}

// ── PROMPT ────────────────────────────────────────────────────

// The uploaded workout, if any: its structure, and how to use it in the plan.
function workoutSection(inputs: PlannerInputs): string {
  const w = inputs.workout;
  if (!w) return "";
  const facts = [
    `- Workout: "${w.name}", ${w.durationMin} minutes${w.sport === "bike" ? ", cycling" : w.sport === "run" ? ", running" : ""}`,
    w.intensityFactor != null && w.basis === "power" ? `- Session intensity factor: ${w.intensityFactor} (normalized power as a fraction of FTP)` : null,
    w.intensityFactor != null && w.basis === "pace" ? `- Normalized pace: ${Math.round(w.intensityFactor * 100)}% of threshold pace (as speed, weighted towards the hardest efforts)` : null,
    w.intensityFactor != null && w.basis === "hr" ? `- Average heart rate: ${Math.round(w.intensityFactor * 100)}% of threshold heart rate` : null,
    w.blocks.some(([, p]) => p != null) ? `- Structure: ${describeBlocks(w.blocks, w.basis)}` : null,
    w.avgPower != null ? `- Average power: ${w.avgPower} W` : null,
    w.kj != null ? `- Work done: ${w.kj} kJ` : null,
  ].filter(Boolean).join("\n");
  return w.kind === "planned"
    ? `
PLANNED WORKOUT (from the athlete's uploaded workout file):
${facts}
Time the DURING EVENT schedule to this structure, using clock times from the start. Where practical, schedule carbs and fluid in the easier blocks just before the hardest efforts rather than during them.
`
    : `
COMPLETED WORKOUT (from the athlete's uploaded activity file; the session is already finished):
${facts}
Under PRE-EVENT, briefly say how to fuel before a session like this next time. Under DURING EVENT, state what this session called for (carbs per hour, fluid and sodium) so the athlete can compare it with what they actually took. Under POST-EVENT, give recovery nutrition for the next 24 hours, starting now.
`;
}

function standardsLine(inputs: PlannerInputs): string {
  return inputs.standards?.length ? inputs.standards.map((id) => STANDARD_CHOICES.find((c) => c.id === id)?.label ?? id).join(", ") : "none";
}

export function buildPlanPrompt(inputs: PlannerInputs): string {
  const isEvent = inputs.mode === "event";
  const outcomeData = OUTCOME_TYPES.find(o => o.id === inputs.outcomeType);
  const eventData = EVENT_TYPES.find(e => e.id === inputs.eventType);
  const carbTarget = carbsNeeded(inputs.durationHours, inputs.intensity);
  const sodiumTarget = sodiumNeeded(inputs.durationHours, inputs.intensity, inputs.weightKg, inputs.sex);
  const weight = inputs.weightUnit === "lbs"
    ? `${formatWeight(inputs.weightKg, "lbs")} (${Math.round(inputs.weightKg)}kg)`
    : formatWeight(inputs.weightKg, "kg");
  const athlete = `- Age: ${inputs.age}
- Sex: ${inputs.sex}
- Training days per week: ${inputs.trainingDaysPerWeek}`;
  const personalise = `Tailor amounts to this athlete's age, sex, body weight and training load only where sports nutrition evidence supports a difference (for example, older athletes' higher protein needs for recovery, or more recovery emphasis with more training days). State quantities in ${inputs.weightUnit === "lbs" ? "pounds and ounces where natural, with metric in brackets" : "metric units"}.`;

  return isEvent
    ? `You are Pello's expert sports nutrition AI. Generate a complete, science-backed nutrition plan.

ATHLETE PROFILE:
- Event: ${eventData?.label}
- Duration: ${inputs.durationHours} hours
- Intensity: ${inputs.intensity}
- Body weight: ${weight}
${athlete}
- Budget: $${inputs.budget}
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}
- Quality standards required: ${standardsLine(inputs)}
${workoutSection(inputs)}
CALCULATED TARGETS:
- Total carbs: ${carbTarget}g (${INTENSITY_OPTIONS.find(i => i.id === inputs.intensity)?.carbsPerHr}g/hr)
- Total sodium: ${sodiumTarget}mg${inputs.sex === "female" ? " (adjusted 15% lower for average female sweat sodium losses)" : ""}
Use these totals exactly in DURING EVENT and TOTALS; don't recalculate them.

${personalise}

Use ONLY these exact section headers. No markdown, no tables, no asterisks, no hashtags. Plain text only.

PRE-EVENT
List specific foods with quantities and carb counts. Use this format:
White rice or pasta — 200g cooked — 55g carbs
Banana — 1 medium — 25g carbs
Then add timing notes as plain sentences.

DURING EVENT
Write a clear per-hour fueling schedule as plain sentences. Example:
Start fueling at 30 minutes with 1 gel (25g carbs).
Take 1 gel every 25 minutes after that.
Sip 150-200ml water with each gel.

POST-EVENT
Three clear windows as plain text:
0-30 minutes: specific food and amounts
30-120 minutes: specific food and amounts
Overnight: specific recommendations

TOTALS
Total carbs: Xg
Total sodium: Xmg
Total caffeine: Xmg
Estimated product cost: $X

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`

    : `You are Pello's expert sports nutrition AI. Generate a complete outcome-based nutrition protocol.

ATHLETE GOAL: ${outcomeData?.label}
- Body weight: ${weight}
${athlete}
- Budget: $${inputs.budget}/month
- Caffeine: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}
- Quality standards required: ${standardsLine(inputs)}

${personalise} Calibrate recovery and supplement recommendations to ${inputs.trainingDaysPerWeek} training day${inputs.trainingDaysPerWeek === 1 ? "" : "s"} a week: more training days need more emphasis on recovery nutrition.

Use ONLY these exact section headers. No markdown, no tables, no asterisks. Plain text only.

PRE-EVENT
Daily nutrition habits before training as plain sentences. Specific foods, timing and quantities.

DURING EVENT
Intra-training nutrition as plain sentences. What to take, when and how much.

POST-EVENT
Three windows as plain text:
0-30 minutes: specific recommendations
30-120 minutes: specific recommendations
Daily habits: ongoing recovery nutrition

TOTALS
Daily protein target: Xg
Daily carb target: Xg
Monthly supplement budget: $X

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`;
}
