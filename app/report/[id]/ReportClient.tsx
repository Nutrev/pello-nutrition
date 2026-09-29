"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/products";
import type { ProductSummary } from "@/lib/catalog-types";
import Link from "next/link";
import ReviewSection, { getAttributesForCategory } from "@/components/ReviewSection";
import type { AttributeAverages } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";
import ProductActions from "@/components/account/ProductActions";
import { PRICE_POSITION_LABEL, PRICE_POSITION_STYLE, type Brand } from "@/lib/brand-types";
import IngredientFlags from "@/components/IngredientFlags";
import { productPelloScore } from "@/lib/product-score";
import { pricePerServing as calcPricePerServing, servingsPerContainer, formatPrice } from "@/lib/servings";
import { productNutrition } from "@/lib/nutrition";
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
      <text x="26" y="31" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1A1A1A">{score}</text>
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
  "Energy Gel": "gel", "Energy Chew": "pack", "Energy Bar": "bar",
};

// "1 stick pack (4g)" -> "stick pack". Only used for single-unit servings, so "1/2 bar" isn't shown as "per bar".
function servingUnit(product: Product): string {
  const m = product.servingSize?.match(/^\s*1\s+([a-z][a-z ]*?)\s*(?:\(|$)/i);
  return m ? m[1].toLowerCase() : SERVING_UNIT[product.category] ?? "serving";
}

function getPricePerServing(product: Product): string {
  return `$${calcPricePerServing(product).toFixed(2)} per ${servingUnit(product)}`;
}

// What the product is used for, from its goals (for supplements, The Feed's classification).
// Empty when no goal is known.
function getBestForStatement(product: Product): string {
  const goalMap: Record<string, string> = {
    muscle: "building muscle",
    endurance: "endurance athletes",
    recovery: "post-workout recovery",
    health: "general health",
    sleep: "sleep and recovery",
    immunity: "immune support",
    "gut health": "gut health",
  };
  if (product.goals.length === 0) return "";
  const goalStr = product.goals.map((g) => goalMap[g] ?? g).join(" and ");
  return `Used for: ${goalStr}`;
}

function getDisputedIngredients(ingredients: Product["ingredients"]) {
  return ingredients.filter((i) => i.verdict === "disputed");
}

// Just enough to show a product in the "Recently viewed" strip.
export type DirectoryEntry = Pick<ProductSummary, "id" | "name" | "brand" | "logo" | "logoDomain">;

// The product's brand, for the brand card under the header.
export interface ReportBrand extends Pick<Brand, "slug" | "name" | "founded" | "hq" | "pricePosition" | "productCount"> {
  line: string;  // one sentence about the brand
}

interface ReportClientProps {
  product: Product;
  similar: ProductSummary[];
  directory: DirectoryEntry[];
  brand: ReportBrand;
}

export default function ReportClient({ product, similar: similarProducts, directory, brand }: ReportClientProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  // Pello community reviews (loaded by ReviewSection); null until they've loaded.
  const [community, setCommunity] = useState<{ count: number; averages: AttributeAverages | null } | null>(null);
  const onReviewsLoaded = useCallback((count: number, averages: AttributeAverages | null) => setCommunity({ count, averages }), []);
  const [variantId, setVariantId] = useState(product.defaultVariantId ?? product.variants?.[0]?.id);

  const nutrition = product ? productNutrition(product) : null;
  const PelloScore = productPelloScore(product);

  useEffect(() => {
    const key = "Pello_recently_viewed";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const updated = [product.id, ...existing.filter((id) => id !== product.id)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
  }, [product.id]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("Pello_recently_viewed") ?? "[]") as string[];
    setRecentIds(existing.filter((id) => id !== product.id).slice(0, 4));
  }, [product.id]);

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

  // The selected variant (e.g. a strength) overrides the product's price, servings, sodium and rating.
  const variant = product.variants?.find((v) => v.id === variantId);
  const shown: Product = variant ? { ...product, ...variant, id: product.id } : product;
  const pricePerServing = getPricePerServing(shown);
  const { pros, cons } = getProsAndCons(product.sentiment, product.ingredients);
  const bestFor = getBestForStatement(product);
  const disputedIngredients = getDisputedIngredients(product.ingredients);

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Ingredient warning banner */}
        {disputedIngredients.length > 0 && (
          <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
            <span className="text-amber text-xs flex-shrink-0 mt-0.5">⚠ Note</span>
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
              {shown.reviewCount > 0 ? (
                <>
                  <div className="flex text-amber text-lg">{"★".repeat(Math.round(shown.rating))}{"☆".repeat(5 - Math.round(shown.rating))}</div>
                  <span className="text-sm text-muted">{shown.rating} / 5</span>
                  <span className="text-muted">·</span>
                  <span className="text-sm text-muted">{shown.reviewCount.toLocaleString()} reviews{variant ? ` for ${variant.label}` : ""}</span>
                </>
              ) : (
                <span className="text-sm text-muted">No reviews yet</span>
              )}
              <span className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{product.category}</span>
            </div>
            {product.variants && product.variants.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-3" role="radiogroup" aria-label="Choose a version">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={v.id === variantId}
                    onClick={() => setVariantId(v.id)}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                      v.id === variantId ? "border-moss bg-moss/10 text-moss font-medium" : "border-sand text-muted hover:border-muted hover:text-ink"
                    }`}
                  >
                    {v.label}
                    {v.sodiumPerServing != null && <span className="text-xs"> · {v.sodiumPerServing}mg sodium</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display font-bold text-xl">{formatPrice(shown.price)}</span>
              <span className="text-sm text-muted">for {servingsPerContainer(shown)} servings</span>
              {pricePerServing && (
                <span className="text-base font-medium text-ink">· {pricePerServing}</span>
              )}
              <PriceAlert
                 productId={product.id}
                 productName={product.name}
                currentPrice={shown.price}
              />
            </div>
            {bestFor && (
              <div className="inline-flex items-center gap-2 bg-moss/10 text-moss px-3 py-1.5 rounded-lg mt-1">
                <span className="text-xs font-medium">{bestFor}</span>
              </div>
            )}
          </div>
         <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/compare?ids=${product.id}`}
              className="btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              Compare this product
            </Link>
            <ProductActions productId={product.id} productName={`${product.brand} ${product.name}`} servingSize={product.servingSize} />
          </div>
        </div>

        {/* Brand */}
        <div className="card flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <BrandLogo logoDomain={product.logoDomain} logo={product.logo} brand={brand.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-semibold">{brand.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md ${PRICE_POSITION_STYLE[brand.pricePosition]}`}>{PRICE_POSITION_LABEL[brand.pricePosition]}</span>
              {(brand.founded || brand.hq) && (
                <span className="text-xs text-muted">{[brand.founded && `Founded ${brand.founded}`, brand.hq].filter(Boolean).join(" · ")}</span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">{brand.line}</p>
          </div>
          <Link href={`/brands/${brand.slug}`} className="text-sm text-moss hover:underline whitespace-nowrap">
            {brand.productCount > 1 ? `View all ${brand.productCount} ${brand.name} products →` : `About ${brand.name} →`}
          </Link>
        </div>

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card bg-moss/5 border-moss/20">
              <div className="text-xs text-moss uppercase tracking-widest mb-3">Strengths</div>
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
              <div className="text-xs text-rust uppercase tracking-widest mb-3">Watch out for</div>
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
            { val: product.reviewCount > 0 ? product.reviewCount.toLocaleString() : "—", label: "Customer reviews" },
            { val: product.certifications?.length ?? 0, label: "Certifications" },
            { val: product.ingredients.length, label: "Key ingredients" },
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
                <div className="mt-3 text-xs text-muted">
                  AI-generated from this product's label, ingredient and rating data
                </div>
              </div>
            ) : loading ? (
              <div className="bg-sand/40 rounded-xl p-4 text-center text-sm text-muted">
                Writing summary...
              </div>
            ) : (
              <div className="bg-sand/30 border border-sand rounded-xl p-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="font-display font-semibold text-base mb-1">
                      Get an AI breakdown of this product
                    </div>
                    <div className="text-sm text-muted mb-1">
                      Based on this product's label, ingredients and rating data
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {["Overall verdict", "Key strengths", "Weaknesses", "Who it's best for"].map((label) => (
                        <div key={label} className="text-xs text-muted flex items-center gap-1.5">
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

          {/* Sentiment: only from Pello community reviews. Estimated values are shown greyed out. */}
          <div className="card">
            <h2 className="font-display font-semibold text-base mb-4">Sentiment breakdown</h2>
            {(() => {
              const communityBars = community && community.count > 0 && community.averages
                ? getAttributesForCategory(product.category)
                    .map(({ key, label }) => ({ label, value: community.averages![key as keyof AttributeAverages] }))
                    .filter((b): b is { label: string; value: number } => b.value != null)
                    .map((b) => ({ label: b.label, pct: Math.round((b.value / 5) * 100) }))
                : [];
              const estimated = Object.entries(product.sentiment).map(([label, pct]) => ({ label, pct }));
              const bars = communityBars.length > 0 ? communityBars : estimated;
              const isCommunity = communityBars.length > 0;
              if (community === null) return <p className="text-sm text-muted">Loading community reviews…</p>;
              return (
                <>
                  {bars.length > 0 && (
                    <div className={isCommunity ? "" : "opacity-40"}>
                      {!isCommunity && <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Estimated</div>}
                      <div className="space-y-3">
                        {bars.map(({ label, pct }) => (
                          <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{label}</span>
                              <span className="font-medium">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "#2D4A2D" : pct >= 60 ? "#C8860A" : "#B84C2E" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {isCommunity ? (
                    <p className="text-xs text-muted mt-3">From {community.count} Pello community review{community.count !== 1 ? "s" : ""}.</p>
                  ) : (
                    <div className={bars.length > 0 ? "mt-4" : ""}>
                      <p className="text-sm text-muted mb-3">
                        {community.count > 0
                          ? "Community reviews for this product don't include attribute ratings yet. Sentiment data will appear here as athletes rate them."
                          : "No community reviews yet for this product. Sentiment data will appear here as athletes submit reviews."}
                      </p>
                      <a href="#reviews" className="btn-secondary text-xs py-1.5 px-3 inline-block">
                        {community.count > 0 ? "Write a review →" : "Write the first review →"}
                      </a>
                    </div>
                  )}
                </>
              );
            })()}
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
                      {ing.dose && <span className="text-xs text-muted ml-2">{ing.dose}</span>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${
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
              {product.transparencyScore != null ? (
                <ScoreCircle score={product.transparencyScore} />
              ) : (
                <div className="h-14 w-14 rounded-full border-4 border-sand flex items-center justify-center text-muted text-lg flex-shrink-0" aria-hidden="true">?</div>
              )}
              <div>
                <div className="lg:col-span-2">
            </div>
            <div className="lg:col-span-2">
              </div>
                <div className="font-semibold">
                  {product.transparencyScore == null ? "Not yet scored — full label not available"
                    : product.transparencyScore >= 85 ? "High transparency" : product.transparencyScore >= 70 ? "Good transparency" : "Moderate transparency"}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {product.certifications?.length ?? 0} certification{(product.certifications?.length ?? 0) === 1 ? "" : "s"} · {product.reviewCount > 0 ? `${product.reviewCount.toLocaleString()} reviews on The Feed` : "no reviews yet"}
                </div>
              </div>
            </div>
            <div className="divide-y divide-sand">
              {product.sources.map((src, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{src.icon} {src.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{src.count.toLocaleString()} {src.unit}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${src.credibility === "high" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
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
        const similar = similarProducts;
        return similar.length > 0 ? (
          <div className="max-w-5xl mx-auto px-6 mt-6">
            <h2 className="font-display font-semibold text-base mb-4">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.map((p) => (
                <Link key={p.id} href={`/report/${p.id}`}>
                  <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} />
                      <span className="text-xs text-muted">{p.reviewCount > 0 ? `${p.rating} ★` : "No reviews"}</span>
                    </div>
                    <div className="text-xs text-muted mb-0.5">{p.brand}</div>
                    <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                    <div className="text-xs text-muted mt-1">{formatPrice(p.price)} · {servingsPerContainer(p)} servings</div>
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
              .map((id) => directory.find((p) => p.id === id))
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

      <ReviewSection productId={product.id} category={product.category} onLoaded={onReviewsLoaded} />
    </div>
  );
}