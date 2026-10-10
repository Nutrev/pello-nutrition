// lib/product-summary.ts
// The static summary on each product report page, built from the product's own data and its Pello
// Score pillars. No AI, no new claims: every sentence comes from lib/summary-config.ts, filled only
// with figures the product data has. Computed on the server at render/build time from current
// data, so it changes when the data or scores change. Tested in lib/product-summary.test.ts.
import type { Product } from "./products";
import { productPelloScore } from "./product-score";
import { productNutrition } from "./nutrition";
import { pricePerServing } from "./servings";
import { categoryAvgPricePerServing } from "./fulens-score";
import { reviewSourceOf } from "./catalog-types";
import {
  PILLAR_MAX, PILLAR_ORDER, STRENGTH_THRESHOLD, WEAKNESS_THRESHOLD, MAX_STRENGTHS, MAX_WEAKNESSES, NO_WEAKNESSES,
  MIXED_RATING_BELOW, FEW_REVIEWS, STRENGTH_PHRASES, WEAKNESS_PHRASES, FEW_REVIEWS_PHRASE, BEST_FOR_RULES,
  CATEGORY_PHRASE, KEY_FACT_BY_CATEGORY, KEY_FACT_PHRASE, type Pillar, type PhraseFacts,
} from "./summary-config";

export interface SummaryInput {
  displayName: string;   // "Maurten Gel 100"
  category: string;
  scores: Record<Pillar, number>;
  carbsPerServing: number | null;
  proteinPerServing: number | null;
  sodiumPerServing: number | null;
  creatinePerServingG: number | null;
  pricePerServing: number | null;
  rating: number | null;
  reviewCount: number;
  reviewSource: string | null;
  testingCertification: string | null;   // Informed Sport, NSF Certified for Sport or Cologne List
  hasIngredientData: boolean;            // science is only judged with ingredient data
  transparencyScored: boolean;           // transparency is only judged once the label is scored
  categoryAvgPrice: number | null;       // value is only judged in categories with a price benchmark
  usedFor: string | null;
}

export interface ProductSummaryText {
  opening: string;
  strengths: string[];
  weaknesses: string[];   // ["No major weaknesses."] when there are none
  bestFor: string | null;
}

const pct = (input: SummaryInput, p: Pillar) => input.scores[p] / PILLAR_MAX[p];

// Whether a pillar's score reflects real data for this product, so it can be called a strength
// or weakness. A neutral default (no ingredients, unscored label, no price benchmark, no reviews)
// says nothing about the product either way.
function judged(input: SummaryInput, p: Pillar): boolean {
  if (p === "science") return input.hasIngredientData;
  if (p === "transparency") return input.transparencyScored;
  if (p === "value") return input.categoryAvgPrice != null && input.pricePerServing != null;
  if (p === "athleteExperience") return input.reviewCount > 0 && input.rating != null;
  return true;
}

