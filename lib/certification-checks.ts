// lib/certification-checks.ts
// GENERATED: Pello's own checks of product certifications against the certifier's public
// database. Don't edit by hand; re-run the check and regenerate.
//
// NSF Certified for Sport: every product The Feed lists as NSF Certified for Sport was looked up
// in NSF's Certified for Sport database (nsfsport.com/certified-products) by brand, and matched
// to NSF's listing by product name, with label checks where names differed. NSF's database was
// also searched for our other products from the same brands. A product counts as NSF Certified
// for Sport on Pello only if it's in NSF_SPORT_LISTINGS.
// NSF sometimes lists a product under a different company or product name (e.g. humann as
// "Human Power of N, Co.", Momentous Ubiquinol as "CoQ10"), so searches cover listing names too.
//
// Informed Sport's database couldn't be checked automatically (its site blocks automated access),
// so Informed Sport certifications are shown as listed by The Feed, with a link to check them.

export const NSF_CHECKED_ON = "2026-10-05T12:00:00Z"; // midday UTC, so it shows as 5 Oct in every time zone

// Product id → NSF listing (id on nsfsport.com/certified-products/listing-detail.php?id=…).
export const NSF_SPORT_LISTINGS: Record<string, { listingId: string; listingName: string }> = {
  "altred": { listingId: "1088666", listingName: "AltRed" },
  "bare-performance-naturals-post-muscle-recovery-post-workout": { listingId: "1817000", listingName: "POST (Fruit Punch)" },
  "bare-performance-naturals-pump-muscle-pump-enhancer": { listingId: "1802801", listingName: "PUMP (Pink Lemonade)" },
  "bare-performance-nutrition-collagen": { listingId: "1646928", listingName: "Collagen Protein" },
  "bare-performance-nutrition-creatine": { listingId: "1675505", listingName: "Creatine Monohydrate" },
  "bare-performance-nutrition-endopump": { listingId: "1635652", listingName: "Endo Pump (Blue Raspberry)" },
  "bare-performance-nutrition-endurance-essentials": { listingId: "1721665", listingName: "Endurance Essentials" },
  "bare-performance-nutrition-go-bar": { listingId: "1657437", listingName: "Go Bar (Original)" },
  "bare-performance-nutrition-go-gel": { listingId: "1643805", listingName: "Go Gel - (Mango)" },
  "bare-performance-nutrition-peak-sleep": { listingId: "1660451", listingName: "Peak Sleep Gummy (Berry)" },
  "bare-performance-nutrition-recover": { listingId: "1659698", listingName: "Recover (Watermelon)" },
  "bare-performance-nutrition-strong-greens": { listingId: "1750793", listingName: "Strong Greens (Lemon)" },
  "bare-performance-nutrition-strong-joints": { listingId: "1815454", listingName: "Strong Joints" },
  "bare-performance-nutrition-strong-multi-vitamin": { listingId: "1820649", listingName: "Strong Multi Vitamin" },
  "bare-performance-nutrition-strong-omega": { listingId: "1655566", listingName: "Strong Omega" },
  "bare-performance-nutrition-strong-reds": { listingId: "1732824", listingName: "Strong Reds (Strawberry)" },
  "bare-performance-pre-pre-workout": { listingId: "1799508", listingName: "PRE (Pink Lemonade)" },
  "bubs-naturals-collagen-protein": { listingId: "1531712", listingName: "Bubs Naturals Collagen Peptides" },
  "bubs-naturals-creatine-monohydrate": { listingId: "1755708", listingName: "BUBS Boost Creatine Monohydrate" },
  "cadence-core-24-gel": { listingId: "1762990", listingName: "Cadence Core 24 Original Dual-Fuel Gel" },
  "cheribundi-sleep-concentrate": { listingId: "1627847", listingName: "Cheribundi\u00ae PERFORMANCE SLEEP Tart Cherry, Melatonin +Magnesium CONCENTRATE SHOT" },
  "cheribundi-sleep-gummies": { listingId: "1656897", listingName: "cheribundi\u00ae PERFORMANCE SLEEP Tart Cherry Gummies" },
  "cheribundi-tart-cherry-gummies": { listingId: "1629276", listingName: "cheribundi\u00ae PERFORMANCE PURE Tart Cherry Gummies" },
  "create-creatine-electrolytes-mix": { listingId: "1783231", listingName: "Create Wellness Creatine + Electrolytes Watermelon" },
  "create-creatine-monohydrate-gummies": { listingId: "1782311", listingName: "Create Wellness Creatine Gummies Watermelon" },
  "create-creatine-monohydrate-stick-packs": { listingId: "1722223", listingName: "Create Wellness Unflavored" },
  "designs-for-sport-adrenal-flow": { listingId: "1788643", listingName: "Adrenal Flow" },
  "designs-for-sport-amino-complex": { listingId: "1438523", listingName: "Amino Complex Orange Flavor" },
  "designs-for-sport-collagen-complex": { listingId: "1692702", listingName: "Collagen Complex" },
  "designs-for-sport-creatine-monohydrate": { listingId: "1536549", listingName: "Creatine Monohydrate" },
  "designs-for-sport-curcumin-complex": { listingId: "1322717", listingName: "Curcumin Complex" },
  "designs-for-sport-gpc-liquid": { listingId: "1325231", listingName: "GPC Liquid" },
  "designs-for-sport-l-glutamine-powder": { listingId: "1355934", listingName: "Glutamine" },
  "designs-for-sport-magnesium-bisglycinate": { listingId: "1778775", listingName: "Magnesium Bisglycinate" },
  "designs-for-sport-multi-phyto": { listingId: "1780341", listingName: "Multi + Phyto" },
  "designs-for-sport-neuro-complex": { listingId: "1794604", listingName: "Neuromag Sport" },
  "designs-for-sport-pre-train-elite": { listingId: "1769220", listingName: "Pre-Train Elite" },
  "designs-for-sport-pro-formance-peptides": { listingId: "1799974", listingName: "Pro-Formance Peptides" },
  "designs-for-sport-probiotic-50": { listingId: "1798501", listingName: "Probiotic 50" },
  "designs-for-sport-sleep-complex": { listingId: "1780043", listingName: "Sleep Complex" },
  "designs-for-sport-vitamin-d3-pro": { listingId: "1477085", listingName: "Vitamin D3 Pro" },
  "formulas-dream-shot": { listingId: "1798152", listingName: "Formulas Dream Shot No Sugar" },
  "gnarly-bcaas": { listingId: "1753625", listingName: "Gnarly Essential Aminos - Berry Lemonade" },
  "gnarly-collagen-pro": { listingId: "1330416", listingName: "Gnarly Collagen Pro" },
  "gnarly-creatine": { listingId: "1394351", listingName: "Gnarly Creatine" },
  "gnarly-nutrition-fuel2o": { listingId: "1409367", listingName: "Gnarly Fuel2O Tropical" },
  "gnarly-performance-greens": { listingId: "1484853", listingName: "Gnarly Performance Greens Blueberry A\u00e7ai" },
  "gnarly-preworkout": { listingId: "1279789", listingName: "Gnarly PREworkout Strawberry Lemonade" },
  "h2tab-molecular-hydrogen-tablets": { listingId: "1822935", listingName: "H2Tab Molecular Hydrogen Tablets - Unflavored" },
  "humann-tart-cherry-gummies": { listingId: "1477976", listingName: "HumanN Tart Cherry Gummies" },
  "ketone-iq": { listingId: "1798072", listingName: "Ketone-IQ Multiserving (12oz) - HVMN" },
  "ketone-iq-shots": { listingId: "1798073", listingName: "Ketone-IQ Single Serving Shot (2oz) \u2013 HVMN" },
  "klean-athlete-b-complex": { listingId: "1603268", listingName: "Klean B-Complex" },
  "klean-athlete-collagen-c": { listingId: "1204227", listingName: "Klean Collagen+C" },
  "klean-athlete-iron": { listingId: "1446485", listingName: "Klean Iron" },
  "klean-athlete-joint-and-muscle": { listingId: "1680506", listingName: "Klean Joint & Muscle" },
  "klean-athlete-preworkout": { listingId: "1379909", listingName: "Klean Pre-Workout" },
  "klean-athlete-vitamin-d": { listingId: "1633064", listingName: "KLEAN-D\u2122 5000" },
  "klean-athlete-vitamin-d-10000-iu": { listingId: "1622811", listingName: "KLEAN-D 25 mcg (1,000)" },
  "klean-athlete-zinc": { listingId: "1630011", listingName: "Klean Zinc" },
  "klean-bcaa-peak-atp": { listingId: "970153", listingName: "Klean BCAA + PeakATP" },
  "klean-beta-alanine": { listingId: "1187753", listingName: "KLEAN SR BETA-ALANINE" },
  "klean-creatine": { listingId: "1121640", listingName: "Klean Creatine" },
  "klean-hmb": { listingId: "1254007", listingName: "Klean Essential Aminos + HMB" },
  "klean-magnesium": { listingId: "1572352", listingName: "Klean Magnesium" },
  "klean-melatonin": { listingId: "1808747", listingName: "Klean Melatonin" },
  "klean-multivitamin": { listingId: "749363", listingName: "Klean Multivitamin\u2122" },
  "klean-probiotic": { listingId: "786227", listingName: "Klean Probiotic\u2122" },
  "klean-sport-pack": { listingId: "1622813", listingName: "Klean Athlete Sport Pack" },
  "momentous-acetyl-l-carnitine": { listingId: "1601060", listingName: "Acetyl L-Carnitine" },
  "momentous-alpha-gpc": { listingId: "1601061", listingName: "Alpha GPC" },
  "momentous-ashwagandha": { listingId: "1604971", listingName: "Ashwagandha" },
  "momentous-collagen": { listingId: "1258469", listingName: "MOMENTOUS COLLAGEN PEPTIDES" },
  "momentous-collagen-shots": { listingId: "1643612", listingName: "Collagen Shot" },
  "momentous-creatine": { listingId: "1756219", listingName: "Creatine Monohydrate" },
  "momentous-creatine-chews": { listingId: "1760026", listingName: "Creatine Chews Strawberry" },
  "momentous-elite-sleep": { listingId: "1255381", listingName: "Elite Sleep" },
  "momentous-essential-multi": { listingId: "1676980", listingName: "Essential Multivitamin" },
  "momentous-fiber": { listingId: "1764796", listingName: "Fiber \u2013 Unflavored" },
  "momentous-iron-plus": { listingId: "1692931", listingName: "Iron+" },
  "momentous-l-glutamine": { listingId: "1618476", listingName: "L-Glutamine" },
  "momentous-magnesium-malate": { listingId: "1409624", listingName: "Magnesium Malate" },
  "momentous-magnesium-threonate": { listingId: "1496111", listingName: "Magnesium Threonate" },
  "momentous-omega-3": { listingId: "1671910", listingName: "Momentous Omega-3" },
  "momentous-rhodiola-rosea": { listingId: "1601064", listingName: "Rhodiola Rosea" },
  "momentous-tumeric": { listingId: "1496443", listingName: "Turmeric Ultra" },
  "momentous-tyrosine": { listingId: "1601063", listingName: "Tyrosine" },
  "momentous-ubiquinol": { listingId: "1667436", listingName: "CoQ10" },
  "momentous-vegan-omega-3": { listingId: "1696700", listingName: "Vegan Omega 3" },
  "momentous-vital-aminos": { listingId: "1505442", listingName: "Vital Aminos Tropical Punch" },
  "momentous-vitamin-d3": { listingId: "1477860", listingName: "Vitamin D" },
  "momentous-whey-isolate": { listingId: "1676856", listingName: "Whey Protein Isolate \u2013 Strawberry Flavor" },
  "momentous-zinc-picolinate": { listingId: "1612942", listingName: "Zinc" },
  "mortal-hydration": { listingId: "1662950", listingName: "Mortal Hydration Berry" },
  "nordic-naturals-ultimate-omega-2x-sport": { listingId: "1207526", listingName: "Ultimate Omega 2X Sport" },
  "nordic-naturals-ultimate-omega-d3-sport": { listingId: "1400694", listingName: "Ultimate Omega-D3 Sport" },
  "omega-3-hi-po": { listingId: "1340985", listingName: "Omega 3 Hi-PO" },
  "podium-creatine-monohydrate": { listingId: "1786158", listingName: "PODIUM\u00ae CREATINE MONOHYDRATE \u2013 UNFLAVORED" },
  "podium-flavored-creatine-monohydrate": { listingId: "1724020", listingName: "PODIUM\u00ae CREATINE MONOHYDRATE \u2013 PINK LEMONADE" },
  "podium-fuse-pre-workout": { listingId: "1693109", listingName: "PODIUM\u00ae Fuse 2025 Preworkout Sour Watermelon" },
  "podium-hydro-salt-bcaa": { listingId: "1701155", listingName: "PODIUM\u00ae Hydro 2025 Salt+BCAA Sour Watermelon 30 servings" },
  "precision-fuel-hydration-tablets": { listingId: "1204463", listingName: "Precision Hydration 500 tablets" },
  "sfh-super-omega3-fish-oil": { listingId: "1504598", listingName: "Super Omega3 Fish Oil" },
  "spoken-aminos-atp": { listingId: "1654408", listingName: "Aminos + ATP \u2013 Fruit Punch (US)" },
  "spoken-creatine": { listingId: "1657609", listingName: "Creatine \u2013 Unflavored (US)" },
  "spoken-high-epa-fish-oil-d": { listingId: "1657927", listingName: "Pro Resolving Mediators + EPA/DHA (US)" },
  "spoken-mag-3": { listingId: "1711376", listingName: "Mag 3 (US)" },
  "spoken-sleep-builder": { listingId: "1655885", listingName: "Sleep Builder \u2013 Cherry (US)" },
  "stemregen": { listingId: "1697649", listingName: "Stemregen Sport" },
  "swiss-rx-synthesis": { listingId: "1712748", listingName: "SwissRX Synthesis" },
  "swissrx-peptisleep-capsules-dream": { listingId: "1721963", listingName: "SwissRX Dream" },
  "the-feed-lab-creatine": { listingId: "1691156", listingName: "The Feed Lab. Creatine" },
  "the-feed-lab-creatine-monohydrate": { listingId: "1802257", listingName: "The Feed Lab Creatine Monohydrate" },
  "the-feed-lab-high-carb-drink-mix": { listingId: "1704223", listingName: "The Feed Lab. High Carb Drink Mix" },
  "the-feed-lab-hydration": { listingId: "1730272", listingName: "Feed Lab. Watermelon Hydration" },
  "the-feed-lab-whey-protein": { listingId: "1725573", listingName: "The Feed Lab. Whey Protein Vanilla" },
  "thorne-advanced-iron-complex": { listingId: "1813362", listingName: "Thorne\u00ae Advanced Iron Complex" },
  "thorne-advanced-pre-workout": { listingId: "1759402", listingName: "Thorne\u00ae Advanced Pre-Workout (Rainbow Sherbet Flavor)" },
  "thorne-amino-complex": { listingId: "1662816", listingName: "Thorne\u00ae Amino Complex Lemon" },
  "thorne-basic-nutrients-2-day": { listingId: "1301460", listingName: "Thorne\u00ae Basic Nutrients 2/Day" },
  "thorne-beta-alanine-sr": { listingId: "1251410", listingName: "Thorne\u00ae Beta Alanine-SR" },
  "thorne-collagen-fit": { listingId: "1506207", listingName: "Thorne\u00ae Collagen Fit" },
  "thorne-creatine": { listingId: "1663109", listingName: "Thorne\u00ae Creatine" },
  "thorne-creatine-alpha-gpc": { listingId: "1748625", listingName: "Thorne\u00ae Creatine + Alpha GPC (Watermelon Lemonade Flavored)" },
  "thorne-creatine-bcaas": { listingId: "1741747", listingName: "Thorne\u00ae Creatine + BCAA (Peach Mango Flavored)" },
  "thorne-curcumin-phytosome": { listingId: "1829442", listingName: "Thorne\u00ae Curcumin Phytosome" },
  "thorne-florasport-20b": { listingId: "1398111", listingName: "Thorne\u00ae FloraSport 20B\u00ae" },
  "thorne-immune-activator": { listingId: "1809887", listingName: "Thorne\u00ae Immune Activator\u2021" },
  "thorne-iron-bisglycinate": { listingId: "1205059", listingName: "Thorne\u00ae Iron Bisglycinate" },
  "thorne-l-glutamine": { listingId: "1509493", listingName: "Thorne\u00ae L-Glutamine Powder" },
  "thorne-leaky-gut-support": { listingId: "1779613", listingName: "Thorne\u00ae Leaky Gut Support" },
  "thorne-magnesium-bisglycinate": { listingId: "1666128", listingName: "Thorne\u00ae Magnesium Bisglycinate" },
  "thorne-melaton-3": { listingId: "1207474", listingName: "Thorne\u00ae Melaton-3\u2122" },
  "thorne-multi-vitamin-elite": { listingId: "1309658", listingName: "Thorne\u00ae Multi-Vitamin Elite" },
  "thorne-super-epa": { listingId: "1237707", listingName: "Thorne\u00ae Super EPA (EPA & DHA)" },
  "thorne-synaquell": { listingId: "1428451", listingName: "Thorne\u00ae SynaQuell\u2122" },
  "thorne-vitamin-b12": { listingId: "1811504", listingName: "Thorne\u00ae Vitamin B12" },
  "thorne-vitamin-d3": { listingId: "1221010", listingName: "Thorne\u00ae D-5,000" },
  "thorne-whey-protein-isolate": { listingId: "1513728", listingName: "Thorne\u00ae Whey Protein Isolate Vanilla Flavored" },
  "thorne-zinc-picolinate": { listingId: "1211643", listingName: "Thorne\u00ae Zinc Picolinate 30 mg" },
  "transparent-labs-creatine-hmb": { listingId: "1755008", listingName: "Creatine HMB Unflavored" },
  "transparent-labs-grass-fed-whey": { listingId: "1756600", listingName: "Grass-Fed Whey Protein Isolate Unflavored" },
  "vital-proteins-collagen-peptides": { listingId: "1610798", listingName: "Vital Proteins Collagen Peptides" },
};

