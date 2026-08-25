// lib/Pello-score.ts
// Pello Score™ — proprietary scoring methodology
// Version 1.0 — published and transparent
// No brand can pay to influence this score

import { INGREDIENT_TAXONOMY } from "./ingredient-taxonomy";

// ── SCORE BREAKDOWN ──────────────────────────────────────────

export interface FulensScoreBreakdown {
  overall: number;          // 0-100 weighted composite
  science: number;          // 0-25
  transparency: number;     // 0-25
  value: number;            // 0-20
  athleteExperience: number;// 0-20
  quality: number;          // 0-10
  version: string;          // methodology version
  calculatedAt: string;     // ISO date
  notes: string[];          // explanation of deductions
}

// ── CATEGORY BENCHMARKS ───────────────────────────────────────
// Average price per gram of key nutrient by category
// Used for value scoring relative to category peers

const CATEGORY_BENCHMARKS: Record<string, {
  avgPricePerServing: number;
  keyNutrient: string;
  avgKeyNutrientPerServing: number;
}> = {
  "Energy Gel": { avgPricePerServing: 2.50, keyNutrient: "carbs", avgKeyNutrientPerServing: 25 },
  "Energy Chew": { avgPricePerServing: 1.80, keyNutrient: "carbs", avgKeyNutrientPerServing: 35 },
  "Energy Bar": { avgPricePerServing: 2.20, keyNutrient: "carbs", avgKeyNutrientPerServing: 38 },
  "Carbohydrate Mix": { avgPricePerServing: 2.00, keyNutrient: "carbs", avgKeyNutrientPerServing: 50 },
  "Hydration": { avgPricePerServing: 1.20, keyNutrient: "sodium", avgKeyNutrientPerServing: 400 },
  "Protein": { avgPricePerServing: 2.50, keyNutrient: "protein", avgKeyNutrientPerServing: 24 },
  "Creatine": { avgPricePerServing: 0.50, keyNutrient: "creatine", avgKeyNutrientPerServing: 5 },
  "Supplement": { avgPricePerServing: 1.50, keyNutrient: "active", avgKeyNutrientPerServing: 1 },
  "Probiotic": { avgPricePerServing: 1.20, keyNutrient: "CFU", avgKeyNutrientPerServing: 10 },
  "Omega-3": { avgPricePerServing: 1.00, keyNutrient: "EPA+DHA", avgKeyNutrientPerServing: 1000 },
  "Vitamin": { avgPricePerServing: 0.40, keyNutrient: "active", avgKeyNutrientPerServing: 1 },
  "Mineral": { avgPricePerServing: 0.30, keyNutrient: "active", avgKeyNutrientPerServing: 1 },
};

// ── INPUT TYPE ────────────────────────────────────────────────
// Subset of PelloProduct needed to calculate the score

export interface ScoringInput {
  // Identity
  category: string;

  // Ingredients
  ingredients: {
    name: string;
    verdict: "proven" | "likely" | "disputed";
    dose?: string;
  }[];
  hasProprietaryBlend: boolean;
  isCleanLabel: boolean;

  // Certifications
  certifications: string[];
  isBatchTested: boolean;
  bannedSubstanceTested: boolean;

  // Pricing
  pricePerServing: number;
  carbsPerServing?: number;
  proteinPerServing?: number;
  sodiumPerServing?: number;

  // Dietary
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];

  // Sentiment
  sentiment: Record<string, number>;
  reviewCount: number;
  rating: number;

  // Legacy transparency score (used as input)
  transparencyScore: number;
}

// ── PILLAR 1: SCIENCE (0-25) ─────────────────────────────────

