// lib/planner.ts
// Planner inputs and prompt building, shared by the quiz page and /api/plan.
// The prompt is built on the server so the API can't be used as an open proxy to Claude.

import { STANDARD_CHOICES, STANDARD_CHOICE_IDS, type StandardChoice } from "./quality-standards";
import { describeBlocks, MAX_BLOCKS, type WorkoutBlock, type IntensityBasis } from "./workout-file";
import { sodiumPlan, carbsPerHour, carbsDuring, fluidDuring, FLUID_ML_PER_HOUR, CONDITIONS, type Conditions } from "./fueling";

// ── TYPES ─────────────────────────────────────────────────────

export type PlanMode = "event" | "outcome" | "workout";
export type EventType = "road-cycling" | "gravel" | "triathlon" | "running" | "trail-running" | "gym" | "training-day" | "recovery";
export type OutcomeType = "finish-first-marathon" | "finish-first-triathlon" | "improve-cycling-endurance" | "improve-recovery" | "build-muscle-endurance" | "lose-weight-perform" | "race-faster" | "gut-health";
export type Intensity = "easy" | "moderate" | "hard" | "race";
export type CaffeinePreference = "none" | "moderate" | "high";
export type DietaryRestriction = "vegan" | "gluten-free" | "dairy-free";
export type FormatPreference = "Energy Gel" | "Energy Chew" | "Energy Bar" | "Carbohydrate Mix" | "Hydration";
export type Retailer = "REI" | "Amazon" | "The Feed" | "Running Warehouse";
export type WeightUnit = "kg" | "lbs";
export type Sex = "male" | "female";
// "Today's workout" planner only: when the session is, and when the athlete last ate.
export type SessionTime = "morning" | "midday" | "evening";
export type LastMeal = "under-1h" | "1-3h" | "over-3h" | "fasted";

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
  recordedWith?: string | null;  // Garmin device, credited where the workout is shown
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
  sessionTime?: SessionTime | null;  // "Today's workout" only
  lastMeal?: LastMeal | null;        // "Today's workout" only
  conditions?: Conditions | null;    // weather for the session; default mild
  saltySweater?: boolean | null;     // from the athlete profile
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

// Session types for the "Today's workout" planner. They reuse the event types (so targets,
// product matching and saved plans work the same) with labels for an everyday session.
export const WORKOUT_TYPES: { id: EventType; label: string; desc: string }[] = [
  { id: "road-cycling", label: "Ride", desc: "Road, gravel, mountain bike or indoor" },
  { id: "running", label: "Run", desc: "Road, track or treadmill" },
  { id: "trail-running", label: "Trail run or hike", desc: "Hills, trails, long days on foot" },
  { id: "triathlon", label: "Brick or multisport", desc: "Bike-run, swim-bike or similar" },
  { id: "gym", label: "Gym / strength", desc: "Lifting, CrossFit, classes" },
  { id: "training-day", label: "Other session", desc: "Swim, team sport or anything else" },
];

export const SESSION_TIMES: { id: SessionTime; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "midday", label: "Midday" },
  { id: "evening", label: "Evening" },
];

export const LAST_MEALS: { id: LastMeal; label: string; desc: string }[] = [
  { id: "under-1h", label: "Within the hour", desc: "A meal or snack less than an hour before" },
  { id: "1-3h", label: "1–3 hours before", desc: "A normal meal a little earlier" },
  { id: "over-3h", label: "More than 3 hours before", desc: "Lunch or breakfast was a while ago" },
  { id: "fasted", label: "Nothing yet today", desc: "Training before breakfast" },
];