// Extra conditions for a weakness, so its sentence is true.
function weaknessHolds(input: SummaryInput, p: Pillar): boolean {
  // "Expensive" only when the price is above the category average.
  if (p === "value") return input.pricePerServing! > input.categoryAvgPrice!;
  // "No third-party testing" only when there's no banned-substance certification at all.
  if (p === "quality") return !input.testingCertification;
  // A good rating with few reviews reads as "few reviews so far"; with plenty of reviews it isn't a weakness.
  if (p === "athleteExperience") return input.rating! < MIXED_RATING_BELOW || input.reviewCount < FEW_REVIEWS;
  return true;
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function buildProductSummary(input: SummaryInput): ProductSummaryText {
  const facts: PhraseFacts = {
    pricePerServing: input.pricePerServing != null && input.pricePerServing > 0 ? money(input.pricePerServing) : null,
    rating: input.reviewCount > 0 && input.rating != null ? String(input.rating) : null,
    reviewCount: input.reviewCount > 0 ? input.reviewCount.toLocaleString("en-US") : null,
    reviewSource: input.reviewCount > 0 ? input.reviewSource : null,
    testingCertification: input.testingCertification,
  };

  // a) Opening line.
  const what = CATEGORY_PHRASE[input.category] ?? `a ${input.category.toLowerCase()} product`;
  const key = KEY_FACT_BY_CATEGORY[input.category];
  const amount = key === "carbs" ? input.carbsPerServing : key === "protein" ? input.proteinPerServing
    : key === "sodium" ? input.sodiumPerServing : key === "creatine" ? input.creatinePerServingG : null;
  const opening = key && amount != null && amount > 0
    ? `${input.displayName} is ${what} with ${KEY_FACT_PHRASE[key](amount)}.`
    : `${input.displayName} is ${what}.`;

  // b) Strengths, strongest first; ties keep PILLAR_ORDER (Array.sort is stable).
  const strong = PILLAR_ORDER
    .filter((p) => judged(input, p) && pct(input, p) >= STRENGTH_THRESHOLD)
    .sort((a, b) => pct(input, b) - pct(input, a))
    .slice(0, MAX_STRENGTHS);

  // c) Weaknesses, weakest first.
  const weak = PILLAR_ORDER
    .filter((p) => judged(input, p) && pct(input, p) <= WEAKNESS_THRESHOLD && weaknessHolds(input, p))
    .sort((a, b) => pct(input, a) - pct(input, b))
    .slice(0, MAX_WEAKNESSES);

  const weaknessText = (p: Pillar) =>
    p === "athleteExperience" && input.rating! >= MIXED_RATING_BELOW ? FEW_REVIEWS_PHRASE(facts) : WEAKNESS_PHRASES[p](facts);

  // d) Best for: first matching rule.
  const ctx = { strengths: strong, weaknesses: weak, hasTestingCertification: !!input.testingCertification, usedFor: input.usedFor };
  const rule = BEST_FOR_RULES.find((r) => r.when(ctx));

  return {
    opening,
    strengths: strong.map((p) => STRENGTH_PHRASES[p](facts)),
    weaknesses: weak.length ? weak.map(weaknessText) : [NO_WEAKNESSES],
    bestFor: rule ? rule.text(ctx) : null,
  };
}

// ── From a product ────────────────────────────────────────────

// What the product is used for, from its goals (for supplements, The Feed's classification).
const GOAL_PHRASES: Record<string, string> = {
  muscle: "building muscle",
  endurance: "endurance athletes",
  recovery: "post-workout recovery",
  health: "general health",
  sleep: "sleep and recovery",
  immunity: "immune support",
  "gut health": "gut health",
};
export function usedForText(product: Pick<Product, "goals">): string | null {
  if (!product.goals.length) return null;
  const parts = product.goals.map((g) => GOAL_PHRASES[g] ?? g);
  return parts.length < 3 ? parts.join(" and ") : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

const TESTING_CERTIFICATIONS = ["Informed Sport", "NSF Certified for Sport", "Cologne List"];

// A single creatine ingredient's dose in grams, from the ingredient list ("5g", "5000mg").
function creatineGrams(product: Product): number | null {
  const items = product.ingredients.filter((i) => /creatine/i.test(i.name));
  if (items.length !== 1) return null;
  const m = items[0].dose?.match(/^\s*([\d.]+)\s*(mg|g)\b/i);
  if (!m) return null;
  const g = m[2].toLowerCase() === "mg" ? Number(m[1]) / 1000 : Number(m[1]);
  return g > 0 ? Math.round(g * 10) / 10 : null;
}

export function summaryInputFor(product: Product): SummaryInput {
  const score = productPelloScore(product);
  const n = productNutrition(product);
  const pps = pricePerServing(product);
  return {
    displayName: product.name.toLowerCase().startsWith(product.brand.toLowerCase()) ? product.name : `${product.brand} ${product.name}`,
    category: product.category,
    scores: { science: score.science, transparency: score.transparency, value: score.value, athleteExperience: score.athleteExperience, quality: score.quality },
    carbsPerServing: n.carbsPerServing,
    proteinPerServing: n.proteinPerServing,
    sodiumPerServing: n.sodiumPerServing,
    creatinePerServingG: product.category === "Creatine" ? creatineGrams(product) : null,
    pricePerServing: pps > 0 ? pps : null,
    rating: product.reviewCount > 0 ? product.rating : null,
    reviewCount: product.reviewCount,
    reviewSource: reviewSourceOf(product),
    testingCertification: (product.certifications ?? []).find((c) => TESTING_CERTIFICATIONS.includes(c)) ?? null,
    hasIngredientData: product.ingredients.length > 0,
    transparencyScored: product.transparencyScore != null,
    categoryAvgPrice: categoryAvgPricePerServing(product.category),
    usedFor: usedForText(product),
  };
}

export const productSummary = (product: Product) => buildProductSummary(summaryInputFor(product));