// The Feed lists these as NSF Certified for Sport, but no matching product was in NSF's database
// on NSF_CHECKED_ON. They're not shown as NSF certified.
export const NSF_NOT_FOUND: string[] = ["thorne-calcium-magnesium-malate"];

// Close name matches that were reviewed and are NOT the same product (usually a separate "Sport"
// SKU, another country's listing or a different formula). scripts/check-nsf.ts skips these.
export const NSF_REVIEWED_NOT_SAME: Record<string, string[]> = {
  "bodyhealth-perfect-amino-non-coated-tablets": ["1807050"], // NSF lists the coated tablets
  "bodyhealth-perfect-amino-powder": ["1753373"],             // NSF lists Perfect Amino Creatine
  "nordic-naturals-omega-3": ["1207526"],                     // Sport SKU only
  "nordic-naturals-ultimate-omega": ["1207526", "1400694"],   // Sport SKUs only
  "nordic-naturals-ultimate-omega-d3": ["1400694"],           // Sport SKU only
  "nordic-naturals-ultimate-omega-supp": ["1207526"],         // Sport SKU only
  "pure-encapsulations-creatine": ["1832980"],                // Canadian listing only
  "thorne-collagen-plus": ["1506207"],                        // that's Collagen Fit
  "thorne-melaton-5": ["1207474"],                            // that's Melaton-3
};
