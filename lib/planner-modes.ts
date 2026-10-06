// lib/planner-modes.ts
// The planner's modes, and the definitions, validation, calculations and product selection for
// the three newer ones: supplement stack, race week and budget optimizer. Client-safe: works on
// product summaries passed in, holds no product data.
//
// Every product recommended comes from Pello's catalog, and only fields a product actually has
// are used. Nutrition targets come from the 2016 position stand of the Academy of Nutrition and
// Dietetics, Dietitians of Canada and the American College of Sports Medicine ("Nutrition and
// Athletic Performance"), cited on the results pages.

import type { ProductSummary } from "./catalog-types";
import { byWeightedRating } from "./catalog-types";
import { meetsDiet, type DietId } from "./quality-standards";
import { EVENT_TYPES, type CaffeinePreference, type DietaryRestriction, type EventType, type FormatPreference, type WeightUnit } from "./planner";

export type PlannerMode = "workout" | "event" | "outcome" | "supplement-stack" | "race-week" | "budget-optimiser";
export type ModeAccess = "free-limited" | "pro" | "free";

export const PLANNER_MODES: { id: PlannerMode; title: string; desc: string; access: ModeAccess; isNew?: boolean; steps: number; loading: string }[] = [
  { id: "workout", title: "Today's workout", desc: "How to fuel the session you're doing today, before, during and after", access: "free-limited", isNew: true, steps: 3, loading: "Sizing up your session and building your fueling plan" },
  { id: "event", title: "Race day fueling", desc: "Pre, during and post nutrition for your next event", access: "free-limited", steps: 3, loading: "Calculating targets, matching products and building your protocol" },
  { id: "outcome", title: "Achieve a goal", desc: "Outcome-based nutrition to reach a specific target", access: "pro", steps: 3, loading: "Calculating targets, matching products and building your protocol" },
  { id: "supplement-stack", title: "Supplement stack", desc: "Daily supplement protocol matched to your goals and budget", access: "pro", isNew: true, steps: 3, loading: "Matching supplements to your goals..." },
  { id: "race-week", title: "Race week protocol", desc: "Day-by-day nutrition for the days before your race", access: "pro", isNew: true, steps: 3, loading: "Building your countdown protocol..." },
  { id: "budget-optimiser", title: "Budget optimizer", desc: "Maximum performance per dollar from your nutrition spend", access: "free", isNew: true, steps: 2, loading: "Calculating value scores across the database..." },
];
export const MODE_BY_ID = Object.fromEntries(PLANNER_MODES.map((m) => [m.id, m])) as Record<PlannerMode, (typeof PLANNER_MODES)[number]>;

// What upgrading gets you, per Pro mode (shown on the Pro gate).
export const MODE_PRO_PITCH: Partial<Record<PlannerMode, string>> = {
  outcome: "Nutrition built around a goal, like finishing your first marathon, recovering faster or building muscle.",
  "supplement-stack": "A morning, training and evening supplement protocol from Pello's database, matched to your goals, diet and budget.",
  "race-week": "A day-by-day countdown to race day: carb loading, hydration and race-morning timing, using the published guidelines.",
};

// ── Goals and what's already taken ───────────────────────────────────────────

export const STACK_GOALS = [
  { id: "muscle", label: "Build muscle and strength" },
  { id: "endurance", label: "Improve endurance performance" },
  { id: "recovery", label: "Faster recovery between sessions" },
  { id: "sleep", label: "Better sleep and rest" },
  { id: "cognitive", label: "Cognitive performance and focus" },
  { id: "gut", label: "Gut health and digestion" },
  { id: "health", label: "General health and immunity" },
  { id: "body-comp", label: "Body composition" },
] as const;
export type StackGoal = (typeof STACK_GOALS)[number]["id"];

