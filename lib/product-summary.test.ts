import { describe, expect, it } from "vitest";
import { buildProductSummary, summaryInputFor, productSummary, type SummaryInput } from "./product-summary";
import { PRODUCTS } from "./products";

// The reference product from the brief: Maurten Gel 100.
const maurten: SummaryInput = {
  displayName: "Maurten Gel 100",
  category: "Energy Gel",
  scores: { science: 20, transparency: 19, value: 7, athleteExperience: 18, quality: 9 },
  carbsPerServing: 25, proteinPerServing: null, sodiumPerServing: null, creatinePerServingG: null,
  pricePerServing: 3.75, rating: 4.8, reviewCount: 1426, reviewSource: "The Feed",
  testingCertification: "Informed Sport", hasIngredientData: true, transparencyScored: true,
  categoryAvgPrice: 2.5, usedFor: "endurance athletes and post-workout recovery",
};
const MAURTEN_OUTPUT = {
  opening: "Maurten Gel 100 is an energy gel with 25g of carbs per serving.",
  strengths: ["Highly rated by athletes (4.8/5 from 1,426 reviews at The Feed).", "Batch-tested for banned substances (Informed Sport)."],
  weaknesses: ["Expensive at $3.75 per serving."],
  bestFor: "Athletes who put performance ahead of price.",
};

// A plain middle-of-the-road product to vary in each test.
const base: SummaryInput = {
  ...maurten,
  displayName: "Test Gel",
  scores: { science: 15, transparency: 15, value: 12, athleteExperience: 12, quality: 6 },
  testingCertification: null,
};
const with_ = (over: Partial<SummaryInput>, scores: Partial<SummaryInput["scores"]> = {}): SummaryInput =>
  ({ ...base, ...over, scores: { ...base.scores, ...scores } });

describe("Maurten Gel 100 reference output", () => {
  it("matches the brief exactly from the fixture", () => {
    expect(buildProductSummary(maurten)).toEqual(MAURTEN_OUTPUT);
  });
  it("matches from Pello's live product data too", () => {
    const p = PRODUCTS.find((x) => x.id === "maurten-gel-100")!;
    expect(productSummary(p)).toEqual(MAURTEN_OUTPUT);
  });
});

