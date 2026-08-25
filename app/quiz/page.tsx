"use client";

import { useState } from "react";
import { PRODUCTS, Goal, Category } from "@/lib/products";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const GOALS: { id: Goal; label: string; desc: string }[] = [
  { id: "muscle", label: "Build muscle", desc: "Maximise hypertrophy & strength" },
  { id: "endurance", label: "Improve endurance", desc: "Boost stamina & aerobic output" },
  { id: "recovery", label: "Faster recovery", desc: "Reduce soreness & bounce back" },
  { id: "health", label: "General health", desc: "Everyday wellness & longevity" },
  { id: "sleep", label: "Better sleep", desc: "Recovery & sleep quality" },
  { id: "immunity", label: "Immunity", desc: "Immune system support" },
  { id: "gut health", label: "Gut health", desc: "Digestive health & microbiome support" },
];

const ACTIVITIES = [
  { id: "cycling", label: "Cycling", desc: "Road, gravel or MTB" },
  { id: "running", label: "Running", desc: "Road, trail or track" },
  { id: "triathlon", label: "Triathlon", desc: "Swim, bike, run" },
  { id: "gym", label: "Gym / Strength", desc: "Lifting and resistance training" },
  { id: "general", label: "General fitness", desc: "Mixed training and health" },
];

const FORMATS: { id: Category; label: string; desc: string }[] = [
  { id: "Energy Gel", label: "Energy Gels", desc: "Fast-acting, portable carbs" },
  { id: "Energy Chew", label: "Chews", desc: "Chewable energy on the go" },
  { id: "Carbohydrate Mix", label: "Drink / Carb Mixes", desc: "High-carb drink mixes" },
  { id: "Energy Bar", label: "Energy Bars", desc: "Solid food fuelling" },
  { id: "Hydration", label: "Hydration / Electrolytes", desc: "Salt and electrolyte products" },
];

const SUPPLEMENT_CATS = ["Supplement", "Supplement", "Creatine", "Protein", "Probiotic", "Sleep", "Recovery"];
const NUTRITION_CATS = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];

type RankedItem = { id: string; name: string; reason: string };

