// lib/ingredient-taxonomy.ts
// Pello ingredient & source taxonomy
// Powers ingredient filtering, flagging and the Explore interface

// ── INGREDIENT CATEGORIES ────────────────────────────────────

export type IngredientCategory =
  | "carbohydrate"
  | "electrolyte"
  | "stimulant"
  | "amino-acid"
  | "protein"
  | "vitamin"
  | "mineral"
  | "adaptogen"
  | "probiotic"
  | "prebiotic"
  | "botanical"
  | "omega-fatty-acid"
  | "gelling-agent"
  | "emulsifier"
  | "sweetener"
  | "preservative"
  | "colourant"
  | "seed-oil"
  | "gum"
  | "filler"
  | "flavouring"
  | "antioxidant"
  | "thickener";

// ── SOURCE TYPES ─────────────────────────────────────────────

export type IngredientSource =
  | "plant"
  | "animal"
  | "synthetic"
  | "fermentation"
  | "marine"
  | "algae"
  | "mineral-derived"
  | "unknown";

// ── FLAG TYPES ───────────────────────────────────────────────
// These are ingredients many health-conscious athletes want to avoid

export type IngredientFlag =
  | "artificial-sweetener"      // sucralose, acesulfame-K, aspartame
  | "artificial-colour"         // tartrazine, Red 40, Blue 1 etc.
  | "artificial-preservative"   // sodium benzoate, potassium sorbate
  | "seed-oil"                  // sunflower, canola, soybean, corn oil
  | "gum"                       // xanthan, guar, gellan, carrageenan
  | "soy"                       // soy lecithin, soy protein, soy flour
  | "gluten"                    // wheat, barley, rye derivatives
  | "proprietary-blend"         // undisclosed doses
  | "high-fructose-corn-syrup"
  | "hydrogenated-fat"
  | "carrageenan"               // gut inflammation concerns
  | "maltitol"                  // GI distress at high doses
  | "sorbitol"                  // GI distress at high doses
  | "natural-flavours"          // ambiguous — can hide many things
  | "caramel-colour"            // Class IV has 4-MEI concerns
  | "silicon-dioxide"           // anti-caking agent, some prefer to avoid
  | "titanium-dioxide"          // nanoparticle concerns
  | "carnauba-wax"              // coating agent
  | "modified-starch"           // highly processed starch
  | "enriched-flour";           // refined, low nutritional value

// ── EVIDENCE LEVELS ──────────────────────────────────────────

export type EvidenceLevel =
  | "strong"      // multiple RCTs, consistent results
  | "moderate"    // some RCTs, mixed results
  | "emerging"    // promising but limited research
  | "traditional" // historical use, limited clinical evidence
  | "disputed"    // conflicting evidence or debunked claims
  | "insufficient"; // not enough research to evaluate

// ── TIMING ───────────────────────────────────────────────────

export type UsageTiming =
  | "pre-workout"
  | "intra-workout"
  | "post-workout"
  | "daily"
  | "before-bed"
  | "with-food"
  | "empty-stomach";

// ── MAIN INGREDIENT TYPE ─────────────────────────────────────

export interface TaxonomyIngredient {
  id: string;
  name: string;
  aliases: string[];              // common names and variants
  category: IngredientCategory;
  source: IngredientSource;
  flags: IngredientFlag[];        // things to flag for filtering
  evidenceLevel: EvidenceLevel;
  
  // Performance relevance
  primaryBenefit: string;         // one sentence
  mechanismOfAction?: string;     // how it works
  optimalDose?: string;           // evidence-based dose range
  optimalTiming?: UsageTiming[];
  
  // Safety & tolerance
  safetyNotes?: string;
  commonSideEffects?: string[];
  avoidWith?: string[];           // interactions or contraindications
  
  // Dietary compatibility
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  
  // Quality markers
  preferredForms?: string[];      // e.g. "Creapure", "Ferrochel", "MK-7"
  inferiorForms?: string[];       // e.g. "magnesium oxide", "folic acid"
  
  pubmedUrl?: string;
  examineUrl?: string;
}

// ── THE TAXONOMY ─────────────────────────────────────────────

