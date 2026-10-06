// lib/quality-standards.ts
// The quality standards Pello tracks: third-party certifications (from each product's listing,
// with NSF Certified for Sport checked against NSF's own database; see
// lib/certification-checks.ts) and diet label claims. Safe to import from client components:
// it holds definitions only, no product data.
//
// Every description here is taken from the certifier's own published information (sources are
// listed in lib/certification-guides.ts). Keep them factual: what the program checks, how often,
// and how to look a product up. Never describe a claim as a certification.

export type StandardId = "nsf-sport" | "informed-sport" | "cologne-list" | "usda-organic" | "non-gmo-project";
export type StandardGroup = "sport" | "sourcing";

export interface QualityStandard {
  id: StandardId;
  name: string;            // as it appears in product certifications
  short: string;           // short label for chips and filters
  group: StandardGroup;
  certifier: string;
  what: string;            // one line: what it means for the athlete
  testing: string;         // how often / what is checked
  lookupUrl: string;       // the certifier's public product search
  lookupLabel: string;
  guide: string;           // /guides/certifications/<guide>#<id>
}

export const QUALITY_STANDARDS: QualityStandard[] = [
  {
    id: "nsf-sport",
    name: "NSF Certified for Sport",
    short: "NSF Certified for Sport",
    group: "sport",
    certifier: "NSF",
    what: "Tested for substances banned in sport, with the formula and label reviewed and the manufacturing facilities inspected.",
    testing: "NSF tests for 290 banned substances, reviews the formula and label, inspects production facilities and suppliers, and monitors certified products on an ongoing basis.",
    lookupUrl: "https://www.nsfsport.com/certified-products/",
    lookupLabel: "NSF Certified for Sport database",
    guide: "sport-testing",
  },
  {
    id: "informed-sport",
    name: "Informed Sport",
    short: "Informed Sport",
    group: "sport",
    certifier: "LGC (Informed)",
    what: "Every batch is tested for substances banned in sport before it's released for sale.",
    testing: "Informed Sport tests every finished batch before release, screening for over 300 compounds.",
    lookupUrl: "https://sport.wetestyoutrust.com/supplement-search",
    lookupLabel: "Informed Sport product search",
    guide: "sport-testing",
  },
  {
    id: "cologne-list",
    name: "Cologne List",
    short: "Cologne List",
    group: "sport",
    certifier: "Cologne List®",
    what: "Listed after passing a label check and a laboratory analysis for steroids and stimulants.",
    testing: "Products pass a label check and a laboratory analysis for anabolic steroids and stimulants at the German Sport University Cologne's doping-research center at least once a year.",
    lookupUrl: "https://www.koelnerliste.com/en/",
    lookupLabel: "Cologne List product list",
    guide: "sport-testing",
  },
  {
    id: "usda-organic",
    name: "USDA Organic",
    short: "USDA Organic",
    group: "sourcing",
    certifier: "USDA National Organic Program",
    what: "At least 95% organic ingredients (excluding salt and water), certified by a USDA-accredited certifier.",
    testing: "Products using the USDA Organic seal are overseen by a USDA-authorised certifying agent and must contain at least 95% organic ingredients, excluding salt and water.",
    lookupUrl: "https://organic.ams.usda.gov/integrity/",
    lookupLabel: "USDA Organic Integrity Database",
    guide: "food-and-sourcing",
  },
  {
    id: "non-gmo-project",
    name: "Non-GMO Project Verified",
    short: "Non-GMO Project",
    group: "sourcing",
    certifier: "The Non-GMO Project",
    what: "Evaluated by an independent technical administrator against the Non-GMO Project Standard for GMO avoidance.",
    testing: "Products are evaluated by an independent technical administrator and reviewed every year. The Project notes this isn't a \"GMO-free\" claim.",
    lookupUrl: "https://www.nongmoproject.org/find-non-gmo/",
    lookupLabel: "Non-GMO Project Product Finder",
    guide: "food-and-sourcing",
  },
];

export const STANDARD_BY_ID = Object.fromEntries(QUALITY_STANDARDS.map((s) => [s.id, s])) as Record<StandardId, QualityStandard>;
const STANDARD_BY_NAME = new Map(QUALITY_STANDARDS.map((s) => [s.name, s.id]));

export const SPORT_TESTING: StandardId[] = QUALITY_STANDARDS.filter((s) => s.group === "sport").map((s) => s.id);

// The standards a product meets, from its certifications.
export function standardsFrom(certifications: string[] | undefined): StandardId[] {
  return (certifications ?? []).flatMap((c) => STANDARD_BY_NAME.get(c) ?? []);
}

// What athletes can choose to require (Explore filters and the planner). "sport-tested" means
// any of the sport-testing programs.
export type StandardChoice = StandardId | "sport-tested";
export const STANDARD_CHOICES: { id: StandardChoice; label: string; hint: string }[] = [
  { id: "sport-tested", label: "Tested for banned substances", hint: "Any of NSF Certified for Sport, Informed Sport or Cologne List" },
  ...QUALITY_STANDARDS.map((s) => ({ id: s.id as StandardChoice, label: s.short, hint: s.what })),
];
export const STANDARD_CHOICE_IDS = STANDARD_CHOICES.map((c) => c.id);

export function meetsChoice(standards: StandardId[], choice: StandardChoice): boolean {
  return choice === "sport-tested" ? standards.some((s) => SPORT_TESTING.includes(s)) : standards.includes(choice);
}

export function meetsAll(standards: StandardId[], choices: StandardChoice[]): boolean {
  return choices.every((c) => meetsChoice(standards, c));
}

// ── Diet requirements ────────────────────────────────────────────────────────
// These are label claims made by the brand or retailer, not certifications. A product only
// counts when the claim is stated; unknown never counts as a yes.
export type DietId = "vegan" | "gluten-free" | "dairy-free";

export interface DietFacts {
  isVegan?: boolean | null;
  isGlutenFree?: boolean | null;
  allergens?: string[] | null;   // undefined/null = allergen statement not available
}

export function meetsDiet(d: DietFacts, diet: DietId): boolean {
  if (diet === "vegan") return d.isVegan === true;
  if (diet === "gluten-free") return d.isGlutenFree === true;
  // Dairy-free: labeled vegan, or an allergen statement is available and doesn't list milk.
  return d.isVegan === true || (Array.isArray(d.allergens) && !d.allergens.some((a) => /milk|dairy|whey|casein/i.test(a)));
}
