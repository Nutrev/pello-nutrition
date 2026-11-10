// lib/swaps.ts
// Swap suggestions for a report page: similar products that are cheaper, caffeine-free, vegan or
// tested for sport. Worked out at build time from catalog data only; nothing is estimated.
//
// "Similar" means the same category and about the same dose of what the product is bought for:
//   gels, chews, bars, carb mixes  carbs per serving within ±25% (and hydrogel only with hydrogel)
//   protein                        protein per serving within ±25%
//   hydration                      sodium per serving within ±25%
//   creatine                       creatine per serving within ±25%
// Other categories get no swaps: their products are too varied to call two of them alike from the
// data (a Performance supplement can be anything from CoQ10 to a pre-workout).
//
// A swap never gives up something the product already has: a caffeinated product's swaps are
// caffeinated unless the reason is "Caffeine-free", and a vegan or sport-tested product's swaps
// are vegan or sport-tested too. Suggestions need a Pello Score at or above their category's
// median, so they're never a step down on quality.

import type { ProductSummary } from "./catalog-types";
import { byWeightedRating } from "./catalog-types";
import { meetsDiet } from "./quality-standards";
import { hasStimulant, isSportTested } from "./product-flags";

export type SwapReason = "cheaper" | "caffeine-free" | "vegan" | "tested";
export const SWAP_REASONS: SwapReason[] = ["cheaper", "caffeine-free", "vegan", "tested"];
export const SWAP_LABEL: Record<SwapReason, string> = {
  cheaper: "Cheaper",
  "caffeine-free": "Caffeine-free",
  vegan: "Vegan",
  tested: "Tested for sport",
};

export interface Swap {
  id: string;
  reasons: SwapReason[];
  // Both products' cost on the same basis, when the reasons include "cheaper".
  cost?: { own: number; swap: number; unit: string };
}

export const SWAP_TOLERANCE = 0.25;
// "Cheaper" means at least this much cheaper on the same basis, so a few cents don't count.
export const CHEAPER_BY = 0.1;
export const MAX_SWAPS = 4;

const CARB_CATEGORIES = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix"];

type Basis = { amount: number; unit: string };

// Grams of creatine per serving, from the creatine line on the label.
function creatineGrams(p: ProductSummary): number | null {
  const i = p.ingredients.find((x) => /creatine|creapure/i.test(x.name));
  const m = i?.dose?.match(/^\s*(\d+(?:\.\d+)?)\s*(mg|g)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2].toLowerCase() === "mg" ? n / 1000 : n;
}

// What the product is compared on, or null when the category has no swap rule or the label
// doesn't state the amount.
export function swapBasis(p: ProductSummary): Basis | null {
  const n = p.nutrition;
  const pos = (v: number | null | undefined) => (v != null && v > 0 ? v : null);
  if (CARB_CATEGORIES.includes(p.category)) { const v = pos(n.carbsPerServing); return v ? { amount: v, unit: "g of carbs" } : null; }
  if (p.category === "Protein") { const v = pos(n.proteinPerServing); return v ? { amount: v, unit: "g of protein" } : null; }
  if (p.category === "Hydration") { const v = pos(n.sodiumPerServing); return v ? { amount: v, unit: "serving" } : null; }
  if (p.category === "Creatine") { const v = pos(creatineGrams(p)); return v ? { amount: v, unit: "g of creatine" } : null; }
  return null;
}

// Price for one unit of the basis: per gram of carbs, protein or creatine; per serving for
// hydration (servings are already matched on sodium).
function unitCost(p: ProductSummary, b: Basis): number | null {
  if (!(p.pricePerServing > 0)) return null;
  return b.unit === "serving" ? p.pricePerServing : p.pricePerServing / b.amount;
}

const isVegan = (p: ProductSummary) => meetsDiet({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens }, "vegan");

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  if (!s.length) return Infinity;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Each category's median Pello Score: the minimum for a product to be suggested as a swap.
export function swapScoreFloors(catalog: ProductSummary[]): Map<string, number> {
  const by = new Map<string, number[]>();
  for (const p of catalog) if (p.pelloScore != null) (by.get(p.category) ?? by.set(p.category, []).get(p.category)!).push(p.pelloScore);
  return new Map(Array.from(by, ([c, v]) => [c, median(v)]));
}

const byScore = (a: ProductSummary, b: ProductSummary) => (b.pelloScore ?? 0) - (a.pelloScore ?? 0) || byWeightedRating(a, b);

export function findSwaps(product: ProductSummary, catalog: ProductSummary[], floors = swapScoreFloors(catalog)): Swap[] {
  const basis = swapBasis(product);
  if (!basis) return [];
  const own = unitCost(product, basis);
  const ownStim = hasStimulant(product);
  const ownVegan = isVegan(product);
  const ownTested = isSportTested(product.certifications);
  const floor = floors.get(product.category) ?? Infinity;

  const candidates: { p: ProductSummary; reasons: SwapReason[]; cost?: Swap["cost"] }[] = [];
  for (const p of catalog) {
    if (p.id === product.id || p.category !== product.category) continue;
    if (p.pelloScore == null || p.pelloScore < floor || !(p.pricePerServing > 0)) continue;
    const b = swapBasis(p);
    if (!b || Math.abs(b.amount - basis.amount) / basis.amount > SWAP_TOLERANCE) continue;
    if (CARB_CATEGORIES.includes(product.category) && p.nutrition.isHydrogel !== product.nutrition.isHydrogel) continue;
    const stim = hasStimulant(p);
    const vegan = isVegan(p);
    const tested = isSportTested(p.certifications);
    // Never give up what the product already has (caffeine is the exception, for "Caffeine-free").
    if ((stim && !ownStim) || (ownVegan && !vegan) || (ownTested && !tested)) continue;

    const reasons: SwapReason[] = [];
    const theirs = unitCost(p, b);
    let cost: Swap["cost"];
    if (own != null && theirs != null && theirs <= own * (1 - CHEAPER_BY)) {
      reasons.push("cheaper");
      cost = { own, swap: theirs, unit: basis.unit };
    }
    if (ownStim && !stim) reasons.push("caffeine-free");
    if (!ownVegan && vegan) reasons.push("vegan");
    if (!ownTested && tested) reasons.push("tested");
    if (!reasons.length) continue;
    candidates.push({ p, reasons, cost });
  }

  // The best-scoring product for each reason, then the best of the rest, up to MAX_SWAPS.
  candidates.sort((a, b) => byScore(a.p, b.p));
  const picked: typeof candidates = [];
  for (const r of SWAP_REASONS) {
    const c = candidates.find((x) => x.reasons.includes(r) && !picked.includes(x));
    if (c && picked.length < MAX_SWAPS) picked.push(c);
  }
  for (const c of candidates) if (picked.length < 3 && !picked.includes(c)) picked.push(c);
  return picked.map(({ p, reasons, cost }) => ({ id: p.id, reasons, ...(cost ? { cost } : {}) }));
}
