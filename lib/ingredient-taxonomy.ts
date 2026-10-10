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
  | "thickener"
  | "other";

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
  // Regex (case-insensitive) matched against product ingredient names to list the products
  // that contain this ingredient. Computed on the server from the labels, so it never goes stale.
  productPattern?: string;
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
    productPattern: "maltodextrin",
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Fast-absorbing glucose polymer — primary fuel for endurance sport",
    mechanismOfAction: "Absorbed via SGLT1 intestinal transporter alongside sodium. High glycemic index delivers rapid energy without significant osmolality increase",
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
    productPattern: "fructose(?!.*oligo)",
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
    productPattern: "glucose|dextrose",
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
    productPattern: "sucrose|cane sugar",
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
    productPattern: "cluster dextrin|cyclic dextrin|hbcd",
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
    productPattern: "^sodium\\b(?!.*(ascorbate|bicarbonate|chondroitin|selenite|selenate|molybdate|alginate))|pink salt|himalayan",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Primary electrolyte for fluid balance, nerve function and carbohydrate absorption",
    mechanismOfAction: "Sodium-glucose co-transport (SGLT1) requires sodium to pull glucose across intestinal wall. Also maintains plasma osmolality and drives thirst to maintain hydration",
    optimalDose: "300-1500mg/hr by session length and conditions (up to 2000mg/hr for salty sweaters)",
    optimalTiming: ["intra-workout"],
    preferredForms: ["sodium citrate", "sodium chloride"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+electrolyte+endurance+hydration+sweat",
  },

  {
    id: "magnesium",
    name: "Magnesium",
    aliases: ["Mg", "magnesium glycinate", "magnesium citrate", "magnesium malate", "magnesium threonate"],
    productPattern: "^magnesium",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "moderate",  // matches the "likely" verdict on product pages
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
    productPattern: "^potassium\\b(?!.*(sorbate|iodide))",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Nerve signaling, muscle contraction and fluid balance alongside sodium",
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
    productPattern: "caffeine(?!.*decaf)",
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
    productPattern: "creatine|creapure",
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Replenishes phosphocreatine (PCr) — most researched performance supplement in existence",
    mechanismOfAction: "Increases PCr stores in muscle, enabling faster ATP regeneration during high-intensity efforts. Also supports cognitive function and muscle protein synthesis",
    optimalDose: "3-5g daily — no loading phase needed",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["Creapure (German pharmaceutical grade)", "micronized creatine monohydrate"],
    inferiorForms: ["creatine ethyl ester (less stable)", "creatine HCl (no proven advantage over monohydrate)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+monohydrate+performance+safety+review",
    examineUrl: "https://examine.com/supplements/creatine/",
  },

  {
    id: "beta-alanine",
    name: "Beta-Alanine",
    aliases: ["β-alanine", "CarnoSyn"],
    productPattern: "beta.?alanine|carnosyn",
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
    productPattern: "bcaa|branched.?chain",
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
    productPattern: "glutamine",
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
    productPattern: "cherry|montmorency|prunus cerasus",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Reduces post-exercise inflammation, DOMS and oxidative stress",
    mechanismOfAction: "Anthocyanins inhibit COX-1 and COX-2 enzymes (same mechanism as NSAIDs). Also naturally boosts melatonin production for improved sleep quality",
    optimalDose: "480mg anthocyanins or 30ml concentrate twice daily",
    optimalTiming: ["post-workout", "before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["CherryPURE (standardized to 40% polyphenols)", "VitaCherry Sport"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=tart+cherry+DOMS+inflammation+recovery",
    examineUrl: "https://examine.com/supplements/tart-cherry/",
  },

  {
    id: "beetroot",
    name: "Beetroot / Dietary Nitrate",
    aliases: ["beet root", "beta vulgaris", "nitrate", "NO3"],
    productPattern: "beet(?!aine)|beta vulgaris",
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
    productPattern: "ashwagandha|withania|ksm-66",
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
    productPattern: "turmeric|curcumin",
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
    productPattern: "^vitamin d|cholecalciferol",
    category: "vitamin",
    source: "animal",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Bone health, immune function and muscle strength — deficiency is extremely common in athletes",
    mechanismOfAction: "Steroid hormone precursor — regulates calcium absorption, immune cell function and muscle fiber composition. Up to 77% of indoor athletes are deficient",
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
    productPattern: "vitamin k|menaquinone|mk-7",
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
    productPattern: "^iron\\b",
    category: "mineral",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Oxygen transport via hemoglobin — deficiency severely impairs VO2 max and endurance",
    optimalDose: "18-25mg elemental iron daily (only supplement if deficient — test ferritin first)",
    optimalTiming: ["empty-stomach", "with-food"],
    safetyNotes: "Do not supplement without confirmed deficiency. Iron overload is toxic. Take with Vitamin C to enhance absorption. Avoid with calcium, coffee or tea",
    commonSideEffects: ["constipation", "nausea", "GI upset (minimized with bisglycinate form)"],
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
    productPattern: "\\bepa\\b|\\bdha\\b|omega-?3|fish oil|krill",
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
    productPattern: "algal|algae oil|schizochytrium",
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
    primaryBenefit: "Prevents mold and bacterial growth — extends shelf life of liquid or gel products",
    safetyNotes: "Generally recognized as safe at food levels. When combined with Vitamin C can form benzene (a carcinogen) — relevant to products containing both",
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
    primaryBenefit: "Prevents yeast and mold — common in gels, chews and liquid supplements",
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
    primaryBenefit: "Thickening and stabilizing agent — creates gel texture",
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
    name: "Natural Flavors",
    aliases: ["natural flavoring", "natural flavor", "natural flavouring"],
    category: "flavouring",
    source: "unknown",
    flags: ["natural-flavours"],
    evidenceLevel: "insufficient",
    primaryBenefit: "Flavor enhancement without artificial chemicals",
    safetyNotes: "FDA definition of 'natural flavors' is broad — can include animal-derived compounds (making it non-vegan), MSG derivatives, and many other ingredients. A transparency concern when brands don't specify further",
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
    safetyNotes: "Generally recognized as safe at food levels. Some concerns about nanoparticle forms and their potential gut effects. Preferred to avoid in clean-label products",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
  },


  // ══ Added 2026-09-28 from the ingredients in Pello's products ═══════════════
  // Evidence levels match the verdicts shown on product pages (proven → strong,
  // likely → moderate). Doses are given only where research supports a range.

  // ── CARBOHYDRATES ─────────────────────────────────────────

  {
    id: "isomaltulose",
    name: "Isomaltulose",
    aliases: ["palatinose"],
    productPattern: "isomaltulose|palatinose",
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Slowly digested glucose–fructose sugar that gives a steadier, lower blood sugar rise than maltodextrin",
    mechanismOfAction: "A disaccharide of glucose and fructose with a bond that gut enzymes split slowly, so its carbohydrate enters the blood gradually",
    optimalTiming: ["pre-workout", "intra-workout"],
    safetyNotes: "Slow digestion means less is absorbed per hour than glucose-based fuels; large amounts can cause gut discomfort",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=isomaltulose+exercise+performance",
  },

  {
    id: "trehalose",
    name: "Trehalose",
    aliases: [],
    productPattern: "trehalose",
    category: "carbohydrate",
    source: "plant",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Glucose disaccharide absorbed more slowly than glucose; studied as a lower-glycaemic exercise fuel",
    mechanismOfAction: "Two glucose units split by the trehalase enzyme in the small intestine",
    optimalTiming: ["intra-workout"],
    safetyNotes: "People with low trehalase activity can get gut symptoms",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=trehalose+exercise+carbohydrate",
  },

  {
    id: "honey",
    name: "Honey",
    aliases: [],
    productPattern: "\\bhoney\\b(?!suckle)",
    category: "carbohydrate",
    source: "animal",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Natural glucose and fructose mix that fuels endurance exercise about as well as sports-drink sugars",
    mechanismOfAction: "Roughly equal glucose and fructose, so it uses both intestinal sugar transporters",
    optimalDose: "As part of 30–90g carbohydrate per hour, depending on session length",
    optimalTiming: ["intra-workout"],
    isVegan: false, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=honey+carbohydrate+endurance+performance",
  },

  // ── ELECTROLYTES & MINERALS ───────────────────────────────

  {
    id: "chloride",
    name: "Chloride",
    aliases: ["sodium chloride", "salt"],
    productPattern: "^chloride|^sodium chloride|^salt$|sea salt",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "The electrolyte paired with sodium in sweat and salt; lost alongside sodium during exercise",
    mechanismOfAction: "The main negative ion in the fluid outside cells, working with sodium to keep fluid balance",
    optimalTiming: ["intra-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sweat+sodium+chloride+losses+athletes",
  },

  {
    id: "calcium",
    name: "Calcium",
    aliases: [],
    productPattern: "^calcium\\b(?!.*(hmb|hydroxy|alpha|fructoborate|pyruvate))",
    category: "mineral",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Bone mineral; adequate intake matters for athletes at risk of low bone density, such as those with low energy availability",
    optimalDose: "About 1,000mg a day from food and supplements combined for most adults",
    optimalTiming: ["with-food"],
    safetyNotes: "Very high supplemental intakes add little and may raise kidney stone risk; calcium can reduce iron absorption when taken together",
    avoidWith: ["iron supplements (take separately)"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["calcium citrate (absorbed without food)", "calcium carbonate (with meals)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=calcium+supplementation+athletes+bone",
  },

  {
    id: "zinc",
    name: "Zinc",
    aliases: [],
    productPattern: "^zinc\\b(?!.*carnosine)",
    category: "mineral",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Supports immune function and tissue repair; some is lost in sweat",
    optimalDose: "About 8–11mg a day meets needs; stay under 40mg a day long term",
    optimalTiming: ["with-food"],
    safetyNotes: "Long-term high doses can cause copper deficiency",
    commonSideEffects: ["nausea on an empty stomach"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["zinc bisglycinate", "zinc picolinate", "zinc citrate"],
    inferiorForms: ["zinc oxide (less well absorbed)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=zinc+athletes+immune",
  },

  {
    id: "sodium-bicarbonate",
    name: "Sodium Bicarbonate",
    aliases: ["bicarb", "baking soda"],
    productPattern: "^(?!potassium).*bicarbonate|^bicarb",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Buffers acid build-up, improving hard efforts of roughly 1–10 minutes",
    mechanismOfAction: "Raises blood bicarbonate, helping move hydrogen ions out of working muscle",
    optimalDose: "0.2–0.3g per kg of body weight, 60–180 minutes before exercise",
    optimalTiming: ["pre-workout"],
    safetyNotes: "Stomach upset is common; split doses, a carbohydrate meal or encapsulated/hydrogel forms reduce it. High sodium content",
    commonSideEffects: ["nausea", "diarrhea", "bloating"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+bicarbonate+supplementation+exercise+performance",
  },

  {
    id: "sodium-citrate",
    name: "Sodium Citrate",
    aliases: ["trisodium citrate"],
    productPattern: "sodium citrate|trisodium citrate",
    category: "electrolyte",
    source: "mineral-derived",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "A sodium source in hydration drinks; in large doses it also buffers acid like bicarbonate",
    optimalTiming: ["intra-workout"],
    safetyNotes: "Buffering doses are much larger than the amounts in drinks and can cause stomach upset",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sodium+citrate+exercise+performance",
  },

  // ── AMINO ACIDS & PROTEIN ─────────────────────────────────

  {
    id: "leucine",
    name: "Leucine",
    aliases: ["L-leucine"],
    productPattern: "^(instantized )?l?-?leucine",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "The amino acid that most strongly switches on muscle protein building",
    mechanismOfAction: "Activates the mTOR pathway that starts muscle protein synthesis; the other essential amino acids are still needed to build muscle",
    optimalDose: "About 2–3g per meal, usually from 20–40g of quality protein",
    optimalTiming: ["post-workout", "with-food"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=leucine+muscle+protein+synthesis",
  },

  {
    id: "essential-amino-acids",
    name: "Essential Amino Acids (EAAs)",
    aliases: ["EAAs", "EAA"],
    productPattern: "\\beaas?\\b|essential amino",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "The nine amino acids the body can't make; together they drive muscle repair",
    mechanismOfAction: "Provide every building block for muscle protein synthesis, unlike BCAAs alone",
    optimalDose: "About 10–15g, including 2–3g leucine",
    optimalTiming: ["post-workout"],
    safetyNotes: "A full protein serving provides the same amino acids",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=essential+amino+acids+muscle+protein+synthesis",
  },

  {
    id: "l-citrulline",
    name: "L-Citrulline",
    aliases: ["citrulline", "citrulline malate"],
    productPattern: "citrul(?!lus)",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Raises nitric oxide and may modestly improve high-intensity and resistance-exercise performance",
    mechanismOfAction: "Converted to arginine in the kidneys, raising blood arginine more reliably than arginine itself",
    optimalDose: "3–6g L-citrulline or 6–8g citrulline malate, about 60 minutes before exercise",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["L-citrulline", "citrulline malate 2:1"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=citrulline+supplementation+exercise+performance+meta-analysis",
  },

  {
    id: "l-arginine",
    name: "L-Arginine",
    aliases: ["arginine"],
    productPattern: "arginine(?!.*silicate)",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Nitric oxide precursor, but taken by mouth it raises nitric oxide less reliably than citrulline or dietary nitrate",
    mechanismOfAction: "Much of an oral dose is broken down in the gut and liver before reaching the blood",
    optimalTiming: ["pre-workout"],
    commonSideEffects: ["gut discomfort at higher doses"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=L-arginine+supplementation+performance",
  },

  {
    id: "taurine",
    name: "Taurine",
    aliases: ["L-taurine"],
    productPattern: "^(l-)?taurine",
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "May modestly improve endurance performance and reduce exercise-related oxidative stress; results are mixed",
    optimalDose: "Studies commonly use 1–6g, taken 1–3 hours before exercise",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=taurine+endurance+exercise+performance",
  },

  {
    id: "glycine",
    name: "Glycine",
    aliases: ["L-glycine"],
    productPattern: "^(l-)?glycine\\b(?!.*(rebaudioside|glyvia))",
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Small trials show better subjective sleep quality with 3g before bed",
    mechanismOfAction: "May lower core body temperature, which helps the onset of sleep",
    optimalDose: "3g about an hour before bed",
    optimalTiming: ["before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=glycine+sleep+quality",
  },

  {
    id: "l-theanine",
    name: "L-Theanine",
    aliases: ["theanine", "Suntheanine"],
    productPattern: "theanine",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Tea amino acid that promotes calm without sedation; often paired with caffeine to smooth its effects",
    optimalDose: "100–200mg",
    optimalTiming: ["pre-workout", "before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=l-theanine+caffeine+cognition+relaxation",
  },

  {
    id: "l-tyrosine",
    name: "L-Tyrosine",
    aliases: ["tyrosine", "N-acetyl L-tyrosine"],
    productPattern: "tyrosine",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "May help maintain focus and working memory under stress or sleep loss; effects on endurance are inconsistent",
    mechanismOfAction: "Precursor to dopamine and noradrenaline",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    inferiorForms: ["N-acetyl L-tyrosine (converts to tyrosine less efficiently)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=tyrosine+cognition+stress",
  },

  {
    id: "hmb",
    name: "HMB (β-hydroxy β-methylbutyrate)",
    aliases: ["HMB", "calcium HMB", "myHMB"],
    productPattern: "\\bhmb\\b|hydroxy.?.?methyl ?butyrate",
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Leucine breakdown product marketed to reduce muscle breakdown; benefits show mainly in untrained or older people",
    optimalDose: "Studies use 3g a day",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=HMB+supplementation+trained+athletes",
  },

  {
    id: "l-carnitine",
    name: "L-Carnitine",
    aliases: ["carnitine", "acetyl-L-carnitine", "L-carnitine L-tartrate", "Carnipure"],
    productPattern: "carnitine|carnipure",
    category: "amino-acid",
    source: "synthetic",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Moves fats into mitochondria, but supplements haven't consistently improved endurance performance",
    mechanismOfAction: "Muscle carnitine only rises with weeks of intake alongside carbohydrate",
    optimalTiming: ["with-food"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=carnitine+supplementation+exercise+performance",
  },

  {
    id: "n-acetyl-cysteine",
    name: "N-Acetyl Cysteine (NAC)",
    aliases: ["NAC", "N-acetyl-L-cysteine"],
    productPattern: "acetyl.?l?-?cysteine|\\bnac\\b",
    category: "antioxidant",
    source: "synthetic",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Precursor to the antioxidant glutathione; evidence for sport benefits is limited",
    safetyNotes: "The high doses used in performance studies commonly cause stomach upset; regular antioxidant use may blunt some training adaptations",
    commonSideEffects: ["nausea", "gut discomfort"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=N-acetylcysteine+exercise+performance",
  },

  {
    id: "betaine",
    name: "Betaine (Trimethylglycine)",
    aliases: ["betaine anhydrous", "trimethylglycine", "TMG", "BetaPure"],
    productPattern: "betaine anhydrous|trimethylglycine|betapure|^betaine$",
    category: "amino-acid",
    source: "plant",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Studied for strength and power output; results are mixed",
    optimalDose: "Studies commonly use about 2.5g a day",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    inferiorForms: ["betaine HCl (a different compound, used as a digestive acid)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=betaine+supplementation+strength+power",
  },

  {
    id: "whey-protein",
    name: "Whey Protein",
    aliases: ["whey isolate", "whey concentrate"],
    productPattern: "^(?!calcium).*whey",
    category: "protein",
    source: "animal",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Fast-digesting, leucine-rich complete protein that supports muscle repair after training",
    optimalDose: "About 0.25g per kg of body weight (roughly 20–40g) per serving",
    optimalTiming: ["post-workout"],
    safetyNotes: "Contains milk; isolates are lower in lactose than concentrates",
    isVegan: false, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["whey isolate (lower lactose)"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=whey+protein+muscle+protein+synthesis+athletes",
  },

  {
    id: "collagen-peptides",
    name: "Collagen Peptides",
    aliases: ["hydrolysed collagen", "collagen hydrolysate", "Fortigel", "Tendoforte", "Verisol"],
    productPattern: "collagen(?!.*(undenatured|type ii|uc-ii))",
    category: "protein",
    source: "animal",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Studied for joint comfort and tendon support; several trials report modest reductions in activity-related joint pain",
    mechanismOfAction: "Supplies glycine, proline and hydroxyproline used to build connective tissue",
    optimalDose: "5–15g a day; tendon studies take it with vitamin C 30–60 minutes before loading exercise",
    optimalTiming: ["pre-workout", "daily"],
    safetyNotes: "An incomplete protein, so it doesn't replace other protein for muscle building",
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=collagen+peptides+joint+pain+athletes",
  },

  // ── PERFORMANCE COMPOUNDS ─────────────────────────────────

  {
    id: "theacrine",
    name: "Theacrine",
    aliases: ["TeaCrine"],
    productPattern: "theacrine|teacrine",
    category: "stimulant",
    source: "synthetic",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Caffeine-like compound studied for energy and focus; little evidence for exercise performance",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=theacrine",
  },

  {
    id: "alpha-gpc",
    name: "Alpha-GPC",
    aliases: ["L-alpha glycerylphosphorylcholine", "AlphaSize"],
    productPattern: "alpha.?gpc|glyceryl ?phosphoryl ?chol|glycerol phosphoryl",
    category: "other",
    source: "synthetic",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "A choline source studied for focus and power output; results are mixed and trials are small",
    optimalTiming: ["pre-workout"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=alpha-GPC+supplementation+performance",
  },

  {
    id: "rhodiola",
    name: "Rhodiola Rosea",
    aliases: ["rhodiola", "golden root"],
    productPattern: "rhodiola",
    category: "adaptogen",
    source: "plant",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Adaptogenic herb studied for fatigue and stress; results for exercise and mental performance are mixed",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["extracts standardized to rosavins and salidroside"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=rhodiola+rosea+fatigue+exercise",
  },

  {
    id: "cordyceps",
    name: "Cordyceps",
    aliases: ["Cordyceps militaris", "Cordyceps sinensis", "CS-4"],
    productPattern: "cordyceps",
    category: "botanical",
    source: "fermentation",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Medicinal mushroom marketed for energy and endurance; human evidence is limited and mixed",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=cordyceps+exercise+performance",
  },

  {
    id: "nz-blackcurrant",
    name: "New Zealand Blackcurrant",
    aliases: ["blackcurrant extract", "CurraNZ", "Ribes nigrum"],
    productPattern: "blackcurrant|ribes nigrum|curranz",
    category: "antioxidant",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Several small trials show slight improvements in endurance performance and fat use after about 7 days",
    mechanismOfAction: "Anthocyanins may improve blood flow to working muscle",
    optimalDose: "Trials use about 300–600mg extract (roughly 105–210mg anthocyanins) a day for 7 days",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=New+Zealand+blackcurrant+exercise+performance",
  },

  {
    id: "exogenous-ketones",
    name: "Exogenous Ketones",
    aliases: ["ketone ester", "ketone salts", "BHB", "beta-hydroxybutyrate", "R-1,3-butanediol"],
    productPattern: "ketone|butanediol|\\bbhb\\b|hydroxybutyrate(?!.*(monohydrate|methyl))",
    category: "other",
    source: "synthetic",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Raise blood ketones, but most studies show no improvement in endurance performance and some show worse",
    optimalTiming: ["pre-workout"],
    safetyNotes: "Gut symptoms are common; ketone salts add a lot of sodium or other minerals",
    commonSideEffects: ["nausea", "gut discomfort"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=exogenous+ketone+supplementation+performance",
  },

  {
    id: "coq10",
    name: "Coenzyme Q10",
    aliases: ["CoQ10", "ubiquinol", "ubiquinone"],
    productPattern: "coq10|coenzyme q|ubiquin",
    category: "antioxidant",
    source: "fermentation",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Part of the cell's energy machinery; supplements haven't consistently improved exercise performance in healthy people",
    optimalTiming: ["with-food"],
    avoidWith: ["warfarin (may reduce its effect)"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=coenzyme+Q10+exercise+performance",
  },

  // ── RECOVERY & JOINTS ─────────────────────────────────────

  {
    id: "ginger",
    name: "Ginger",
    aliases: ["Zingiber officinale", "gingerols"],
    productPattern: "ginger|zingiber",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "May ease nausea and modestly reduce muscle soreness",
    optimalDose: "Soreness studies use about 2g a day for several days",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=ginger+muscle+soreness",
  },

  {
    id: "glucosamine",
    name: "Glucosamine",
    aliases: ["glucosamine sulfate", "glucosamine HCl"],
    productPattern: "glucosamine(?!.*(salt|methyltetrahydro|folate))",
    category: "other",
    source: "marine",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Studied for joint health in osteoarthritis; overall evidence is mixed",
    optimalDose: "Studies use 1,500mg a day",
    optimalTiming: ["daily"],
    safetyNotes: "Usually made from shellfish; vegan forms exist",
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=glucosamine+joint+meta-analysis",
  },

  {
    id: "chondroitin",
    name: "Chondroitin",
    aliases: ["chondroitin sulfate"],
    productPattern: "chondroitin",
    category: "other",
    source: "animal",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Studied for joint health, usually with glucosamine; overall evidence is mixed",
    optimalDose: "Studies use 800–1,200mg a day",
    optimalTiming: ["daily"],
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=chondroitin+osteoarthritis+meta-analysis",
  },

  {
    id: "hyaluronic-acid",
    name: "Hyaluronic Acid",
    aliases: ["hyaluronan", "Mobilee"],
    productPattern: "hyaluron|mobilee",
    category: "other",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Part of joint fluid; small studies suggest oral supplements may ease joint discomfort",
    optimalTiming: ["daily"],
    safetyNotes: "Chicken-comb forms (such as Mobilee) aren't vegan",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=oral+hyaluronic+acid+joint",
  },

  {
    id: "uc-ii-collagen",
    name: "Undenatured Type II Collagen (UC-II)",
    aliases: ["UC-II", "undenatured collagen"],
    productPattern: "uc-?ii|undenatured|type ii collagen|standardized cartilage",
    category: "other",
    source: "animal",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Small doses studied for joint comfort; a few trials report modest benefits, including in active people",
    optimalDose: "40mg a day",
    optimalTiming: ["daily"],
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=undenatured+type+II+collagen+joint",
  },

  {
    id: "boswellia",
    name: "Boswellia",
    aliases: ["Indian frankincense", "Boswellia serrata"],
    productPattern: "boswelli|frankincense",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Modest evidence for easing joint pain in osteoarthritis; evidence in athletes is limited",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    preferredForms: ["extracts standardized to boswellic acids"],
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=boswellia+osteoarthritis",
  },

  {
    id: "msm",
    name: "MSM (Methylsulfonylmethane)",
    aliases: ["MSM", "OptiMSM"],
    productPattern: "\\bmsm\\b|methylsulfonylmethane",
    category: "other",
    source: "synthetic",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Sulfur compound studied for joint pain and exercise soreness; small trials show modest benefits",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=methylsulfonylmethane+exercise",
  },

  {
    id: "colostrum",
    name: "Bovine Colostrum",
    aliases: ["colostrum"],
    productPattern: "colostrum",
    category: "other",
    source: "animal",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Early milk rich in antibodies; small studies suggest it may support the gut barrier during hard exercise, but evidence is mixed",
    optimalTiming: ["daily"],
    safetyNotes: "A dairy product",
    isVegan: false, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=bovine+colostrum+exercise+gut",
  },

  {
    id: "astaxanthin",
    name: "Astaxanthin",
    aliases: ["AstaReal", "Haematococcus pluvialis"],
    productPattern: "astaxanthin",
    category: "antioxidant",
    source: "algae",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Antioxidant pigment from algae; studies on performance and recovery show small or inconsistent effects",
    optimalTiming: ["with-food"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=astaxanthin+exercise",
  },

  {
    id: "quercetin",
    name: "Quercetin",
    aliases: ["isoquercitrin"],
    productPattern: "quercetin|quercitrin",
    category: "antioxidant",
    source: "plant",
    flags: [],
    evidenceLevel: "disputed",
    primaryBenefit: "Plant flavonoid; performance studies show small or inconsistent effects",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=quercetin+exercise+performance+meta-analysis",
  },

  // ── GUT HEALTH ────────────────────────────────────────────

  {
    id: "lactobacillus",
    name: "Lactobacillus Probiotics",
    aliases: ["Lactobacillus", "Lactiplantibacillus", "Lacticaseibacillus"],
    productPattern: "lactobacillus|lacticaseibacillus|lactiplantibacillus|ligilactobacillus",
    category: "probiotic",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Probiotic strains that can support gut health, though benefits depend on the specific strain and dose",
    optimalTiming: ["daily"],
    safetyNotes: "Effects are strain-specific: a benefit shown for one strain doesn't carry over to others. Heat-inactivated forms are postbiotics, not probiotics",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=probiotic+athletes+gastrointestinal",
  },

  {
    id: "bifidobacterium",
    name: "Bifidobacterium Probiotics",
    aliases: ["Bifidobacterium", "B. lactis", "B. longum"],
    productPattern: "bifidobacterium",
    category: "probiotic",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Probiotic strains that can support gut health, though benefits depend on the specific strain and dose",
    optimalTiming: ["daily"],
    safetyNotes: "Effects are strain-specific",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=bifidobacterium+probiotic+athletes",
  },

  {
    id: "bacillus-spores",
    name: "Bacillus (Spore) Probiotics",
    aliases: ["Bacillus coagulans", "Bacillus subtilis", "Bacillus clausii", "spore probiotics"],
    productPattern: "bacill?us (coagulans|subtilis|clausii)|lactospore",
    category: "probiotic",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Spore-forming probiotics that survive stomach acid and storage well; benefits are strain-specific",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=bacillus+coagulans+probiotic+exercise",
  },

  {
    id: "saccharomyces-boulardii",
    name: "Saccharomyces boulardii",
    aliases: ["S. boulardii"],
    productPattern: "saccharomyces",
    category: "probiotic",
    source: "fermentation",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Probiotic yeast with good evidence for preventing antibiotic-associated and travelers' diarrhea",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=saccharomyces+boulardii+diarrhea+meta-analysis",
  },

  {
    id: "prebiotic-fibre",
    name: "Prebiotic Fiber",
    aliases: ["inulin", "FOS", "fructooligosaccharides", "partially hydrolysed guar gum", "XOS"],
    productPattern: "inulin|\\bfos\\b|fructooligo|xylooligo|prebiotic|partially hydrolyzed guar",
    category: "prebiotic",
    source: "plant",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Fiber that feeds beneficial gut bacteria",
    optimalDose: "Build up gradually to about 5–10g a day",
    optimalTiming: ["daily"],
    safetyNotes: "Can cause gas and bloating; avoid large amounts just before exercise",
    commonSideEffects: ["gas", "bloating"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=prebiotic+fiber+gut+microbiota",
  },

  {
    id: "immunoglobulins",
    name: "Serum-Derived Bovine Immunoglobulins",
    aliases: ["SBI", "ImmunoLin", "IgG"],
    productPattern: "^(?!.*colostrum).*(immunoglobulin|\\bigg\\b|immunolin)",
    category: "other",
    source: "animal",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Antibody concentrate that binds microbes and toxins in the gut; small studies suggest support for the gut barrier under exercise stress",
    optimalTiming: ["daily"],
    safetyNotes: "Made from cattle blood",
    isVegan: false, isVegetarian: false, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=serum+bovine+immunoglobulin+gut",
  },

  {
    id: "zinc-carnosine",
    name: "Zinc Carnosine",
    aliases: ["PepZin GI", "zinc L-carnosine"],
    productPattern: "zinc.?l?-?carnosine|pepzin",
    category: "mineral",
    source: "synthetic",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Studied for protecting the gut lining; one small study found less exercise-induced gut permeability",
    optimalTiming: ["daily"],
    safetyNotes: "Counts towards total zinc intake",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=zinc+carnosine+gut+permeability+exercise",
  },

  // ── SLEEP & STRESS ────────────────────────────────────────

  {
    id: "melatonin",
    name: "Melatonin",
    aliases: [],
    productPattern: "melatonin",
    category: "other",
    source: "synthetic",
    flags: [],
    evidenceLevel: "strong",
    primaryBenefit: "Reliably helps people fall asleep faster, particularly with jet lag or shifted schedules",
    optimalDose: "0.5–3mg; low doses are usually as effective as higher ones",
    optimalTiming: ["before-bed"],
    safetyNotes: "Sold as a medicine in some countries; can cause morning grogginess at higher doses",
    commonSideEffects: ["drowsiness", "headache"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+sleep+onset+meta-analysis",
  },

  {
    id: "gaba",
    name: "GABA",
    aliases: ["gamma-aminobutyric acid", "PharmaGABA"],
    productPattern: "\\bgaba\\b|gamma.?amino",
    category: "amino-acid",
    source: "fermentation",
    flags: [],
    evidenceLevel: "insufficient",
    primaryBenefit: "The brain's main calming messenger, but it's unclear how much taken by mouth reaches the brain",
    optimalTiming: ["before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=oral+GABA+sleep",
  },

  {
    id: "5-htp",
    name: "5-HTP",
    aliases: ["5-hydroxytryptophan", "Griffonia simplicifolia"],
    productPattern: "5-htp|hydroxytryptophan",
    category: "amino-acid",
    source: "plant",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Precursor to serotonin and melatonin; small studies suggest sleep and mood effects",
    optimalTiming: ["before-bed"],
    safetyNotes: "Don't combine with antidepressants or other serotonergic drugs",
    avoidWith: ["SSRIs and other antidepressants"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=5-HTP+sleep",
  },

  {
    id: "valerian",
    name: "Valerian Root",
    aliases: ["valerian", "Valeriana officinalis"],
    productPattern: "valerian",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "traditional",
    primaryBenefit: "Traditional sleep herb; studies have found mixed and mostly small effects",
    optimalTiming: ["before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=valerian+sleep+meta-analysis",
  },

  {
    id: "chamomile",
    name: "Chamomile",
    aliases: ["Matricaria chamomilla"],
    productPattern: "chamomile|matricaria",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "traditional",
    primaryBenefit: "Traditional calming herb; small trials show modest effects on sleep quality",
    optimalTiming: ["before-bed"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=chamomile+sleep+quality",
  },

  {
    id: "reishi",
    name: "Reishi Mushroom",
    aliases: ["reishi", "Ganoderma lucidum"],
    productPattern: "reishi|ganoderma",
    category: "botanical",
    source: "fermentation",
    flags: [],
    evidenceLevel: "traditional",
    primaryBenefit: "Medicinal mushroom traditionally used for calm and sleep; human evidence is limited",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=reishi+ganoderma+sleep",
  },

  // ── IMMUNE ────────────────────────────────────────────────

  {
    id: "vitamin-c",
    name: "Vitamin C",
    aliases: ["ascorbic acid", "sodium ascorbate"],
    productPattern: "^vitamin c\\b|^ascorbic acid",
    category: "vitamin",
    source: "synthetic",
    flags: [],
    evidenceLevel: "moderate",
    primaryBenefit: "Supports immune function; regular intake may reduce colds in people doing heavy physical training",
    optimalDose: "About 200–1,000mg a day during heavy training blocks",
    optimalTiming: ["daily"],
    safetyNotes: "Very high doses taken all the time may blunt some training adaptations; over 2g a day can cause gut upset",
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+C+common+cold+physical+stress",
  },

  {
    id: "elderberry",
    name: "Elderberry",
    aliases: ["black elderberry", "Sambucus nigra"],
    productPattern: "elderberry|sambucus",
    category: "botanical",
    source: "plant",
    flags: [],
    evidenceLevel: "emerging",
    primaryBenefit: "Studied for colds and flu; a few small trials suggest shorter or milder illness",
    optimalTiming: ["daily"],
    isVegan: true, isVegetarian: true, isGlutenFree: true,
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=elderberry+cold+influenza",
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