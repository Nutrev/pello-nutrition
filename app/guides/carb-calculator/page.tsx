"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const INTENSITY_MULTIPLIERS = {
  easy: { label: "Easy / Recovery", desc: "Conversational pace, Z1-Z2", carbs: 30, sweat: 0.5 },
  moderate: { label: "Moderate", desc: "Steady effort, Z2-Z3", carbs: 50, sweat: 0.8 },
  hard: { label: "Hard", desc: "Threshold / tempo, Z3-Z4", carbs: 70, sweat: 1.1 },
  race: { label: "Race pace", desc: "Maximum effort, Z4-Z5", carbs: 90, sweat: 1.4 },
};

const DURATION_OPTIONS = [
  { value: 0.5, label: "30 min" },
  { value: 0.75, label: "45 min" },
  { value: 1, label: "1 hour" },
  { value: 1.5, label: "1.5 hours" },
  { value: 2, label: "2 hours" },
  { value: 2.5, label: "2.5 hours" },
  { value: 3, label: "3 hours" },
  { value: 4, label: "4 hours" },
  { value: 5, label: "5+ hours" },
];

const FORMATS = [
  {
    id: "gel",
    label: "Energy Gels",
    desc: "Fast-acting, portable",
    carbsPerUnit: 25,
    unit: "gel",
    unitPlural: "gels",
    example: "Maurten Gel 100, SiS GO Isotonic",
    pros: "Convenient, no mixing, precise dosing",
    cons: "Can cause GI issues at high volumes, sweet fatigue",
  },
  {
    id: "chew",
    label: "Energy Chews",
    desc: "Chewable, slower release",
    carbsPerUnit: 40,
    unit: "pack",
    unitPlural: "packs",
    example: "Clif Bloks, SiS Beta Fuel Chews",
    pros: "Easier on stomach, satisfying to eat",
    cons: "Harder to consume at high intensity",
  },
  {
    id: "drink",
    label: "Carb Drink Mix",
    desc: "Hydration + carbs combined",
    carbsPerUnit: 60,
    unit: "scoop",
    unitPlural: "scoops",
    example: "Maurten Drink Mix 320, SiS Beta Fuel",
    pros: "Combines fuelling and hydration, easy to absorb",
    cons: "Requires carrying liquid, less portable",
  },
  {
    id: "bar",
    label: "Energy Bars",
    desc: "Solid food, slower digestion",
    carbsPerUnit: 40,
    unit: "bar",
    unitPlural: "bars",
    example: "Maurten Solid 160, Cadence Core 40",
    pros: "Real food feeling, good for lower intensities",
    cons: "Harder to chew at high effort, slower absorption",
  },
];

type Intensity = keyof typeof INTENSITY_MULTIPLIERS;
type FormatId = typeof FORMATS[number]["id"];