export const INGREDIENT_TAXONOMY: TaxonomyIngredient[] = [

  // ── CARBOHYDRATES ─────────────────────────────────────────

  {
    id: "maltodextrin",
    name: "Maltodextrin",
    aliases: ["malto", "glucose polymer", "complex carbohydrate"],
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Fast-absorbing glucose polymer — primary fuel for endurance sport",
    mechanismOfAction: "Absorbed via SGLT1 intestinal transporter alongside sodium. High glycaemic index delivers rapid energy without significant osmolality increase",
    optimalDose: "30-60g/hr alone, up to 90g/hr combined with fructose",
    optimalTiming: ["intra-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["Cluster Dextrin (highly branched cyclic dextrin)", "Waxy maize starch"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=maltodextrin+endurance+carbohydrate+absorption",
    examineUrl: "https://examine.com/supplements/maltodextrin/",
  },

  {
    id: "fructose",
    name: "Fructose",
    aliases: ["fruit sugar", "levulose"],
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Uses GLUT5 transporter — enables carb absorption above 60g/hr when paired with glucose",
    mechanismOfAction: "Absorbed via separate GLUT5 intestinal transporter. When combined with glucose at 2:1 or 1:0.8 ratio, total carb oxidation ceiling rises from 60g/hr to 90g/hr",
    optimalDose: "20-40g/hr combined with glucose sources",
    optimalTiming: ["intra-workout"],
    safetyNotes: "Can cause GI distress at high doses in sensitive individuals. Some athletes have fructose malabsorption",
    commonSideEffects: ["bloating", "GI cramps at high doses"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=fructose+glucose+co-ingestion+carbohydrate+oxidation",
  },

  {
    id: "glucose",
    name: "Glucose",
    aliases: ["dextrose", "grape sugar", "blood sugar"],
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Simplest carbohydrate — immediate energy, rapid absorption",
    optimalDose: "30-60g/hr",
    optimalTiming: ["intra-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=glucose+endurance+performance+energy",
  },

  {
    id: "sucrose",
    name: "Sucrose",
    aliases: ["table sugar", "cane sugar", "beet sugar"],
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "50/50 glucose-fructose disaccharide — naturally provides dual transporter pathway",
    mechanismOfAction: "Sucrase enzyme splits sucrose into glucose and fructose in the gut — effectively delivers a 1:1 glucose:fructose ratio naturally",
    optimalTiming: ["intra-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "cluster-dextrin",
    name: "Cluster Dextrin",
    aliases: ["highly branched cyclic dextrin", "HBCD", "Cyclic Dextrin"],
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Fastest gastric emptying of any carbohydrate — lower osmolality, less GI distress",
    mechanismOfAction: "Cyclic branched structure passes through stomach faster than maltodextrin. Lower osmolality than standard glucose polymers means less water drawn into gut",
    optimalDose: "30-60g/hr",
    optimalTiming: ["intra-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=highly+branched+cyclic+dextrin+gastric+emptying",
  },

  // ── ELECTROLYTES ──────────────────────────────────────────

  {
    id: "sodium",
    name: "Sodium",
    aliases: ["Na", "sodium chloride", "table salt", "sodium citrate", "sodium bicarbonate"],
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Primary electrolyte for fluid balance, nerve function and carbohydrate absorption",
    mechanismOfAction: "Sodium-glucose co-transport (SGLT1) requires sodium to pull glucose across intestinal wall. Also maintains plasma osmolality and drives thirst to maintain hydration",
    optimalDose: "500-1500mg/hr depending on sweat rate and conditions",
    optimalTiming: ["intra-workout"],
    preferredForms: ["sodium citrate", "sodium chloride"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+electrolyte+endurance+hydration+sweat",
  },

  {
    id: "magnesium",
    name: "Magnesium",
    aliases: ["Mg", "magnesium glycinate", "magnesium citrate", "magnesium malate", "magnesium threonate"],
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Essential for 300+ enzymatic reactions — muscle relaxation, sleep quality and energy metabolism",
    optimalDose: "200-400mg elemental magnesium daily",
    optimalTiming: ["before-bed", "daily"],
    preferredForms: ["magnesium glycinate", "magnesium malate", "magnesium L-threonate", "Aquamin"],
    inferiorForms: ["magnesium oxide (poor absorption, laxative effect)"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+athlete+performance+sleep+recovery",
    examineUrl: "https://examine.com/supplements/magnesium/",
  },

  {
    id: "potassium",
    name: "Potassium",
    aliases: ["K", "potassium citrate", "potassium chloride"],
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Nerve signalling, muscle contraction and fluid balance alongside sodium",
    optimalDose: "200-500mg/hr during exercise",
    optimalTiming: ["intra-workout"],
    preferredForms: ["potassium citrate"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=potassium+electrolyte+muscle+function+exercise",
  },

  // ── STIMULANTS ────────────────────────────────────────────

  {
    id: "caffeine",
    name: "Caffeine",
    aliases: ["1,3,7-trimethylxanthine", "caffeine anhydrous"],
    category: "stimulant",
    source: "synthetic",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Most evidence-backed ergogenic aid — improves endurance, strength, focus and fat oxidation",
    mechanismOfAction: "Blocks adenosine receptors, reducing perception of fatigue. Increases adrenaline release and enhances fat oxidation",
    optimalDose: "3-6mg per kg body weight (200-400mg for most athletes)",
    optimalTiming: ["pre-workout", "intra-workout"],
    safetyNotes: "Tolerance builds with regular use. Avoid within 8 hours of sleep. Individual variation in metabolism (CYP1A2 gene)",
    commonSideEffects: ["anxiety", "increased heart rate", "GI distress at high doses", "sleep disruption"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["green tea extract (natural)", "guarana (natural)", "caffeine anhydrous (synthetic — faster acting)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=caffeine+endurance+performance+ergogenic",
    examineUrl: "https://examine.com/supplements/caffeine/",
  },

  {
    id: "caffeine-natural",
    name: "Green Tea Extract",
    aliases: ["natural caffeine", "guarana", "coffee extract", "white tea extract"],
    category: "stimulant",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Natural caffeine source — same ergogenic effects with additional polyphenols",
    optimalDose: "200-400mg caffeine equivalent",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["green tea extract", "guarana seed extract"],
  },

  // ── AMINO ACIDS ───────────────────────────────────────────

  {
    id: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    aliases: ["creatine", "Cr", "creatine HCl"],
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Replenishes phosphocreatine (PCr) — most researched performance supplement in existence",
    mechanismOfAction: "Increases PCr stores in muscle, enabling faster ATP regeneration during high-intensity efforts. Also supports cognitive function and muscle protein synthesis",
    optimalDose: "3-5g daily — no loading phase needed",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["Creapure (German pharmaceutical grade)", "micronised creatine monohydrate"],
    inferiorForms: ["creatine ethyl ester (less stable)", "creatine HCl (no proven advantage over monohydrate)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+monohydrate+performance+safety+review",
    examineUrl: "https://examine.com/supplements/creatine/",
  },

  {
    id: "beta-alanine",
    name: "Beta-Alanine",
    aliases: ["β-alanine", "CarnoSyn"],
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Raises muscle carnosine levels — buffers lactic acid during high-intensity efforts",
    mechanismOfAction: "Rate-limiting precursor to carnosine, which buffers hydrogen ions (lactic acid) in muscle. Most effective for efforts lasting 1-4 minutes",
    optimalDose: "3.2-6.4g daily (split doses reduce tingling)",
    optimalTiming: ["daily"],
    safetyNotes: "Causes harmless tingling (paresthesia) — reduced with split dosing or slow-release forms",
    commonSideEffects: ["paresthesia (tingling) — harmless"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["CarnoSyn (patented, most studied)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=beta-alanine+carnosine+performance+endurance",
    examineUrl: "https://examine.com/supplements/beta-alanine/",
  },

  {
    id: "bcaa",
    name: "BCAAs",
    aliases: ["branched chain amino acids", "leucine", "isoleucine", "valine"],
    category: "amino-acid",
    source: "animal",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "May reduce mental fatigue and muscle damage during prolonged efforts",
    mechanismOfAction: "Competes with tryptophan for brain uptake — may reduce serotonin-driven central fatigue. Leucine directly stimulates mTOR and muscle protein synthesis",
    optimalDose: "5-10g before or during exercise",
    optimalTiming: ["pre-workout", "intra-workout"],
    safetyNotes: "Most evidence suggests EAAs (all 9 amino acids) are superior to BCAAs alone for MPS",
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    preferredForms: ["plant-based BCAAs from fermentation (vegan)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=BCAA+endurance+fatigue+muscle+damage",
    examineUrl: "https://examine.com/supplements/branched-chain-amino-acids/",
  },

  {
    id: "l-glutamine",
    name: "L-Glutamine",
    aliases: ["glutamine"],
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Gut integrity support and immune function after high-volume training",
    mechanismOfAction: "Primary fuel for intestinal cells — maintains gut barrier integrity during physiological stress. Also supports immune cell proliferation post-exercise",
    optimalDose: "5-10g post-exercise",
    optimalTiming: ["post-workout", "daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=glutamine+gut+immunity+exercise+recovery",
    examineUrl: "https://examine.com/supplements/glutamine/",
  },

  // ── BOTANICAL & PLANT EXTRACTS ────────────────────────────

  {
    id: "tart-cherry",
    name: "Tart Cherry Extract",
    aliases: ["Montmorency cherry", "tart cherry juice", "CherryPURE", "VitaCherry"],
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Reduces post-exercise inflammation, DOMS and oxidative stress",
    mechanismOfAction: "Anthocyanins inhibit COX-1 and COX-2 enzymes (same mechanism as NSAIDs). Also naturally boosts melatonin production for improved sleep quality",
    optimalDose: "480mg anthocyanins or 30ml concentrate twice daily",
    optimalTiming: ["post-workout", "before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["CherryPURE (standardised to 40% polyphenols)", "VitaCherry Sport"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=tart+cherry+DOMS+inflammation+recovery",
    examineUrl: "https://examine.com/supplements/tart-cherry/",
  },

  {
    id: "beetroot",
    name: "Beetroot / Dietary Nitrate",
    aliases: ["beet root", "beta vulgaris", "nitrate", "NO3"],
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Increases nitric oxide — improves blood flow, oxygen delivery and exercise efficiency",
    mechanismOfAction: "Dietary nitrate converted to nitric oxide via oral bacteria and stomach acid — induces vasodilation, improves mitochondrial efficiency and reduces O2 cost of exercise",
    optimalDose: "400-600mg dietary nitrate, 2-3 hours before exercise",
    optimalTiming: ["pre-workout"],
    safetyNotes: "Most effective in untrained or moderately trained athletes. Less effect in elite athletes. Avoid using antibacterial mouthwash which kills the bacteria needed for conversion",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=beetroot+nitrate+performance+VO2+endurance",
    examineUrl: "https://examine.com/supplements/beetroot/",
  },

  {
    id: "ashwagandha",
    name: "Ashwagandha",
    aliases: ["Withania somnifera", "KSM-66", "Sensoril"],
    category: "adaptogen",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Reduces cortisol and stress response — supports recovery and sleep quality",
    optimalDose: "300-600mg extract daily",
    optimalTiming: ["before-bed", "daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["KSM-66 (full-spectrum root extract)", "Sensoril (leaf + root)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=ashwagandha+cortisol+stress+recovery+athlete",
    examineUrl: "https://examine.com/supplements/ashwagandha/",
  },

  {
    id: "turmeric",
    name: "Turmeric / Curcumin",
    aliases: ["Curcuma longa", "curcumin", "BCM-95"],
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Anti-inflammatory — reduces post-exercise joint pain and muscle soreness",
    optimalDose: "500-2000mg curcumin with black pepper (piperine) for absorption",
    optimalTiming: ["post-workout", "daily"],
    safetyNotes: "Poor bioavailability unless combined with piperine or in phospholipid complex",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["BCM-95 (enhanced bioavailability)", "Meriva (phospholipid complex)", "whole turmeric matrix"],
    inferiorForms: ["plain curcumin powder (poor bioavailability without piperine)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=curcumin+inflammation+exercise+recovery",
    examineUrl: "https://examine.com/supplements/curcumin/",
  },

  // ── VITAMINS ──────────────────────────────────────────────

  {
    id: "vitamin-d3",
    name: "Vitamin D3",
    aliases: ["cholecalciferol", "vitamin D", "D3"],
    category: "vitamin",
    source: "animal",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Bone health, immune function and muscle strength — deficiency is extremely common in athletes",
    mechanismOfAction: "Steroid hormone precursor — regulates calcium absorption, immune cell function and muscle fibre composition. Up to 77% of indoor athletes are deficient",
    optimalDose: "1000-5000 IU daily depending on baseline levels (get tested first)",
    optimalTiming: ["daily", "with-food"],
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    preferredForms: ["cholecalciferol D3 (2x more effective than D2)", "paired with K2 MK-7 for long-term safety"],
    inferiorForms: ["ergocalciferol D2 (less potent, shorter half-life)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+D3+athlete+deficiency+performance+immunity",
    examineUrl: "https://examine.com/supplements/vitamin-d/",
  },

  {
    id: "vitamin-k2",
    name: "Vitamin K2",
    aliases: ["menaquinone", "MK-7", "MK-4"],
    category: "vitamin",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Directs calcium to bones and away from arteries — essential cofactor for long-term Vitamin D3 use",
    optimalDose: "90-200mcg MK-7 daily",
    optimalTiming: ["daily", "with-food"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["MK-7 (longest half-life, best for supplementation)", "from fermented natto"],
    inferiorForms: ["MK-4 (shorter half-life, requires multiple doses)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+K2+MK-7+calcium+bone+arterial+calcification",
    examineUrl: "https://examine.com/supplements/vitamin-k2/",
  },

  // ── MINERALS ──────────────────────────────────────────────

  {
    id: "iron",
    name: "Iron",
    aliases: ["Fe", "ferrous bisglycinate", "ferrous sulfate", "Ferrochel"],
    category: "mineral",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Oxygen transport via haemoglobin — deficiency severely impairs VO2 max and endurance",
    optimalDose: "18-25mg elemental iron daily (only supplement if deficient — test ferritin first)",
    optimalTiming: ["empty-stomach", "with-food"],
    safetyNotes: "Do not supplement without confirmed deficiency. Iron overload is toxic. Take with Vitamin C to enhance absorption. Avoid with calcium, coffee or tea",
    commonSideEffects: ["constipation", "nausea", "GI upset (minimised with bisglycinate form)"],
    avoidWith: ["calcium supplements", "antacids", "tea", "coffee (within 1 hour)"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["ferrous bisglycinate (Ferrochel) — best absorbed, gentlest on gut"],
    inferiorForms: ["ferrous sulfate (cheap but causes GI distress)", "ferric iron forms (poor absorption)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=iron+deficiency+endurance+athlete+VO2max+ferritin",
    examineUrl: "https://examine.com/supplements/iron/",
  },

  // ── OMEGA FATTY ACIDS ─────────────────────────────────────

  {
    id: "omega-3-epa-dha",
    name: "Omega-3 (EPA + DHA)",
    aliases: ["fish oil", "EPA", "DHA", "omega-3 fatty acids"],
    category: "omega-fatty-acid",
    source: "marine",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Reduces systemic inflammation and supports cardiovascular, brain and joint health",
    optimalDose: "1-3g combined EPA+DHA daily",
    optimalTiming: ["daily", "with-food"],
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    preferredForms: ["triglyceride form (2x better absorbed than ethyl ester)", "algae oil (vegan, same EPA+DHA)"],
    inferiorForms: ["ethyl ester form (cheaper, less absorbed)", "ALA from flaxseed (poor conversion to EPA/DHA)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=omega-3+EPA+DHA+inflammation+performance+recovery",
    examineUrl: "https://examine.com/supplements/fish-oil/",
  },

  {
    id: "omega-3-algae",
    name: "Algae Oil Omega-3",
    aliases: ["algal oil", "vegan omega-3", "DHA from algae"],
    category: "omega-fatty-acid",
    source: "algae",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Vegan source of EPA and DHA — identical benefits to fish oil without animal products",
    mechanismOfAction: "Fish get their omega-3s from algae — this goes straight to the source. Same EPA and DHA as fish oil, identical biological activity",
    optimalDose: "500-1000mg DHA + EPA daily",
    optimalTiming: ["daily", "with-food"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=algae+oil+DHA+EPA+vegan+omega-3",
  },

  // ── FLAGGED INGREDIENTS ───────────────────────────────────

  {
    id: "sucralose",
    name: "Sucralose",
    aliases: ["Splenda", "E955"],
    category: "sweetener",
    source: "synthetic",
    flags: ["artificial-sweetener"],
    evidenceLevel: "moderate",
    primaryBenefit: "Zero-calorie sweetener for palatability",
    safetyNotes: "Safe at typical doses per FDA. Some studies suggest potential gut microbiome disruption at high doses. Many athletes prefer to avoid artificial sweeteners",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    examineUrl: "https://examine.com/supplements/sucralose/",
  },

  {
    id: "acesulfame-k",
    name: "Acesulfame Potassium",
    aliases: ["Ace-K", "acesulfame K", "E950"],
    category: "sweetener",
    source: "synthetic",
    flags: ["artificial-sweetener"],
    evidenceLevel: "disputed",
    primaryBenefit: "Zero-calorie sweetener — often paired with sucralose",
    safetyNotes: "Some animal studies raise concerns at very high doses. Considered safe at typical food levels by FDA/EFSA but many health-conscious consumers avoid",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "sodium-benzoate",
    name: "Sodium Benzoate",
    aliases: ["E211", "benzoic acid"],
    category: "preservative",
    source: "synthetic",
    flags: ["artificial-preservative"],
    evidenceLevel: "disputed",
    primaryBenefit: "Prevents mould and bacterial growth — extends shelf life of liquid or gel products",
    safetyNotes: "Generally recognised as safe at food levels. When combined with Vitamin C can form benzene (a carcinogen) — relevant to products containing both",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "potassium-sorbate",
    name: "Potassium Sorbate",
    aliases: ["E202", "sorbic acid"],
    category: "preservative",
    source: "synthetic",
    flags: ["artificial-preservative"],
    evidenceLevel: "moderate",
    primaryBenefit: "Prevents yeast and mould — common in gels, chews and liquid supplements",
    safetyNotes: "Widely considered safe at food levels. Some athletes prefer to avoid all artificial preservatives",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "sunflower-oil",
    name: "Sunflower Oil",
    aliases: ["high oleic sunflower oil", "sunflower lecithin"],
    category: "seed-oil",
    source: "plant",
    flags: ["seed-oil"],
    evidenceLevel: "disputed",
    primaryBenefit: "Emulsifier and texture agent in bars and protein powders",
    safetyNotes: "High in omega-6 linoleic acid — high consumption may contribute to systemic inflammation when omega-6:omega-3 ratio is already unbalanced. High oleic versions are more stable",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "canola-oil",
    name: "Canola Oil",
    aliases: ["rapeseed oil", "vegetable oil"],
    category: "seed-oil",
    source: "plant",
    flags: ["seed-oil"],
    evidenceLevel: "disputed",
    primaryBenefit: "Cheap fat source and emulsifier",
    safetyNotes: "Highly refined industrial seed oil — high in omega-6, often partially hydrogenated. Many health-conscious athletes avoid. One of the most processed oils in the food supply",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "xanthan-gum",
    name: "Xanthan Gum",
    aliases: ["E415"],
    category: "gum",
    source: "fermentation",
    flags: ["gum"],
    evidenceLevel: "moderate",
    primaryBenefit: "Thickening and stabilising agent — creates gel texture",
    safetyNotes: "Generally well tolerated. Some individuals experience GI distress particularly at high doses. Produced by bacterial fermentation of sugars",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "carrageenan",
    name: "Carrageenan",
    aliases: ["E407", "Irish moss extract"],
    category: "gum",
    source: "marine",
    flags: ["gum", "carrageenan"],
    evidenceLevel: "disputed",
    primaryBenefit: "Thickening and emulsifying agent from seaweed",
    safetyNotes: "Some animal studies and in-vitro research suggest pro-inflammatory effects in the gut. Degraded carrageenan (poligeenan) is a known carcinogen — food-grade carrageenan is different but some researchers advise caution",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "gellan-gum",
    name: "Gellan Gum",
    aliases: ["E418"],
    category: "gum",
    source: "fermentation",
    flags: ["gum"],
    evidenceLevel: "moderate",
    primaryBenefit: "Gelling agent used in energy gels and drinks",
    safetyNotes: "Generally well tolerated — fermentation-derived. Common in GU products",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

  {
    id: "soy-lecithin",
    name: "Soy Lecithin",
    aliases: ["lecithin", "E322"],
    category: "emulsifier",
    source: "plant",
    flags: ["soy"],
    evidenceLevel: "strong",
    primaryBenefit: "Emulsifier that improves mixability and texture in protein powders and bars",
    safetyNotes: "Soy allergen — avoid if soy-sensitive. Highly refined so most soy proteins are removed, but trace amounts may remain. Sunflower lecithin is the soy-free alternative",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    inferiorForms: ["soy lecithin (soy allergen risk)"],
    preferredForms: ["sunflower lecithin (soy-free, cleaner)"],
  },

  {
    id: "natural-flavours",
    name: "Natural Flavours",
    aliases: ["natural flavoring", "natural flavor", "natural flavouring"],
    category: "flavouring",
    source: "unknown",
    flags: ["natural-flavours"],
    evidenceLevel: "insufficient",
    primaryBenefit: "Flavour enhancement without artificial chemicals",
    safetyNotes: "FDA definition of 'natural flavours' is broad — can include animal-derived compounds (making it non-vegan), MSG derivatives, and many other ingredients. A transparency concern when brands don't specify further",
    isVegan: false, isVegetarian: false, isGlutenFree: true,
  },

  {
    id: "silicon-dioxide",
    name: "Silicon Dioxide",
    aliases: ["E551", "silica", "anti-caking agent"],
    category: "filler",
    source: "mineral-derived",
    flags: ["silicon-dioxide"],
    evidenceLevel: "moderate",
    primaryBenefit: "Anti-caking agent — prevents powder clumping",
    safetyNotes: "Generally recognised as safe at food levels. Some concerns about nanoparticle forms and their potential gut effects. Preferred to avoid in clean-label products",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },

];

// ── FLAGGED INGREDIENT LOOKUP ─────────────────────────────────
// Quick reference for the Explore interface

export const FLAGGED_INGREDIENTS = INGREDIENT_TAXONOMY.filter(
  (i) => i.flags.length > 0
);

export const SEED_OILS = INGREDIENT_TAXONOMY.filter(
  (i) => i.flags.includes("seed-oil")
).map((i) => i.name);

export const ARTIFICIAL_SWEETENERS = INGREDIENT_TAXONOMY.filter(
  (i) => i.flags.includes("artificial-sweetener")
).map((i) => i.name);

export const ARTIFICIAL_PRESERVATIVES = INGREDIENT_TAXONOMY.filter(
  (i) => i.flags.includes("artificial-preservative")
).map((i) => i.name);

export const GUMS = INGREDIENT_TAXONOMY.filter(
  (i) => i.flags.includes("gum")
).map((i) => i.name);

// ── INGREDIENT LOOKUP ─────────────────────────────────────────

export function getIngredient(id: string): TaxonomyIngredient | undefined {
  return INGREDIENT_TAXONOMY.find((i) => i.id === id);
}

export function searchIngredients(Explore: string): TaxonomyIngredient[] {
  const q = Explore.toLowerCase();
  return INGREDIENT_TAXONOMY.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

export function getIngredientsByCategory(
  category: IngredientCategory
): TaxonomyIngredient[] {
  return INGREDIENT_TAXONOMY.filter((i) => i.category === category);
}

export function getIngredientsByFlag(
  flag: IngredientFlag
): TaxonomyIngredient[] {
  return INGREDIENT_TAXONOMY.filter((i) => i.flags.includes(flag));
}

export function getFlaggedInProduct(
  ingredientNames: string[]
): IngredientFlag[] {
  const flags = new Set<IngredientFlag>();
  ingredientNames.forEach((name) => {
    const match = INGREDIENT_TAXONOMY.find(
      (i) =>
        i.name.toLowerCase() === name.toLowerCase() ||
        i.aliases.some((a) => a.toLowerCase() === name.toLowerCase())
    );
    if (match) match.flags.forEach((f) => flags.add(f));
  });
  return Array.from(flags);
}