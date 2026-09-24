"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const WORKOUT_TYPES = [
  { id: "endurance", label: "Endurance", desc: "Running, cycling, triathlon, swimming" },
  { id: "strength", label: "Strength / Gym", desc: "Lifting, resistance training, CrossFit" },
  { id: "hiit", label: "HIIT / Intervals", desc: "High intensity intervals, circuit training" },
  { id: "mixed", label: "Mixed", desc: "Combination of endurance and strength" },
];

const RECOVERY_GOALS = [
  { id: "next_day", label: "Train again tomorrow", desc: "Need to be ready for back-to-back sessions" },
  { id: "general", label: "General recovery", desc: "Standard recovery between sessions" },
  { id: "competition", label: "Competition prep", desc: "Recovering before a race or event" },
  { id: "injury", label: "Injury prevention", desc: "Focus on tissue repair and longevity" },
];

const SESSION_INTENSITIES = [
  { id: "easy", label: "Easy", desc: "Light effort, active recovery" },
  { id: "moderate", label: "Moderate", desc: "Steady effort, typical training" },
  { id: "hard", label: "Hard", desc: "Threshold or high intensity" },
  { id: "max", label: "Maximum", desc: "Race effort or hardest session" },
];

type WorkoutType = typeof WORKOUT_TYPES[number]["id"];
type RecoveryGoal = typeof RECOVERY_GOALS[number]["id"];
type SessionIntensity = typeof SESSION_INTENSITIES[number]["id"];

