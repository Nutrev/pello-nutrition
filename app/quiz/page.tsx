"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

// ── TYPES ─────────────────────────────────────────────────────

type PlanMode = "event" | "outcome";
type EventType = "road-cycling" | "gravel" | "triathlon" | "running" | "trail-running" | "gym" | "training-day" | "recovery";
type OutcomeType = "finish-first-marathon" | "finish-first-triathlon" | "improve-cycling-endurance" | "improve-recovery" | "build-muscle-endurance" | "lose-weight-perform" | "race-faster" | "gut-health";
type Intensity = "easy" | "moderate" | "hard" | "race";
type CaffeinePreference = "none" | "moderate" | "high";
type DietaryRestriction = "vegan" | "gluten-free" | "dairy-free";
type FormatPreference = "Energy Gel" | "Energy Chew" | "Energy Bar" | "Carbohydrate Mix" | "Hydration";
type Retailer = "REI" | "Amazon" | "The Feed" | "Running Warehouse";

interface PlannerInputs {
  mode: PlanMode;
  eventType: EventType | null;
  outcomeType: OutcomeType | null;
  durationHours: number;
  intensity: Intensity;
  caffeinePreference: CaffeinePreference;
  budget: number;
  dietary: DietaryRestriction[];
  formats: FormatPreference[];
  retailers: Retailer[];
  weightKg: number;
}

interface ParsedPlan {
  preEvent: string[];
  duringEvent: string[];
  postEvent: string[];
  totals: string[];
  keyNotes: string[];
}

interface PhaseProduct {
  product: typeof PRODUCTS[0];
  phase: "pre" | "during" | "post" | "daily";
  quantity: number;
  totalCost: number;
  reason: string;
}

// ── CONSTANTS ─────────────────────────────────────────────────

const EVENT_TYPES: { id: EventType; label: string; desc: string }[] = [
  { id: "road-cycling", label: "Road cycling", desc: "Sportive, gran fondo, road race" },
  { id: "gravel", label: "Gravel / MTB", desc: "Gravel race, mountain bike event" },
  { id: "triathlon", label: "Triathlon", desc: "Sprint, Olympic, 70.3, Ironman" },
  { id: "running", label: "Running", desc: "5K, 10K, half marathon, marathon" },
  { id: "trail-running", label: "Trail running", desc: "Trail race, ultra marathon" },
  { id: "gym", label: "Gym / Strength", desc: "Lifting, CrossFit, resistance training" },
  { id: "training-day", label: "Training day", desc: "General training session" },
  { id: "recovery", label: "Recovery day", desc: "Post-race or hard session recovery" },
];

const OUTCOME_TYPES: { id: OutcomeType; label: string; desc: string; timeframe: string }[] = [
  { id: "finish-first-marathon", label: "Finish my first marathon", desc: "Complete 26.2 miles feeling strong", timeframe: "Race-day + training nutrition" },
  { id: "finish-first-triathlon", label: "Finish my first triathlon", desc: "Swim, bike, run nutrition strategy", timeframe: "Multi-sport fuelling" },
  { id: "improve-cycling-endurance", label: "Improve cycling endurance", desc: "Go longer and stronger on the bike", timeframe: "Training + event nutrition" },
  { id: "improve-recovery", label: "Improve my recovery", desc: "Bounce back faster between sessions", timeframe: "Daily recovery protocol" },
  { id: "build-muscle-endurance", label: "Build muscle while training", desc: "Strength + endurance combined goals", timeframe: "Hybrid nutrition strategy" },
  { id: "lose-weight-perform", label: "Lose weight and perform", desc: "Body composition without losing power", timeframe: "Periodised nutrition" },
  { id: "race-faster", label: "Race faster", desc: "Optimise nutrition for peak performance", timeframe: "Performance nutrition" },
  { id: "gut-health", label: "Fix my gut health", desc: "Reduce GI issues during training", timeframe: "GI protocol" },
];

const DURATION_OPTIONS = [
  { value: 0.5, label: "30 min" }, { value: 0.75, label: "45 min" },
  { value: 1, label: "1 hr" }, { value: 1.5, label: "1.5 hrs" },
  { value: 2, label: "2 hrs" }, { value: 2.5, label: "2.5 hrs" },
  { value: 3, label: "3 hrs" }, { value: 4, label: "4 hrs" },
  { value: 5, label: "5 hrs" }, { value: 6, label: "6 hrs" },
  { value: 8, label: "8 hrs" }, { value: 10, label: "10+ hrs" },
];

