// lib/catalog.ts
// Server-side access to the product catalog. Pages read products here and pass the
// browser only what it needs: slim summaries for lists, the full product for its own page.
import "server-only";

import { PRODUCTS, type Product } from "./products";
import { productNutrition } from "./nutrition";
import { pricePerServing } from "./servings";
import { weightedRating } from "./ratings";
import type { ProductSummary } from "./catalog-types";
import { standardsFrom } from "./quality-standards";
import { productPelloScore } from "./product-score";

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    price: p.price,
    goals: p.goals,
    transparencyScore: p.transparencyScore,
    imageEmoji: p.imageEmoji,
    logo: p.logo,
    logoSize: p.logoSize,
    logoDomain: p.logoDomain,
    sentiment: p.sentiment,
    certifications: p.certifications,
    allergens: p.allergens,
    servingsPerContainer: p.servingsPerContainer,
    retailerLinks: p.retailerLinks,
    ingredients: p.ingredients.map(({ name, dose, verdict }) => ({ name, dose, verdict })),
    nutrition: productNutrition(p),
    pricePerServing: pricePerServing(p),
    weightedRating: weightedRating(p),
    standards: standardsFrom(p.certifications),
    pelloScore: productPelloScore(p)?.overall ?? null,
  };
}

let summaries: ProductSummary[] | null = null;

export function getProductSummaries(): ProductSummary[] {
  summaries ??= PRODUCTS.map(toSummary);
  return summaries;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCatalogStats() {
  return {
    productCount: PRODUCTS.length,
    reviewTotal: PRODUCTS.reduce((sum, p) => sum + p.reviewCount, 0),
  };
}

// Every category that has products, with how many, for the site nav.
export function getCategoryCounts(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of PRODUCTS) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return Array.from(counts, ([name, count]) => ({ name, count }));
}