export default function RecoveryGuidePage() {
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [recoveryGoal, setRecoveryGoal] = useState<RecoveryGoal | null>(null);
  const [intensity, setIntensity] = useState<SessionIntensity | null>(null);
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [calculated, setCalculated] = useState(false);

  const weightKg = weightUnit === "lbs" ? weight * 0.453592 : weight;

  // Carb recs based on workout type and intensity
  const getCarbRec = () => {
    if (!workoutType || !intensity) return { low: 1.0, high: 1.2 };
    if (workoutType === "strength") return { low: 0.5, high: 0.8 };
    if (intensity === "easy") return { low: 0.5, high: 0.8 };
    if (intensity === "moderate") return { low: 0.8, high: 1.0 };
    if (intensity === "hard") return { low: 1.0, high: 1.2 };
    return { low: 1.2, high: 1.5 };
  };

  // Protein recs
  const getProteinRec = () => {
    if (workoutType === "strength") return { low: 30, high: 40 };
    if (intensity === "hard" || intensity === "max") return { low: 25, high: 35 };
    return { low: 20, high: 30 };
  };

  const carbRec = getCarbRec();
  const proteinRec = getProteinRec();
  const carbsLow = Math.round(carbRec.low * weightKg);
  const carbsHigh = Math.round(carbRec.high * weightKg);

  // Recovery urgency
  const isUrgent = recoveryGoal === "next_day" || recoveryGoal === "competition";

  // Protocol steps
  const getProtocol = () => {
    const steps = [];

    steps.push({
      window: "0–30 min",
      priority: "critical",
      title: "Immediate refuel",
      items: [
        `${carbsLow}–${carbsHigh}g carbohydrates (${Math.round(carbRec.low * weightKg / 4)}–${Math.round(carbRec.high * weightKg / 4)} slices of bread equivalent)`,
        `${proteinRec.low}–${proteinRec.high}g fast-absorbing protein (whey isolate ideal)`,
        "500–750ml fluid with electrolytes to begin rehydration",
        workoutType === "endurance" ? "A recovery shake or banana + milk works well here" : "A protein shake + fruit juice is convenient",
      ],
    });

    steps.push({
      window: "30 min – 2 hrs",
      priority: "important",
      title: "Proper meal",
      items: [
        "Full balanced meal — carbs, protein, vegetables",
        `Continue protein intake: another ${proteinRec.low}–${proteinRec.high}g`,
        workoutType === "strength" ? "Leucine-rich foods (chicken, fish, eggs, dairy) maximise MPS" : "Anti-inflammatory foods: tart cherry, turmeric, leafy greens",
        "Continue sipping fluids — urine should be pale yellow",
      ],
    });

    if (isUrgent) {
      steps.push({
        window: "2–4 hrs",
        priority: "important",
        title: "Ongoing fuelling",
        items: [
          "Another carb-rich snack — rice cakes, oat bar, fruit",
          "Tart cherry juice or concentrate — reduces inflammation and DOMS",
          `Continue distributing protein: aim for 1.6–2.2g per kg total (${Math.round(1.6 * weightKg)}–${Math.round(2.2 * weightKg)}g across the day)`,
          recoveryGoal === "competition" ? "Avoid heavy fats or fibre — keep gut comfortable for tomorrow" : "Normal dietary fat intake is fine",
        ],
      });
    }

    steps.push({
      window: "Evening / Pre-sleep",
      priority: "standard",
      title: "Sleep preparation",
      items: [
        "200–400mg magnesium glycinate — supports deep sleep and muscle relaxation",
        "Casein protein or Greek yoghurt before bed — slow-release protein sustains MPS overnight",
        "Tart cherry juice (second dose if using) — naturally boosts melatonin",
        "Dark room, consistent bedtime — sleep is the most powerful recovery tool available",
        recoveryGoal === "next_day" ? "Target 8–9 hours — growth hormone peaks during deep sleep" : "Target 7–9 hours",
      ],
    });

    return steps;
  };

  const protocol = getProtocol();

  const priorityStyles: Record<string, string> = {
    critical: "bg-moss text-cream",
    important: "bg-amber/20 text-amber",
    standard: "bg-sand text-muted",
  };

  const canCalculate = workoutType && recoveryGoal && intensity;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      <Logo />
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden sm:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
      <Link href="/guides" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
      <Link href="/compare" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Explore</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">
            <Link href="/guides" className="hover:text-ink transition-colors">Guides</Link>
            <span className="mx-2">·</span>
            Recovery
          </div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">
            Recovery Guide
          </h1>
          <p className="text-muted leading-relaxed">
            Tell us about your session and goals — we'll build you a personalised recovery protocol with exact targets and timing.
          </p>
        </div>

        {/* Inputs */}
        {!calculated && (
          <div className="space-y-4 mb-8">

            {/* Workout type */}
            <div className="card">
              <h2 className="font-display font-semibold mb-4">What type of session was it?</h2>
              <div className="space-y-2">
                {WORKOUT_TYPES.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWorkoutType(w.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${workoutType === w.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{w.label}</div>
                      <div className="text-xs text-muted">{w.desc}</div>
                    </div>
                    {workoutType === w.id && <span className="text-moss font-mono text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="card">
              <h2 className="font-display font-semibold mb-4">How hard was it?</h2>
              <div className="grid grid-cols-2 gap-2">
                {SESSION_INTENSITIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setIntensity(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${intensity === s.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-muted">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recovery goal */}
            <div className="card">
              <h2 className="font-display font-semibold mb-4">What's your recovery goal?</h2>
              <div className="space-y-2">
                {RECOVERY_GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setRecoveryGoal(g.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${recoveryGoal === g.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{g.label}</div>
                      <div className="text-xs text-muted">{g.desc}</div>
                    </div>
                    {recoveryGoal === g.id && <span className="text-moss font-mono text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Body weight */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">Body weight</h2>
                <div className="flex gap-1 bg-sand rounded-lg p-0.5">
                  <button onClick={() => setWeightUnit("kg")} className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${weightUnit === "kg" ? "bg-white text-ink" : "text-muted"}`}>kg</button>
                  <button onClick={() => setWeightUnit("lbs")} className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${weightUnit === "lbs" ? "bg-white text-ink" : "text-muted"}`}>lbs</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-muted">{weightUnit === "kg" ? "40kg" : "88lbs"}</span>
                <input
                  type="range"
                  min={weightUnit === "kg" ? 40 : 88}
                  max={weightUnit === "kg" ? 120 : 264}
                  step={weightUnit === "kg" ? 1 : 2}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="flex-1 accent-moss"
                />
                <span className="text-sm text-muted">{weightUnit === "kg" ? "120kg" : "264lbs"}</span>
              </div>
              <div className="text-center font-display font-bold text-2xl text-moss">{weight}{weightUnit}</div>
            </div>
          </div>
        )}

        {!calculated && (
          <button
            onClick={() => setCalculated(true)}
            disabled={!canCalculate}
            className="btn-primary w-full justify-center flex mb-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Build my recovery protocol
          </button>
        )}

        {/* Results */}
        {calculated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-muted uppercase tracking-widest">Your recovery protocol</div>
              <button onClick={() => setCalculated(false)} className="text-xs text-moss underline underline-offset-2">
                Recalculate
              </button>
            </div>

            {/* Summary */}
            <div className="card bg-moss/5 border-moss/20">
              <h3 className="font-display font-bold text-xl mb-4">Nutrition targets</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 rounded-xl p-4 text-center">
                  <div className="font-display font-bold text-3xl text-moss">{carbsLow}–{carbsHigh}g</div>
                  <div className="text-xs text-muted mt-1">carbs in first hour</div>
                </div>
                <div className="bg-white/60 rounded-xl p-4 text-center">
                  <div className="font-display font-bold text-3xl text-moss">{proteinRec.low}–{proteinRec.high}g</div>
                  <div className="text-xs text-muted mt-1">protein within 2 hrs</div>
                </div>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-xs font-mono text-muted mb-1">Daily protein target</div>
                <div className="font-display font-bold text-xl text-moss">{Math.round(1.6 * weightKg)}–{Math.round(2.2 * weightKg)}g</div>
                <div className="text-xs text-muted mt-0.5">spread across 4–5 meals throughout the day</div>
              </div>
            </div>

            {/* Protocol steps */}
            <div className="space-y-3">
              {protocol.map((step, i) => (
                <div key={i} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${priorityStyles[step.priority]}`}>
                      {step.window}
                    </span>
                    <h3 className="font-display font-semibold text-base">{step.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted">
                        <span className="text-moss font-mono flex-shrink-0 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Key supplements */}
            <div className="card">
              <h3 className="font-display font-semibold text-base mb-4">Key recovery supplements</h3>
              <div className="space-y-3">
                {[
                  { name: "Whey Protein Isolate", dose: `${proteinRec.low}–${proteinRec.high}g within 30 min`, verdict: "proven", note: "Fastest-absorbing protein with highest leucine content — triggers muscle protein synthesis" },
                  { name: "Creatine Monohydrate", dose: "3–5g daily", verdict: "proven", note: "Replenishes phosphocreatine stores. Daily dosing maximises saturation — timing doesn't matter much" },
                  { name: "Tart Cherry Extract", dose: "480mg anthocyanins or 30ml concentrate x2", verdict: "proven", note: "Reduces inflammation and DOMS. Take immediately post-workout and again before bed" },
                  { name: "Magnesium Glycinate", dose: "200–400mg before bed", verdict: "proven", note: "Supports deep sleep, muscle relaxation and 300+ enzymatic recovery processes" },
                  ...(workoutType === "strength" || workoutType === "mixed" ? [
                    { name: "Collagen + Vitamin C", dose: "10–15g collagen + 50mg Vit C pre-next session", verdict: "likely" as const, note: "Take 60 min before your next session — supports tendon and connective tissue repair" },
                  ] : []),
                  ...(workoutType === "endurance" || workoutType === "mixed" ? [
                    { name: "Omega-3 (EPA + DHA)", dose: "2–3g daily", verdict: "likely" as const, note: "Reduces systemic inflammation and supports MPS — best from quality fish oil" },
                  ] : []),
                ].map((supp, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-sand last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{supp.name}</span>
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${supp.verdict === "proven" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
                          {supp.verdict === "proven" ? "✓ Proven" : "~ Likely"}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted mb-1">{supp.dose}</div>
                      <p className="text-xs text-muted leading-relaxed">{supp.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to avoid */}
            <div className="card">
              <h3 className="font-display font-semibold text-base mb-4">What to avoid</h3>
              <div className="space-y-2">
                {[
                  { item: "Alcohol", reason: "Significantly blunts muscle protein synthesis — even moderate amounts reduce MPS by up to 37%" },
                  { item: "NSAIDs (ibuprofen) routinely", reason: "Blunts the inflammatory response needed for adaptation. Reserve for genuine injury, not soreness" },
                  { item: "Skipping post-workout nutrition", reason: "Even if not hungry — the 30-minute window matters most for glycogen resynthesis" },
                  ...(isUrgent ? [{ item: "Heavy fats or fibre before next session", reason: "Slow gastric emptying and can cause GI issues — keep meals lighter and easily digestible" }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-rust/5 rounded-xl border border-rust/10">
                    <span className="text-xs font-mono bg-rust/10 text-rust px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">Avoid</span>
                    <div>
                      <div className="font-medium text-sm mb-0.5">{item.item}</div>
                      <p className="text-xs text-muted leading-relaxed">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="card text-center py-8">
              <h3 className="font-display font-semibold mb-2">Find the right recovery products</h3>
              <p className="text-xs text-muted mb-4">Browse our Explore of protein, creatine and recovery supplements</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/products/protein" className="btn-primary text-sm">Browse protein</Link>
                <Link href="/products/recovery-and-sleep" className="btn-secondary text-sm">Browse recovery</Link>
                <Link href="/products/creatine" className="btn-secondary text-sm">Browse creatine</Link>
              </div>
            </div>

            <button onClick={() => setCalculated(false)} className="btn-secondary w-full justify-center flex">
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}