function renderProductRow(item: RankedItem, product: typeof PRODUCTS[0], i: number) {
  return (
    <div key={i} className="flex items-start gap-4 pb-4 border-b border-sand last:border-0 last:pb-0">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-moss/10 text-moss text-xs font-mono font-medium flex items-center justify-center mt-0.5">
        {i + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <BrandLogo
              logoDomain={product.logoDomain}
              logo={product.logo}
              brand={product.brand}
              imageEmoji={product.imageEmoji}
              logoSize={product.logoSize}
/>
            <div className="font-display font-semibold text-sm">{item.name}</div>
            <div className="text-xs font-mono text-muted">{product.category} · {product.brand}</div>
          </div>
          <span className="text-xs font-mono text-muted flex-shrink-0">${product.price}/mo</span>
        </div>
        <p className="text-xs text-muted mt-1 leading-relaxed">{item.reason}</p>
        <Link href={`/report/${product.id}`} className="text-xs text-moss underline underline-offset-2 mt-1 inline-block">
          View full report →
        </Link>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budget, setBudget] = useState(60);
  const [activities, setActivities] = useState<string[]>([]);
  const [formats, setFormats] = useState<Category[]>([]);
  const [showFuelling, setShowFuelling] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RankedItem[]>([]);
  const [done, setDone] = useState(false);

  const toggleGoal = (g: Goal) => {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const toggleActivity = (a: string) => {
    setActivities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const toggleFormat = (f: Category) => {
    setFormats((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const runQuiz = async () => {
    if (goals.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, budget, formats: formats.length > 0 ? formats : null }),
      });
      const data = await res.json();
      setResults(data.ranked ?? []);
      setDone(true);
    } catch {
      setResults([{ id: "", name: "Error", reason: "Could not generate ranking. Check your ANTHROPIC_API_KEY." }]);
      setDone(true);
    }
    setLoading(false);
  };

  const reset = () => {
    setDone(false);
    setGoals([]);
    setActivities([]);
    setFormats([]);
    setShowFuelling(null);
    setResults([]);
  };

  // Build stacks from results
  const allRanked = results
    .map((item) => ({ item, product: PRODUCTS.find((p) => p.id === item.id) }))
    .filter((x) => x.product);

  const dedupeByCategory = (items: typeof allRanked) => {
    const seen = new Set<string>();
    return items.filter(({ product }) => {
      if (!product || seen.has(product.category)) return false;
      seen.add(product.category);
      return true;
    });
  };

  const supplementStack = dedupeByCategory(
    allRanked.filter((x) => SUPPLEMENT_CATS.includes(x.product!.category))
  );
  const nutritionStack = dedupeByCategory(
    allRanked.filter((x) => NUTRITION_CATS.includes(x.product!.category))
  );
  const otherStack = allRanked.filter((x) =>
    !SUPPLEMENT_CATS.includes(x.product!.category) &&
    !NUTRITION_CATS.includes(x.product!.category)
  );

  const totalCost = [...supplementStack, ...nutritionStack]
    .reduce((a, { product }) => a + (product?.price ?? 0), 0);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">Pel<span className="text-moss">lo</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/compare" className="text-sm text-muted hover:text-ink transition-colors">Compare</Link>
            <Link href="/guides" className="text-sm text-muted hover:text-ink transition-colors">Guides</Link>
            <Link href="/query" className="text-sm text-muted hover:text-ink transition-colors">Query</Link><Link href="/ingredients" className="text-sm text-muted hover:text-ink transition-colors">Ingredients</Link><Link href="/graph" className="text-sm text-muted hover:text-ink transition-colors">Graph</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Find your perfect match</h1>
          <p className="text-muted">Tell us your goals and budget — we'll rank the best options for you.</p>
        </div>

        {/* Quiz form */}
        {!done && (
          <>
            {/* Goals */}
            <div className="card mb-4">
              <h2 className="font-display font-semibold mb-1">What are your goals?</h2>
              <p className="text-xs text-muted mb-4">Select all that apply</p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${goals.includes(g.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{g.label}</div>
                      <div className="text-xs text-muted">{g.desc}</div>
                    </div>
                    {goals.includes(g.id) && <span className="text-moss font-mono text-xs flex-shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="card mb-4">
              <h2 className="font-display font-semibold mb-4">Monthly budget</h2>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-muted">$20</span>
                <input type="range" min={20} max={150} step={5} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="flex-1 accent-moss" />
                <span className="text-sm text-muted">$150</span>
              </div>
              <div className="text-center font-display font-bold text-2xl text-moss">${budget}/mo</div>
            </div>

            {/* Fuelling */}
            <div className="card mb-6">
              <h2 className="font-display font-semibold mb-1">Are you fuelling for a sport?</h2>
              <p className="text-xs text-muted mb-4">Optional — helps us recommend the right product formats</p>

              {showFuelling === null && (
                <div className="flex gap-3">
                  <button onClick={() => setShowFuelling(true)} className="btn-primary text-sm flex-1">
                    Yes, add fuelling preferences
                  </button>
                  <button onClick={() => setShowFuelling(false)} className="btn-secondary text-sm flex-1">
                    Skip for now
                  </button>
                </div>
              )}

              {showFuelling === true && (
                <div>
                  <div className="mb-5">
                    <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Your sport</div>
                    <div className="space-y-2">
                      {ACTIVITIES.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => toggleActivity(a.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${activities.includes(a.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{a.label}</div>
                            <div className="text-xs text-muted">{a.desc}</div>
                          </div>
                          {activities.includes(a.id) && <span className="text-moss font-mono text-xs flex-shrink-0">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Preferred format</div>
                    <div className="space-y-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => toggleFormat(f.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formats.includes(f.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{f.label}</div>
                            <div className="text-xs text-muted">{f.desc}</div>
                          </div>
                          {formats.includes(f.id) && <span className="text-moss font-mono text-xs flex-shrink-0">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setShowFuelling(null)} className="text-xs text-muted underline underline-offset-2 mt-4">
                    Clear fuelling preferences
                  </button>
                </div>
              )}

              {showFuelling === false && (
                <div className="flex items-center justify-between bg-sand/40 rounded-xl px-4 py-3">
                  <span className="text-sm text-muted">Fuelling preferences skipped</span>
                  <button onClick={() => setShowFuelling(null)} className="text-xs text-moss underline underline-offset-2">
                    Add preferences
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={runQuiz}
              disabled={goals.length === 0 || loading}
              className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full" />Ranking products...</>
                : "Get my recommendations →"}
            </button>
          </>
        )}

        {/* Results */}
        {done && (
          <div className="mt-8">
            <h2 className="font-display font-semibold text-lg mb-2">Your personalised recommendations</h2>
            <p className="text-xs text-muted mb-6">Based on your goals, budget and format preferences</p>

            {/* Panel 1 — Daily supplements */}
            <div className="card mb-4">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Panel 1</div>
              <h3 className="font-display font-bold text-base mb-4">Daily supplements</h3>
              {supplementStack.length > 0 ? (
                <div className="space-y-4">
                  {supplementStack.map(({ item, product }, i) =>
                    product ? renderProductRow(item, product, i) : null
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">No supplement recommendations for your current goals and budget.</p>
              )}
            </div>

            {/* Panel 2 — During workout nutrition */}
            <div className="card mb-4">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Panel 2</div>
              <h3 className="font-display font-bold text-base mb-4">During workout nutrition</h3>
              {nutritionStack.length > 0 ? (
                <div className="space-y-4">
                  {nutritionStack.map(({ item, product }, i) =>
                    product ? renderProductRow(item, product, i) : null
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted mb-3">No specific format selected — here are our top-rated options:</p>
                  <div className="space-y-2">
                    {["Energy Gel", "Energy Chew", "Carbohydrate Mix"].map((cat) => {
                      const top = PRODUCTS
                        .filter((p) => p.category === cat && goals.some((g) => p.goals.includes(g)))
                        .sort((a, b) => b.rating - a.rating)[0];
                      return top ? (
                        <Link key={cat} href={`/report/${top.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-xl border border-sand hover:border-muted transition-all bg-white/40 mb-2">
                            <div>
                              <div className="text-xs font-mono text-muted mb-0.5">{cat}</div>
                              <div className="text-sm font-medium">{top.name} — {top.brand}</div>
                            </div>
                            <span className="text-xs text-moss">View →</span>
                          </div>
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Panel 3 — Other recommendations */}
            {(otherStack.length > 0 || formats.length > 0) && (
              <div className="card mb-4">
                <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Panel 3</div>
                <h3 className="font-display font-bold text-base mb-4">Other recommendations</h3>
                {otherStack.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {otherStack.map(({ item, product }, i) =>
                      product ? renderProductRow(item, product, i) : null
                    )}
                  </div>
                )}
                {formats.length > 0 && (
                  <div className="space-y-2">
                    {FORMATS.filter((f) => !formats.includes(f.id)).map((f) => {
                      const top = PRODUCTS
                        .filter((p) => p.category === f.id && goals.some((g) => p.goals.includes(g)))
                        .sort((a, b) => b.rating - a.rating)[0];
                      return top ? (
                        <Link key={f.id} href={`/products/${f.id.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`}>
                          <div className="flex items-center justify-between p-3 rounded-xl border border-sand hover:border-muted transition-all bg-white/40 mb-2">
                            <div>
                              <div className="text-xs font-mono text-muted mb-0.5">{f.label}</div>
                              <div className="text-sm font-medium">Top pick: {top.name}</div>
                            </div>
                            <span className="text-xs text-moss">Browse →</span>
                          </div>
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Cost summary */}
            {(supplementStack.length > 0 || nutritionStack.length > 0) && (
              <div className="card bg-moss/5 border-moss/20 mb-4">
                <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Your complete stack</div>
                <div className="space-y-2 mb-3">
                  {[...supplementStack, ...nutritionStack].map(({ product }, i) => product && (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {product.logo && <img src={product.logo} alt={product.brand} className="h-4 w-auto object-contain" />}
                        <span className="text-muted text-xs">{product.name}</span>
                      </div>
                      <span className="font-mono text-xs text-muted">${product.price}/mo</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-sand/60 flex items-center justify-between">
                  <div className="text-xs text-muted">Total estimated cost</div>
                  <div className="font-display font-bold text-lg text-moss">${totalCost}/mo</div>
                </div>
              </div>
            )}

            <button onClick={reset} className="btn-secondary mt-2 w-full justify-center flex">
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}