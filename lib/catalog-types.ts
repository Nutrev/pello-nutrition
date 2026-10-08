// lib/catalog-types.ts
// The slim product shape sent to the browser, and helpers that work on it. Safe to import
// from client components: it holds no product data. The data itself stays on the server
// (lib/products.ts, read through lib/catalog.ts), so pages don't ship every product's
// ingredient notes, research links and sources to every visitor.

import type { Product } from "./products";
import type { ProductNutrition } from "./nutrition";
import type { StandardId } from "./quality-standards";

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
  // Quality standards the product meets (lib/quality-standards.ts).
  standards: StandardId[];
  // Pello Score overall (0–100), as shown on the product page.
  pelloScore: number | null;
  // Where the rating and review count come from (e.g. "The Feed"); null if not recorded.
  reviewSource: string | null;
};

// The retailer whose customer ratings a product's rating and review count are, from its
// sources ("reviews" entries). Pello community reviews are separate (components/ReviewSection).
export function reviewSourceOf(p: Pick<Product, "sources">): string | null {
  return p.sources.find((s) => s.unit === "reviews")?.name ?? null;
}

// "1,426 reviews at The Feed" — the count always names whose reviews they are.
export function reviewsAt(count: number, source: string | null): string {
  return `${count.toLocaleString()} review${count === 1 ? "" : "s"}${source ? ` at ${source}` : ""}`;
}

// Hover text explaining a retailer review count.
export function reviewSourceNote(source: string | null): string {
  return source
    ? `Rating and review count from ${source}'s customers. Pello community reviews are shown separately on each product page.`
    : "Pello community reviews are shown separately on each product page.";
}

// Comparator for Array.sort: best-rated first, weighting ratings by how many reviews back them.
export function byWeightedRating(a: { weightedRating: number }, b: { weightedRating: number }): number {
  return b.weightedRating - a.weightedRating;
}

// URL slug for a category page, e.g. "Energy Gel" → "energy-gel" (/products/energy-gel).
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
}