const INTENSITY_OPTIONS = [
  { id: "easy" as Intensity, label: "Easy / recovery", desc: "Conversational pace, Z1-Z2", carbsPerHr: 30 },
  { id: "moderate" as Intensity, label: "Moderate", desc: "Steady effort, Z2-Z3", carbsPerHr: 50 },
  { id: "hard" as Intensity, label: "Hard", desc: "Threshold / tempo, Z3-Z4", carbsPerHr: 70 },
  { id: "race" as Intensity, label: "Race pace", desc: "Maximum effort, Z4-Z5", carbsPerHr: 90 },
];

const FORMAT_OPTIONS: { id: FormatPreference; label: string; desc: string }[] = [
  { id: "Energy Gel", label: "Gels", desc: "Fast-acting, portable" },
  { id: "Energy Chew", label: "Chews", desc: "Chewable, slower release" },
  { id: "Energy Bar", label: "Bars", desc: "Solid food, lower intensity" },
  { id: "Carbohydrate Mix", label: "Drink mix", desc: "Carbs + hydration combined" },
  { id: "Hydration", label: "Electrolytes", desc: "Salt + hydration" },
];

const RETAILER_OPTIONS: Retailer[] = ["REI", "Amazon", "The Feed", "Running Warehouse"];

// ── OUTCOME → CATEGORY PRIORITY MAP ──────────────────────────

const OUTCOME_CATEGORY_PRIORITY: Record<OutcomeType, string[]> = {
  "finish-first-marathon": ["Energy Gel", "Energy Chew", "Hydration", "Carbohydrate Mix", "Energy Bar"],
  "finish-first-triathlon": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Energy Chew", "Protein"],
  "improve-cycling-endurance": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Energy Chew", "Creatine"],
  "improve-recovery": ["Protein", "Omega-3", "Supplement", "Mineral", "Probiotic"],
  "build-muscle-endurance": ["Protein", "Creatine", "Energy Gel", "Supplement", "Mineral"],
  "lose-weight-perform": ["Protein", "Hydration", "Energy Gel", "Supplement", "Omega-3"],
  "race-faster": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Creatine", "Supplement"],
  "gut-health": ["Probiotic", "Supplement", "Hydration", "Energy Gel", "Omega-3"],
};

// ── PHASE → CATEGORY MAP ──────────────────────────────────────

const PHASE_CATEGORIES = {
  pre: ["Energy Bar", "Carbohydrate Mix", "Hydration"],
  during: ["Energy Gel", "Energy Chew", "Carbohydrate Mix", "Hydration"],
  post: ["Protein", "Supplement", "Omega-3", "Mineral", "Probiotic"],
};

// ── HELPERS ───────────────────────────────────────────────────

function carbsNeeded(durationHours: number, intensity: Intensity): number {
  const rates: Record<Intensity, number> = { easy: 30, moderate: 50, hard: 70, race: 90 };
  if (durationHours < 1) return Math.round(rates[intensity] * durationHours * 0.5);
  return Math.round(rates[intensity] * durationHours);
}

function sodiumNeeded(durationHours: number, intensity: Intensity, weightKg: number): number {
  const sweat: Record<Intensity, number> = { easy: 0.5, moderate: 0.8, hard: 1.1, race: 1.4 };
  return Math.round(sweat[intensity] * weightKg * 500 * durationHours);
}

function getServingsPerContainer(category: string): number {
  const map: Record<string, number> = {
    "Energy Gel": 12, "Energy Chew": 12, "Energy Bar": 12,
    "Carbohydrate Mix": 30, "Hydration": 30, "Protein": 28,
    "Creatine": 90, "Supplement": 30, "Probiotic": 30,
    "Omega-3": 30, "Vitamin": 90, "Mineral": 60,
  };
  return map[category] ?? 30;
}

function getCarbsPerServing(p: typeof PRODUCTS[0]): number {
  for (const ing of p.ingredients ?? []) {
    const dose = ing.dose?.toLowerCase() ?? "";
    const match = dose.match(/(\d+)g?\s*carb/);
    if (match) return parseInt(match[1]);
  }
  return 25; // default estimate
}

// ── SMART RECOMMENDATION ENGINE ───────────────────────────────

