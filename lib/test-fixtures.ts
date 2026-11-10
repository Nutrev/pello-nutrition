// Test helper: a minimal ProductSummary with sensible defaults, for unit tests.
import type { ProductSummary } from "./catalog-types";

type Over = Partial<Omit<ProductSummary, "nutrition">> & { nutrition?: Partial<ProductSummary["nutrition"]> };

export function summary(over: Over = {}): ProductSummary {
  const { nutrition, ...rest } = over;
  return {
    id: "p", name: "Product", brand: "Brand", category: "Energy Gel", rating: 4.5, reviewCount: 10, price: 30, goals: [],
    transparencyScore: 80, imageEmoji: "", logo: undefined, logoSize: undefined, logoDomain: undefined, sentiment: undefined,
    certifications: [], allergens: [], servingsPerContainer: 10, retailerLinks: {},
    ingredients: [], pricePerServing: 3, weightedRating: 4, standards: [], pelloScore: 70, reviewSource: null,
    ...rest,
    nutrition: {
      carbsPerServing: null, sodiumPerServing: null, caffeinePerServing: null, proteinPerServing: null, hasCaffeine: false,
      isHydrogel: false, isClearWhey: false, glucoseFructoseRatio: null, isBatchTested: false, isVegan: null, isGlutenFree: null,
      certifications: [], ...nutrition,
    },
  } as ProductSummary;
}
