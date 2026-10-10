// lib/fueling.ts
// Sodium, gut-training and race-day timeline calculations. Shared by the planner, the Pello
// Pro fueling tools and the tests (lib/fueling.test.ts). Pure functions: no product data and
// no I/O, so they're safe on the client and the server.
//
// Every number here is taken from Pello's own articles or the cited guidance, never invented.
// Anything marked "TODO: needs editorial review" should be checked by an editor before it's
// presented as a recommendation in new places.

export type Conditions = "cool" | "mild" | "hot";
export type Intensity = "easy" | "moderate" | "hard" | "race";

export const CONDITIONS: { id: Conditions; label: string }[] = [
  { id: "cool", label: "Cool" },
  { id: "mild", label: "Mild" },
  { id: "hot", label: "Hot or humid" },
];

// ── CARBOHYDRATE DURING EXERCISE ─────────────────────────────

// The single source for carbs during exercise: the planner (all modes), the carb calculator, the
// home page calculator and the race-day card all use carbsPerHour/carbsDuring.
//
// The rate by intensity (Pello's long-standing figures, also in the energy gel guide) is capped by
// session length, following the 2016 ACSM / Academy of Nutrition and Dietetics / Dietitians of
// Canada position stand (Table 1), the same guideline the race-week planner uses:
//   under 45 minutes ............................ not needed
//   45-75 minutes, sustained high intensity ..... small amounts, including mouth rinse
//   1-2.5 hours ................................. 30-60g per hour
//   over 2.5-3 hours ............................ up to 90g per hour
// "Small amounts" is set at up to 30g per hour, for hard and race efforts only.
// TODO: needs editorial review ("small amounts" as 30g/hr; the 75-minute and 2.5-hour cut-offs).
export const CARB_RATE_BY_INTENSITY: Record<Intensity, number> = { easy: 30, moderate: 50, hard: 70, race: 90 };

export function carbsPerHour(durationHours: number, intensity: Intensity): number {
  const minutes = durationHours * 60;
  const rate = CARB_RATE_BY_INTENSITY[intensity];
  if (minutes < 45) return 0;
  if (minutes <= 75) return intensity === "hard" || intensity === "race" ? Math.min(rate, 30) : 0;
  if (minutes <= 150) return Math.min(rate, 60);
  return rate;
}

// Total carbs for the session (g).
export function carbsDuring(durationHours: number, intensity: Intensity): number {
  return Math.round(carbsPerHour(durationHours, intensity) * durationHours);
}

// Why the rate is what it is, in plain words, for showing next to it.
export function carbRateNote(durationHours: number, intensity: Intensity): string {
  const minutes = durationHours * 60;
  if (minutes < 45) return "Under 45 minutes, you don't need carbs during the session.";
  if (minutes <= 75) return intensity === "hard" || intensity === "race"
    ? "For 45-75 minutes at high intensity, small amounts (or a carb mouth rinse) are enough."
    : "For 45-75 minutes at this intensity, stored glycogen is enough.";
  if (minutes <= 150) return "Up to 2.5 hours, 30-60g per hour is the guideline range.";
  return intensity === "race" ? "Beyond 2.5 hours, up to 90g per hour, if your gut is trained for it." : "Beyond 2.5 hours, up to 90g per hour is possible at higher intensities.";
}

// ── SODIUM ────────────────────────────────────────────────────

export interface SodiumInputs {
  durationHours: number;
  intensity: Intensity;
  conditions?: Conditions | null;  // default mild
  saltySweater?: boolean | null;   // self-reported: white residue on skin or kit
}

export interface SodiumPlan {
  perHourLow: number;   // mg per hour
  perHourHigh: number;  // mg per hour
  perHour: number;      // the single figure plans use (mg per hour)
  total: number;        // mg for the whole session
  basis: string;        // which tier applied, in plain words
}

