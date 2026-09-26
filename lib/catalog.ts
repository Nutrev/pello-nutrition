// lib/catalog.ts
// Server-side access to the product catalogue. Pages read products here and pass the
// browser only what it needs: slim summaries for lists, the full product for its own page.
import "server-only";

import { PRODUCTS, type Product } from "./products";
import { productNutrition } from "./nutrition";
import { pricePerServing } from "./servings";
import { weightedRating } from "./ratings";
import type { ProductSummary } from "./catalog-types";

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
    ingredients: p.ingredients.map(({ name, dose, verdict }) => ({ name, dose, verdict })),
    nutrition: productNutrition(p),
    pricePerServing: pricePerServing(p),
    weightedRating: weightedRating(p),
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
