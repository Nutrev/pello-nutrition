import { describe, expect, it } from "vitest";
import { sodiumPlan, gutTrainingPlan, servingInterval, raceDayTimeline, timelineTotals, GUT_TRAINING_WEEKS } from "./fueling";

describe("sodiumPlan (tiers from Pello's sodium article)", () => {
  it("needs no sodium under an hour", () => {
    expect(sodiumPlan({ durationHours: 0.75, intensity: "hard" }).total).toBe(0);
  });
  it("uses 300-500mg/hr for 1-2 hours, by intensity", () => {
    expect(sodiumPlan({ durationHours: 1.5, intensity: "easy" }).perHour).toBe(300);
    expect(sodiumPlan({ durationHours: 1.5, intensity: "moderate" }).perHour).toBe(400);
    expect(sodiumPlan({ durationHours: 1.5, intensity: "race" }).perHour).toBe(500);
    expect(sodiumPlan({ durationHours: 1.5, intensity: "moderate" })).toMatchObject({ perHourLow: 300, perHourHigh: 500 });
  });
  it("uses 500-800mg/hr for 2-3 hours", () => {
    expect(sodiumPlan({ durationHours: 2.5, intensity: "moderate" })).toMatchObject({ perHourLow: 500, perHourHigh: 800, perHour: 650 });
  });
  it("uses 800-1500mg/hr for 3+ hours or hot conditions", () => {
    expect(sodiumPlan({ durationHours: 4, intensity: "moderate" })).toMatchObject({ perHourLow: 800, perHourHigh: 1500, perHour: 1150 });
    expect(sodiumPlan({ durationHours: 1.5, intensity: "moderate", conditions: "hot" })).toMatchObject({ perHourLow: 800, perHourHigh: 1500 });
  });
  it("uses the low end in cool conditions", () => {
    expect(sodiumPlan({ durationHours: 2.5, intensity: "hard", conditions: "cool" }).perHour).toBe(500);
  });
  it("raises salty sweaters to the top of their tier, up to 2000mg/hr", () => {
    expect(sodiumPlan({ durationHours: 1.5, intensity: "easy", saltySweater: true }).perHour).toBe(500);
    expect(sodiumPlan({ durationHours: 5, intensity: "moderate", saltySweater: true })).toMatchObject({ perHour: 2000, perHourHigh: 2000 });
  });
  it("never goes outside the article's ranges", () => {
    for (const h of [1, 1.5, 2, 2.5, 3, 6, 12]) for (const intensity of ["easy", "moderate", "hard", "race"] as const)
      for (const conditions of ["cool", "mild", "hot"] as const) for (const saltySweater of [false, true]) {
        const s = sodiumPlan({ durationHours: h, intensity, conditions, saltySweater });
        expect(s.perHour).toBeGreaterThanOrEqual(300);
        expect(s.perHour).toBeLessThanOrEqual(2000);
        expect(s.perHour).toBeGreaterThanOrEqual(s.perHourLow);
        expect(s.perHour).toBeLessThanOrEqual(s.perHourHigh);
        expect(s.total).toBe(Math.round(s.perHour * h));
      }
  });
});

describe("gutTrainingPlan", () => {
  it("ramps from 60 to 90g/hr in ascending weekly steps", () => {
    const plan = gutTrainingPlan(60, 90);
    expect(plan.map((w) => w.carbsPerHour)).toEqual(GUT_TRAINING_WEEKS.map((w) => w.carbsPerHour));
    expect(plan[0].carbsPerHour).toBe(60);
    expect(plan.at(-1)!.carbsPerHour).toBe(90);
    plan.forEach((w, i) => i && expect(w.carbsPerHour).toBeGreaterThan(plan[i - 1].carbsPerHour));
    expect(plan.map((w) => w.week)).toEqual(plan.map((_, i) => i + 1));
  });
  it("starts from the current intake and stops at the target", () => {
    expect(gutTrainingPlan(70, 80).map((w) => w.carbsPerHour)).toEqual([70, 75, 80]);
  });
  it("ends with practice at race intensity", () => {
    expect(gutTrainingPlan(60, 90).at(-1)!.note).toMatch(/race intensity/);
  });
  it("keeps targets within 60-90g/hr", () => {
    expect(gutTrainingPlan(40, 120)[0].carbsPerHour).toBe(60);
    expect(gutTrainingPlan(40, 120).at(-1)!.carbsPerHour).toBe(90);
  });
  it("gives a single week when already at the target", () => {
    expect(gutTrainingPlan(80, 80)).toHaveLength(1);
    expect(gutTrainingPlan(90, 75).map((w) => w.carbsPerHour)).toEqual([75]);
  });
});

describe("race-day timeline", () => {
  const gel = { name: "Gel", carbsPerServing: 30, sodiumPerServing: 50 };
  it("spaces servings to hit the hourly carb target", () => {
    expect(servingInterval(30, 60)).toBe(30);
    expect(servingInterval(25, 90)).toBe(15);
    expect(servingInterval(40, 90)).toBe(25);
    expect(servingInterval(0, 60)).toBe(0);
  });
  it("schedules enough servings to reach the carb target, none in the last 5 minutes", () => {
    const rows = raceDayTimeline({ durationHours: 2, carbsPerHour: 60, sodiumPerHour: 0, fluidPerHourMl: 600, carbProduct: gel });
    expect(rows.map((r) => r.minute)).toEqual([30, 60, 85, 115]);
    expect(rows.reduce((s, r) => s + r.carbs, 0)).toBe(120);
    expect(rows.every((r) => r.fluidMl === 300)).toBe(true);
  });
  it("adds an hourly electrolyte when the gels fall short on sodium", () => {
    const rows = raceDayTimeline({
      durationHours: 3, carbsPerHour: 60, sodiumPerHour: 800, fluidPerHourMl: 600, carbProduct: gel,
      sodiumProduct: { name: "Salt", carbsPerServing: 0, sodiumPerServing: 350 },
    });
    const salt = rows.filter((r) => r.product.startsWith("Salt"));
    expect(salt.map((r) => r.minute)).toEqual([60, 120]);
    // Gels at 30, 60, 90 … each carry 50mg, so each hour still needs about 700mg: 2 servings of 350.
    expect(salt[0].sodium).toBe(700);
  });
  it("shows distance markers when a distance is given", () => {
    const rows = raceDayTimeline({ durationHours: 4, carbsPerHour: 60, sodiumPerHour: 0, fluidPerHourMl: 600, carbProduct: gel, distanceKm: 42.2 });
    expect(rows[0].km).toBeCloseTo(5.3, 1);
  });
  it("totals carbs, fluid and sodium", () => {
    const rows = raceDayTimeline({ durationHours: 2, carbsPerHour: 60, sodiumPerHour: 0, fluidPerHourMl: 600, carbProduct: gel });
    expect(timelineTotals(rows)).toEqual({ carbs: 120, fluidMl: 1200, sodium: 200 });
  });
});
