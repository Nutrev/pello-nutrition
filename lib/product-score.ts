// lib/product-score.ts
// A product's Pello Score™, calculated the same way everywhere it's shown (product pages,
// brand pages). Client-safe: works on a Product passed in, holds no product data.

import type { Product } from "./products";
import { calculatePelloScore, type FulensScoreBreakdown } from "./fulens-score";
import { productNutrition } from "./nutrition";
import { pricePerServing } from "./servings";

export function productPelloScore(product: Product): FulensScoreBreakdown {
  const nutrition = productNutrition(product);
  return calculatePelloScore({
    category: product.category,
    ingredients: product.ingredients.map((i) => ({
      name: i.name,
      verdict: i.verdict as "proven" | "likely" | "disputed",
      dose: i.dose,
    })),
    // From the label: a proprietary blend line means some amounts aren't disclosed.
    hasProprietaryBlend: product.ingredients.some((i) => /proprietary/i.test(i.name)),
    // Additives can't be checked: the other-ingredients list isn't stored. Scored neutrally.
    isCleanLabel: null,
    certifications: nutrition.certifications,
    isBatchTested: nutrition.isBatchTested,
    // Informed Sport / NSF Certified for Sport / Cologne List certification is banned-substance testing.
    bannedSubstanceTested: nutrition.isBatchTested,
    pricePerServing: pricePerServing(product),
    carbsPerServing: nutrition.carbsPerServing ?? undefined,
    proteinPerServing: nutrition.proteinPerServing ?? undefined,
    sodiumPerServing: nutrition.sodiumPerServing ?? undefined,
    isVegan: nutrition.isVegan,
    isGlutenFree: nutrition.isGlutenFree ?? null,
    allergens: product.allergens ?? [],
    allergensKnown: product.allergens !== undefined,
    sentiment: product.sentiment,
    reviewCount: product.reviewCount,
    rating: product.rating,
    transparencyScore: product.transparencyScore,
  });
}
