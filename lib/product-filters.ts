// lib/product-filters.ts
// The filters on category pages and search: tested for sport, caffeine-free, vegan, gluten-free,
// dairy-free, a maximum price per serving and a minimum of carbs per serving, plus the sort order.
// They're kept in the page's URL (?tested=1&nocaffeine=1&diet=vegan&maxprice=2.5&mincarbs=25&sort=cost)
// so a filtered list can be shared. Every filter uses the same definitions as swaps and the
// supplement finder (lib/product-flags.ts, lib/quality-standards.ts). Client-safe.

import type { ProductSummary } from "./catalog-types";
import { meetsDiet, type DietId } from "./quality-standards";
import { isCaffeineFree, isSportTested } from "./product-flags";
import { costPerHour } from "./cost";

export const FILTER_DIETS: { id: DietId; label: string }[] = [
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
];

export type SortId = "rating" | "score" | "price" | "cost";
export const SORTS: { id: SortId; label: string; carbOnly?: boolean }[] = [
  { id: "rating", label: "Top rated" },
  { id: "score", label: "Pello Score" },
  { id: "price", label: "Price per serving" },
  { id: "cost", label: "Cost per hour", carbOnly: true },
];

export interface ProductFilters {
  tested: boolean;
  noCaffeine: boolean;
  diets: DietId[];
  maxPrice: number | null;  // dollars per serving
  minCarbs: number | null;  // grams per serving
  sort: SortId;
}

export const NO_FILTERS: ProductFilters = { tested: false, noCaffeine: false, diets: [], maxPrice: null, minCarbs: null, sort: "rating" };

// The facts the filters and sorts need, small enough to send to the browser for every product.
export interface FilterFacts {
  id: string;
  tested: boolean;
  caffeineFree: boolean;
  diets: DietId[];
  pricePerServing: number;
  carbs: number | null;
  costPerHour: number | null;
  pelloScore: number | null;
  weightedRating: number;
}

export function filterFacts(p: ProductSummary): FilterFacts {
  const diet = { isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens };
  return {
    id: p.id,
    tested: isSportTested(p.certifications),
    caffeineFree: isCaffeineFree(p),
    diets: FILTER_DIETS.map((d) => d.id).filter((d) => meetsDiet(diet, d)),
    pricePerServing: p.pricePerServing,
    carbs: p.nutrition.carbsPerServing,
    costPerHour: costPerHour(p)?.cost ?? null,
    pelloScore: p.pelloScore,
    weightedRating: p.weightedRating,
  };
}

const positive = (v: string | null): number | null => {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Filters from a URL's query string. Unknown or invalid values are ignored.
export function parseFilters(q: URLSearchParams): ProductFilters {
  const diets = FILTER_DIETS.map((d) => d.id).filter((d) => q.getAll("diet").includes(d));
  const sort = SORTS.find((s) => s.id === q.get("sort"))?.id ?? "rating";
  return {
    tested: q.get("tested") === "1",
    noCaffeine: q.get("nocaffeine") === "1",
    diets,
    maxPrice: positive(q.get("maxprice")),
    minCarbs: positive(q.get("mincarbs")),
    sort,
  };
}

// The query string for a set of filters (without "?"); empty when nothing is set.
export function filtersQuery(f: ProductFilters): string {
  const q = new URLSearchParams();
  if (f.tested) q.set("tested", "1");
  if (f.noCaffeine) q.set("nocaffeine", "1");
  for (const d of f.diets) q.append("diet", d);
  if (f.maxPrice != null) q.set("maxprice", String(f.maxPrice));
  if (f.minCarbs != null) q.set("mincarbs", String(f.minCarbs));
  if (f.sort !== "rating") q.set("sort", f.sort);
  return q.toString();
}

export function activeFilterCount(f: ProductFilters): number {
  return Number(f.tested) + Number(f.noCaffeine) + f.diets.length + Number(f.maxPrice != null) + Number(f.minCarbs != null);
}

// Unknown values never pass a filter: a product without stated carbs is left out by "minimum
// carbs", and one without a price by "maximum price".
export function matchesFilters(p: FilterFacts, f: ProductFilters): boolean {
  if (f.tested && !p.tested) return false;
  if (f.noCaffeine && !p.caffeineFree) return false;
  if (!f.diets.every((d) => p.diets.includes(d))) return false;
  if (f.maxPrice != null && !(p.pricePerServing > 0 && p.pricePerServing <= f.maxPrice)) return false;
  if (f.minCarbs != null && !(p.carbs != null && p.carbs >= f.minCarbs)) return false;
  return true;
}

// Comparator for a sort. Products without the value (no price, no cost per hour) go last.
export function compareBy(sort: SortId): (a: FilterFacts, b: FilterFacts) => number {
  const last = (v: number | null | undefined) => (v == null || !(v > 0) ? Infinity : v);
  const asc = (x: number, y: number) => (x === y ? 0 : x - y);
  switch (sort) {
    case "score": return (a, b) => (b.pelloScore ?? -1) - (a.pelloScore ?? -1) || b.weightedRating - a.weightedRating;
    case "price": return (a, b) => asc(last(a.pricePerServing), last(b.pricePerServing)) || b.weightedRating - a.weightedRating;
    case "cost": return (a, b) => asc(last(a.costPerHour), last(b.costPerHour)) || b.weightedRating - a.weightedRating;
    default: return (a, b) => b.weightedRating - a.weightedRating;
  }
}

// The ids that pass the filters, in the chosen order.
export function applyFilters(facts: FilterFacts[], f: ProductFilters): string[] {
  return facts.filter((p) => matchesFilters(p, f)).sort(compareBy(f.sort)).map((p) => p.id);
}