// The catalog categories relevant to each goal.
export const GOAL_CATEGORIES: Record<StackGoal, string[]> = {
  muscle: ["Protein", "Creatine", "Recovery"],
  endurance: ["Performance", "Supplement", "Vitamin", "Mineral", "Omega-3"],
  recovery: ["Recovery", "Protein", "Omega-3", "Sleep"],
  sleep: ["Sleep", "Mineral"],
  cognitive: ["Performance", "Omega-3", "Supplement"],
  gut: ["Probiotic", "Gut Health"],
  health: ["Vitamin", "Mineral", "Omega-3", "Immune", "Greens"],
  "body-comp": ["Protein", "Creatine", "Supplement"],
};
// Goals where a whole category is too broad: only products that fit.
const ingredientsMatch = (p: ProductSummary, re: RegExp) => re.test(p.name) || p.ingredients.some((i) => re.test(i.name));
const COGNITIVE = /caffeine|theanine|tyrosine|alpha[- ]?gpc|citicoline|cdp[- ]?choline|rhodiola|bacopa|lion'?s mane/i;
export const GOAL_FILTER: Partial<Record<StackGoal, (p: ProductSummary) => boolean>> = {
  sleep: (p) => p.category === "Sleep" || (p.category === "Mineral" && ingredientsMatch(p, /magnesium/i)),
  cognitive: (p) => p.category === "Omega-3" || (["Performance", "Supplement"].includes(p.category) && ingredientsMatch(p, COGNITIVE) && !/electrolyte/i.test(p.name)),
};
export function fitsGoal(p: ProductSummary, goal: StackGoal): boolean {
  const f = GOAL_FILTER[goal];
  return f ? f(p) : GOAL_CATEGORIES[goal].includes(p.category);
}

export const FUEL_CATEGORIES = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];

export const CURRENT_SUPPLEMENTS = [
  { id: "protein", label: "Protein powder" },
  { id: "creatine", label: "Creatine" },
  { id: "omega-3", label: "Omega-3" },
  { id: "vitamin-d", label: "Vitamin D" },
  { id: "magnesium", label: "Magnesium" },
  { id: "probiotics", label: "Probiotics" },
  { id: "caffeine", label: "Caffeine or pre-workout" },
  { id: "none", label: "None, starting from scratch" },
] as const;
export type CurrentSupplement = (typeof CURRENT_SUPPLEMENTS)[number]["id"];

// Whether a product is the kind of thing the athlete already takes. Matched on what the product is
// (category, or the product's name), not on every product that happens to contain it, so ticking
// "Vitamin D" removes vitamin D supplements but not multivitamins.
export function isAlreadyTaken(p: ProductSummary, have: string): boolean {
  const name = `${p.name}`.toLowerCase();
  switch (have) {
    case "protein": return p.category === "Protein";
    case "creatine": return p.category === "Creatine" || /creatine/.test(name);
    case "omega-3": return p.category === "Omega-3";
    case "vitamin-d": return p.category === "Vitamin" && /vitamin d|\bd3\b|\bd-?\d{1,2},?000\b|d\/k2|d\+k/.test(name);
    case "magnesium": return /magnesium|\bmag\b|\bmag 3\b|neuromag/.test(name);
    case "probiotics": return p.category === "Probiotic";
    case "caffeine": return p.category === "Performance" && (p.nutrition.hasCaffeine || /pre-?workout|\bpre\b/.test(name));
    default: return false;
  }
}

const diet = (p: ProductSummary) => ({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens });
const hasRating = (p: ProductSummary) => p.reviewCount > 0 && p.rating > 0;
const hasPrice = (p: ProductSummary) => p.price > 0 && p.pricePerServing > 0;

