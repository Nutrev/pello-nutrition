// lib/ratings.ts
// Ranking by customer rating, weighted by how many reviews back it up. A plain sort by
// rating lets 5★ from 3 reviews beat 4.8★ from 1,400. Each product's rating is pulled
// towards the site-wide average until it has enough reviews to stand on its own
// (a Bayesian average, as used by IMDb's top lists).

import { PRODUCTS, type Product } from "./products";

// Reviews needed before a product's own rating counts as much as the site average.
const PRIOR_REVIEWS = 25;

const rated = PRODUCTS.filter((p) => p.reviewCount > 0);
const SITE_AVERAGE =
  rated.reduce((sum, p) => sum + p.rating * p.reviewCount, 0) / Math.max(1, rated.reduce((sum, p) => sum + p.reviewCount, 0));

// Products without reviews rank below every reviewed product.
export function weightedRating(p: Pick<Product, "rating" | "reviewCount">): number {
  if (p.reviewCount <= 0) return -1;
  return (p.rating * p.reviewCount + SITE_AVERAGE * PRIOR_REVIEWS) / (p.reviewCount + PRIOR_REVIEWS);
}

// Comparator for Array.sort: best-rated first.
export function byWeightedRating(a: Pick<Product, "rating" | "reviewCount">, b: Pick<Product, "rating" | "reviewCount">): number {
  return weightedRating(b) - weightedRating(a);
}