function buildPhaseRecommendations(inputs: PlannerInputs, carbTarget: number): {
  pre: PhaseProduct[];
  during: PhaseProduct[];
  post: PhaseProduct[];
} {
  const isEvent = inputs.mode === "event";
  const hasCaffeine = inputs.caffeinePreference !== "none";
  const needsFuelling = inputs.durationHours >= 1;

  // Filter base pool
  const pool = PRODUCTS.filter(p => {
    if (inputs.dietary.includes("vegan")) {
      const hasAnimal = p.ingredients?.some((i: any) =>
        i.name.toLowerCase().includes("whey") ||
        i.name.toLowerCase().includes("casein") ||
        i.name.toLowerCase().includes("egg")
      );
      if (hasAnimal) return false;
    }
    return true;
  });

  const bestByCategory = (categories: string[], maxPerCat = 2, preferCaffeine = false): typeof PRODUCTS => {
    const results: typeof PRODUCTS = [];
    categories.forEach(cat => {
      const inCat = pool
        .filter(p => p.category === cat)
        .filter(p => {
          if (inputs.caffeinePreference === "none") {
            return !p.ingredients?.some((i: any) =>
              i.name.toLowerCase().includes("caffeine") ||
              i.name.toLowerCase().includes("green tea")
            );
          }
          return true;
        })
        .sort((a, b) => {
          // Prefer caffeinated products during event if caffeine preference is high
          if (preferCaffeine && inputs.caffeinePreference === "high") {
            const aHasCaf = a.ingredients?.some((i: any) => i.name.toLowerCase().includes("caffeine")) ?? false;
            const bHasCaf = b.ingredients?.some((i: any) => i.name.toLowerCase().includes("caffeine")) ?? false;
            if (aHasCaf && !bHasCaf) return -1;
            if (!aHasCaf && bHasCaf) return 1;
          }
          return b.rating - a.rating;
        })
        .slice(0, maxPerCat);
      results.push(...inCat);
    });
    return results;
  };

  if (isEvent) {
    // PRE — bar + hydration
    const preProducts = bestByCategory(PHASE_CATEGORIES.pre, 1);

    // DURING — gels/chews + hydration based on duration and carb target
    const duringCategories = inputs.formats.length > 0
      ? inputs.formats.filter(f => PHASE_CATEGORIES.during.includes(f))
      : PHASE_CATEGORIES.during;

    const duringProducts = bestByCategory(
      duringCategories.length > 0 ? duringCategories : PHASE_CATEGORIES.during,
      2,
      true // prefer caffeinated during event
    );

    // Calculate quantities
    const prePhase: PhaseProduct[] = preProducts.slice(0, 1).map(p => ({
      product: p,
      phase: "pre" as const,
      quantity: 1,
      totalCost: parseFloat((p.price / getServingsPerContainer(p.category)).toFixed(2)),
      reason: `Slow-release carbs 2-3 hours before — provides sustained energy without GI distress`,
    }));

    const duringPhase: PhaseProduct[] = duringProducts.slice(0, 3).map(p => {
      const carbsPerServing = getCarbsPerServing(p);
      const carbsPerHr = INTENSITY_OPTIONS.find(i => i.id === inputs.intensity)?.carbsPerHr ?? 50;
      const servingsNeeded = p.category === "Energy Gel" || p.category === "Energy Chew"
        ? Math.max(1, Math.ceil(carbTarget / carbsPerServing))
        : Math.ceil(inputs.durationHours);
      const pricePerServing = p.price / getServingsPerContainer(p.category);
      const totalCost = parseFloat((pricePerServing * servingsNeeded).toFixed(2));

      const hasCaf = p.ingredients?.some((i: any) => i.name.toLowerCase().includes("caffeine")) ?? false;
      const reason = p.category === "Energy Gel"
        ? `x${servingsNeeded} gels — 1 every ${Math.round(inputs.durationHours * 60 / servingsNeeded)} min for ${carbsPerServing * servingsNeeded}g total carbs`
        : p.category === "Hydration"
        ? `Electrolyte replacement — ${Math.ceil(inputs.durationHours)} servings for sodium and fluid balance`
        : `Carb + hydration combined — ${Math.ceil(inputs.durationHours)} servings`;

      return { product: p, phase: "during" as const, quantity: servingsNeeded, totalCost, reason };
    });

    // POST — protein + recovery
    const postProducts = bestByCategory(PHASE_CATEGORIES.post, 1);
    const postPhase: PhaseProduct[] = postProducts.slice(0, 2).map(p => ({
      product: p,
      phase: "post" as const,
      quantity: 1,
      totalCost: parseFloat((p.price / getServingsPerContainer(p.category)).toFixed(2)),
      reason: p.category === "Protein"
        ? `30-min recovery window — protein synthesis peaks immediately post-event`
        : `Recovery support — reduce inflammation and restore balance`,
    }));

    return { pre: prePhase, during: duringPhase, post: postPhase };

  } else {
    // OUTCOME MODE
    const outcomeType = inputs.outcomeType!;
    const priorityCategories = OUTCOME_CATEGORY_PRIORITY[outcomeType] ?? [];

    const allProducts = bestByCategory(priorityCategories, 2);

    // Split into phases based on category
    const pre = allProducts
      .filter(p => ["Energy Bar", "Carbohydrate Mix", "Hydration"].includes(p.category))
      .slice(0, 1)
      .map(p => ({
        product: p,
        phase: "pre" as const,
        quantity: 1,
        totalCost: parseFloat((p.price / getServingsPerContainer(p.category)).toFixed(2)),
        reason: "Daily preparation and pre-training nutrition",
      }));

    const during = allProducts
      .filter(p => ["Energy Gel", "Energy Chew", "Carbohydrate Mix"].includes(p.category))
      .slice(0, 2)
      .map(p => ({
        product: p,
        phase: "during" as const,
        quantity: 1,
        totalCost: parseFloat((p.price / getServingsPerContainer(p.category)).toFixed(2)),
        reason: "Intra-workout fuelling to support your goal",
      }));

    const post = allProducts
      .filter(p => ["Protein", "Creatine", "Omega-3", "Supplement", "Mineral", "Probiotic"].includes(p.category))
      .slice(0, 3)
      .map(p => ({
        product: p,
        phase: "post" as const,
        quantity: 30,
        totalCost: p.price,
        reason: outcomeType === "build-muscle-endurance" && p.category === "Creatine"
          ? "3-5g daily — most researched performance supplement. Take consistently."
          : outcomeType === "improve-recovery" && p.category === "Omega-3"
          ? "Daily anti-inflammatory — reduces DOMS and accelerates tissue repair"
          : outcomeType === "gut-health" && p.category === "Probiotic"
          ? "Daily gut support — diversifies microbiome and reduces GI distress during exercise"
          : "Daily supplement to support your goal",
      }));

    return { pre, during, post };
  }
}

