// lib/nutrition.ts
// Per-serving nutrition and label facts for a product, shared by Explore, the quiz and
// the Pello Score. Structured fields on the product (carbsPerServing, isVegan, …) are
// used when present; otherwise values are read from the ingredient list as a fallback.

import type { Product } from "./products";

export interface ProductNutrition {
  carbsPerServing: number | null;
  sodiumPerServing: number | null;
  caffeinePerServing: number | null;
  proteinPerServing: number | null;
  hasCaffeine: boolean;
  isHydrogel: boolean;
  glucoseFructoseRatio: string | null;
  isBatchTested: boolean;
  isVegan: boolean;
  isGlutenFree: boolean | null;
  certifications: string[];
}

const BATCH_TESTED = /informed sport|informed choice|nsf|cologne list|batch test/i;

// Best-effort values from the ingredient list, for products without structured fields.
function fromIngredients(p: Product) {
  let carbs: number | null = null;
  let sodium: number | null = null;
  let caffeine: number | null = null;
  let protein: number | null = null;
  let hasCaffeine = false;
  let isHydrogel = false;
  let ratio: string | null = null;

  for (const ing of p.ingredients ?? []) {
    const name = ing.name.toLowerCase();
    const dose = ing.dose?.toLowerCase() ?? "";

    const carbMatch = dose.match(/(\d+(?:\.\d+)?)\s*g?\s*carb/);
    if (carbMatch && carbs === null) carbs = parseFloat(carbMatch[1]);

    if (/\bsodium\b/.test(name) && !/bicarbonate|citrate/.test(name)) {
      const mg = dose.match(/(\d+(?:\.\d+)?)\s*mg/);
      if (mg && sodium === null) sodium = parseFloat(mg[1]);
    }

    if (name.includes("caffeine") || name.includes("green tea")) {
      hasCaffeine = true;
      const mg = dose.match(/(\d+(?:\.\d+)?)\s*mg/);
      if (mg) caffeine = parseFloat(mg[1]);
    }

    const protMatch = dose.match(/(\d+(?:\.\d+)?)\s*g?\s*protein/);
    if (protMatch && protein === null) protein = parseFloat(protMatch[1]);

    if (name.includes("hydrogel")) isHydrogel = true;

    const r = `${name} ${dose}`.match(/\b(2:1|1:0\.8|1:1)\b/);
    if (r && ratio === null) ratio = r[1];
  }

  const isBatchTested =
    p.sources?.some((s) => BATCH_TESTED.test(s.name)) ||
    p.ingredients?.some((i) => BATCH_TESTED.test(i.note)) ||
    false;

  const isVegan = !p.ingredients?.some((i) => /whey|casein|egg|collagen|milk|honey|gelatin/i.test(i.name));

  return { carbs, sodium, caffeine, protein, hasCaffeine, isHydrogel, ratio, isBatchTested, isVegan };
}

export function productNutrition(p: Product): ProductNutrition {
  const f = fromIngredients(p);
  const caffeine = p.caffeinePerServing ?? f.caffeine;
  return {
    carbsPerServing: p.carbsPerServing ?? f.carbs,
    sodiumPerServing: p.sodiumPerServing ?? f.sodium,
    caffeinePerServing: caffeine,
    proteinPerServing: p.proteinPerServing ?? f.protein,
    // A caffeinated flavour counts even when caffeine varies by flavour (no single value).
    hasCaffeine: (p.caffeinePerServing ?? 0) > 0 || f.hasCaffeine,
    isHydrogel: p.isHydrogel ?? f.isHydrogel,
    glucoseFructoseRatio: p.glucoseFructoseRatio ?? f.ratio,
    isBatchTested: p.isBatchTested ?? f.isBatchTested,
    isVegan: p.isVegan ?? f.isVegan,
    isGlutenFree: p.isGlutenFree ?? null,
    certifications: p.certifications ?? [],
  };
}
