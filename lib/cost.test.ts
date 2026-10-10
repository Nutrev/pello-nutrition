import { describe, expect, it } from "vitest";
import { cheapestEquivalent, costPerGramCarb, fuelingCost, type Costed } from "./cost";

const p = (id: string, category: string, price: number, carbs: number | null, caffeine = false): Costed =>
  ({ id, category, pricePerServing: price, nutrition: { carbsPerServing: carbs, hasCaffeine: caffeine } });

describe("cost per gram of carb", () => {
  it("divides price per serving by carbs per serving", () => {
    expect(costPerGramCarb(p("a", "Energy Gel", 3, 25))).toBeCloseTo(0.12);
  });
  it("is unknown without stated carbs or a price", () => {
    expect(costPerGramCarb(p("a", "Energy Gel", 3, null))).toBeNull();
    expect(costPerGramCarb(p("a", "Energy Gel", 0, 25))).toBeNull();
  });
  it("prices a plan by whole servings", () => {
    expect(fuelingCost(p("a", "Energy Gel", 3, 25), 90)).toEqual({ servings: 4, cost: 12 });
  });
});

describe("cheapestEquivalent", () => {
  const base = p("base", "Energy Gel", 3, 25);
  const catalog = [
    base,
    p("cheap-gel", "Energy Gel", 1.5, 22),
    p("cheaper-gel", "Energy Gel", 1.2, 24),
    p("cheap-chew", "Energy Chew", 0.5, 24),        // different format
    p("tiny-gel", "Energy Gel", 0.5, 10),           // carbs too different
    p("caffeinated", "Energy Gel", 0.6, 25, true),  // caffeine doesn't match
    p("pricier", "Energy Gel", 4, 25),
  ];
  it("finds the cheapest same-format product with similar carbs and caffeine", () => {
    expect(cheapestEquivalent(base, catalog)?.id).toBe("cheaper-gel");
  });
  it("respects the plan's own filters", () => {
    expect(cheapestEquivalent(base, catalog, (x) => x.id !== "cheaper-gel")?.id).toBe("cheap-gel");
  });
  it("returns null when nothing is cheaper", () => {
    expect(cheapestEquivalent(catalog[1 + 1], catalog.filter((x) => x.id !== "tiny-gel" && x.id !== "caffeinated"))).toBeNull();
  });
  it("never reorders or changes the catalog", () => {
    const before = catalog.map((x) => x.id);
    cheapestEquivalent(base, catalog);
    expect(catalog.map((x) => x.id)).toEqual(before);
  });
});
