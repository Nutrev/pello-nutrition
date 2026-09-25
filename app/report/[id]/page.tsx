"use client";

import { useState, useEffect } from "react";
import { PRODUCTS, Product } from "@/lib/products";
import Link from "next/link";
import Logo from "@/components/Logo";
import ReviewSection from "@/components/ReviewSection";
import BrandLogo from "@/components/BrandLogo";
import IngredientFlags from "@/components/IngredientFlags";
import { calculatePelloScore } from "@/lib/fulens-score";
import { pricePerServing as calcPricePerServing } from "@/lib/servings";
import FulensScoreDisplay from "@/components/FulensScore";
import PriceAlert from "@/components/PriceAlert";

function ScoreCircle({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#2D4A2D" : score >= 70 ? "#C8860A" : "#B84C2E";
  return (
    <svg width="56" height="56" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#E8E0D0" strokeWidth="5" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 26 26)" />
      <text x="26" y="31" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1A1A1A" fontFamily="DM Mono">{score}</text>
    </svg>
  );
}

function getProsAndCons(sentiment: Record<string, number>, ingredients: { verdict: string; name: string }[]) {
  const pros: string[] = [];
  const cons: string[] = [];

  Object.entries(sentiment).forEach(([key, val]) => {
    if (val >= 85) pros.push(`Strong ${key.toLowerCase()} scores (${val}%)`);
    else if (val < 60) cons.push(`Lower ${key.toLowerCase()} scores (${val}%)`);
  });

  const provenCount = ingredients.filter((i) => i.verdict === "proven").length;
  const disputedCount = ingredients.filter((i) => i.verdict === "disputed").length;
  if (provenCount >= 2) pros.push(`${provenCount} science-backed ingredients`);
  if (disputedCount > 0) cons.push(`${disputedCount} disputed ingredient${disputedCount > 1 ? "s" : ""} — check label`);

  return { pros: pros.slice(0, 4), cons: cons.slice(0, 4) };
}

const SERVING_UNIT: Record<string, string> = {
  "Energy Gel": "gel", "Energy Chew": "pack", "Energy Bar": "bar", "Probiotic": "capsule",
};

function getPricePerServing(product: Product): string {
  return `$${calcPricePerServing(product).toFixed(2)} per ${SERVING_UNIT[product.category] ?? "serving"}`;
}

function getBestForStatement(product: typeof PRODUCTS[0]): string {
  const goalMap: Record<string, string> = {
    muscle: "building muscle",
    endurance: "endurance athletes",
    recovery: "post-workout recovery",
    health: "general health",
    sleep: "sleep and recovery",
    immunity: "immune support",
    "gut health": "gut health",
  };
  const goalStr = product.goals.map((g) => goalMap[g] ?? g).join(" and ");
  return `Best for: ${goalStr}`;
}

function getDisputedIngredients(ingredients: typeof PRODUCTS[0]["ingredients"]) {
  return ingredients.filter((i) => i.verdict === "disputed");
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const PelloScore = product ? calculatePelloScore({
    category: product.category,
    ingredients: product.ingredients.map((i) => ({
      name: i.name,
      verdict: i.verdict as "proven" | "likely" | "disputed",
      dose: i.dose,
    })),
    hasProprietaryBlend: false,
    isCleanLabel: true,
    certifications: [],
    isBatchTested: false,
    bannedSubstanceTested: false,
    pricePerServing: calcPricePerServing(product),
    carbsPerServing: undefined,
    proteinPerServing: undefined,
    sodiumPerServing: undefined,
    isVegan: true,
    isGlutenFree: true,
    allergens: [],
    sentiment: product.sentiment,
    reviewCount: product.reviewCount,
    rating: product.rating,
    transparencyScore: product.transparencyScore,
  }) : null;

  useEffect(() => {
    if (!product) return;
    const key = "Pello_recently_viewed";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const updated = [product.id, ...existing.filter((id) => id !== product.id)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
  }, [product?.id]);

  useEffect(() => {
  const existing = JSON.parse(localStorage.getItem("Pello_recently_viewed") ?? "[]") as string[];
  setRecentIds(existing.filter((id) => id !== product?.id).slice(0, 4));
}, [product?.id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} by ${product.brand} | Pello`;
    }
  }, [product]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">404</div>
        <p className="text-muted mb-4">Product not found</p>
        <Link href="/" className="btn-primary">Back to browse</Link>
      </div>
    </div>
  );

  const generateSummary = async () => {
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.summary) {
        setSummary(res.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : "Couldn't generate a summary right now. Please try again.");
      } else {
        setSummary(data.summary);
        setGenerated(true);
      }
    } catch {
      setSummary("Couldn't generate a summary right now. Please try again.");
    }
    setLoading(false);
  };

  const pricePerServing = getPricePerServing(product);
  const { pros, cons } = getProsAndCons(product.sentiment, product.ingredients);
  const bestFor = getBestForStatement(product);
  const disputedIngredients = getDisputedIngredients(product.ingredients);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      <Logo />
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
<Link href="/search" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Search</Link>
            <Link href="/search" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Search</Link>
      
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Explore</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Ingredient warning banner */}
        {disputedIngredients.length > 0 && (
          <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
            <span className="text-amber font-mono text-xs flex-shrink-0 mt-0.5">⚠ Note</span>
            <p className="text-xs text-muted leading-relaxed">
              This product contains {disputedIngredients.length} disputed ingredient{disputedIngredients.length > 1 ? "s" : ""}:{" "}
              <strong>{disputedIngredients.map((i) => i.name).join(", ")}</strong>.{" "}
              Evidence is mixed or doses are undisclosed — see the ingredient science section below for details.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
          <BrandLogo
            logoDomain={product.logoDomain}
            logo={product.logo}
            brand={product.brand} size="lg" />
          <div className="flex-1">
            <div className="text-sm text-muted mb-1">{product.brand}</div>
            <h1 className="font-display font-bold text-3xl tracking-tight mb-2">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="flex text-amber text-lg">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</div>
              <span className="font-mono text-sm text-muted">{product.rating} / 5</span>
              <span className="text-muted">·</span>
              <span className="text-sm text-muted">{product.reviewCount.toLocaleString()} reviews</span>
              <span className="text-xs bg-moss/10 text-moss font-mono px-2 py-0.5 rounded-md">{product.category}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display font-bold text-xl">${product.price}/mo</span>
              {pricePerServing && (
                <span className="text-base font-mono font-medium text-ink">· {pricePerServing}</span>
              )}
              <PriceAlert
                 productId={product.id}
                 productName={product.name}
                currentPrice={product.price}
              />
            </div>
            <div className="inline-flex items-center gap-2 bg-moss/10 text-moss px-3 py-1.5 rounded-lg mt-1">
              <span className="text-xs font-mono font-medium">{bestFor}</span>
            </div>
          </div>
         <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/compare?ids=${product.id}`}
              className="btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              Compare this product
          </Link>
          </div>
        </div>

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card bg-moss/5 border-moss/20">
              <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">Strengths</div>
              <ul className="space-y-2">
                {pros.length > 0 ? pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-moss flex-shrink-0 mt-0.5">✓</span>
                    {pro}
                  </li>
                )) : <li className="text-xs text-muted">Insufficient data</li>}
              </ul>
            </div>
            <div className="card bg-rust/5 border-rust/20">
              <div className="text-xs font-mono text-rust uppercase tracking-widest mb-3">Watch out for</div>
              <ul className="space-y-2">
                {cons.length > 0 ? cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-rust flex-shrink-0 mt-0.5">→</span>
                    {con}
                  </li>
                )) : <li className="text-xs text-muted">No major concerns identified</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { val: product.reviewCount.toLocaleString(), label: "Reviews analyzed" },
            { val: product.sources.length, label: "Data sources" },
            { val: product.sources.find(s => s.name === "PubMed")?.count ?? 0, label: "Studies cited" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="font-display font-bold text-2xl">{s.val}</div>
              <div className="text-muted text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pello Score */}
          {PelloScore && (
            <div className="lg:col-span-2">
             <FulensScoreDisplay score={PelloScore} />
            </div>
          )}
          {/* AI Summary */}
          <div className="card lg:col-span-2">
            <h2 className="font-display font-semibold text-base mb-3">AI Summary</h2>
            {summary ? (
              <div>
                <p className="text-sm leading-relaxed">{summary}</p>
                <div className="mt-3 text-xs text-muted font-mono">
                  AI-generated · {product.reviewCount.toLocaleString()} reviews · {product.sources.find(s => s.name === "PubMed")?.count ?? 0} studies
                </div>
              </div>
            ) : loading ? (
              <div className="bg-sand/40 rounded-xl p-4 text-center text-sm text-muted">
                Reading {product.reviewCount.toLocaleString()} reviews across {product.sources.length} sources...
              </div>
            ) : (
              <div className="bg-sand/30 border border-sand rounded-xl p-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="font-display font-semibold text-base mb-1">
                      Get an AI breakdown of this product
                    </div>
                    <div className="text-sm text-muted mb-1">
                      Based on {product.reviewCount.toLocaleString()} reviews across {product.sources.length} sources
                      {product.sources.find(s => s.name === "PubMed") &&
                        ` · ${product.sources.find(s => s.name === "PubMed")?.count} peer-reviewed studies`}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {["Overall verdict", "Key strengths", "Weaknesses", "Who it's best for"].map((label) => (
                        <div key={label} className="text-xs text-muted font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-moss inline-block" />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={generateSummary} className="btn-primary whitespace-nowrap flex-shrink-0">
                    Generate AI summary
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sentiment */}
          <div className="card">
            <h2 className="font-display font-semibold text-base mb-4">Sentiment breakdown</h2>
            <div className="space-y-3">
              {Object.entries(product.sentiment).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{key}</span>
                    <span className="font-mono font-medium">{val}%</span>
                  </div>
                  <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: val >= 80 ? "#2D4A2D" : val >= 60 ? "#C8860A" : "#B84C2E" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="card">
            <h2 className="font-display font-semibold text-base mb-1">Ingredient science</h2>
            <p className="text-xs text-muted mb-4">Cross-referenced with PubMed & Examine.com</p>
            <IngredientFlags ingredientNames={product.ingredients.map((i) => i.name)} />
            <div className="space-y-3">
              {product.ingredients.map((ing, i) => (
                <div key={i} className="pb-3 border-b border-sand last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{ing.name}</span>
                      {ing.dose && <span className="text-xs font-mono text-muted ml-2">{ing.dose}</span>}
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md flex-shrink-0 ${
                      ing.verdict === "proven" ? "bg-moss/10 text-moss" :
                      ing.verdict === "likely" ? "bg-amber/10 text-amber" :
                      "bg-rust/10 text-rust"
                    }`}>
                      {ing.verdict === "proven" ? "✓ Proven" : ing.verdict === "likely" ? "~ Likely" : "⚠ Disputed"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{ing.note}</p>
                  <div className="flex gap-2 mt-1.5">
                    {ing.pubmedUrl && <a href={ing.pubmedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">PubMed →</a>}
                    {ing.examineUrl && <a href={ing.examineUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">Examine →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparency */}
          <div className="card lg:col-span-2">
            <h2 className="font-display font-semibold text-base mb-4">Transparency & Sources</h2>
            <div className="flex items-center gap-4 mb-5 p-4 bg-sand/40 rounded-xl">
              <ScoreCircle score={product.transparencyScore} />
              <div>
                <div className="lg:col-span-2">
            </div>
            <div className="lg:col-span-2">
              </div>
                <div className="font-semibold">
                  {product.transparencyScore >= 85 ? "High transparency" : product.transparencyScore >= 70 ? "Good transparency" : "Moderate transparency"}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {product.sources.length} sources · {product.reviewCount.toLocaleString()} reviews · {product.sources.find(s => s.name === "PubMed")?.count ?? 0} peer-reviewed studies
                </div>
              </div>
            </div>
            <div className="divide-y divide-sand">
              {product.sources.map((src, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{src.icon} {src.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">{src.count.toLocaleString()} {src.unit}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${src.credibility === "high" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
                      {src.credibility}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* You might also like */}
      {(() => {
        const similar = PRODUCTS
          .filter((p) => p.category === product.category && p.id !== product.id)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        return similar.length > 0 ? (
          <div className="max-w-5xl mx-auto px-6 mt-6">
            <h2 className="font-display font-semibold text-base mb-4">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.map((p) => (
                <Link key={p.id} href={`/report/${p.id}`}>
                  <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} />
                      <span className="text-xs font-mono text-muted">{p.rating} ★</span>
                    </div>
                    <div className="text-xs text-muted mb-0.5">{p.brand}</div>
                    <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                    <div className="text-xs font-mono text-muted mt-1">${p.price}/mo</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* Recently viewed */}
      {recentIds.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-6 mb-10">
          <h2 className="font-display font-semibold text-base mb-4">Recently viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentIds
              .map((id) => PRODUCTS.find((p) => p.id === id))
              .filter(Boolean)
              .map((p) => p && (
                <Link key={p.id} href={`/report/${p.id}`}>
                  <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="sm" className="mb-2" />
                    <div className="text-xs text-muted mb-0.5">{p.brand}</div>
                    <div className="font-display font-semibold text-xs group-hover:text-moss transition-colors leading-tight">{p.name}</div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      <ReviewSection productId={product.id} category={product.category} />
    </div>
  );
}