// At most `perCategory` from each category, best-rated first, up to `limit` in total.
function topByCategory(list: ProductSummary[], perCategory: number, limit: number): ProductSummary[] {
  const counts = new Map<string, number>();
  const out: ProductSummary[] = [];
  for (const p of [...list].sort(byWeightedRating)) {
    const n = counts.get(p.category) ?? 0;
    if (n >= perCategory) continue;
    counts.set(p.category, n + 1);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

// Cost for a month at one serving a day. Shown with that assumption stated.
export const monthlyAtOneServing = (p: ProductSummary) => Math.round(p.pricePerServing * 30 * 100) / 100;

// ── Supplement stack ─────────────────────────────────────────────────────────

export interface StackInputs {
  goals: StackGoal[];
  current: CurrentSupplement[];
  age: number;
  sex: "male" | "female";
  trainingDaysPerWeek: number;
  budget: number;            // per month
  dietary: DietaryRestriction[];
}
export const STACK_DEFAULTS: StackInputs = { goals: [], current: [], age: 30, sex: "male", trainingDaysPerWeek: 4, budget: 80, dietary: [] };

export function stackCandidates(products: ProductSummary[], inputs: StackInputs): ProductSummary[] {
  const have = inputs.current.filter((c) => c !== "none");
  return topByCategory(products.filter((p) =>
    inputs.goals.some((g) => fitsGoal(p, g)) && hasRating(p) && hasPrice(p) &&
    inputs.dietary.every((d) => meetsDiet(diet(p), d as DietId)) &&
    !have.some((h) => isAlreadyTaken(p, h))
  ), 5, 40);
}

// ── Race week ────────────────────────────────────────────────────────────────

export const RACE_TYPES = [
  { id: "road-running", label: "Road running" },
  { id: "trail-running", label: "Trail running" },
  { id: "cycling", label: "Cycling" },
  { id: "triathlon", label: "Triathlon" },
  { id: "gravel", label: "Gravel" },
  { id: "other", label: "Other endurance" },
] as const;
export type RaceType = (typeof RACE_TYPES)[number]["id"];

// Durations split at 90 minutes, where the guidance on carbohydrate loading changes.
export const RACE_DURATIONS = [
  { id: "lt90", label: "Under 90 min" },
  { id: "90-120", label: "90 min to 2 hours" },
  { id: "2-4", label: "2 to 4 hours" },
  { id: "4-8", label: "4 to 8 hours" },
  { id: "8plus", label: "8 hours or more" },
] as const;
export type RaceDuration = (typeof RACE_DURATIONS)[number]["id"];

export const RACE_PRIORITIES = [
  { id: "a", label: "A-race", desc: "Peak priority" },
  { id: "b", label: "B-race", desc: "Moderate priority" },
  { id: "training", label: "Training race", desc: "Low priority" },
] as const;
export type RacePriority = (typeof RACE_PRIORITIES)[number]["id"];

export interface RaceWeekInputs {
  raceType: RaceType;
  duration: RaceDuration;
  daysUntil: number;         // 2–7
  priority: RacePriority;
  weightKg: number;
  weightUnit: WeightUnit;
  caffeinePreference: CaffeinePreference;
  dietary: DietaryRestriction[];
  budget: number;
  formats: FormatPreference[];
}
export const RACE_WEEK_DEFAULTS: Omit<RaceWeekInputs, "raceType" | "duration" | "priority"> & { raceType: RaceType | null; duration: RaceDuration | null; priority: RacePriority | null } = {
  raceType: null, duration: null, daysUntil: 7, priority: null, weightKg: 70, weightUnit: "kg", caffeinePreference: "moderate", dietary: [], budget: 50, formats: [],
};

export interface RaceWeekTargets {
  loading: boolean;                 // carbohydrate loading applies (events over 90 min)
  dailyCarbs: { gPerKg: [number, number]; grams: [number, number] };
  loadingDays: number;              // days before race day at the daily target
  preRaceMeal: { gPerKg: [number, number]; grams: [number, number] };
  preRaceFluidMl: [number, number]; // 2–4 h before
  duringCarbs: string;              // g per hour, as the guideline states it
}

// From the position stand's Table 1: carbohydrate loading (10–12 g/kg/24 h for 36–48 h) for
// events over 90 min; general fueling up (7–12 g/kg/24 h) for shorter ones; pre-event fueling
// 1–4 g/kg 1–4 h before; 5–10 ml/kg of fluid 2–4 h before; during exercise by duration.
export function raceWeekTargets(i: Pick<RaceWeekInputs, "duration" | "weightKg">): RaceWeekTargets {
  const loading = i.duration !== "lt90";
  const g = (lo: number, hi: number): [number, number] => [Math.round(lo * i.weightKg), Math.round(hi * i.weightKg)];
  const duringCarbs = {
    lt90: "none needed under 45 min; small amounts, including mouth rinse, for 45 to 75 min; 30 to 60 g per hour beyond that",
    "90-120": "30 to 60 g per hour",
    "2-4": "30 to 60 g per hour up to about 2.5 hours, and up to 90 g per hour for longer races",
    "4-8": "up to 90 g per hour",
    "8plus": "up to 90 g per hour",
  }[i.duration];
  return {
    loading,
    dailyCarbs: loading ? { gPerKg: [10, 12], grams: g(10, 12) } : { gPerKg: [7, 12], grams: g(7, 12) },
    loadingDays: loading ? 2 : 1,
    preRaceMeal: { gPerKg: [1, 4], grams: g(1, 4) },
    preRaceFluidMl: [Math.round(5 * i.weightKg), Math.round(10 * i.weightKg)],
    duringCarbs,
  };
}

export function raceWeekCandidates(products: ProductSummary[], i: RaceWeekInputs): ProductSummary[] {
  const cats = i.formats.length ? FUEL_CATEGORIES.filter((c) => i.formats.includes(c as FormatPreference)) : FUEL_CATEGORIES;
  return topByCategory(products.filter((p) =>
    cats.includes(p.category) && hasRating(p) && hasPrice(p) &&
    i.dietary.every((d) => meetsDiet(diet(p), d as DietId)) &&
    (i.caffeinePreference !== "none" || !p.nutrition.hasCaffeine)
  ), 6, 30);
}

// ── Budget optimizer ─────────────────────────────────────────────────────────

export const BUDGET_HAVE = CURRENT_SUPPLEMENTS.filter((c) => c.id !== "caffeine" && c.id !== "none");

export interface BudgetInputs {
  goal: StackGoal;
  eventFocus: boolean;
  eventType: EventType | null;
  budget: number;            // per month
  currentSpend: number | null;
  dietary: DietaryRestriction[];
  caffeinePreference: CaffeinePreference;
  have: CurrentSupplement[];
}
export const BUDGET_DEFAULTS: Omit<BudgetInputs, "goal"> & { goal: StackGoal | null } = {
  goal: null, eventFocus: false, eventType: null, budget: 60, currentSpend: null, dietary: [], caffeinePreference: "moderate", have: [],
};

export interface ValuePick { product: ProductSummary; valueScore: number; monthly: number }

// Value score: (rating × transparency score) ÷ price per serving. Products need a price, at
// least one rating, a transparency score and a Pello Score; nothing is estimated.
export function budgetTiers(products: ProductSummary[], i: BudgetInputs): { tier1: ValuePick[]; tier2: ValuePick[]; tier3: ValuePick[]; considered: number } {
  const pool = products.filter((p) =>
    (fitsGoal(p, i.goal) || (i.eventFocus && FUEL_CATEGORIES.includes(p.category))) && hasRating(p) && hasPrice(p) && p.transparencyScore != null && p.pelloScore != null &&
    i.dietary.every((d) => meetsDiet(diet(p), d as DietId)) &&
    (i.caffeinePreference !== "none" || !p.nutrition.hasCaffeine) &&
    !i.have.some((h) => isAlreadyTaken(p, h))
  ).map((p) => ({ product: p, valueScore: Math.round(((p.rating * p.transparencyScore!) / p.pricePerServing) * 10) / 10, monthly: monthlyAtOneServing(p) }))
    .sort((a, b) => b.valueScore - a.valueScore);
  const tier1 = pool.filter((x) => x.product.pelloScore! > 75 && x.product.pricePerServing < 1.5).slice(0, 3);
  const tier2 = pool.filter((x) => x.product.pelloScore! >= 60 && x.product.pelloScore! <= 75 && x.product.pricePerServing < 2).slice(0, 3);
  const used = new Set([...tier1, ...tier2].map((x) => x.product.id));
  const tier3 = pool.filter((x) => x.product.pelloScore! > 80 && !used.has(x.product.id)).slice(0, 2);
  return { tier1, tier2, tier3, considered: pool.length };
}

// ── Validation of untrusted request data ─────────────────────────────────────

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id);
const oneOf = <T,>(v: unknown, allowed: readonly T[]): v is T => allowed.includes(v as T);
const listOf = <T,>(v: unknown, allowed: readonly T[]): T[] | null =>
  Array.isArray(v) && v.every((x) => allowed.includes(x as T)) ? Array.from(new Set(v as T[])) : null;
const num = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null);
const DIETS: DietaryRestriction[] = ["vegan", "gluten-free", "dairy-free"];
const CAFFEINE: CaffeinePreference[] = ["none", "moderate", "high"];
const FORMATS: FormatPreference[] = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];