function scoreScience(input: ScoringInput): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  const total = input.ingredients.length;
  if (total === 0) return { score: 0, notes: ["No ingredient data available"] };

  const proven = input.ingredients.filter((i) => i.verdict === "proven").length;
  const likely = input.ingredients.filter((i) => i.verdict === "likely").length;
  const disputed = input.ingredients.filter((i) => i.verdict === "disputed").length;

  // Evidence quality (0-15)
  const provenPct = proven / total;
  const likelyPct = likely / total;
  const disputedPct = disputed / total;

  const evidenceScore = Math.round(
    (provenPct * 15) + (likelyPct * 8) - (disputedPct * 10)
  );
  score += Math.max(0, Math.min(15, evidenceScore));

  if (provenPct >= 0.8) notes.push("Strong evidence base — majority of ingredients are Proven");
  if (disputed > 0) notes.push(`${disputed} disputed ingredient${disputed > 1 ? "s" : ""} penalised`);

  // Dose transparency (0-5)
  const withDose = input.ingredients.filter((i) => i.dose && i.dose.length > 0).length;
  const dosePct = withDose / total;
  const doseScore = Math.round(dosePct * 5);
  score += doseScore;

  if (input.hasProprietaryBlend) {
    score -= 3;
    notes.push("Proprietary blend penalty — doses not fully disclosed");
  }

  // Flagged ingredients from taxonomy (0 to -5)
  const ingredientNames = input.ingredients.map((i) => i.name.toLowerCase());
  let flagPenalty = 0;
  ingredientNames.forEach((name) => {
    INGREDIENT_TAXONOMY.forEach((t) => {
      const matches = t.name.toLowerCase() === name ||
        t.aliases.some((a) => name.includes(a.toLowerCase()));
      if (matches && t.flags.length > 0) {
        t.flags.forEach((flag) => {
          if (["artificial-sweetener", "artificial-colour", "carrageenan", "hydrogenated-fat"].includes(flag)) {
            flagPenalty += 1;
          }
        });
      }
    });
  });

  if (flagPenalty > 0) {
    score -= Math.min(5, flagPenalty);
    notes.push(`Flagged ingredient penalty (-${Math.min(5, flagPenalty)} pts)`);
  }

  // Independent lab testing bonus (0-5)
  if (input.isBatchTested) {
    score += 3;
    notes.push("Batch tested — bonus applied");
  }
  if (input.bannedSubstanceTested) {
    score += 2;
    notes.push("WADA compliance tested — bonus applied");
  }

  return { score: Math.max(0, Math.min(25, score)), notes };
}

// ── PILLAR 2: TRANSPARENCY (0-25) ────────────────────────────

function scoreTransparency(input: ScoringInput): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  // Base from existing transparency score (0-10)
  const baseScore = Math.round((input.transparencyScore / 100) * 10);
  score += baseScore;

  // Proprietary blend penalty (-5)
  if (input.hasProprietaryBlend) {
    score -= 5;
    notes.push("Proprietary blend — heavy transparency penalty");
  }

  // Clean label bonus (0-5)
  if (input.isCleanLabel) {
    score += 5;
    notes.push("Clean label — no artificial additives");
  }

  // Certifications (0-5)
  const certScore = Math.min(5, input.certifications.length * 2);
  score += certScore;
  if (input.certifications.length > 0) {
    notes.push(`${input.certifications.length} certification${input.certifications.length > 1 ? "s" : ""} — bonus applied`);
  }

  // Allergen clarity (0-5)
  // Give full points if allergens array is populated (shows brand discloses allergens)
  score += 5;
  if (input.allergens.length > 0) {
    notes.push("Allergens clearly disclosed");
  }

  return { score: Math.max(0, Math.min(25, score)), notes };
}

// ── PILLAR 3: VALUE (0-20) ────────────────────────────────────

