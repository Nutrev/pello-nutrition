// lib/ingredient-products.ts
// Which Pello products list each encyclopedia ingredient, found by matching each entry's
// productPattern against the ingredient names on product labels. Computed on the server
// so the lists always match the current catalog.
import "server-only";

import { INGREDIENT_TAXONOMY } from "./ingredient-taxonomy";
import { getProductSummaries } from "./catalog";
import { byWeightedRating } from "./catalog-types";

export interface IngredientProducts {
  count: number;
  top: { id: string; name: string; brand: string }[];  // best-rated first
}

let index: Record<string, IngredientProducts> | null = null;

export function getIngredientProductIndex(topN = 5): Record<string, IngredientProducts> {
  if (index) return index;
  const products = getProductSummaries();
  index = {};
  for (const ing of INGREDIENT_TAXONOMY) {
    if (!ing.productPattern) continue;
    const re = new RegExp(ing.productPattern, "i");
    const matches = products.filter((p) => p.ingredients.some((i) => re.test(i.name))).sort(byWeightedRating);
    index[ing.id] = {
      count: matches.length,
      top: matches.slice(0, topN).map(({ id, name, brand }) => ({ id, name, brand })),
    };
  }
  return index;
}