export function parseStackInputs(raw: unknown): StackInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const goals = listOf(r.goals, ids(STACK_GOALS)) as StackGoal[] | null;
  const current = listOf(r.current, ids(CURRENT_SUPPLEMENTS)) as CurrentSupplement[] | null;
  const dietary = listOf(r.dietary, DIETS);
  const age = num(r.age, 16, 70), days = num(r.trainingDaysPerWeek, 1, 7), budget = num(r.budget, 20, 300);
  if (!goals?.length || !current || !dietary || age == null || days == null || budget == null || !oneOf(r.sex, ["male", "female"] as const)) return null;
  return { goals, current, dietary, age: Math.round(age), sex: r.sex, trainingDaysPerWeek: Math.round(days), budget: Math.round(budget) };
}

export function parseRaceWeekInputs(raw: unknown): RaceWeekInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const dietary = listOf(r.dietary, DIETS), formats = listOf(r.formats, FORMATS);
  const daysUntil = num(r.daysUntil, 2, 7), weightKg = num(r.weightKg, 30, 200), budget = num(r.budget, 0, 1000);
  if (!oneOf(r.raceType, ids(RACE_TYPES)) || !oneOf(r.duration, ids(RACE_DURATIONS)) || !oneOf(r.priority, ids(RACE_PRIORITIES))) return null;
  if (!oneOf(r.weightUnit, ["kg", "lbs"] as const) || !oneOf(r.caffeinePreference, CAFFEINE)) return null;
  if (!dietary || !formats || daysUntil == null || weightKg == null || budget == null) return null;
  return { raceType: r.raceType as RaceType, duration: r.duration as RaceDuration, priority: r.priority as RacePriority, daysUntil: Math.round(daysUntil), weightKg, weightUnit: r.weightUnit, caffeinePreference: r.caffeinePreference, dietary, budget: Math.round(budget), formats };
}

export function parseBudgetInputs(raw: unknown): BudgetInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const dietary = listOf(r.dietary, DIETS), have = listOf(r.have, ids(BUDGET_HAVE)) as CurrentSupplement[] | null;
  const budget = num(r.budget, 20, 200);
  const currentSpend = r.currentSpend == null ? null : num(r.currentSpend, 0, 200);
  if (!oneOf(r.goal, ids(STACK_GOALS)) || typeof r.eventFocus !== "boolean" || !oneOf(r.caffeinePreference, CAFFEINE)) return null;
  if (!dietary || !have || budget == null || (r.currentSpend != null && currentSpend == null)) return null;
  if (r.eventFocus && r.eventType != null && !EVENT_TYPES.some((e) => e.id === r.eventType)) return null;
  const eventType = r.eventFocus && r.eventType != null ? (r.eventType as EventType) : null;
  return { goal: r.goal as StackGoal, eventFocus: r.eventFocus, eventType, budget: Math.round(budget), currentSpend: currentSpend == null ? null : Math.round(currentSpend), dietary, caffeinePreference: r.caffeinePreference, have };
}
