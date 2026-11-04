import { describe, expect, it } from "vitest";
import { getProductSummaries } from "./catalog";
import { DRUG_TESTED_CERTS, finderHref, finderResults, parseFinderParams } from "./supplement-finder";
import { fitsGoal } from "./planner-modes";

const products = getProductSummaries();

describe("parseFinderParams", () => {
  it("needs a known goal", () => {
    expect(parseFinderParams({})).toBeNull();
    expect(parseFinderParams({ goal: "nonsense" })).toBeNull();
    expect(parseFinderParams({ goal: "body-comp" })).toBeNull();
  });
  it("reads the filters and ignores unknown values", () => {
    expect(parseFinderParams({ goal: "sleep", tested: "1", diet: ["vegan", "keto"], nocaffeine: "1" }))
      .toEqual({ goal: "sleep", tested: true, diets: ["vegan"], noCaffeine: true });
    expect(parseFinderParams({ goal: "gut", tested: "0" })).toEqual({ goal: "gut", tested: false, diets: [], noCaffeine: false });
  });
  it("round-trips through finderHref", () => {
    const i = { goal: "recovery" as const, tested: true, diets: ["gluten-free" as const], noCaffeine: false };
    const q = Object.fromEntries(new URL(`https://x${finderHref(i)}`).searchParams);
    expect(parseFinderParams(q)).toEqual(i);
  });
});

describe("finderResults", () => {
  const base = { tested: false, diets: [], noCaffeine: false };
  it("returns products that fit the goal, best Pello Score first within each category", () => {
    const r = finderResults(products, { ...base, goal: "sleep" });
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(fitsGoal(x.product, "sleep")).toBe(true);
    for (const cat of ["Sleep", "Mineral"]) {
      const scores = r.filter((x) => x.product.category === cat).map((x) => x.product.pelloScore ?? 0);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    }
  });
  it("mixes categories instead of filling the list with one", () => {
    const r = finderResults(products, { ...base, goal: "recovery" });
    expect(new Set(r.map((x) => x.product.category)).size).toBeGreaterThan(2);
  });
  it("shows at most two products per brand", () => {
    const r = finderResults(products, { ...base, goal: "endurance" });
    const counts = new Map<string, number>();
    for (const x of r) counts.set(x.product.brand, (counts.get(x.product.brand) ?? 0) + 1);
    expect(Math.max(...Array.from(counts.values()))).toBeLessThanOrEqual(2);
  });
  it("keeps only drug-tested products when asked", () => {
    const r = finderResults(products, { ...base, goal: "recovery", tested: true });
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect((x.product.certifications ?? []).some((c) => DRUG_TESTED_CERTS.includes(c))).toBe(true);
  });
  it("leaves out caffeine and other stimulants when asked", () => {
    const r = finderResults(products, { ...base, goal: "cognitive", noCaffeine: true });
    for (const x of r) {
      expect(x.product.nutrition.hasCaffeine).toBe(false);
      expect(x.product.ingredients.some((i) => /caffeine|guarana|coffee|theacrine/i.test(i.name))).toBe(false);
    }
  });
  it("respects dietary needs", () => {
    for (const x of finderResults(products, { ...base, goal: "health", diets: ["vegan"] })) expect(x.product.nutrition.isVegan).toBe(true);
  });
  it("flags 5-HTP", () => {
    const p = products.find((x) => x.id === "pure-encapsulations-5-htp");
    expect(p).toBeDefined();
    const r = finderResults([p!], { ...base, goal: "sleep" });
    expect(r[0]?.cautions.some((c) => /5-HTP/.test(c))).toBe(true);
  });
});