export const OUTCOME_TYPES: { id: OutcomeType; label: string; desc: string; timeframe: string }[] = [
  { id: "finish-first-marathon", label: "Finish my first marathon", desc: "Complete 26.2 miles feeling strong", timeframe: "Race-day + training nutrition" },
  { id: "finish-first-triathlon", label: "Finish my first triathlon", desc: "Swim, bike, run nutrition strategy", timeframe: "Multi-sport fueling" },
  { id: "improve-cycling-endurance", label: "Improve cycling endurance", desc: "Go longer and stronger on the bike", timeframe: "Training + event nutrition" },
  { id: "improve-recovery", label: "Improve my recovery", desc: "Bounce back faster between sessions", timeframe: "Daily recovery protocol" },
  { id: "build-muscle-endurance", label: "Build muscle while training", desc: "Strength + endurance combined goals", timeframe: "Hybrid nutrition strategy" },
  { id: "lose-weight-perform", label: "Lose weight and perform", desc: "Body composition without losing power", timeframe: "Periodized nutrition" },
  { id: "race-faster", label: "Race faster", desc: "Fuel and recover for peak performance", timeframe: "Performance nutrition" },
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

// Carbs during the session (g), from lib/fueling.ts: the rate by intensity, capped by session
// length per the 2016 position stand. Every planner mode, the carb calculator and the race-day
// card use the same rule, so a session gets the same number everywhere.
export function sessionNeedsFuel(durationHours: number, intensity: Intensity): boolean {
  return carbsPerHour(durationHours, intensity) > 0;
}

export function sessionCarbTarget(inputs: Pick<PlannerInputs, "durationHours" | "intensity">): number {
  return carbsDuring(inputs.durationHours, inputs.intensity);
}

export function carbsNeeded(durationHours: number, intensity: Intensity): number {
  return carbsDuring(durationHours, intensity);
}

// Sodium to take during the session (mg), from lib/fueling.ts (Pello's sodium article ranges,
// by duration, conditions and whether the athlete is a salty sweater).
export function sodiumNeeded(inputs: Pick<PlannerInputs, "durationHours" | "intensity" | "conditions" | "saltySweater">): number {
  return sodiumPlan(inputs).total;
}

function fluidLine(inputs: PlannerInputs, label: string): string {
  const ml = fluidDuring(inputs.durationHours, inputs.conditions);
  if (!ml) return `- ${label}: drink to thirst; the session is short`;
  return `- ${label}: about ${ml}ml (${FLUID_ML_PER_HOUR[inputs.conditions ?? "mild"]}ml/hr, within a 400-800ml/hr starting range; drink to thirst and adjust for conditions)`;
}

function sodiumLine(inputs: PlannerInputs, label: string): string {
  const s = sodiumPlan(inputs);
  if (!s.total) return `- ${label}: none needed for a session under an hour`;
  return `- ${label}: ${s.total}mg (${s.perHour}mg/hr; ${s.basis.toLowerCase()} range ${s.perHourLow}-${s.perHourHigh}mg/hr${inputs.conditions ? `, ${inputs.conditions} conditions` : ""})`;
}

// ── VALIDATION ────────────────────────────────────────────────

const PLAN_MODES: PlanMode[] = ["event", "outcome", "workout"];
const CAFFEINE_PREFERENCES: CaffeinePreference[] = ["none", "moderate", "high"];
const DIETARY_RESTRICTIONS: DietaryRestriction[] = ["vegan", "gluten-free", "dairy-free"];
const FORMAT_PREFERENCES: FormatPreference[] = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];
const RETAILERS: Retailer[] = ["REI", "Amazon", "The Feed", "Running Warehouse"];
const WEIGHT_UNITS: WeightUnit[] = ["kg", "lbs"];
const SEXES: Sex[] = ["male", "female"];
const SESSION_TIME_IDS: SessionTime[] = ["morning", "midday", "evening"];
const LAST_MEAL_IDS: LastMeal[] = ["under-1h", "1-3h", "over-3h", "fasted"];

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
  // Only Garmin device names, which must be credited (intervals.icu API terms).
  const recordedWith = typeof w.recordedWith === "string" && /^Garmin[A-Za-z0-9 \-]{0,40}$/.test(w.recordedWith) ? w.recordedWith : null;
  if (w.recordedWith != null && recordedWith === null) return undefined;
  return { ...(recordedWith ? { recordedWith } : {}), kind: w.kind, sport: w.sport, name: name || "Uploaded workout", durationMin: Math.round(durationMin), basis, intensityFactor: basis === "relative" ? null : intensityFactor, blocks, avgPower, kj };
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
  if (r.mode === "outcome" ? outcomeType === null : eventType === null) return null;
  if (r.mode === "workout" && !WORKOUT_TYPES.some((w) => w.id === eventType)) return null;
  // Only the "Today's workout" planner sends these; anything else must leave them out.
  const sessionTime = r.sessionTime ?? null;
  const lastMeal = r.lastMeal ?? null;
  if (sessionTime !== null && !oneOf(sessionTime, SESSION_TIME_IDS)) return null;
  if (lastMeal !== null && !oneOf(lastMeal, LAST_MEAL_IDS)) return null;
  if (r.mode === "workout" && (sessionTime === null || lastMeal === null)) return null;
  const conditions = r.conditions ?? null;
  if (conditions !== null && !CONDITIONS.some((c) => c.id === conditions)) return null;
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
    ...(r.mode === "workout" ? { sessionTime: sessionTime as SessionTime, lastMeal: lastMeal as LastMeal } : {}),
    ...(conditions !== null ? { conditions: conditions as Conditions } : {}),
    ...(typeof r.saltySweater === "boolean" ? { saltySweater: r.saltySweater } : {}),
  };
}

