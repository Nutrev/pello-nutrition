// lib/cost.ts
// Fueling cost tools (Pello Pro): what a plan's fueling costs, and the cheapest product that
// meets the same carb and format requirements. Uses the same cost-per-gram-of-carb figure as the
// Explore page (price per serving ÷ carbs per serving, from The Feed's prices).
//
// These only describe cost. They never change a Pello Score or the order products are ranked
// in; a cheaper suggestion is always shown next to its own Pello Score.

// The fields the cost tools need, so they work on full summaries and on slimmer product lists.
export interface Costed {
  id: string;
  category: string;
  pricePerServing: number;
  nutrition: { carbsPerServing: number | null; hasCaffeine?: boolean };
}

// Dollars per gram of carbohydrate; null when the label doesn't state carbs or there's no price.
export function costPerGramCarb(p: Pick<Costed, "pricePerServing" | "nutrition">): number | null {
  const carbs = p.nutrition.carbsPerServing;
  if (!carbs || carbs <= 0 || !(p.pricePerServing > 0)) return null;
  return p.pricePerServing / carbs;
}

// Servings of a product needed for a carb total, and what they cost.
export function fuelingCost(p: Pick<Costed, "pricePerServing" | "nutrition">, carbsTotal: number): { servings: number; cost: number } | null {
  const carbs = p.nutrition.carbsPerServing;
  if (!carbs || carbs <= 0 || carbsTotal <= 0 || !(p.pricePerServing > 0)) return null;
  const servings = Math.ceil(carbsTotal / carbs);
  return { servings, cost: Math.round(servings * p.pricePerServing * 100) / 100 };
}

// Carbs per serving may differ by this much (either way) and still count as the same requirement:
// close enough that the number of servings per hour barely changes.
export const EQUIVALENT_CARB_TOLERANCE = 0.25;

const hasCaffeine = (p: Costed) => !!p.nutrition.hasCaffeine;

// The cheapest product, per gram of carbohydrate, that's the same format (category), has carbs
// per serving within EQUIVALENT_CARB_TOLERANCE, matches on caffeine, and passes `eligible` (the
// plan's own diet, quality-standard and caffeine filters). null if nothing is cheaper.
export function cheapestEquivalent<T extends Costed>(product: T, catalog: T[], eligible: (p: T) => boolean = () => true): T | null {
  const own = costPerGramCarb(product);
  const carbs = product.nutrition.carbsPerServing;
  if (own == null || !carbs) return null;
  let best: { p: T; cost: number } | null = null;
  for (const p of catalog) {
    if (p.id === product.id || p.category !== product.category || hasCaffeine(p) !== hasCaffeine(product)) continue;
    const c = p.nutrition.carbsPerServing;
    if (!c || Math.abs(c - carbs) / carbs > EQUIVALENT_CARB_TOLERANCE) continue;
    const cost = costPerGramCarb(p);
    if (cost == null || cost >= own || !eligible(p)) continue;
    if (!best || cost < best.cost) best = { p, cost };
  }
  return best?.p ?? null;
}