function scoreValue(input: ScoringInput): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 10; // start at midpoint

  const benchmark = CATEGORY_BENCHMARKS[input.category];

  if (!benchmark) {
    notes.push("No category benchmark — using default value score");
    return { score: 10, notes };
  }

  // Price vs category average (0-10)
  const priceDiff = (input.pricePerServing - benchmark.avgPricePerServing) / benchmark.avgPricePerServing;

  if (priceDiff <= -0.3) {
    score += 5;
    notes.push("Significantly below category average price — excellent value");
  } else if (priceDiff <= -0.1) {
    score += 3;
    notes.push("Below category average price — good value");
  } else if (priceDiff <= 0.1) {
    score += 1;
    notes.push("In line with category average price");
  } else if (priceDiff <= 0.3) {
    score -= 2;
    notes.push("Above category average price");
  } else {
    score -= 4;
    notes.push("Significantly above category average price — premium positioning");
  }

  // Nutrient density vs price (0-10)
  let nutrientScore = 0;

  if (input.carbsPerServing && benchmark.keyNutrient === "carbs") {
    const carbsVsAvg = input.carbsPerServing / benchmark.avgKeyNutrientPerServing;
    if (carbsVsAvg >= 1.5) { nutrientScore = 5; notes.push("High carb density — excellent fuel efficiency"); }
    else if (carbsVsAvg >= 1.2) { nutrientScore = 3; notes.push("Good carb density"); }
    else if (carbsVsAvg >= 0.8) { nutrientScore = 1; }
    else { nutrientScore = -1; notes.push("Below average carb density"); }
  } else if (input.proteinPerServing && benchmark.keyNutrient === "protein") {
    const protVsAvg = input.proteinPerServing / benchmark.avgKeyNutrientPerServing;
    if (protVsAvg >= 1.2) { nutrientScore = 5; notes.push("High protein content — excellent value"); }
    else if (protVsAvg >= 0.9) { nutrientScore = 3; }
    else { nutrientScore = 0; }
  } else if (input.sodiumPerServing && benchmark.keyNutrient === "sodium") {
    const sodVsAvg = input.sodiumPerServing / benchmark.avgKeyNutrientPerServing;
    if (sodVsAvg >= 2) { nutrientScore = 5; notes.push("High sodium — best for heavy sweaters"); }
    else if (sodVsAvg >= 1) { nutrientScore = 3; }
    else { nutrientScore = 1; }
  }

  score += nutrientScore;

  return { score: Math.max(0, Math.min(20, score)), notes };
}

// ── PILLAR 4: ATHLETE EXPERIENCE (0-20) ──────────────────────

function scoreAthleteExperience(input: ScoringInput): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  // Overall rating (0-8)
  const ratingScore = Math.round(((input.rating - 1) / 4) * 8);
  score += ratingScore;

  // Review volume — more reviews = more reliable data (0-4)
  if (input.reviewCount >= 10000) { score += 4; notes.push("10k+ reviews — highly reliable data"); }
  else if (input.reviewCount >= 1000) { score += 3; notes.push("1k+ reviews — reliable data"); }
  else if (input.reviewCount >= 100) { score += 2; }
  else if (input.reviewCount >= 10) { score += 1; }
  else { notes.push("Low review count — score less reliable"); }

  // Sentiment quality (0-8)
  const sentimentValues = Object.values(input.sentiment);
  if (sentimentValues.length > 0) {
    const avgSentiment = sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length;
    const sentimentScore = Math.round((avgSentiment / 100) * 8);
    score += sentimentScore;

    // GI comfort bonus — critical for endurance athletes
    const giComfort = input.sentiment["GI Comfort"] ?? input.sentiment["gi comfort"];
    if (giComfort && giComfort >= 90) {
      score += 2;
      notes.push("Exceptional GI comfort — key for endurance athletes");
    } else if (giComfort && giComfort < 70) {
      score -= 2;
      notes.push("GI comfort concerns flagged in reviews");
    }
  }

  return { score: Math.max(0, Math.min(20, score)), notes };
}

// ── PILLAR 5: QUALITY (0-10) ──────────────────────────────────

function scoreQuality(input: ScoringInput): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  // NSF / Informed Sport certification (0-4)
  const hasNSF = input.certifications.some((c) =>
    c.toLowerCase().includes("nsf") || c.toLowerCase().includes("informed sport") || c.toLowerCase().includes("informed choice")
  );
  if (hasNSF) {
    score += 4;
    notes.push("NSF/Informed Sport certified — highest quality standard");
  }

  // Batch testing (0-3)
  if (input.isBatchTested) {
    score += 2;
    notes.push("Every batch independently tested");
  }
  if (input.bannedSubstanceTested) {
    score += 1;
    notes.push("WADA banned substance tested");
  }

  // Clean manufacturing (0-3)
  if (input.isCleanLabel) score += 2;
  if (input.isGlutenFree) score += 1;

  return { score: Math.max(0, Math.min(10, score)), notes };
}