export default function CarbCalculatorPage() {
  const [duration, setDuration] = useState(2);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [selectedFormats, setSelectedFormats] = useState<FormatId[]>([]);
  const [calculated, setCalculated] = useState(false);

  const weightKg = unit === "lbs" ? weight * 0.453592 : weight;
  const intensityData = INTENSITY_MULTIPLIERS[intensity];

  const carbsPerHour = intensityData.carbs;
  const totalCarbs = Math.round(carbsPerHour * duration);
  const carbsNeeded = duration < 1 ? Math.round(totalCarbs * 0.5) : totalCarbs;
  const needsCarbFuelling = duration >= 1;

  const fluidPerHour = Math.round(intensityData.sweat * weightKg * 10) / 10;
  const totalFluid = Math.round(fluidPerHour * duration * 10) / 10;
  const sodiumPerHour = Math.round(intensityData.sweat * 500);
  const totalSodium = Math.round(sodiumPerHour * duration);

  const toggleFormat = (id: FormatId) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    setCalculated(false);
  };

  // Calculate carbs split evenly across selected formats
  const formatBreakdown = selectedFormats.length > 0
    ? selectedFormats.map((fid) => {
        const format = FORMATS.find((f) => f.id === fid)!;
        const carbsFromThisFormat = Math.round(carbsNeeded / selectedFormats.length);
        const unitsNeeded = Math.ceil(carbsFromThisFormat / format.carbsPerUnit);
        const actualCarbs = unitsNeeded * format.carbsPerUnit;
        return { format, carbsFromThisFormat, unitsNeeded, actualCarbs };
      })
    : FORMATS.map((format) => {
        const unitsNeeded = Math.ceil(carbsNeeded / format.carbsPerUnit);
        return { format, carbsFromThisFormat: carbsNeeded, unitsNeeded, actualCarbs: unitsNeeded * format.carbsPerUnit };
      });

  const totalActualCarbs = selectedFormats.length > 0
    ? formatBreakdown.reduce((a, b) => a + b.actualCarbs, 0)
    : null;

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
      <Link href="/Explore" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Explore</Link>
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
            Calculator
          </div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Carb Calculator</h1>
          <p className="text-muted leading-relaxed">
            Calculate exactly how many carbohydrates you need — then see how to hit that target with your preferred product formats.
          </p>
        </div>

        <div className="space-y-4 mb-8">

          {/* Duration */}
          <div className="card">
            <h2 className="font-display font-semibold mb-4">Workout duration</h2>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setDuration(d.value); setCalculated(false); }}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-mono transition-all ${duration === d.value ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="card">
            <h2 className="font-display font-semibold mb-4">Intensity</h2>
            <div className="space-y-2">
              {(Object.entries(INTENSITY_MULTIPLIERS) as [Intensity, typeof INTENSITY_MULTIPLIERS[Intensity]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setIntensity(key); setCalculated(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${intensity === key ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                >
                  <div>
                    <div className="font-medium text-sm">{val.label}</div>
                    <div className="text-xs text-muted">{val.desc}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-mono text-sm font-medium text-moss">{val.carbs}g</div>
                    <div className="text-xs text-muted">carbs/hr</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Body weight */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Body weight</h2>
              <div className="flex gap-1 bg-sand rounded-lg p-0.5">
                <button onClick={() => setUnit("kg")} className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${unit === "kg" ? "bg-white text-ink" : "text-muted"}`}>kg</button>
                <button onClick={() => setUnit("lbs")} className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${unit === "lbs" ? "bg-white text-ink" : "text-muted"}`}>lbs</button>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted">{unit === "kg" ? "40kg" : "88lbs"}</span>
              <input
                type="range"
                min={unit === "kg" ? 40 : 88}
                max={unit === "kg" ? 120 : 264}
                step={unit === "kg" ? 1 : 2}
                value={weight}
                onChange={(e) => { setWeight(Number(e.target.value)); setCalculated(false); }}
                className="flex-1 accent-moss"
              />
              <span className="text-sm text-muted">{unit === "kg" ? "120kg" : "264lbs"}</span>
            </div>
            <div className="text-center font-display font-bold text-2xl text-moss">{weight}{unit}</div>
          </div>

          {/* Format selector */}
          <div className="card">
            <h2 className="font-display font-semibold mb-1">Preferred carb formats</h2>
            <p className="text-xs text-muted mb-4">Select all you use — we'll split your carb target across them. Leave blank to see all options.</p>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFormat(f.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedFormats.includes(f.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{f.label}</span>
                      <span className="text-xs font-mono text-muted">{f.carbsPerUnit}g per {f.unit}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">{f.example}</div>
                  </div>
                  {selectedFormats.includes(f.id) && (
                    <span className="text-moss font-mono text-xs flex-shrink-0 mt-0.5">✓</span>
                  )}
                </button>
              ))}
            </div>
            {selectedFormats.length > 1 && (
              <p className="text-xs text-muted mt-3 bg-sand/40 rounded-xl px-3 py-2">
                Carbs will be split equally across your {selectedFormats.length} selected formats
              </p>
            )}
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={() => setCalculated(true)}
          className="btn-primary w-full justify-center flex mb-8"
        >
          Calculate my fuelling plan
        </button>

        {/* Results */}
        {calculated && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Your fuelling plan</div>

            {/* Main output */}
            <div className="card bg-moss/5 border-moss/20">
              <h3 className="font-display font-bold text-xl mb-5">Carbohydrate targets</h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-white/60 rounded-xl p-4 text-center">
                  <div className="font-display font-bold text-4xl text-moss">{carbsPerHour}g</div>
                  <div className="text-xs text-muted mt-1">carbs per hour</div>
                </div>
                <div className="bg-white/60 rounded-xl p-4 text-center">
                  <div className="font-display font-bold text-4xl text-moss">{carbsNeeded}g</div>
                  <div className="text-xs text-muted mt-1">total for session</div>
                </div>
              </div>

              {!needsCarbFuelling ? (
                <div className="bg-amber/10 border border-amber/20 rounded-xl p-4">
                  <p className="text-sm text-amber font-medium mb-1">Short session — carbs optional</p>
                  <p className="text-xs text-muted leading-relaxed">
                    For sessions under 60 minutes, glycogen stores are usually sufficient. Focus on hydration. If you feel depleted, a small carb hit won't hurt.
                  </p>
                </div>
              ) : (
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-xs text-muted leading-relaxed">
                    Start fuelling at <strong>30–45 minutes</strong> in — don't wait until you feel hungry. Aim for <strong>{carbsPerHour}g per hour</strong>. Use a 2:1 glucose-to-fructose product for anything above 60g/hr.
                  </p>
                </div>
              )}
            </div>

            {/* Format breakdown */}
            {needsCarbFuelling && (
              <div className="card">
                <h3 className="font-display font-semibold text-base mb-1">
                  {selectedFormats.length > 0 ? "Your format breakdown" : "Product equivalents"}
                </h3>
                <p className="text-xs text-muted mb-4">
                  {selectedFormats.length > 0
                    ? `How to hit your ${carbsNeeded}g target across your selected formats`
                    : `How many of each product type you'd need to hit ${carbsNeeded}g`}
                </p>

                {selectedFormats.length > 0 ? (
                  <div className="space-y-3">
                    {formatBreakdown.map(({ format, carbsFromThisFormat, unitsNeeded, actualCarbs }) => (
                      <div key={format.id} className="bg-sand/30 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-display font-semibold text-sm">{format.label}</div>
                            <div className="text-xs text-muted">{format.example}</div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="font-mono font-bold text-moss text-lg">{unitsNeeded} {unitsNeeded === 1 ? format.unit : format.unitPlural}</div>
                            <div className="text-xs text-muted">{actualCarbs}g carbs</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted mt-2 pt-2 border-t border-sand">
                          <span className="text-moss">Pros:</span> {format.pros}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          <span className="text-rust">Watch out:</span> {format.cons}
                        </div>
                      </div>
                    ))}
                    {totalActualCarbs && totalActualCarbs !== carbsNeeded && (
                      <div className="bg-amber/10 rounded-xl px-4 py-3">
                        <p className="text-xs text-amber">
                          Due to product sizing, your actual intake will be <strong>{totalActualCarbs}g</strong> — slightly {totalActualCarbs > carbsNeeded ? "above" : "below"} your target of {carbsNeeded}g. This is fine.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formatBreakdown.map(({ format, unitsNeeded }) => (
                      <div key={format.id} className="flex items-center justify-between pb-3 border-b border-sand last:border-0 last:pb-0">
                        <div>
                          <div className="text-sm font-medium">{format.label}</div>
                          <div className="text-xs text-muted">{format.example}</div>
                        </div>
                        <div className="font-mono font-bold text-moss text-right flex-shrink-0 ml-4">
                          ~{unitsNeeded} {unitsNeeded === 1 ? format.unit : format.unitPlural}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Per hour breakdown */}
            {needsCarbFuelling && selectedFormats.length > 0 && duration >= 1 && (
              <div className="card">
                <h3 className="font-display font-semibold text-base mb-4">Per hour guide</h3>
                <div className="space-y-2">
                  {formatBreakdown.map(({ format, unitsNeeded }) => {
                    const perHour = Math.ceil(unitsNeeded / duration);
                    return (
                      <div key={format.id} className="flex items-center justify-between py-2 border-b border-sand last:border-0">
                        <span className="text-sm text-muted">{format.label}</span>
                        <span className="font-mono text-sm font-medium">
                          {perHour} {perHour === 1 ? format.unit : format.unitPlural} / hr
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hydration */}
            <div className="card">
              <h3 className="font-display font-semibold text-base mb-4">Hydration needs</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-sand/40 rounded-xl">
                  <div className="font-display font-bold text-2xl">{fluidPerHour}L</div>
                  <div className="text-xs text-muted mt-1">fluid per hour</div>
                </div>
                <div className="text-center p-3 bg-sand/40 rounded-xl">
                  <div className="font-display font-bold text-2xl">{totalFluid}L</div>
                  <div className="text-xs text-muted mt-1">total fluid</div>
                </div>
                <div className="text-center p-3 bg-sand/40 rounded-xl">
                  <div className="font-display font-bold text-2xl">{sodiumPerHour}mg</div>
                  <div className="text-xs text-muted mt-1">sodium per hour</div>
                </div>
              </div>
              <p className="text-xs text-muted mt-3 leading-relaxed">
                Estimates based on {intensity} intensity. Hot or humid conditions increase needs by 20–50%. Drink to thirst rather than forcing fluid intake.
              </p>
            </div>

            {/* Science note */}
            <div className="card bg-sand/30">
              <h3 className="font-display font-semibold text-sm mb-2">The science</h3>
              <p className="text-xs text-muted leading-relaxed mb-2">
                The gut absorbs up to <strong>60g/hr</strong> from a single carb source. Using a <strong>2:1 glucose-to-fructose ratio</strong> activates a second transporter, raising the ceiling to <strong>90g/hr</strong> — the basis of modern high-carb fuelling products like Maurten, SiS Beta Fuel and Skratch Super High-Carb.
              </p>
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=carbohydrate+oxidation+endurance+exercise" target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">
                View research on PubMed →
              </a>
            </div>

            {/* CTA */}
            <div className="card text-center py-8">
              <h3 className="font-display font-semibold mb-2">Find the right products</h3>
              <p className="text-xs text-muted mb-4">Browse our Explore to find products that hit your targets</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/products/energy-gel" className="btn-primary text-sm">Energy gels</Link>
                <Link href="/products/carbohydrate-mix" className="btn-secondary text-sm">Carb mixes</Link>
                <Link href="/products/energy-chew" className="btn-secondary text-sm">Chews</Link>
              </div>
            </div>

            <button onClick={() => setCalculated(false)} className="btn-secondary w-full justify-center flex">
              Recalculate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}