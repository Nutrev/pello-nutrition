import { describe, expect, it } from "vitest";
import { parseAskQuery, type AskQuery } from "./query";
import { runAskQuery, describeAskQuery, exploreHref } from "./run";
import { looksLikeQuestion } from "./detect";
import { limitForAccess, FREE_RESULTS } from "./access";
import type { ProductSummary } from "../catalog-types";
import { getProductSummaries } from "../catalog";

const q = (over: Partial<AskQuery> = {}): AskQuery => ({
  supported: true, unsupportedReason: null, categories: [], brand: null, filters: [], vegan: null, glutenFree: null,
  hydrogel: null, caffeine: null, certifications: [], sort: null, limit: 10, ...over,
});

// A tiny catalogue with just the fields the runner reads.
const prod = (id: string, over: Partial<ProductSummary> & { carbs?: number | null; sodium?: number | null; vegan?: boolean | null; caffeine?: boolean } = {}): ProductSummary => ({
  id, name: id.toUpperCase(), brand: over.brand ?? "Brand", category: over.category ?? "Energy Gel",
  rating: over.rating ?? 4.5, reviewCount: over.reviewCount ?? 100, reviewSource: "The Feed", price: 30, pricePerServing: over.pricePerServing ?? 2,
  weightedRating: over.weightedRating ?? 4, standards: over.standards ?? [], pelloScore: over.pelloScore ?? 60, allergens: [],
  nutrition: {
    carbsPerServing: over.carbs === undefined ? 25 : over.carbs, sodiumPerServing: over.sodium === undefined ? 50 : over.sodium,
    caffeinePerServing: null, proteinPerServing: null, hasCaffeine: over.caffeine ?? false, isHydrogel: false, glucoseFructoseRatio: null,
    isVegan: over.vegan === undefined ? null : over.vegan, isGlutenFree: null,
  },
} as unknown as ProductSummary);