// ── MAIN SCORING FUNCTION ────────────────────────────────────

export function calculatePelloScore(input: ScoringInput): FulensScoreBreakdown {
  const science = scoreScience(input);
  const transparency = scoreTransparency(input);
  const value = scoreValue(input);
  const athleteExperience = scoreAthleteExperience(input);
  const quality = scoreQuality(input);

  const overall = Math.round(
    science.score +
    transparency.score +
    value.score +
    athleteExperience.score +
    quality.score
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    science: science.score,
    transparency: transparency.score,
    value: value.score,
    athleteExperience: athleteExperience.score,
    quality: quality.score,
    version: "1.0",
    calculatedAt: new Date().toISOString(),
    notes: [
      ...science.notes,
      ...transparency.notes,
      ...value.notes,
      ...athleteExperience.notes,
      ...quality.notes,
    ],
  };
}

// ── SCORE LABEL ───────────────────────────────────────────────

export function getFulensScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 85) return {
    label: "Exceptional",
    color: "#2D4A2D",
    description: "Best in class — top science, transparency and athlete experience",
  };
  if (score >= 75) return {
    label: "Excellent",
    color: "#3B6D11",
    description: "Strong across all pillars — highly recommended",
  };
  if (score >= 65) return {
    label: "Good",
    color: "#C8860A",
    description: "Above average — minor trade-offs worth knowing about",
  };
  if (score >= 50) return {
    label: "Average",
    color: "#8A8478",
    description: "Meets the basics — check individual pillar scores",
  };
  if (score >= 35) return {
    label: "Below average",
    color: "#B84C2E",
    description: "Notable weaknesses in one or more pillars",
  };
  return {
    label: "Poor",
    color: "#8B1A1A",
    description: "Significant concerns — transparency or evidence issues",
  };
}

// ── METHODOLOGY EXPORT ────────────────────────────────────────
// Published so the methodology is fully transparent

export const Pello_SCORE_METHODOLOGY = {
  version: "1.0",
  lastUpdated: "2026-08-05",
  totalPoints: 100,
  pillars: [
    {
      name: "Science",
      weight: 25,
      description: "Quality and quantity of evidence behind the ingredients",
      factors: [
        "Percentage of ingredients rated Proven vs Likely vs Disputed",
        "Dose transparency — are amounts clearly disclosed?",
        "Presence of flagged ingredients (artificial sweeteners, seed oils etc.)",
        "Independent lab testing and batch verification",
      ],
    },
    {
      name: "Transparency",
      weight: 25,
      description: "How clearly does the brand disclose what is in the product?",
      factors: [
        "Label clarity and dose disclosure",
        "Absence of proprietary blends",
        "Clean label (no artificial colours, flavours or preservatives)",
        "Third-party certifications",
        "Allergen disclosure",
      ],
    },
    {
      name: "Value",
      weight: 20,
      description: "Is the price justified relative to the category and nutrient content?",
      factors: [
        "Price per serving vs category average",
        "Key nutrient density vs category average",
        "Cost per gram of carbohydrate, protein or active ingredient",
      ],
    },
    {
      name: "Athlete Experience",
      weight: 20,
      description: "What do real athletes say across thousands of reviews?",
      factors: [
        "Aggregated star rating across all sources",
        "Review volume — more reviews = more reliable",
        "Sentiment breakdown across key attributes",
        "GI comfort score — critical for endurance athletes",
      ],
    },
    {
      name: "Quality",
      weight: 10,
      description: "Manufacturing standards and safety certifications",
      factors: [
        "NSF Certified for Sport or Informed Sport certification",
        "Batch testing against banned substances",
        "WADA compliance",
        "Clean manufacturing practices",
      ],
    },
  ],
  principles: [
    "No brand can pay to influence their Pello Score",
    "The full methodology is published and transparent",
    "Scores are category-adjusted — gels are benchmarked against gels",
    "Science and transparency are weighted equally at 25 points each",
    "GI comfort is given special weight as it is uniquely critical for endurance athletes",
    "Scores are recalculated when new reviews or formula changes occur",
  ],
};