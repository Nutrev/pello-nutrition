// lib/catalog-types.ts
// The slim product shape sent to the browser, and helpers that work on it. Safe to import
// from client components: it holds no product data. The data itself stays on the server
// (lib/products.ts, read through lib/catalog.ts), so pages don't ship every product's
// ingredient notes, research links and sources to every visitor.

import type { Product } from "./products";
import type { ProductNutrition } from "./nutrition";

export type ProductSummary = Pick<
  Product,
  | "id" | "name" | "brand" | "category" | "rating" | "reviewCount" | "price" | "goals"
  | "transparencyScore" | "imageEmoji" | "logo" | "logoSize" | "logoDomain" | "sentiment"
  | "certifications" | "allergens" | "servingsPerContainer" | "retailerLinks"
> & {
  // Ingredient names, doses and verdicts, without the notes and links.
  ingredients: Pick<Product["ingredients"][number], "name" | "dose" | "verdict">[];
  nutrition: ProductNutrition;
  pricePerServing: number;
  // Rating weighted by review count (see lib/ratings.ts); -1 when there are no reviews.
  weightedRating: number;
};

// Comparator for Array.sort: best-rated first, weighting ratings by how many reviews back them.
export function byWeightedRating(a: { weightedRating: number }, b: { weightedRating: number }): number {
  return b.weightedRating - a.weightedRating;
}

// URL slug for a category page, e.g. "Energy Gel" → "energy-gel" (/products/energy-gel).
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
}
