import { describe, expect, it } from "vitest";
import { findSwaps, swapBasis, swapScoreFloors } from "./swaps";
import { summary } from "./test-fixtures";
import { getProductSummaries } from "./catalog";
import { isSportTested, hasStimulant } from "./product-flags";

const gel = (id: string, o: Parameters<typeof summary>[0] = {}) =>
  summary({ id, name: id, brand: id, category: "Energy Gel", pricePerServing: 3, pelloScore: 70, ...o, nutrition: { carbsPerServing: 25, ...o.nutrition } });

describe("swapBasis", () => {
  it("compares fuel on carbs, protein on protein, hydration on sodium and creatine on creatine", () => {
    expect(swapBasis(gel("a"))).toEqual({ amount: 25, unit: "g of carbs" });
    expect(swapBasis(summary({ category: "Protein", nutrition: { proteinPerServing: 24 } }))).toEqual({ amount: 24, unit: "g of protein" });
    expect(swapBasis(summary({ category: "Hydration", nutrition: { sodiumPerServing: 500, carbsPerServing: 20 } }))).toEqual({ amount: 500, unit: "serving" });
    expect(swapBasis(summary({ category: "Creatine", ingredients: [{ name: "Creatine Monohydrate", dose: "5000mg", verdict: "proven" }] }))).toEqual({ amount: 5, unit: "g of creatine" });
  });
  it("has no basis for other categories or a missing amount", () => {
    expect(swapBasis(summary({ category: "Performance", nutrition: { carbsPerServing: 25 } }))).toBeNull();
    expect(swapBasis(gel("a", { nutrition: { carbsPerServing: null } }))).toBeNull();
  });
});

describe("findSwaps", () => {
  const base = gel("base", { pricePerServing: 3 });
  const floors = new Map([["Energy Gel", 60]]);

  it("labels a cheaper product with about the same carbs", () => {
    const s = findSwaps(base, [base, gel("cheap", { pricePerServing: 2 })], floors);
    expect(s).toEqual([{ id: "cheap", reasons: ["cheaper"], cost: { own: 0.12, swap: 0.08, unit: "g of carbs" } }]);
  });
  it("leaves out products outside ±25% carbs, another category, below the score floor, or barely cheaper", () => {
    const s = findSwaps(base, [base,
      gel("small", { pricePerServing: 1, nutrition: { carbsPerServing: 15 } }),
      gel("chew", { category: "Energy Chew", pricePerServing: 1 }),
      gel("low-score", { pricePerServing: 1, pelloScore: 50 }),
      gel("pennies", { pricePerServing: 2.9 }),
    ], floors);
    expect(s).toEqual([]);
  });
  it("only matches hydrogel with hydrogel", () => {
    expect(findSwaps(base, [base, gel("hydro", { pricePerServing: 1, nutrition: { isHydrogel: true } })], floors)).toEqual([]);
  });
  it("suggests caffeine-free swaps for a caffeinated product, never caffeinated ones for a caffeine-free product", () => {
    const caf = gel("caf", { nutrition: { hasCaffeine: true, caffeinePerServing: 100 } });
    expect(findSwaps(caf, [caf, gel("plain", { pricePerServing: 3 })], floors)[0].reasons).toEqual(["caffeine-free"]);
    expect(findSwaps(base, [base, gel("cheap-caf", { pricePerServing: 1, nutrition: { hasCaffeine: true } })], floors)).toEqual([]);
  });
  it("treats caffeine in an ingredient or the name (e.g. guarana) as caffeinated", () => {
    const g = gel("guarana", { pricePerServing: 1, ingredients: [{ name: "Guarana Extract", dose: "", verdict: "likely" }] });
    expect(findSwaps(base, [base, g], floors)).toEqual([]);
  });
  it("never gives up vegan or sport testing", () => {
    const vegan = gel("vegan", { nutrition: { isVegan: true } });
    const tested = gel("tested", { certifications: ["Informed Sport"] });
    expect(findSwaps(vegan, [vegan, gel("cheap", { pricePerServing: 1 })], floors)).toEqual([]);
    expect(findSwaps(tested, [tested, gel("cheap", { pricePerServing: 1 })], floors)).toEqual([]);
  });
  it("labels vegan and tested swaps, and combines reasons", () => {
    const s = findSwaps(base, [base, gel("both", { pricePerServing: 1.5, nutrition: { isVegan: true }, certifications: ["Cologne List"] })], floors);
    expect(s[0].reasons).toEqual(["cheaper", "vegan", "tested"]);
  });
  it("shows at most four", () => {
    const many = Array.from({ length: 10 }, (_, i) => gel(`c${i}`, { pricePerServing: 1 + i * 0.1 }));
    expect(findSwaps(base, [base, ...many], floors).length).toBeLessThanOrEqual(4);
  });
});

describe("findSwaps on the catalog", () => {
  const all = getProductSummaries();
  const floors = swapScoreFloors(all);
  const byId = new Map(all.map((p) => [p.id, p]));
  it("keeps every rule for every product", () => {
    let withSwaps = 0;
    for (const p of all) {
      const swaps = findSwaps(p, all, floors);
      if (swaps.length) withSwaps++;
      for (const s of swaps) {
        const o = byId.get(s.id)!;
        expect(o.category).toBe(p.category);
        expect(o.pelloScore!).toBeGreaterThanOrEqual(floors.get(p.category)!);
        if (isSportTested(p.certifications)) expect(isSportTested(o.certifications)).toBe(true);
        if (!hasStimulant(p)) expect(hasStimulant(o)).toBe(false);
        if (s.reasons.includes("caffeine-free")) expect(hasStimulant(o)).toBe(false);
        if (s.reasons.includes("cheaper")) expect(s.cost!.swap).toBeLessThan(s.cost!.own);
      }
    }
    expect(withSwaps).toBeGreaterThan(400);
  });
});
