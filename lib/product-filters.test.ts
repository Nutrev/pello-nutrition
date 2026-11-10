import { describe, expect, it } from "vitest";
import { applyFilters, filterFacts, filtersQuery, matchesFilters, NO_FILTERS, parseFilters } from "./product-filters";
import { summary } from "./test-fixtures";

describe("parseFilters / filtersQuery", () => {
  it("reads the URL and ignores unknown or invalid values", () => {
    const f = parseFilters(new URLSearchParams("tested=1&nocaffeine=1&diet=vegan&diet=keto&maxprice=2.5&mincarbs=abc&sort=cost"));
    expect(f).toEqual({ tested: true, noCaffeine: true, diets: ["vegan"], maxPrice: 2.5, minCarbs: null, sort: "cost" });
    expect(parseFilters(new URLSearchParams("sort=nonsense&maxprice=-1"))).toEqual(NO_FILTERS);
  });
  it("round-trips", () => {
    const f = { tested: true, noCaffeine: false, diets: ["gluten-free" as const, "dairy-free" as const], maxPrice: 3, minCarbs: 25, sort: "price" as const };
    expect(parseFilters(new URLSearchParams(filtersQuery(f)))).toEqual(f);
    expect(filtersQuery(NO_FILTERS)).toBe("");
  });
});

describe("matchesFilters", () => {
  const f = (o: Partial<typeof NO_FILTERS>) => ({ ...NO_FILTERS, ...o });
  it("tested means NSF, Informed Sport or Cologne List", () => {
    for (const c of ["NSF Certified for Sport", "Informed Sport", "Cologne List"]) expect(matchesFilters(filterFacts(summary({ certifications: [c] })), f({ tested: true }))).toBe(true);
    expect(matchesFilters(filterFacts(summary({ certifications: ["USDA Organic"] })), f({ tested: true }))).toBe(false);
  });
  it("caffeine-free leaves out caffeine that varies by flavor and stimulants in a blend", () => {
    const some = summary({ nutrition: { hasCaffeine: true, caffeinePerServing: null } });
    const blend = summary({ ingredients: [{ name: "Energy Blend (Guarana, Green Tea)", dose: "", verdict: "likely" }] });
    expect(matchesFilters(filterFacts(some), f({ noCaffeine: true }))).toBe(false);
    expect(matchesFilters(filterFacts(blend), f({ noCaffeine: true }))).toBe(false);
    expect(matchesFilters(filterFacts(summary()), f({ noCaffeine: true }))).toBe(true);
  });
  it("dairy-free needs a vegan label or an allergen statement without milk; an empty list doesn't count", () => {
    expect(matchesFilters(filterFacts(summary({ allergens: [] })), f({ diets: ["dairy-free"] }))).toBe(false);
    expect(matchesFilters(filterFacts(summary({ allergens: ["soy"] })), f({ diets: ["dairy-free"] }))).toBe(true);
    expect(matchesFilters(filterFacts(summary({ allergens: ["milk"] })), f({ diets: ["dairy-free"] }))).toBe(false);
    expect(matchesFilters(filterFacts(summary({ nutrition: { isVegan: true } })), f({ diets: ["dairy-free"] }))).toBe(true);
  });
  it("unknown carbs or price never pass a carb or price filter", () => {
    expect(matchesFilters(filterFacts(summary({ nutrition: { carbsPerServing: null } })), f({ minCarbs: 20 }))).toBe(false);
    expect(matchesFilters(filterFacts(summary({ pricePerServing: 0 })), f({ maxPrice: 5 }))).toBe(false);
    expect(matchesFilters(filterFacts(summary({ pricePerServing: 2, nutrition: { carbsPerServing: 25 } })), f({ minCarbs: 20, maxPrice: 2 }))).toBe(true);
  });
});

describe("applyFilters sorting", () => {
  const items = [
    summary({ id: "a", weightedRating: 3, pricePerServing: 1, nutrition: { carbsPerServing: 20 } }),       // $3.00/hr
    summary({ id: "b", weightedRating: 5, pricePerServing: 3, nutrition: { carbsPerServing: 60 } }),       // $3.00/hr, better rated
    summary({ id: "c", weightedRating: 4, pricePerServing: 0.5, nutrition: { carbsPerServing: 10 } }),     // under 15g: no cost per hour
  ].map(filterFacts);
  it("sorts by rating by default", () => expect(applyFilters(items, NO_FILTERS)).toEqual(["b", "c", "a"]));
  it("sorts by cost per hour with products without one last", () => expect(applyFilters(items, { ...NO_FILTERS, sort: "cost" })).toEqual(["b", "a", "c"]));
  it("sorts by price per serving", () => expect(applyFilters(items, { ...NO_FILTERS, sort: "price" })).toEqual(["c", "a", "b"]));
});