// Sodium to take per hour, from the replacement ranges in Pello's sodium article
// ("How Much Sodium Do You Need for Endurance Sport?", lib/blog.ts):
//   under 60 minutes ............................ not generally needed
//   1-2 hours moderate .......................... 300-500mg per hour
//   2-3 hours moderate to hard .................. 500-800mg per hour
//   3+ hours, or hot conditions ................. 800-1500mg per hour
//   very salty sweaters ......................... up to 2000mg per hour
// The marathon guide's "1-2g of sodium per hour lost through sweat" is a loss figure at
// marathon pace; it sits inside the top two tiers.
//
// How the inputs move you between tiers:
// - Duration picks the tier. Hot conditions use the 3+ hour tier, as the article says.
// - Easy sessions under 2 hours drop to the 1-2 hour tier's low end. Hard or race efforts
//   between 1 and 2 hours use the 1-2 hour tier's high end. (The article's tiers mention
//   intensity only loosely; this keeps the figure inside the stated range.)
// - Cool conditions use the low end of the tier; mild use the middle; hot the top tier.
// - Salty sweaters use the high end of their tier, and the 3+ hour/hot tier extends to 2000mg.
// The result is a starting point, not a personal measurement; a sweat test gives the real figure.
// TODO: needs editorial review (tier mapping for intensity and conditions).
export function sodiumPlan({ durationHours, intensity, conditions, saltySweater }: SodiumInputs): SodiumPlan {
  const cond: Conditions = conditions ?? "mild";
  const hours = Math.max(0, durationHours);
  if (hours < 1) {
    return { perHourLow: 0, perHourHigh: 0, perHour: 0, total: 0, basis: "Under an hour: sodium generally isn't needed during the session." };
  }

  let low: number, high: number, basis: string;
  if (hours >= 3 || cond === "hot") {
    [low, high] = [800, saltySweater ? 2000 : 1500];
    basis = cond === "hot" ? "Hot conditions" : "3 hours or more";
  } else if (hours >= 2) {
    [low, high] = [500, 800];
    basis = "2-3 hours";
  } else {
    [low, high] = [300, 500];
    basis = "1-2 hours";
  }
  if (saltySweater) basis += ", salty sweater";

  let perHour: number;
  if (saltySweater) perHour = high;
  else if (cond === "cool") perHour = low;
  else if (hours < 2 && intensity === "easy") perHour = low;
  else if (hours < 2 && (intensity === "hard" || intensity === "race")) perHour = high;
  else perHour = Math.round((low + high) / 2 / 50) * 50;

  return { perHourLow: low, perHourHigh: high, perHour, total: Math.round(perHour * hours), basis };
}

// ── FLUID ─────────────────────────────────────────────────────

// A starting fluid range of 400-800ml per hour (American College of Sports Medicine), drinking to
// thirst within it: lower in cool conditions, higher in heat. Individual sweat rates vary widely.
// TODO: needs editorial review (source and per-condition defaults).
export const FLUID_ML_PER_HOUR: Record<Conditions, number> = { cool: 400, mild: 600, hot: 800 };
export const FLUID_RANGE_ML_PER_HOUR = [400, 800] as const;

// Fluid during the session (ml), or 0 when it's short enough to drink to thirst only.
export function fluidDuring(durationHours: number, conditions?: Conditions | null): number {
  if (durationHours < 0.75) return 0;
  return Math.round((FLUID_ML_PER_HOUR[conditions ?? "mild"] * durationHours) / 50) * 50;
}

// ── GUT TRAINING ──────────────────────────────────────────────

// The week-by-week carb targets for long sessions, from about 60g/hr toward 90g/hr. The range
// comes from Pello's marathon guide (60g/hr baseline; up to 90g/hr "requires gut training") and
// the energy gel guide (glucose plus fructose allows up to about 90g/hr, versus about 60g/hr from
// glucose alone). The step size and number of weeks are an editorial choice, not a study result.
// TODO: needs editorial review (weekly steps, sessions per week, number of weeks).
export const GUT_TRAINING_WEEKS: { carbsPerHour: number; longSessions: number }[] = [
  { carbsPerHour: 60, longSessions: 1 },
  { carbsPerHour: 65, longSessions: 1 },
  { carbsPerHour: 70, longSessions: 2 },
  { carbsPerHour: 75, longSessions: 2 },
  { carbsPerHour: 80, longSessions: 2 },
  { carbsPerHour: 85, longSessions: 2 },
  { carbsPerHour: 90, longSessions: 2 },
];
export const GUT_TRAINING_START_OPTIONS = [60, 70, 80] as const;
export const GUT_TRAINING_TARGET_OPTIONS = [75, 80, 90] as const;

export interface GutTrainingWeek {
  week: number;
  carbsPerHour: number;
  longSessions: number;
  note: string;
}