describe("parseAskQuery (the model's output is checked again)", () => {
  it("accepts a valid query and clamps the limit", () => {
    const parsed = parseAskQuery({ ...q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" } }), limit: 500 });
    expect(parsed?.limit).toBe(20);
    expect(parsed?.categories).toEqual(["Energy Gel"]);
  });
  it("rejects unknown fields, operators and negative values", () => {
    expect(parseAskQuery({ ...q(), filters: [{ field: "taste", op: "gte", value: 1 }] })).toBeNull();
    expect(parseAskQuery({ ...q(), filters: [{ field: "carbsPerServing", op: "eq", value: 1 }] })).toBeNull();
    expect(parseAskQuery({ ...q(), filters: [{ field: "carbsPerServing", op: "gte", value: -5 }] })).toBeNull();
    expect(parseAskQuery({ ...q(), sort: { field: "price", direction: "desc" } })).toBeNull();
    expect(parseAskQuery("not an object")).toBeNull();
  });
  it("drops unknown categories and certifications", () => {
    const parsed = parseAskQuery({ ...q(), categories: ["Energy Gel", "Candy"], certifications: ["informed-sport", "made-up"] });
    expect(parsed?.categories).toEqual(["Energy Gel"]);
    expect(parsed?.certifications).toEqual(["informed-sport"]);
  });
  it("keeps an unsupported reason only for unsupported questions", () => {
    expect(parseAskQuery({ ...q({ supported: false }), unsupportedReason: "taste" })?.unsupportedReason).toBe("taste");
    expect(parseAskQuery({ ...q({ supported: false }), unsupportedReason: "whatever" })?.unsupportedReason).toBe("other");
  });
});

describe("runAskQuery", () => {
  const catalog = [
    prod("a", { carbs: 40, weightedRating: 3 }),
    prod("b", { carbs: 90, weightedRating: 4 }),
    prod("c", { carbs: null }),
    prod("d", { carbs: 60, category: "Carbohydrate Mix" }),
    prod("e", { carbs: 90, weightedRating: 4.5 }),
  ];
  it("sorts by the field and breaks ties by Pello's usual order", () => {
    const r = runAskQuery(q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" } }), catalog);
    expect(r.items.map((i) => i.id)).toEqual(["e", "b", "a"]);
    expect(r.items[0].highlight).toBe("90g carbs");
  });
  it("leaves out products missing the figure, and counts them", () => {
    const r = runAskQuery(q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" } }), catalog);
    expect(r.items.map((i) => i.id)).not.toContain("c");
    expect(r.missing).toEqual({ count: 1, label: "carbs per serving" });
  });
  it("applies filters", () => {
    const r = runAskQuery(q({ filters: [{ field: "carbsPerServing", op: "gte", value: 60 }] }), catalog);
    expect(r.items.map((i) => i.id).sort()).toEqual(["b", "d", "e"]);
    expect(r.total).toBe(3);
  });
  it("limits results but reports the total", () => {
    const r = runAskQuery(q({ sort: { field: "carbsPerServing", direction: "asc" }, limit: 2 }), catalog);
    expect(r.items.map((i) => i.id)).toEqual(["a", "d"]);
    expect(r.total).toBe(4);
  });
  it("treats 'vegan' as labeled only", () => {
    const r = runAskQuery(q({ vegan: true }), [prod("v", { vegan: true }), prod("x", { vegan: null }), prod("n", { vegan: false })]);
    expect(r.items.map((i) => i.id)).toEqual(["v"]);
  });
  it("filters by caffeine and brand", () => {
    const cat = [prod("c1", { caffeine: true, brand: "Maurten" }), prod("c2", { brand: "Maurten" }), prod("c3", { brand: "SiS" })];
    expect(runAskQuery(q({ caffeine: "without", brand: "maurten" }), cat).items.map((i) => i.id)).toEqual(["c2"]);
  });
  it("ranks ratings by the review-weighted rating", () => {
    const cat = [prod("one-review", { rating: 5, reviewCount: 1, weightedRating: 4.1 }), prod("many", { rating: 4.9, reviewCount: 310, weightedRating: 4.8 })];
    expect(runAskQuery(q({ sort: { field: "rating", direction: "desc" } }), cat).items.map((i) => i.id)).toEqual(["many", "one-review"]);
  });
  it("never shows a rating for products without reviews", () => {
    const r = runAskQuery(q({ sort: { field: "rating", direction: "desc" } }), [prod("none", { reviewCount: 0 })]);
    expect(r.items).toEqual([]);
  });
});

describe("how the question was read", () => {
  it("describes the query in plain words", () => {
    expect(describeAskQuery(q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" } }))).toEqual(["Energy gels", "Carbs per serving · highest first"]);
    expect(describeAskQuery(q({ categories: ["Carbohydrate Mix"], caffeine: "without", filters: [{ field: "pricePerServing", op: "lte", value: 2 }] })))
      .toEqual(["Carbohydrate drink mixes", "At most $2.00 price per serving", "Caffeine-free"]);
  });
  it("links to the same view in Explore", () => {
    expect(exploreHref(q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" } }))).toBe("/query?category=Energy+Gel&sort=carbsPerServing&dir=desc");
    expect(exploreHref(q())).toBe("/query");
  });
});

describe("question detection", () => {
  it("recognizes questions", () => {
    for (const t of ["What gels have the most carbs per gel?", "which electrolytes have the most sodium", "gels under $2", "best energy bars", "vegan protein powders", "caffeine-free drink mix options"]) {
      expect(looksLikeQuestion(t)).toBe(true);
    }
  });
  it("leaves plain names to the name search", () => {
    for (const t of ["Maurten", "gu roctane gel", "Precision Fuel PF 90", "beta fuel"]) expect(looksLikeQuestion(t)).toBe(false);
  });
});

describe("free vs Pro", () => {
  it("shows free visitors the top results only, and Pro members everything", () => {
    expect(limitForAccess(10, false)).toBe(FREE_RESULTS);
    expect(limitForAccess(2, false)).toBe(2);
    expect(limitForAccess(20, true)).toBe(20);
  });
});

describe("on Pello's real catalogue", () => {
  it("answers 'most carbs per gel' with gels only, figures from the data", () => {
    const catalog = getProductSummaries();
    const r = runAskQuery(q({ categories: ["Energy Gel"], sort: { field: "carbsPerServing", direction: "desc" }, limit: 3 }), catalog);
    for (const item of r.items) {
      const p = catalog.find((x) => x.id === item.id)!;
      expect(p.category).toBe("Energy Gel");
      expect(item.highlight).toBe(`${p.nutrition.carbsPerServing}g carbs`);
    }
    // Gel Mix 480 is a carbohydrate mix, not a gel, so it doesn't top this list.
    expect(r.items[0].id).not.toBe("maurten-gel-mix-480");
  });
});
