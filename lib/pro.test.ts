import { describe, expect, it } from "vitest";
import { rowIsPro, PRO_FEATURES, PRO_FEATURE_GROUPS } from "./pro";

const DAY = 24 * 60 * 60 * 1000;
const iso = (ms: number) => new Date(Date.now() + ms).toISOString();

describe("entitlement (rowIsPro)", () => {
  it("is Pro through an annual period", () => {
    expect(rowIsPro({ status: "pro", current_period_end: iso(300 * DAY) })).toBe(true);
  });
  it("allows 3 days' grace for a late renewal webhook", () => {
    expect(rowIsPro({ status: "pro", current_period_end: iso(-2 * DAY) })).toBe(true);
    expect(rowIsPro({ status: "pro", current_period_end: iso(-4 * DAY) })).toBe(false);
  });
  it("is never Pro on the free status or without a row", () => {
    expect(rowIsPro({ status: "free", current_period_end: iso(300 * DAY) })).toBe(false);
    expect(rowIsPro(null)).toBe(false);
  });
});

describe("pricing card", () => {
  it("still lists every Pro feature", () => {
    for (const f of ["Unlimited nutrition plans", "Save and revisit plans", "Compare up to 5 products", "Submit community reviews",
      "Supplement stack tracker", "Export plans and comparisons as PDF", "Goal-based planner"]) {
      expect(PRO_FEATURES.some((x) => x.startsWith(f))).toBe(true);
    }
    expect(PRO_FEATURES.some((x) => x.includes(".fit, .zwo, .erg, .mrc, .tcx"))).toBe(true);
    expect(PRO_FEATURES.some((x) => x.startsWith("intervals.icu"))).toBe(true);
  });
  it("leads with workout files and intervals.icu, then gut and race-day tools", () => {
    expect(PRO_FEATURE_GROUPS[0].heading).toBeNull();
    expect(PRO_FEATURE_GROUPS[1].heading).toBe("Train your gut and race-day fueling");
    expect(PRO_FEATURE_GROUPS[2]).toMatchObject({ heading: "Plus everything you need to go deeper", collapsed: true });
  });
});