// The weeks from the athlete's current comfortable intake up to their target. Starting above the
// target, or at it, gives a single week to confirm the target in training.
export function gutTrainingPlan(startCarbsPerHour: number, targetCarbsPerHour: number): GutTrainingWeek[] {
  const target = Math.min(90, Math.max(60, targetCarbsPerHour));
  const start = Math.min(target, Math.max(60, startCarbsPerHour));
  const steps = GUT_TRAINING_WEEKS.filter((w) => w.carbsPerHour >= start && w.carbsPerHour <= target);
  const weeks = steps.length ? steps : [{ carbsPerHour: target, longSessions: 2 }];
  return weeks.map((w, i) => ({
    week: i + 1,
    carbsPerHour: w.carbsPerHour,
    longSessions: w.longSessions,
    note: i === weeks.length - 1
      // From the Maurten vs SiS article: gut tolerance is individual; test at race intensity.
      ? "Practice this rate at race intensity, with the products you plan to race with."
      : w.carbsPerHour > 60
        ? "Above 60g per hour, use products that combine glucose and fructose."
        : "Start at a rate you already tolerate.",
  }));
}

// ── RACE-DAY TIMELINE ─────────────────────────────────────────

export interface TimelineProduct {
  name: string;
  carbsPerServing: number;
  sodiumPerServing: number;  // mg
}

export interface TimelineInputs {
  durationHours: number;
  carbsPerHour: number;
  sodiumPerHour: number;             // mg
  fluidPerHourMl: number;
  carbProduct: TimelineProduct;      // gel, chew or drink mix
  sodiumProduct?: TimelineProduct | null;  // electrolyte, for any sodium the carb product doesn't cover
  distanceKm?: number | null;        // optional, to show distance alongside time
}

export interface TimelineRow {
  minute: number;
  km: number | null;
  product: string;
  carbs: number;
  fluidMl: number;
  sodium: number;
}

// Roughly how often a serving of the carb product comes round at the hourly target, rounded to
// 5 minutes and kept between 10 and 60 minutes (shown as a guide next to the timeline).
export function servingInterval(carbsPerServing: number, carbsPerHour: number): number {
  if (carbsPerServing <= 0 || carbsPerHour <= 0) return 0;
  const raw = (carbsPerServing / carbsPerHour) * 60;
  return Math.min(60, Math.max(10, Math.round(raw / 5) * 5));
}

// A gel/fluid timeline: enough servings of the carb product to reach the session's carb target,
// spread evenly from the start to 5 minutes before the finish (rounded to 5-minute marks), fluid
// spread across the same stops, and an electrolyte serving each hour when the carb product
// doesn't supply the hourly sodium on its own.
export function raceDayTimeline(t: TimelineInputs): TimelineRow[] {
  const totalMin = Math.round(t.durationHours * 60);
  const perServing = t.carbProduct.carbsPerServing;
  if (perServing <= 0 || t.carbsPerHour <= 0 || totalMin <= 10) return [];
  const span = totalMin - 5;
  const servings = Math.ceil((t.carbsPerHour * t.durationHours) / perServing);
  const kmAt = (m: number) => (t.distanceKm && t.durationHours > 0 ? Math.round((t.distanceKm * m) / totalMin * 10) / 10 : null);
  const fluidPerStop = Math.round((t.fluidPerHourMl * t.durationHours) / servings / 10) * 10;

  const rows: TimelineRow[] = [];
  for (let k = 1; k <= servings; k++) {
    const m = Math.min(span, Math.max(5, Math.round((k * span) / servings / 5) * 5));
    rows.push({ minute: m, km: kmAt(m), product: t.carbProduct.name, carbs: perServing, fluidMl: fluidPerStop, sodium: t.carbProduct.sodiumPerServing });
  }

  // Hourly sodium top-up from the electrolyte, if the carb servings fall short.
  const sp = t.sodiumProduct;
  if (sp && sp.sodiumPerServing > 0 && t.sodiumPerHour > 0) {
    for (let h = 60; h <= totalMin - 5; h += 60) {
      const fromCarbs = rows.filter((r) => r.minute > h - 60 && r.minute <= h).reduce((s, r) => s + r.sodium, 0);
      const gap = t.sodiumPerHour - fromCarbs;
      if (gap <= sp.sodiumPerServing / 2) continue;
      const servings = Math.max(1, Math.round(gap / sp.sodiumPerServing));
      rows.push({ minute: h, km: kmAt(h), product: servings > 1 ? `${sp.name} × ${servings}` : sp.name, carbs: sp.carbsPerServing * servings, fluidMl: 0, sodium: sp.sodiumPerServing * servings });
    }
  }
  return rows.sort((a, b) => a.minute - b.minute);
}

export function timelineTotals(rows: TimelineRow[]) {
  return rows.reduce((s, r) => ({ carbs: s.carbs + r.carbs, fluidMl: s.fluidMl + r.fluidMl, sodium: s.sodium + r.sodium }), { carbs: 0, fluidMl: 0, sodium: 0 });
}

export const clockTime = (minute: number) => `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, "0")}`;