function parsePlan(raw: string): ParsedPlan {
  const sections: ParsedPlan = {
    preEvent: [], duringEvent: [], postEvent: [], totals: [], keyNotes: [],
  };
  let current: keyof ParsedPlan = "preEvent";

  raw.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.match(/^PRE.EVENT/i) || trimmed.match(/^BEFORE/i)) { current = "preEvent"; return; }
    if (trimmed.match(/^DURING/i) || trimmed.match(/^INTRA/i)) { current = "duringEvent"; return; }
    if (trimmed.match(/^POST.EVENT/i) || trimmed.match(/^AFTER/i) || trimmed.match(/^RECOVERY/i)) { current = "postEvent"; return; }
    if (trimmed.match(/^PRODUCT/i) || trimmed.match(/^RECOMMENDED/i)) return; // skip — we handle products ourselves
    if (trimmed.match(/^TOTAL/i) || trimmed.match(/^SUMMARY/i)) { current = "totals"; return; }
    if (trimmed.match(/^KEY NOTE/i) || trimmed.match(/^IMPORTANT/i) || trimmed.match(/^NOTE/i)) { current = "keyNotes"; return; }
    sections[current].push(trimmed);
  });
  return sections;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full text-xs font-mono flex items-center justify-center transition-all ${i + 1 === current ? "bg-moss text-cream" : i + 1 < current ? "bg-moss/30 text-moss" : "bg-sand text-muted"}`}>
            {i + 1 < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 ${i + 1 < current ? "bg-moss/30" : "bg-sand"}`} />}
        </div>
      ))}
    </div>
  );
}

// Replace the PlanLines function in app/quiz/page.tsx with this:

function PlanLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Strip markdown
        const clean = line
          .replace(/^#+\s*/, "")           // remove ## headers
          .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold
          .replace(/^[-*]\s+/, "")         // remove bullet markers
          .replace(/^\*(.+)\*$/, "$1")     // remove italic wrappers
          .replace(/^---+$/, "")           // remove dividers
          .replace(/^--$/, "")             // remove --
          .trim();

        if (!clean) return null;

        // Table rows — pipe separated
        if (clean.startsWith("|") && clean.endsWith("|")) {
          // Skip separator rows like |---|---|
          if (clean.match(/^\|[\s\-|]+\|$/)) return null;
          const cells = clean.split("|").filter(c => c.trim());
          // Header row (first table row)
          if (cells.length >= 2) {
            return (
              <div key={i} className="grid gap-2 text-xs py-1.5 border-b border-sand last:border-0"
                style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
                {cells.map((cell, ci) => (
                  <span key={ci} className={ci === 0 ? "font-medium text-ink" : "text-muted"}>{cell.trim()}</span>
                ))}
              </div>
            );
          }
        }

        // Timing headers (e.g. "2.5-3 Hours Before", "0-30 Minutes", "60 Minutes Before")
        if (clean.match(/^\d[\d\s\-–]+(?:hour|min|minute)/i) || clean.match(/^(?:meal total|hour \d)/i)) {
          return (
            <div key={i} className="font-semibold text-sm text-ink mt-4 mb-1 pt-2 border-t border-sand first:border-0 first:pt-0">
              {clean}
            </div>
          );
        }

        // Section subheaders (ALL CAPS or ends with colon)
        if ((clean === clean.toUpperCase() && clean.length > 3) || (clean.endsWith(":") && clean.length < 40)) {
          return (
            <div key={i} className="font-semibold text-sm text-ink mt-3 mb-1">{clean}</div>
          );
        }

        // Totals / summary lines (start with key metric)
        if (clean.match(/^(total|estimated|daily|monthly|target|budget)/i)) {
          const parts = clean.split(":");
          if (parts.length === 2) {
            return (
              <div key={i} className="flex items-center justify-between py-1 border-b border-sand/50 last:border-0">
                <span className="text-xs text-muted">{parts[0].trim()}</span>
                <span className="text-xs font-mono font-medium text-ink">{parts[1].trim()}</span>
              </div>
            );
          }
        }

        // Regular line
        return (
          <div key={i} className="flex items-start gap-2 text-sm text-muted">
            <span className="text-moss flex-shrink-0 mt-1 text-xs">→</span>
            <span className="leading-relaxed">{clean}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhaseProductCard({ item, borderColor }: { item: PhaseProduct; borderColor: string }) {
  const p = item.product;
  const pricePerServing = (p.price / getServingsPerContainer(p.category)).toFixed(2);

  return (
    <Link href={`/report/${p.id}`}>
      <div className={`bg-white/60 border ${borderColor} rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group`}>
        <div className="flex items-start gap-3">
          {(p as any).logoDomain ? (
            <img src={`https://logo.clearbit.com/${(p as any).logoDomain}`} alt={p.brand}
              className="h-7 w-7 object-contain flex-shrink-0 rounded"
              onError={e => (e.currentTarget.style.display = "none")} />
          ) : (
            <div className="w-7 h-7 rounded bg-sand flex items-center justify-center text-xs font-mono flex-shrink-0">
              {p.brand.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-muted mb-0.5">{p.category}</div>
            <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors leading-tight">{p.name}</div>
            <div className="text-xs text-muted">{p.brand}</div>
          </div>
          <div className="text-right flex-shrink-0">
            {item.quantity > 1 ? (
              <>
                <div className="text-xs font-mono font-bold text-ink">x{item.quantity}</div>
                <div className="text-xs font-mono text-moss">${item.totalCost.toFixed(2)}</div>
              </>
            ) : (
              <div className="text-xs font-mono text-muted">${pricePerServing}/srv</div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted mt-2 leading-relaxed">{item.reason}</p>
      </div>
    </Link>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────

export default function PlannerPage() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<PlannerInputs>({
    mode: "event", eventType: null, outcomeType: null,
    durationHours: 2, intensity: "moderate", caffeinePreference: "moderate",
    budget: 50, dietary: [], formats: [], retailers: [], weightKg: 70,
  });
  const [loading, setLoading] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);

  const update = (key: keyof PlannerInputs, value: any) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const toggleArray = <T,>(key: keyof PlannerInputs, value: T) => {
    const arr = inputs[key] as T[];
    setInputs(prev => ({ ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }));
  };

  const carbTarget = carbsNeeded(inputs.durationHours, inputs.intensity);
  const sodiumTarget = sodiumNeeded(inputs.durationHours, inputs.intensity, inputs.weightKg);
  const isEvent = inputs.mode === "event";

  // Build phase-specific recommendations
  const phaseRecs = useMemo(() => {
    if (!parsedPlan) return null;
    return buildPhaseRecommendations(inputs, carbTarget);
  }, [parsedPlan, inputs, carbTarget]);

  // Total cost
  const totalCost = useMemo(() => {
    if (!phaseRecs) return 0;
    return [...phaseRecs.pre, ...phaseRecs.during, ...phaseRecs.post]
      .reduce((sum, item) => sum + item.totalCost, 0);
  }, [phaseRecs]);

  const generatePlan = async () => {
    setLoading(true);
    setParsedPlan(null);

    const outcomeData = OUTCOME_TYPES.find(o => o.id === inputs.outcomeType);
    const eventData = EVENT_TYPES.find(e => e.id === inputs.eventType);

    const prompt = isEvent
    ? `You are Pello's expert sports nutrition AI. Generate a complete, science-backed nutrition plan.

ATHLETE PROFILE:
- Event: ${eventData?.label}
- Duration: ${inputs.durationHours} hours
- Intensity: ${inputs.intensity}
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}

CALCULATED TARGETS:
- Total carbs: ${carbTarget}g (${INTENSITY_OPTIONS.find(i => i.id === inputs.intensity)?.carbsPerHr}g/hr)
- Total sodium: ${sodiumTarget}mg

Use ONLY these exact section headers. No markdown, no tables, no asterisks, no hashtags. Plain text only.

PRE-EVENT
List specific foods with quantities and carb counts. Use this format:
White rice or pasta — 200g cooked — 55g carbs
Banana — 1 medium — 25g carbs
Then add timing notes as plain sentences.

DURING EVENT
Write a clear per-hour fuelling schedule as plain sentences. Example:
Start fuelling at 30 minutes with 1 gel (25g carbs).
Take 1 gel every 25 minutes after that.
Sip 150-200ml water with each gel.

POST-EVENT
Three clear windows as plain text:
0-30 minutes: specific food and amounts
30-120 minutes: specific food and amounts
Overnight: specific recommendations

TOTALS
Total carbs: Xg
Total sodium: Xmg
Total caffeine: Xmg
Estimated product cost: $X

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`

    : `You are Pello's expert sports nutrition AI. Generate a complete outcome-based nutrition protocol.

ATHLETE GOAL: ${outcomeData?.label}
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}/month
- Caffeine: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}

Use ONLY these exact section headers. No markdown, no tables, no asterisks. Plain text only.

PRE-EVENT
Daily nutrition habits before training as plain sentences. Specific foods, timing and quantities.

DURING EVENT
Intra-training nutrition as plain sentences. What to take, when and how much.

POST-EVENT
Three windows as plain text:
0-30 minutes: specific recommendations
30-120 minutes: specific recommendations
Daily habits: ongoing recovery nutrition

TOTALS
Daily protein target: Xg
Daily carb target: Xg
Monthly supplement budget: $X

KEY NOTES
Write exactly 3 numbered tips as plain sentences. No bullet points, no asterisks.`;

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setParsedPlan(parsePlan(data.plan ?? "Failed to generate plan."));
    } catch {
      setParsedPlan(parsePlan("Failed to generate plan. Please try again."));
    }
    setLoading(false);
  };

  const reset = () => {
    setParsedPlan(null);
    setStep(1);
    setInputs({
      mode: "event", eventType: null, outcomeType: null,
      durationHours: 2, intensity: "moderate", caffeinePreference: "moderate",
      budget: 50, dietary: [], formats: [], retailers: [], weightKg: 70,
    });
  };

  const planTitle = isEvent
    ? `${EVENT_TYPES.find(e => e.id === inputs.eventType)?.label} · ${inputs.durationHours}hr plan`
    : OUTCOME_TYPES.find(o => o.id === inputs.outcomeType)?.label ?? "Your plan";

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">Pel<span className="text-moss">lo</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/search" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Search</Link>
            <Link href="/blog" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Blog</Link>            <Link href="/compare" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
            <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Query</Link>
            <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        {!parsedPlan && !loading && (
          <div className="mb-8">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Pello Planner</div>
            <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Build your nutrition plan</h1>
            <p className="text-muted">Science-backed pre, during and post nutrition — tailored to your event or goal.</p>
          </div>
        )}

        {/* Form */}
        {!parsedPlan && !loading && (
          <>
            <StepIndicator current={step} total={3} />

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => update("mode", "event")}
                    className={`p-4 rounded-xl border text-left transition-all ${inputs.mode === "event" ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                    <div className="font-display font-semibold text-sm mb-1">Event / session</div>
                    <div className="text-xs text-muted">I have a specific event or training session to fuel for</div>
                  </button>
                  <button onClick={() => update("mode", "outcome")}
                    className={`p-4 rounded-xl border text-left transition-all ${inputs.mode === "outcome" ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                    <div className="font-display font-semibold text-sm mb-1">Outcome / goal</div>
                    <div className="text-xs text-muted">I want to achieve a specific result through nutrition</div>
                  </button>
                </div>

                {inputs.mode === "event" && (
                  <div>
                    <h2 className="font-display font-semibold text-base mb-4">What are you planning for?</h2>
                    <div className="space-y-2 mb-6">
                      {EVENT_TYPES.map(e => (
                        <button key={e.id} onClick={() => update("eventType", e.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${inputs.eventType === e.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{e.label}</div>
                            <div className="text-xs text-muted">{e.desc}</div>
                          </div>
                          {inputs.eventType === e.id && <span className="text-moss font-mono text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                    {inputs.eventType && (
                      <div className="card mb-6">
                        <h3 className="font-display font-semibold mb-4">Duration</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {DURATION_OPTIONS.map(d => (
                            <button key={d.value} onClick={() => update("durationHours", d.value)}
                              className={`py-2 px-2 rounded-xl border text-xs font-mono transition-all ${inputs.durationHours === d.value ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inputs.mode === "outcome" && (
                  <div>
                    <h2 className="font-display font-semibold text-base mb-4">What do you want to achieve?</h2>
                    <div className="space-y-2 mb-6">
                      {OUTCOME_TYPES.map(o => (
                        <button key={o.id} onClick={() => update("outcomeType", o.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${inputs.outcomeType === o.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{o.label}</div>
                            <div className="text-xs text-muted">{o.desc}</div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            {inputs.outcomeType === o.id
                              ? <span className="text-moss font-mono text-xs">✓</span>
                              : <span className="text-xs font-mono text-muted">{o.timeframe}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setStep(2)} disabled={isEvent ? !inputs.eventType : !inputs.outcomeType}
                  className="btn-primary w-full justify-center flex disabled:opacity-40">
                  Next →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-1">Your targets</h2>
                <p className="text-xs text-muted mb-5">We'll use these to calculate your exact nutrition needs</p>

                {isEvent && (
                  <div className="card mb-4">
                    <h3 className="font-display font-semibold mb-4">Intensity</h3>
                    <div className="space-y-2">
                      {INTENSITY_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => update("intensity", opt.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${inputs.intensity === opt.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div>
                            <div className="font-medium text-sm">{opt.label}</div>
                            <div className="text-xs text-muted">{opt.desc}</div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="font-mono text-sm font-medium text-moss">{opt.carbsPerHr}g</div>
                            <div className="text-xs text-muted">carbs/hr</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-4">Body weight</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted">40kg</span>
                    <input type="range" min={40} max={120} step={1} value={inputs.weightKg}
                      onChange={e => update("weightKg", Number(e.target.value))} className="flex-1 accent-moss" />
                    <span className="text-sm text-muted">120kg</span>
                  </div>
                  <div className="text-center font-display font-bold text-2xl text-moss">{inputs.weightKg}kg</div>
                </div>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-4">Caffeine preference</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "none" as CaffeinePreference, label: "None", desc: "Caffeine-free" },
                      { id: "moderate" as CaffeinePreference, label: "Moderate", desc: "1-2 products" },
                      { id: "high" as CaffeinePreference, label: "High", desc: "Maximise" },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => update("caffeinePreference", opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${inputs.caffeinePreference === opt.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted"}`}>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-muted">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-4">{isEvent ? "Event budget" : "Monthly supplement budget"}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted">$10</span>
                    <input type="range" min={10} max={200} step={5} value={inputs.budget}
                      onChange={e => update("budget", Number(e.target.value))} className="flex-1 accent-moss" />
                    <span className="text-sm text-muted">$200</span>
                  </div>
                  <div className="text-center font-display font-bold text-2xl text-moss">${inputs.budget}</div>
                </div>

                {isEvent && (
                  <div className="bg-moss/5 border border-moss/20 rounded-xl p-4 mb-6">
                    <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">Calculated targets</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-display font-bold text-xl">{carbTarget}g</div>
                        <div className="text-xs text-muted">total carbs</div>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xl">{Math.round(sodiumTarget / 100) / 10}g</div>
                        <div className="text-xs text-muted">sodium</div>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xl">{Math.round(inputs.durationHours * 500)}ml</div>
                        <div className="text-xs text-muted">fluid</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center flex">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center flex">Next →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-1">Your preferences</h2>
                <p className="text-xs text-muted mb-5">All optional — helps tailor product recommendations</p>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-1">Dietary requirements</h3>
                  <p className="text-xs text-muted mb-3">Select all that apply</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["vegan", "gluten-free", "dairy-free"] as DietaryRestriction[]).map(d => (
                      <button key={d} onClick={() => toggleArray("dietary", d)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${inputs.dietary.includes(d) ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {isEvent && (
                  <div className="card mb-4">
                    <h3 className="font-display font-semibold mb-1">Preferred formats</h3>
                    <p className="text-xs text-muted mb-3">Leave blank for all formats</p>
                    <div className="space-y-2">
                      {FORMAT_OPTIONS.map(f => (
                        <button key={f.id} onClick={() => toggleArray("formats", f.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${inputs.formats.includes(f.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{f.label}</div>
                            <div className="text-xs text-muted">{f.desc}</div>
                          </div>
                          {inputs.formats.includes(f.id) && <span className="text-moss font-mono text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card mb-6">
                  <h3 className="font-display font-semibold mb-1">Available at</h3>
                  <p className="text-xs text-muted mb-3">Only recommend products from these retailers</p>
                  <div className="flex gap-2 flex-wrap">
                    {RETAILER_OPTIONS.map(r => (
                      <button key={r} onClick={() => toggleArray("retailers", r)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${inputs.retailers.includes(r) ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center flex">← Back</button>
                  <button onClick={() => { setStep(4); generatePlan(); }} className="btn-primary flex-1 justify-center flex">
                    Generate my plan →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-sand border-t-moss rounded-full mb-6" />
            <h2 className="font-display font-semibold text-lg mb-2">Building your plan...</h2>
            <p className="text-muted text-sm">Calculating targets, matching products and building your protocol</p>
          </div>
        )}

        {/* Results */}
        {parsedPlan && !loading && phaseRecs && (
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Your nutrition plan</div>
              <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{planTitle}</h1>
              <div className="flex flex-wrap gap-2">
                {isEvent && <span className="text-xs bg-moss/10 text-moss font-mono px-2 py-0.5 rounded-md">{carbTarget}g carbs</span>}
                {isEvent && <span className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">{inputs.intensity} intensity</span>}
                <span className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">${inputs.budget} budget</span>
                {inputs.caffeinePreference === "none" && <span className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">caffeine-free</span>}
                {inputs.dietary.map(d => <span key={d} className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">{d}</span>)}
              </div>
            </div>

            {/* PRE phase */}
            <div className="card border-l-4 border-l-moss mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-moss/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-moss text-xs font-mono font-bold">PRE</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{isEvent ? "Pre-event" : "Before training"}</h3>
                  <p className="text-xs text-muted">{isEvent ? "2-3 hours before" : "Daily preparation"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.preEvent} />
              {phaseRecs.pre.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.pre.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-moss/20" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DURING phase */}
            <div className="card border-l-4 border-l-amber mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber text-xs font-mono font-bold">DUR</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{isEvent ? "During event" : "During training"}</h3>
                  <p className="text-xs text-muted">{isEvent ? "Per-hour fuelling plan" : "Intra-workout nutrition"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.duringEvent} />
              {phaseRecs.during.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.during.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-amber/20" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* POST phase */}
            <div className="card border-l-4 border-l-blue-400 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-mono font-bold">POST</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{isEvent ? "Post-event recovery" : "Recovery protocol"}</h3>
                  <p className="text-xs text-muted">{isEvent ? "0-30 min · 30-120 min · overnight" : "Daily recovery habits"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.postEvent} />
              {phaseRecs.post.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.post.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-blue-100" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost summary */}
            <div className="card bg-moss/5 border-moss/20 mb-4">
              <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">
                {isEvent ? "Estimated event cost" : "Monthly supplement stack"}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Recommended products total</span>
                <span className="font-display font-bold text-xl text-moss">${totalCost.toFixed(2)}</span>
              </div>
              {isEvent && (
                <div className={`text-xs font-mono ${totalCost <= inputs.budget ? "text-moss" : "text-amber"}`}>
                  {totalCost <= inputs.budget
                    ? `✓ Within your $${inputs.budget} budget`
                    : `⚠ $${(totalCost - inputs.budget).toFixed(2)} over your $${inputs.budget} budget`}
                </div>
              )}
              {parsedPlan.totals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sand">
                  <PlanLines lines={parsedPlan.totals} />
                </div>
              )}
            </div>

            {/* Key notes */}
            {parsedPlan.keyNotes.length > 0 && (
              <div className="card bg-sand/30 mb-6">
                <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Key notes</div>
                <PlanLines lines={parsedPlan.keyNotes} />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1 justify-center flex">Start over</button>
              <Link href="/products" className="btn-primary flex-1 justify-center flex text-center">Browse all products →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}