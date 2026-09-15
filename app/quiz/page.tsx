"use client";

import { useState } from "react";
import Link from "next/link";
import { PRODUCTS, Category } from "@/lib/products";

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
  products: string[];
  totals: string[];
  keyNotes: string[];
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

function parsePlan(raw: string): ParsedPlan {
  const sections: ParsedPlan = {
    preEvent: [], duringEvent: [], postEvent: [],
    products: [], totals: [], keyNotes: [],
  };

  let current: keyof ParsedPlan = "preEvent";

  raw.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.match(/^PRE.EVENT/i) || trimmed.match(/^BEFORE/i)) { current = "preEvent"; return; }
    if (trimmed.match(/^DURING/i) || trimmed.match(/^INTRA/i)) { current = "duringEvent"; return; }
    if (trimmed.match(/^POST.EVENT/i) || trimmed.match(/^AFTER/i) || trimmed.match(/^RECOVERY/i)) { current = "postEvent"; return; }
    if (trimmed.match(/^PRODUCT/i) || trimmed.match(/^RECOMMENDED/i)) { current = "products"; return; }
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

function PlanLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const clean = line.replace(/^[-•*]\s*/, "").replace(/\*\*/g, "");
        if (!clean) return null;
        if (clean.match(/^[A-Z][A-Z\s:]+$/) || clean.endsWith(":")) {
          return <p key={i} className="font-semibold text-sm mt-3 mb-1 text-ink">{clean}</p>;
        }
        return (
          <div key={i} className="flex items-start gap-2 text-sm text-muted">
            <span className="text-moss flex-shrink-0 mt-0.5">→</span>
            <span className="leading-relaxed">{clean}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────

export default function PlannerPage() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<PlannerInputs>({
    mode: "event",
    eventType: null,
    outcomeType: null,
    durationHours: 2,
    intensity: "moderate",
    caffeinePreference: "moderate",
    budget: 50,
    dietary: [],
    formats: [],
    retailers: [],
    weightKg: 70,
  });
  const [loading, setLoading] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const [rawPlan, setRawPlan] = useState("");

  const update = (key: keyof PlannerInputs, value: any) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const toggleArray = <T,>(key: keyof PlannerInputs, value: T) => {
    const arr = inputs[key] as T[];
    setInputs(prev => ({ ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }));
  };

  const carbTarget = carbsNeeded(inputs.durationHours, inputs.intensity);
  const sodiumTarget = sodiumNeeded(inputs.durationHours, inputs.intensity, inputs.weightKg);

  const getMatchingProducts = () => {
    const suppCats = ["Protein", "Creatine", "Supplement", "Recovery & Sleep", "Probiotic", "Omega-3", "Vitamin", "Mineral"];
    return PRODUCTS.filter(p => {
      if (inputs.formats.length > 0 && !inputs.formats.includes(p.category as FormatPreference) && !suppCats.includes(p.category)) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating).slice(0, 15);
  };

  const generatePlan = async () => {
    setLoading(true);
    setParsedPlan(null);
    setRawPlan("");
    const matchingProducts = getMatchingProducts();

    const isOutcome = inputs.mode === "outcome";
    const outcomeData = OUTCOME_TYPES.find(o => o.id === inputs.outcomeType);
    const eventData = EVENT_TYPES.find(e => e.id === inputs.eventType);

    const prompt = isOutcome ? `You are Pello's expert sports nutrition AI. Generate a complete, science-backed nutrition protocol.

ATHLETE GOAL:
- Outcome: ${outcomeData?.label}
- Description: ${outcomeData?.desc}
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}/month
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}
- Preferred formats: ${inputs.formats.length > 0 ? inputs.formats.join(", ") : "any"}

AVAILABLE PRODUCTS FROM PELLO DATABASE:
${matchingProducts.map(p => `- ${p.name} by ${p.brand} (${p.category}, $${p.price}/mo, rating ${p.rating})`).join("\n")}

Generate a complete outcome-based nutrition protocol with these exact sections:

PRE-EVENT
Daily nutrition habits and pre-training preparation specific to achieving this outcome. Include meal timing, key nutrients and what to prioritise before training sessions.

DURING EVENT
Intra-training or intra-event fuelling strategy. What to take, when and how much. If this is a recovery or muscle-building outcome, focus on intra-workout nutrition.

POST-EVENT
Recovery nutrition protocol. The critical 0-30 minute window, 30-120 minute window, and daily recovery habits that directly support this outcome.

PRODUCT RECOMMENDATIONS
Pick 4-6 specific products from the Pello database above that are most important for achieving this outcome. For each: name, why it matters for this goal, how to use it and approximate monthly cost.

TOTALS
- Daily protein target: Xg
- Daily carb target: Xg
- Key supplement budget: $X/month

KEY NOTES
3 specific, actionable science-backed tips for achieving this outcome through nutrition.

Be specific, practical and outcome-focused. Every recommendation should directly serve the stated goal.`

    : `You are Pello's expert sports nutrition AI. Generate a complete, science-backed nutrition plan.

ATHLETE PROFILE:
- Event: ${eventData?.label}
- Duration: ${inputs.durationHours} hours
- Intensity: ${inputs.intensity}
- Body weight: ${inputs.weightKg}kg
- Budget: $${inputs.budget}
- Caffeine preference: ${inputs.caffeinePreference}
- Dietary: ${inputs.dietary.length > 0 ? inputs.dietary.join(", ") : "none"}
- Preferred formats: ${inputs.formats.length > 0 ? inputs.formats.join(", ") : "any"}
- Retailers: ${inputs.retailers.length > 0 ? inputs.retailers.join(", ") : "any"}

CALCULATED TARGETS:
- Total carbs needed: ${carbTarget}g (${INTENSITY_OPTIONS.find(i => i.id === inputs.intensity)?.carbsPerHr}g/hr)
- Total sodium needed: ${sodiumTarget}mg
- ${inputs.durationHours < 1 ? "Under 60 min — carb fuelling optional" : `${inputs.durationHours} hours — full fuelling protocol needed`}

AVAILABLE PRODUCTS FROM PELLO DATABASE:
${matchingProducts.map(p => `- ${p.name} by ${p.brand} (${p.category}, $${p.price}/mo, rating ${p.rating})`).join("\n")}

Generate a complete plan with these exact sections:

PRE-EVENT
What to eat and drink 2-3 hours before the event. Include specific foods, products, quantities and timing. Focus on carb loading, hydration and gut preparation.

DURING EVENT
Per-hour fuelling breakdown. Start time for fuelling, exact quantities, timing intervals, what to take when. Be specific: "Take 1 gel at 30 min, then 1 every 25 min after that."

POST-EVENT
Recovery protocol in three windows: 0-30 minutes (critical window), 30-120 minutes (sustained recovery), and overnight recovery. Specific foods, products and quantities for each window.

PRODUCT RECOMMENDATIONS
Pick 4-6 specific products from the Pello database above. For each: product name, how many units needed for this event, total cost, exact timing in the plan and why it's the right choice.

TOTALS
- Total carbs: Xg
- Total sodium: Xmg
- Total caffeine: Xmg
- Estimated product cost: $X

KEY NOTES
3 specific tips for this exact event/athlete combination based on the science.

Be specific with quantities and timing. Use exact numbers.`;

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const plan = data.plan || "Failed to generate plan. Please try again.";
      setRawPlan(plan);
      setParsedPlan(parsePlan(plan));
    } catch {
      setRawPlan("Failed to generate plan. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setParsedPlan(null);
    setRawPlan("");
    setStep(1);
    setInputs({
      mode: "event", eventType: null, outcomeType: null,
      durationHours: 2, intensity: "moderate", caffeinePreference: "moderate",
      budget: 50, dietary: [], formats: [], retailers: [], weightKg: 70,
    });
  };

  const isEvent = inputs.mode === "event";
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
            <Link href="/guides" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
            <Link href="/compare" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
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

            {/* Step 1 — Mode + Event/Outcome */}
            {step === 1 && (
              <div>
                {/* Mode selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => update("mode", "event")}
                    className={`p-4 rounded-xl border text-left transition-all ${inputs.mode === "event" ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="font-display font-semibold text-sm mb-1">Event / session</div>
                    <div className="text-xs text-muted">I have a specific event or training session to fuel for</div>
                  </button>
                  <button
                    onClick={() => update("mode", "outcome")}
                    className={`p-4 rounded-xl border text-left transition-all ${inputs.mode === "outcome" ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="font-display font-semibold text-sm mb-1">Outcome / goal</div>
                    <div className="text-xs text-muted">I want to achieve a specific result through nutrition</div>
                  </button>
                </div>

                {/* Event types */}
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

                {/* Outcome types */}
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

                <button
                  onClick={() => setStep(2)}
                  disabled={isEvent ? !inputs.eventType : !inputs.outcomeType}
                  className="btn-primary w-full justify-center flex disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Step 2 — Targets */}
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

            {/* Step 3 — Preferences */}
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
        {parsedPlan && !loading && (
          <div>
            {/* Plan header */}
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

            {/* Three phase cards */}
            <div className="space-y-4 mb-6">

              {/* Pre-event */}
              {parsedPlan.preEvent.length > 0 && (
                <div className="card border-l-4 border-l-moss">
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
                </div>
              )}

              {/* During event */}
              {parsedPlan.duringEvent.length > 0 && (
                <div className="card border-l-4 border-l-amber">
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
                </div>
              )}

              {/* Post-event */}
              {parsedPlan.postEvent.length > 0 && (
                <div className="card border-l-4 border-l-blue-400">
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
                </div>
              )}
            </div>

            {/* Totals */}
            {parsedPlan.totals.length > 0 && (
              <div className="card bg-moss/5 border-moss/20 mb-4">
                <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">Plan summary</div>
                <PlanLines lines={parsedPlan.totals} />
              </div>
            )}

            {/* Key notes */}
            {parsedPlan.keyNotes.length > 0 && (
              <div className="card bg-sand/30 mb-6">
                <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Key notes</div>
                <PlanLines lines={parsedPlan.keyNotes} />
              </div>
            )}

            {/* Product recommendations */}
            <div className="mb-6">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">From the Pello database</div>
              <p className="text-xs text-muted mb-4">Top-rated products that match your plan — click any to read the full report</p>
              <div className="space-y-3">
                {getMatchingProducts().slice(0, 6).map(p => (
                  <Link key={p.id} href={`/report/${p.id}`}>
                    <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4">
                      {(p as any).logoDomain ? (
                        <img src={`https://logo.clearbit.com/${(p as any).logoDomain}`} alt={p.brand}
                          className="h-8 w-auto object-contain flex-shrink-0"
                          onError={e => (e.currentTarget.style.display = "none")} />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center text-xs font-mono flex-shrink-0">
                          {p.brand.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-mono text-muted mb-0.5">{p.category}</div>
                        <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                        <div className="text-xs text-muted">{p.brand} · {p.rating}★</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-mono font-medium">${p.price}/mo</div>
                        <div className="text-xs text-moss mt-1">View →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

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