describe("thresholds", () => {
  it("counts a pillar at exactly 75% as a strength and just under as not", () => {
    expect(buildProductSummary(with_({}, { transparency: 18.75 })).strengths).toEqual(["Clear, complete labeling."]);
    expect(buildProductSummary(with_({}, { transparency: 18.7 })).strengths).toEqual([]);
  });
  it("counts a pillar at exactly 50% as a weakness and just over as not", () => {
    expect(buildProductSummary(with_({}, { science: 12.5 })).weaknesses).toEqual(["Limited research support for key ingredients."]);
    expect(buildProductSummary(with_({}, { science: 12.6 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("compares as percentages of each pillar's maximum", () => {
    // quality 8/10 (80%) beats science 19/25 (76%)
    expect(buildProductSummary(with_({}, { science: 19, quality: 8 })).strengths[0]).toBe("High manufacturing quality standards.");
  });
  it("shows at most 2 strengths, strongest first", () => {
    const s = buildProductSummary(with_({}, { science: 20, transparency: 25, athleteExperience: 19 })).strengths;
    expect(s).toEqual(["Clear, complete labeling.", "Highly rated by athletes (4.8/5 from 1,426 reviews at The Feed)."]);
  });
  it("shows at most 2 weaknesses, weakest first", () => {
    const w = buildProductSummary(with_({ rating: 3.5 }, { science: 10, transparency: 5, athleteExperience: 9 })).weaknesses;
    expect(w).toEqual(["Limited label transparency.", "Limited research support for key ingredients."]);
  });
  it("breaks ties in pillar order", () => {
    // athlete experience 18/20 and quality 9/10 are both 90%: athlete experience comes first
    const s = buildProductSummary(with_({ testingCertification: "NSF Certified for Sport" }, { athleteExperience: 18, quality: 9 })).strengths;
    expect(s).toEqual(["Highly rated by athletes (4.8/5 from 1,426 reviews at The Feed).", "Batch-tested for banned substances (NSF Certified for Sport)."]);
    // science and transparency tied at 40%: science first
    const w = buildProductSummary(with_({}, { science: 10, transparency: 10 })).weaknesses;
    expect(w).toEqual(["Limited research support for key ingredients.", "Limited label transparency."]);
  });
  it("says 'No major weaknesses.' when there are none", () => {
    expect(buildProductSummary(base).weaknesses).toEqual(["No major weaknesses."]);
  });
});

describe("opening line and missing data", () => {
  it("uses the category's key fact", () => {
    expect(buildProductSummary(with_({ category: "Protein", displayName: "X", proteinPerServing: 28 })).opening).toBe("X is a protein supplement with 28g of protein per serving.");
    expect(buildProductSummary(with_({ category: "Hydration", displayName: "X", sodiumPerServing: 1000 })).opening).toBe("X is a hydration product with 1000mg of sodium per serving.");
    expect(buildProductSummary(with_({ category: "Creatine", displayName: "X", creatinePerServingG: 5 })).opening).toBe("X is a creatine supplement with 5g of creatine per serving.");
  });
  it("ends after the category when the key fact is missing or has none", () => {
    expect(buildProductSummary(with_({ carbsPerServing: null })).opening).toBe("Test Gel is an energy gel.");
    expect(buildProductSummary(with_({ category: "Vitamin", displayName: "X" })).opening).toBe("X is a vitamin supplement.");
  });
  it("leaves out figures the data doesn't have", () => {
    expect(buildProductSummary(with_({ pricePerServing: 0.5, categoryAvgPrice: 2.5 }, { value: 18 })).strengths).toContain("Good value at $0.50 per serving.");
    expect(buildProductSummary(with_({ reviewSource: null }, { athleteExperience: 19 })).strengths).toContain("Highly rated by athletes (4.8/5 from 1,426 reviews).");
    expect(buildProductSummary(with_({}, { quality: 9 })).strengths).toContain("High manufacturing quality standards.");
  });
});

describe("guards: only judge a pillar on real data, and only say what's true", () => {
  it("doesn't judge science without ingredient data", () => {
    expect(buildProductSummary(with_({ hasIngredientData: false }, { science: 0 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("doesn't judge transparency before the label is scored", () => {
    expect(buildProductSummary(with_({ transparencyScored: false }, { transparency: 7 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("doesn't judge value without a category price benchmark", () => {
    expect(buildProductSummary(with_({ categoryAvgPrice: null }, { value: 10 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("only calls a product expensive when it costs more than the category average", () => {
    expect(buildProductSummary(with_({ pricePerServing: 2.4, categoryAvgPrice: 2.5 }, { value: 9 })).weaknesses).toEqual(["No major weaknesses."]);
    expect(buildProductSummary(with_({ pricePerServing: 3, categoryAvgPrice: 2.5 }, { value: 9 })).weaknesses).toEqual(["Expensive at $3.00 per serving."]);
  });
  it("doesn't judge athlete experience without reviews", () => {
    expect(buildProductSummary(with_({ reviewCount: 0, rating: null }, { athleteExperience: 10 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("calls reviews mixed only below 4.0, and says 'few reviews' for a good rating with few", () => {
    expect(buildProductSummary(with_({ rating: 3.6, reviewCount: 40 }, { athleteExperience: 8 })).weaknesses).toEqual(["Mixed athlete reviews (3.6/5 from 40 reviews at The Feed)."]);
    expect(buildProductSummary(with_({ rating: 4.7, reviewCount: 6 }, { athleteExperience: 10 })).weaknesses).toEqual(["Few reviews so far (4.7/5 from 6 reviews at The Feed)."]);
    expect(buildProductSummary(with_({ rating: 4.2, reviewCount: 500 }, { athleteExperience: 10 })).weaknesses).toEqual(["No major weaknesses."]);
  });
  it("never says 'no third-party testing' for a tested product", () => {
    expect(buildProductSummary(with_({ testingCertification: "Cologne List" }, { quality: 5 })).weaknesses).toEqual(["No major weaknesses."]);
    expect(buildProductSummary(with_({ testingCertification: null }, { quality: 2 })).weaknesses).toEqual(["No third-party banned-substance certification listed."]);
  });
});

describe("Best for rules, in order", () => {
  const cert = { testingCertification: "Informed Sport" };
  it("1: athlete experience strong and value weak", () => {
    expect(buildProductSummary(with_({ pricePerServing: 4 }, { athleteExperience: 18, value: 6 })).bestFor).toBe("Athletes who put performance ahead of price.");
  });
  it("2: value and athlete experience both strong", () => {
    expect(buildProductSummary(with_({ pricePerServing: 1 }, { athleteExperience: 18, value: 18 })).bestFor).toBe("Athletes who want proven performance without paying a premium.");
  });
  it("3: value strong", () => {
    expect(buildProductSummary(with_({ pricePerServing: 1 }, { value: 18 })).bestFor).toBe("Athletes on a budget or with high training volume.");
  });
  it("4: quality strong with a testing certification", () => {
    expect(buildProductSummary(with_(cert, { quality: 9 })).bestFor).toBe("Athletes who are drug tested.");
  });
  it("5: science and transparency both strong", () => {
    expect(buildProductSummary(with_({}, { science: 22, transparency: 22 })).bestFor).toBe("Athletes who want well-researched, clearly labeled ingredients.");
  });
  it("6: falls back to 'Used for', in sentence case", () => {
    expect(buildProductSummary(base).bestFor).toBe("Endurance athletes and post-workout recovery.");
  });
  it("7: omitted when nothing applies", () => {
    expect(buildProductSummary(with_({ usedFor: null })).bestFor).toBeNull();
  });
  it("takes the first matching rule", () => {
    // value strong and quality strong with certification: rule 3 wins over rule 4
    expect(buildProductSummary(with_({ ...cert, pricePerServing: 1 }, { value: 18, quality: 9 })).bestFor).toBe("Athletes on a budget or with high training volume.");
  });
});

describe("every product", () => {
  it("builds a summary with no figures the data lacks", () => {
    for (const p of PRODUCTS) {
      const s = productSummary(p);
      const all = [s.opening, ...s.strengths, ...s.weaknesses, s.bestFor ?? ""].join(" ");
      expect(all).not.toMatch(/undefined|null|NaN|\(\/5|\$0\.00/);
      expect(s.strengths.length).toBeLessThanOrEqual(2);
      expect(s.weaknesses.length).toBeGreaterThanOrEqual(1);
      expect(s.weaknesses.length).toBeLessThanOrEqual(2);
      if (p.reviewCount === 0) expect(all).not.toMatch(/reviews/);
      if (summaryInputFor(p).testingCertification) expect(all).not.toMatch(/No third-party banned-substance/);
    }
  });
});

describe("used for", () => {
  it("lists goals naturally", async () => {
    const { usedForText } = await import("./product-summary");
    expect(usedForText({ goals: ["endurance"] })).toBe("endurance athletes");
    expect(usedForText({ goals: ["endurance", "recovery"] })).toBe("endurance athletes and post-workout recovery");
    expect(usedForText({ goals: ["endurance", "recovery", "health"] })).toBe("endurance athletes, post-workout recovery and general health");
    expect(usedForText({ goals: [] })).toBeNull();
  });
});
