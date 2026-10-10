// lib/summary-config.ts
// Everything editable about the static product summary on report pages (lib/product-summary.ts):
// thresholds, limits, phrases, category wording, key facts and the "Best for" rules. Change the
// wording here without touching the logic. Every phrase is filled only with the product's own
// data; a figure that isn't in the data is left out, never guessed.

export type Pillar = "science" | "transparency" | "value" | "athleteExperience" | "quality";

// Maximum points per Pello Score pillar (lib/fulens-score.ts). Strengths and weaknesses compare
// percentages of these, since the pillars have different maximums. Listed in tie-break order:
// when two pillars have the same percentage, the earlier one comes first.
export const PILLAR_MAX: Record<Pillar, number> = { science: 25, transparency: 25, value: 20, athleteExperience: 20, quality: 10 };
export const PILLAR_ORDER: Pillar[] = ["science", "transparency", "value", "athleteExperience", "quality"];

export const STRENGTH_THRESHOLD = 0.75; // at or above 75% of the pillar's maximum
export const WEAKNESS_THRESHOLD = 0.5;  // at or below 50%
export const MAX_STRENGTHS = 2;
export const MAX_WEAKNESSES = 2;
export const NO_WEAKNESSES = "No major weaknesses.";

// Below this rating, a low athlete-experience score reads as "mixed reviews". At or above it,
// a low score comes from few reviews, and says so (when there are fewer than FEW_REVIEWS).
export const MIXED_RATING_BELOW = 4.0;
export const FEW_REVIEWS = 100;

// Values the phrases can use. Each is null when the product's data doesn't have it.
export interface PhraseFacts {
  pricePerServing: string | null;  // "$3.75"
  rating: string | null;           // "4.8"
  reviewCount: string | null;      // "1,426"
  reviewSource: string | null;     // "The Feed"
  testingCertification: string | null;  // "Informed Sport"
}

const reviews = (f: PhraseFacts) =>
  f.rating && f.reviewCount ? ` (${f.rating}/5 from ${f.reviewCount} reviews${f.reviewSource ? ` at ${f.reviewSource}` : ""})` : "";

export const STRENGTH_PHRASES: Record<Pillar, (f: PhraseFacts) => string> = {
  science: () => "Key ingredients are well supported by research.",
  transparency: () => "Clear, complete labeling.",
  value: (f) => (f.pricePerServing ? `Good value at ${f.pricePerServing} per serving.` : "Good value."),
  athleteExperience: (f) => `Highly rated by athletes${reviews(f)}.`,
  quality: (f) => (f.testingCertification ? `Batch-tested for banned substances (${f.testingCertification}).` : "High manufacturing quality standards."),
};

export const WEAKNESS_PHRASES: Record<Pillar, (f: PhraseFacts) => string> = {
  science: () => "Limited research support for key ingredients.",
  transparency: () => "Limited label transparency.",
  value: (f) => (f.pricePerServing ? `Expensive at ${f.pricePerServing} per serving.` : "Expensive for its category."),
  athleteExperience: (f) => `Mixed athlete reviews${reviews(f)}.`,
  // Pello only records Informed Sport, NSF Certified for Sport and Cologne List, so this says what's
  // listed rather than claiming the product is never tested.
  quality: () => "No third-party banned-substance certification listed.",
};
// Used instead of the athlete-experience weakness when the rating is good but there are few reviews.
export const FEW_REVIEWS_PHRASE = (f: PhraseFacts) => `Few reviews so far${reviews(f)}.`;

// "Best for": the first rule that matches wins. `strengths` and `weaknesses` are the pillars shown.
export interface BestForContext {
  strengths: Pillar[];
  weaknesses: Pillar[];
  hasTestingCertification: boolean;
  usedFor: string | null;  // e.g. "endurance athletes and post-workout recovery"
}
export const BEST_FOR_RULES: { when: (c: BestForContext) => boolean; text: (c: BestForContext) => string }[] = [
  { when: (c) => c.strengths.includes("athleteExperience") && c.weaknesses.includes("value"), text: () => "Athletes who put performance ahead of price." },
  { when: (c) => c.strengths.includes("value") && c.strengths.includes("athleteExperience"), text: () => "Athletes who want proven performance without paying a premium." },
  { when: (c) => c.strengths.includes("value"), text: () => "Athletes on a budget or with high training volume." },
  { when: (c) => c.strengths.includes("quality") && c.hasTestingCertification, text: () => "Athletes who are drug tested." },
  { when: (c) => c.strengths.includes("science") && c.strengths.includes("transparency"), text: () => "Athletes who want well-researched, clearly labeled ingredients." },
  { when: (c) => !!c.usedFor, text: (c) => `${c.usedFor!.charAt(0).toUpperCase()}${c.usedFor!.slice(1)}.` },
];

// How each category reads in the opening line ("… is an energy gel with …").
export const CATEGORY_PHRASE: Record<string, string> = {
  "Energy Gel": "an energy gel",
  "Energy Chew": "an energy chew",
  "Energy Bar": "an energy bar",
  "Carbohydrate Mix": "a carbohydrate drink mix",
  "Hydration": "a hydration product",
  "Protein": "a protein supplement",
  "Creatine": "a creatine supplement",
  "Recovery": "a recovery product",
  "Performance": "a performance supplement",
  "Supplement": "a supplement",
  "Vitamin": "a vitamin supplement",
  "Mineral": "a mineral supplement",
  "Omega-3": "an omega-3 supplement",
  "Probiotic": "a probiotic",
  "Sleep": "a sleep supplement",
  "Gut Health": "a gut health supplement",
  "Immune": "an immune support supplement",
  "Greens": "a greens supplement",
};

// The key fact in the opening line, by category. Categories not listed get no key fact.
export type KeyFact = "carbs" | "protein" | "sodium" | "creatine";
export const KEY_FACT_BY_CATEGORY: Record<string, KeyFact> = {
  "Energy Gel": "carbs",
  "Energy Chew": "carbs",
  "Energy Bar": "carbs",
  "Carbohydrate Mix": "carbs",
  "Protein": "protein",
  "Hydration": "sodium",
  "Creatine": "creatine",
};
export const KEY_FACT_PHRASE: Record<KeyFact, (amount: number) => string> = {
  carbs: (g) => `${g}g of carbs per serving`,
  protein: (g) => `${g}g of protein per serving`,
  sodium: (mg) => `${mg}mg of sodium per serving`,
  creatine: (g) => `${g}g of creatine per serving`,
};
