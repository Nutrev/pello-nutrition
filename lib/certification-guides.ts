// lib/certification-guides.ts
// The certification guides in the Learn section (app/guides/certifications). Each guide's facts
// come from the certifier's or regulator's own published pages, listed as its sources.
import "server-only";
import { getProductSummaries } from "./catalog";
import { QUALITY_STANDARDS, SPORT_TESTING, type StandardId } from "./quality-standards";

export const CERT_GUIDES = [
  { slug: "sport-testing", title: "Sport testing", desc: "NSF Certified for Sport, Informed Sport, BSCG and the Cologne List: what each tests for, and how often." },
  { slug: "food-and-sourcing", title: "Food & sourcing", desc: "What USDA Organic and Non-GMO Project Verified do and don't mean." },
  { slug: "diet", title: "Diet certifications", desc: "Certified Vegan and certified gluten-free, and how a certification differs from a label claim." },
  { slug: "how-to-verify", title: "How to verify a claim", desc: "Look a product up in each certifier's database, and spot the red flags." },
] as const;

// How many Pello products meet each standard, for "On Pello" notes.
export function standardCounts(): Record<StandardId | "sport-tested" | "total", number> {
  const all = getProductSummaries();
  const out = { total: all.length, "sport-tested": 0 } as Record<StandardId | "sport-tested" | "total", number>;
  for (const s of QUALITY_STANDARDS) out[s.id] = 0;
  for (const p of all) {
    for (const s of p.standards) out[s] += 1;
    if (p.standards.some((s) => SPORT_TESTING.includes(s))) out["sport-tested"] += 1;
  }
  return out;
}

export function dietCounts() {
  const all = getProductSummaries();
  return {
    vegan: all.filter((p) => p.nutrition.isVegan === true).length,
    glutenFree: all.filter((p) => p.nutrition.isGlutenFree === true).length,
  };
}

export const SOURCES = {
  fdaSupplements: { label: "FDA: Questions and Answers on Dietary Supplements", url: "https://www.fda.gov/food/information-consumers-using-dietary-supplements/questions-and-answers-dietary-supplements" },
  nsfProgram: { label: "NSF: Certified for Sport® Program", url: "https://www.nsf.org/consumer-resources/articles/certified-for-sport-program" },
  nsfSport: { label: "NSF Certified for Sport (nsfsport.com)", url: "https://www.nsfsport.com/" },
  nsfDatabase: { label: "NSF Certified for Sport product database", url: "https://www.nsfsport.com/certified-products/" },
  informed: { label: "INFORMED (LGC): Informed Sport and Informed Choice", url: "https://www.wetestyoutrust.com/" },
  informedSearch: { label: "Informed Sport product search", url: "https://sport.wetestyoutrust.com/supplement-search" },
  bscg: { label: "BSCG (Banned Substances Control Group)", url: "https://www.bscg.org/" },
  cologneBackground: { label: "Cologne List: Background", url: "https://www.koelnerliste.com/en/background/" },
  cologneFaq: { label: "Cologne List: FAQs", url: "https://www.koelnerliste.com/en/faqs/" },
  usdaLabeling: { label: "USDA AMS: Labeling Organic Products", url: "https://www.ams.usda.gov/rules-regulations/organic/labeling" },
  usdaIntegrity: { label: "USDA Organic Integrity Database", url: "https://organic.ams.usda.gov/integrity/" },
  nonGmoLabel: { label: "Non-GMO Project: What is Non-GMO Project Verified?", url: "https://www.nongmoproject.org/butterfly-label/" },
  nonGmoVerify: { label: "Non-GMO Project: Get Verified (the verification process)", url: "https://www.nongmoproject.org/get-non-gmo-verified/" },
  nonGmoFinder: { label: "Non-GMO Project Product Finder", url: "https://www.nongmoproject.org/find-non-gmo/" },
  vegan: { label: "Vegan Action: Certified Vegan standards", url: "https://vegan.org/certification/" },
  gfco: { label: "Gluten-Free Certification Organization (GFCO)", url: "https://gfco.org/" },
  fdaGluten: { label: "FDA: Gluten-Free Labeling of Foods", url: "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/gluten-free-labeling-foods" },
  fdaGlutenQa: { label: "FDA: Questions and Answers on the Gluten-Free Food Labeling Final Rule", url: "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/questions-and-answers-gluten-free-food-labeling-final-rule" },
};
