// lib/planner.ts
// Planner inputs and prompt building, shared by the quiz page and /api/plan.
// The prompt is built on the server so the API can't be used as an open proxy to Claude.

// ── TYPES ─────────────────────────────────────────────────────

export type PlanMode = "event" | "outcome";
export type EventType = "road-cycling" | "gravel" | "triathlon" | "running" | "trail-running" | "gym" | "training-day" | "recovery";
export type OutcomeType = "finish-first-marathon" | "finish-first-triathlon" | "improve-cycling-endurance" | "improve-recovery" | "build-muscle-endurance" | "lose-weight-perform" | "race-faster" | "gut-health";
export type Intensity = "easy" | "moderate" | "hard" | "race";
export type CaffeinePreference = "none" | "moderate" | "high";
export type DietaryRestriction = "vegan" | "gluten-free" | "dairy-free";
export type FormatPreference = "Energy Gel" | "Energy Chew" | "Energy Bar" | "Carbohydrate Mix" | "Hydration";
export type Retailer = "REI" | "Amazon" | "The Feed" | "Running Warehouse";

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
  retailers: Retailer[];
  weightKg: number;
}

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
  { id: "finish-first-triathlon", label: "Finish my first triathlon", desc: "Swim, bike, run nutrition strategy", timeframe: "Multi-sport fuelling" },
  { id: "improve-cycling-endurance", label: "Improve cycling endurance", desc: "Go longer and stronger on the bike", timeframe: "Training + event nutrition" },
  { id: "improve-recovery", label: "Improve my recovery", desc: "Bounce back faster between sessions", timeframe: "Daily recovery protocol" },
  { id: "build-muscle-endurance", label: "Build muscle while training", desc: "Strength + endurance combined goals", timeframe: "Hybrid nutrition strategy" },
  { id: "lose-weight-perform", label: "Lose weight and perform", desc: "Body composition without losing power", timeframe: "Periodised nutrition" },
  { id: "race-faster", label: "Race faster", desc: "Optimise nutrition for peak performance", timeframe: "Performance nutrition" },
  { id: "gut-health", label: "Fix my gut health", desc: "Reduce GI issues during training", timeframe: "GI protocol" },
];

export const INTENSITY_OPTIONS = [
  { id: "easy" as Intensity, label: "Easy / recovery", desc: "Conversational pace, Z1-Z2", carbsPerHr: 30 },
  { id: "moderate" as Intensity, label: "Moderate", desc: "Steady effort, Z2-Z3", carbsPerHr: 50 },
  { id: "hard" as Intensity, label: "Hard", desc: "Threshold / tempo, Z3-Z4", carbsPerHr: 70 },
  { id: "race" as Intensity, label: "Race pace", desc: "Maximum effort, Z4-Z5", carbsPerHr: 90 },
];

// ── HELPERS ───────────────────────────────────────────────────

export function carbsNeeded(durationHours: number, intensity: Intensity): number {
  const rates: Record<Intensity, number> = { easy: 30, moderate: 50, hard: 70, race: 90 };
  if (durationHours < 1) return Math.round(rates[intensity] * durationHours * 0.5);
  return Math.round(rates[intensity] * durationHours);
}

export function sodiumNeeded(durationHours: number, intensity: Intensity, weightKg: number): number {
  const sweat: Record<Intensity, number> = { easy: 0.5, moderate: 0.8, hard: 1.1, race: 1.4 };
  return Math.round(sweat[intensity] * weightKg * 500 * durationHours);
}

// ── VALIDATION ────────────────────────────────────────────────

const PLAN_MODES: PlanMode[] = ["event", "outcome"];
const CAFFEINE_PREFERENCES: CaffeinePreference[] = ["none", "moderate", "high"];
const DIETARY_RESTRICTIONS: DietaryRestriction[] = ["vegan", "gluten-free", "dairy-free"];
const FORMAT_PREFERENCES: FormatPreference[] = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];
const RETAILERS: Retailer[] = ["REI", "Amazon", "The Feed", "Running Warehouse"];

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

  const durationHours = numberIn(r.durationHours, 0.25, 24);
  const budget = numberIn(r.budget, 0, 10000);
  const weightKg = numberIn(r.weightKg, 20, 300);
  const dietary = listOf(r.dietary, DIETARY_RESTRICTIONS);
  const formats = listOf(r.formats, FORMAT_PREFERENCES);
  const retailers = listOf(r.retailers, RETAILERS);
  if (durationHours === null || budget === null || weightKg === null || !dietary || !formats || !retailers) return null;

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
    weightKg,
  };
}

// ── PROMPT ────────────────────────────────────────────────────

export function buildPlanPrompt(inputs: PlannerInputs): string {
  const isEvent = inputs.mode === "event";
  const outcomeData = OUTCOME_TYPES.find(o => o.id === inputs.outcomeType);
  const eventData = EVENT_TYPES.find(e => e.id === inputs.eventType);
  const carbTarget = carbsNeeded(inputs.durationHours, inputs.intensity);
  const sodiumTarget = sodiumNeeded(inputs.durationHours, inputs.intensity, inputs.weightKg);

  return isEvent
    ? `You are Pello's expert sports nutrition AI. Generate a complete, science-backed nutrition plan.

ATHLETE PROFILE:
- Event: ${eventData?.label}
- Duration: ${inputs.durationHours} hours
- Intensity: ${inputs.intensity}
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}

CALCULATED TARGETS:
- Total carbs: ${carbTarget}g (${INTENSITY_OPTIONS.find(i => i.id === inputs.intensity)?.carbsPerHr}g/hr)
- Total sodium: ${sodiumTarget}mg

Use ONLY these exact section headers. No markdown, no tables, no asterisks, no hashtags. Plain text only.

PRE-EVENT
List specific foods with quantities and carb counts. Use this format:
White rice or pasta — 200g cooked — 55g carbs
Banana — 1 medium — 25g carbs
Then add timing notes as plain sentences.

DURING EVENT
Write a clear per-hour fuelling schedule as plain sentences. Example:
Start fuelling at 30 minutes with 1 gel (25g carbs).
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
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}/month
- Caffeine: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}

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