// ── PROMPT ────────────────────────────────────────────────────

// The uploaded workout, if any: its structure, and how to use it in the plan.
function workoutSection(inputs: PlannerInputs): string {
  const w = inputs.workout;
  if (!w) return "";
  const [pre, during, post] = inputs.mode === "workout" ? ["BEFORE", "DURING", "AFTER"] : ["PRE-EVENT", "DURING EVENT", "POST-EVENT"];
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
Time the ${during} schedule to this structure, using clock times from the start. Where practical, schedule carbs and fluid in the easier blocks just before the hardest efforts rather than during them.
`
    : `
COMPLETED WORKOUT (from the athlete's uploaded activity file; the session is already finished):
${facts}
Under ${pre}, briefly say how to fuel before a session like this next time. Under ${during}, state what this session called for (carbs per hour, fluid and sodium) so the athlete can compare it with what they actually took. Under ${post}, give recovery nutrition for the next 24 hours, starting now.
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
  const weight = inputs.weightUnit === "lbs"
    ? `${formatWeight(inputs.weightKg, "lbs")} (${Math.round(inputs.weightKg)}kg)`
    : formatWeight(inputs.weightKg, "kg");
  const athlete = `- Age: ${inputs.age}
- Sex: ${inputs.sex}
- Training days per week: ${inputs.trainingDaysPerWeek}`;
  const personalise = `Tailor amounts to this athlete's age, sex, body weight and training load only where sports nutrition evidence supports a difference (for example, older athletes' higher protein needs for recovery, or more recovery emphasis with more training days). State quantities in ${inputs.weightUnit === "lbs" ? "pounds and ounces where natural, with metric in brackets" : "metric units"}.`;

  if (inputs.mode === "workout") return buildWorkoutPrompt(inputs, weight, athlete, personalise);

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
- Total carbs: ${carbTarget}g (${carbsPerHour(inputs.durationHours, inputs.intensity)}g/hr)
${sodiumLine(inputs, "Total sodium")}
${fluidLine(inputs, "Total fluid during")}
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
Sip about 200ml of fluid with each gel (keep to the fluid total above).

POST-EVENT
Three clear windows as plain text:
Within about an hour: specific food and amounts (20-40g protein with carbohydrate)
1-4 hours: specific food and amounts (if training again within about 8 hours, 1.0-1.2g of carbohydrate per kg of body weight per hour for the first 4 hours)
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

GUIDELINES (2016 ACSM / Academy of Nutrition and Dietetics / Dietitians of Canada position stand; keep within them):
- Daily protein: 1.2-2.0g per kg of body weight (${Math.round(1.2 * inputs.weightKg)}-${Math.round(2.0 * inputs.weightKg)}g), toward the top in heavy training; 20-40g per meal.
- Carbs during sessions: none under 45 minutes; 30-60g per hour up to about 2.5 hours; up to 90g per hour beyond that.
- Sodium during long sessions: 300-500mg per hour for 1-2 hours, 500-800mg for 2-3 hours, 800-1500mg for 3+ hours or heat.

${personalise} Calibrate recovery and supplement recommendations to ${inputs.trainingDaysPerWeek} training day${inputs.trainingDaysPerWeek === 1 ? "" : "s"} a week: more training days need more emphasis on recovery nutrition.

Use ONLY these exact section headers. No markdown, no tables, no asterisks. Plain text only.

PRE-EVENT
Daily nutrition habits before training as plain sentences. Specific foods, timing and quantities.

DURING EVENT
Intra-training nutrition as plain sentences. What to take, when and how much.

POST-EVENT
Three windows as plain text:
Within about an hour: specific recommendations (20-40g protein with carbohydrate)
1-4 hours: specific recommendations
Daily habits: ongoing recovery nutrition

TOTALS
Daily protein target: Xg
Daily carb target: Xg
Monthly supplement budget: $X

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`;
}

// "Today's workout": fueling for one everyday training session, not a race.
function buildWorkoutPrompt(inputs: PlannerInputs, weight: string, athlete: string, personalise: string): string {
  const session = WORKOUT_TYPES.find((w) => w.id === inputs.eventType)?.label ?? "Training session";
  const minutes = Math.round(inputs.durationHours * 60);
  const carbs = sessionCarbTarget(inputs);
  const time = SESSION_TIMES.find((t) => t.id === inputs.sessionTime)?.label.toLowerCase() ?? "not given";
  const meal = LAST_MEALS.find((m) => m.id === inputs.lastMeal)?.label.toLowerCase() ?? "not given";
  const perHour = carbsPerHour(inputs.durationHours, inputs.intensity);

  return `You are Pello's expert sports nutrition AI. Plan fueling for one training session today. This is an everyday workout, not a race: keep it practical and proportionate.

SESSION:
- Session: ${session}
- Duration: ${minutes} minutes
- Intensity: ${inputs.intensity}
- Time of day: ${time}
- Last meal before the session: ${meal}
- Body weight: ${weight}
${athlete}
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}
- Quality standards required: ${standardsLine(inputs)}
${workoutSection(inputs)}
CALCULATED TARGETS FOR THE SESSION ITSELF:
${carbs > 0
  ? `- Carbs during the session: ${carbs}g (${perHour}g/hr)`
  : "- Carbs during the session: none needed. It's short or easy enough to run on stored glycogen; water to thirst is enough."}
${sodiumLine(inputs, "Sodium during the session")}
${fluidLine(inputs, "Fluid during the session")}
Use these in DURING and TOTALS; don't recalculate them.

${personalise}

Use ONLY these exact section headers. No markdown, no tables, no asterisks, no hashtags. Plain text only.

BEFORE
Base this on the time of day and when the athlete last ate. If they ate within the hour, say they don't need anything more. If it was 1-3 hours ago, suggest at most a small top-up only if the session is long or hard. If it was more than 3 hours ago, or they haven't eaten today, suggest a light carb snack 30-60 minutes before, with specific foods, quantities and carb counts. For a fasted session that is easy and under an hour, say training fasted is fine and when to eat afterwards.

DURING
${carbs > 0
  ? "A clear schedule as plain sentences: when to start, how much, how often, and fluid with it."
  : "Say plainly that no fuel is needed during this session and that water to thirst is enough. Keep it to one or two sentences."}

AFTER
Recovery sized to this session: what to eat or drink within about an hour and how the next meal should look, with specific foods and amounts. After a short or easy session, a normal balanced meal is enough; say so.

TOTALS
Carbs during: Xg
Sodium during: Xmg
Fluid during: X ml

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`;
}
