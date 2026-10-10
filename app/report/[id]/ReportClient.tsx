"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { Product } from "@/lib/products";
import { reviewsAt, reviewSourceOf, categorySlug, type ProductSummary } from "@/lib/catalog-types";
import { usedForText, type ProductSummaryText } from "@/lib/product-summary";
import Link from "next/link";
import ReviewSection, { getAttributesForCategory } from "@/components/ReviewSection";
import type { AttributeAverages } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";
import WarningIcon from "@/components/WarningIcon";
import ProductActions from "@/components/account/ProductActions";
import BuyButtons from "@/components/BuyButtons";
import { PRICE_POSITION_LABEL, PRICE_POSITION_STYLE, type Brand } from "@/lib/brand-types";
import IngredientFlags, { detectFlags } from "@/components/IngredientFlags";
import QualityStandards, { type NsfCheck } from "@/components/QualityStandards";
import { QUALITY_STANDARDS, standardsFrom, meetsDiet } from "@/lib/quality-standards";
import { productPelloScore } from "@/lib/product-score";
import { pricePerServing as calcPricePerServing, servingsPerContainer, formatPrice } from "@/lib/servings";
import { productNutrition, type ProductNutrition } from "@/lib/nutrition";
import FulensScoreDisplay, { ScoreSummary } from "@/components/FulensScore";

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

const SERVING_UNIT: Record<string, string> = {
  "Energy Gel": "gel", "Energy Chew": "pack", "Energy Bar": "bar",
};

// "1 stick pack (4g)" -> "stick pack". Only used for single-unit servings, so "1/2 bar" isn't shown as "per bar".
function servingUnit(product: Product): string {
  const m = product.servingSize?.match(/^\s*1\s+([a-z][a-z ]*?)\s*(?:\(|$)/i);
  return m ? m[1].toLowerCase() : SERVING_UNIT[product.category] ?? "serving";
}

// The numbers people compare first, per serving, from the product's own data only: up to four
// of creatine, protein, carbs, sodium, caffeine and calories. Caffeine shows as "None" for fuel
// products (10g+ carbs) that have none, since that's a deliberate choice for those. When caffeine
// is only listed as an ingredient, its dose is shown as written ("up to 50mg", some flavors).
function servingFacts(product: Product, n: ProductNutrition): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  const { carbsPerServing: carbs, proteinPerServing: protein, sodiumPerServing: sodium } = n;
  const creatine = product.category === "Creatine" ? product.ingredients.filter((i) => /creatine/i.test(i.name)) : [];
  if (creatine.length === 1 && creatine[0].dose && /^\s*[\d.]+\s*(mg|g)\b/i.test(creatine[0].dose)) {
    facts.push({ label: "Creatine", value: creatine[0].dose.trim() });
  }
  const proteinFirst = protein != null && protein >= 10;
  if (proteinFirst) facts.push({ label: "Protein", value: `${protein}g` });
  if (carbs != null && carbs > 0) facts.push({ label: "Carbs", value: `${carbs}g` });
  if (!proteinFirst && protein != null && protein > 0) facts.push({ label: "Protein", value: `${protein}g` });
  if (sodium != null && sodium > 0) facts.push({ label: "Sodium", value: `${sodium}mg` });
  const caffeineIngredient = product.ingredients.find((i) => /caffeine/i.test(i.name));
  if (product.caffeinePerServing != null && product.caffeinePerServing > 0) {
    facts.push({ label: "Caffeine", value: `${product.caffeinePerServing}mg` });
  } else if (caffeineIngredient) {
    const dose = caffeineIngredient.dose?.trim();
    facts.push({
      label: /some flavou?rs/i.test(caffeineIngredient.name) ? "Caffeine, some flavors" : "Caffeine",
      value: dose ? dose.charAt(0).toUpperCase() + dose.slice(1) : "Yes",
    });
  } else if (n.caffeinePerServing === 0 && carbs != null && carbs >= 10) {
    facts.push({ label: "Caffeine", value: "None" });
  }
  if (product.caloriesPerServing) facts.push({ label: "Calories", value: String(product.caloriesPerServing) });
  return facts.slice(0, 4);
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// What the product is used for, from its goals (lib/product-summary.ts). Empty when no goal is known.
function getBestForStatement(product: Product): string {
  const usedFor = usedForText(product);
  return usedFor ? `Used for: ${usedFor}` : "";
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
  brand: ReportBrand;
  nsf: NsfCheck;
  summary: ProductSummaryText;  // built on the server (lib/product-summary.ts)
}

export default function ReportClient({ product, similar: similarProducts, brand, nsf, summary }: ReportClientProps) {
  const [recent, setRecent] = useState<DirectoryEntry[]>([]);
  // Pello community reviews (loaded by ReviewSection); null until they've loaded.
  const [community, setCommunity] = useState<{ count: number; averages: AttributeAverages | null } | null>(null);
  const onReviewsLoaded = useCallback((count: number, averages: AttributeAverages | null) => setCommunity({ count, averages }), []);
  const [variantId, setVariantId] = useState(product.defaultVariantId ?? product.variants?.[0]?.id);

  const nutrition = product ? productNutrition(product) : null;
  const PelloScore = productPelloScore(product);
  const reviewSource = reviewSourceOf(product);

  // Recently viewed products are kept in this browser with the details needed to show them,
  // so each product page doesn't have to carry the whole catalogue.
  useEffect(() => {
    const key = "Pello_recently_viewed_items";
    let existing: DirectoryEntry[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(parsed)) existing = parsed.filter((p) => p && typeof p.id === "string" && typeof p.name === "string");
    } catch {}
    setRecent(existing.filter((p) => p.id !== product.id).slice(0, 4));
    const entry: DirectoryEntry = { id: product.id, name: product.name, brand: product.brand, logo: product.logo, logoDomain: product.logoDomain };
    try {
      localStorage.setItem(key, JSON.stringify([entry, ...existing.filter((p) => p.id !== product.id)].slice(0, 5)));
      localStorage.removeItem("Pello_recently_viewed");
    } catch {}
  }, [product.id, product.name, product.brand, product.logo, product.logoDomain]);

  // The selected variant (e.g. a strength) overrides the product's price, servings, sodium and rating.
  const variant = product.variants?.find((v) => v.id === variantId);
  const shown: Product = variant ? { ...product, ...variant, id: product.id } : product;
  const shownNutrition = productNutrition(shown);
  const facts = servingFacts(shown, shownNutrition);
  const unit = servingUnit(product);
  const bestFor = getBestForStatement(product);
  const disputedIngredients = getDisputedIngredients(product.ingredients);

  // One-line answers for the folded sections.
  const flags = detectFlags(product.ingredients.map((i) => i.name));
  const verdictCounts = (["proven", "likely", "disputed"] as const)
    .map((v) => ({ v, n: product.ingredients.filter((i) => i.verdict === v).length }))
    .filter((c) => c.n > 0)
    .map((c) => `${c.n} ${c.v}`);
  const ingredientsLine = product.ingredients.length === 0 ? "No ingredient details yet" : [
    plural(product.ingredients.length, "key ingredient"),
    verdictCounts.join(", "),
    flags.length > 0 ? `${flags.length} flagged` : "nothing flagged",
  ].filter(Boolean).join(" · ");

  const met = new Set(standardsFrom(product.certifications));
  const metStandards = QUALITY_STANDARDS.filter((s) => met.has(s.id));
  const sportTested = metStandards.filter((s) => s.group === "sport");
  const diet = { isVegan: product.isVegan ?? null, isGlutenFree: product.isGlutenFree, allergens: product.allergens };
  const dietYes = (["vegan", "gluten-free", "dairy-free"] as const).filter((d) => meetsDiet(diet, d));
  const qualityLine = [...metStandards.map((s) => s.name), ...dietYes].join(" · ") || "No certifications or diet claims listed";

  const communityLine = community === null ? "" : community.count > 0 ? plural(community.count, "Pello community review") : "no Pello community reviews yet";
  const reviewsLine = [
    shown.reviewCount > 0 ? `${shown.rating} from ${reviewsAt(shown.reviewCount, reviewSource)}` : "No retailer reviews yet",
    communityLine,
  ].filter(Boolean).join(" · ");

  const transparencyLabel = product.transparencyScore == null ? "Not yet scored"
    : product.transparencyScore >= 85 ? "High transparency" : product.transparencyScore >= 70 ? "Good transparency" : "Moderate transparency";
  const sourcesLine = [transparencyLabel, product.sources.map((src) => src.name).join(", ")].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-10">

        {/* Ingredient warning banner */}
        {disputedIngredients.length > 0 && (
          <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
            <span className="text-amber text-xs flex-shrink-0 mt-0.5 flex items-center gap-1"><WarningIcon className="h-3.5 w-3.5" />Note</span>
            <p className="text-xs text-muted leading-relaxed">
              This product contains {disputedIngredients.length} disputed ingredient{disputedIngredients.length > 1 ? "s" : ""}:{" "}
              <strong>{disputedIngredients.map((i) => i.name).join(", ")}</strong>.{" "}
              Evidence is mixed or doses are undisclosed — see <a href="#ingredients" className="underline">Ingredients</a> below for details.
            </p>
          </div>
        )}

        {/* Header: what it is, what it costs, where to buy, and the score */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-0">
            <BrandLogo logoDomain={product.logoDomain} logo={product.logo} brand={product.brand} size="lg" />
            <div className="flex-1 min-w-0">
              <Link href={`/brands/${brand.slug}`} className="inline-block text-sm text-muted hover:text-moss hover:underline">{product.brand}</Link>
              <h1 className="font-display font-bold text-3xl tracking-tight leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted">
                {shown.reviewCount > 0 ? (
                  <>
                    <span className="text-amber" aria-hidden="true">{"★".repeat(Math.round(shown.rating))}{"☆".repeat(5 - Math.round(shown.rating))}</span>
                    <span className="text-ink font-medium">{shown.rating}<span className="sr-only"> out of 5</span></span>
                    <a href="#ratings" className="hover:text-ink">· {reviewsAt(shown.reviewCount, reviewSource)}{variant ? ` for ${variant.label}` : ""}</a>
                  </>
                ) : (
                  <span>No reviews yet</span>
                )}
                <Link href={`/products/${categorySlug(product.category)}`}
                  className="text-xs border border-sand rounded-full px-2 py-0.5 hover:bg-sand/60">{product.category}</Link>
              </div>

              {product.variants && product.variants.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="Choose a version">
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

              <div className="flex flex-wrap items-baseline gap-x-2 mt-4">
                <span className="font-display font-bold text-2xl">${calcPricePerServing(shown).toFixed(2)}</span>
                <span className="text-sm text-muted">per {unit} · {formatPrice(shown.price)} for {servingsPerContainer(shown)}</span>
              </div>
              <div className="mt-3">
                <BuyButtons retailerLinks={product.retailerLinks} productName={product.name} brand={product.brand}
                  logoDomain={product.logoDomain} layout="inline" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                <Link href={`/compare?ids=${product.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors">
                  <span aria-hidden="true">⇄</span> Compare
                </Link>
                <ProductActions productId={product.id} productName={`${product.brand} ${product.name}`} servingSize={product.servingSize} inline />
              </div>
              {bestFor && <p className="text-xs text-muted mt-3">{bestFor}</p>}
            </div>
          </div>

          {PelloScore && <div className="md:self-start"><ScoreSummary score={PelloScore} /></div>}
        </div>

        {/* At a glance: the numbers people compare, then the key facts as tags */}
        <div className="mt-8">
          {facts.length > 0 && (
            <>
              <div className="text-xs text-muted uppercase tracking-widest mb-2">Per {unit}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {facts.map((f) => (
                  <div key={f.label} className="card !px-4 !py-3">
                    <div className="font-display font-bold text-xl">{f.value}</div>
                    <div className="text-xs text-muted">{f.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className={`flex flex-wrap gap-2 ${facts.length > 0 ? "mt-3" : ""}`}>
            {sportTested.map((s) => (
              <a key={s.id} href="#quality-standards" className="text-xs bg-moss/10 text-moss px-2.5 py-1 rounded-full hover:bg-moss/15">✓ {s.name}</a>
            ))}
            {metStandards.filter((s) => s.group !== "sport").map((s) => (
              <span key={s.id} className="text-xs bg-sand/70 px-2.5 py-1 rounded-full">{s.name}</span>
            ))}
            {shownNutrition.isHydrogel && <span className="text-xs bg-sand/70 px-2.5 py-1 rounded-full">Hydrogel</span>}
            {shownNutrition.glucoseFructoseRatio && (
              <span className="text-xs bg-sand/70 px-2.5 py-1 rounded-full">{shownNutrition.glucoseFructoseRatio} glucose:fructose</span>
            )}
            {dietYes.map((d) => (
              <span key={d} className="text-xs bg-sand/70 px-2.5 py-1 rounded-full">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
            ))}
            {product.ingredients.length > 0 && (flags.length === 0 ? (
              <span className="text-xs bg-sand/70 px-2.5 py-1 rounded-full">Nothing flagged in ingredients</span>
            ) : (
              <a href="#ingredients" className="text-xs bg-amber/10 text-amber px-2.5 py-1 rounded-full hover:bg-amber/15">
                {plural(flags.length, "ingredient flag")}
              </a>
            ))}
          </div>
        </div>

        {/* The short version, built from the product's own data (lib/product-summary.ts) */}
        <section className="card mt-8" aria-labelledby="summary">
          <h2 id="summary" className="font-display font-semibold text-base mb-2">Summary</h2>
          <p className="text-sm leading-relaxed">{summary.opening}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4">
            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-moss mb-2">Strengths</h3>
              {summary.strengths.length > 0 ? (
                <ul className="space-y-1.5">
                  {summary.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm"><span aria-hidden="true" className="text-moss flex-shrink-0">✓</span>{s}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">No standout strengths.</p>}
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-amber mb-2">Weaknesses</h3>
              <ul className="space-y-1.5">
                {summary.weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm"><span aria-hidden="true" className="text-amber flex-shrink-0">→</span>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {summary.bestFor && (
            <p className="text-sm mt-4 pt-4 border-t border-sand"><span className="font-medium">Best for:</span> <span className="text-muted">{summary.bestFor}</span></p>
          )}
        </section>

        {/* Score breakdown */}
        {PelloScore && (
          <div className="mt-4 scroll-mt-20" id="score">
            <FulensScoreDisplay score={PelloScore} />
          </div>
        )}

        {/* The details: everything else, folded, each with a one-line answer */}
        <div className="mt-8">
          <h2 className="font-display font-semibold text-base mb-3">The details</h2>
          <DetailList initialOpen="ingredients">
            <DetailItem id="ingredients" title="Ingredients" summary={ingredientsLine}>
              <p className="text-xs text-muted mb-3">Cross-referenced with PubMed &amp; Examine.com</p>
              <IngredientFlags ingredientNames={product.ingredients.map((i) => i.name)} />
              <div className="space-y-3 mt-3">
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
                        {ing.verdict === "proven" ? "✓ Proven" : ing.verdict === "likely" ? "~ Likely" : "Disputed"}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{ing.note}</p>
                    <div className="flex gap-3 mt-1.5">
                      {ing.pubmedUrl && <a href={ing.pubmedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">PubMed →</a>}
                      {ing.examineUrl && <a href={ing.examineUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">Examine →</a>}
                    </div>
                  </div>
                ))}
              </div>
            </DetailItem>

            <DetailItem id="quality-standards" title="Quality standards" summary={qualityLine}>
              <QualityStandards certifications={product.certifications} nsf={nsf} diet={diet} bare />
            </DetailItem>

            <DetailItem id="ratings" aliases="reviews" title="Reviews" summary={reviewsLine}>
              <SentimentBreakdown product={product} community={community} />
              <div className="border-t border-sand mt-5 pt-5">
                <ReviewSection productId={product.id} category={product.category} onLoaded={onReviewsLoaded} bare />
              </div>
            </DetailItem>

            <DetailItem id="sources" title="Sources & transparency" summary={sourcesLine}>
              <div className="flex items-center gap-4 mb-4 p-4 bg-sand/40 rounded-xl">
                {product.transparencyScore != null ? (
                  <ScoreCircle score={product.transparencyScore} />
                ) : (
                  <div className="h-14 w-14 rounded-full border-4 border-sand flex items-center justify-center text-muted text-lg flex-shrink-0" aria-hidden="true">?</div>
                )}
                <div>
                  <div className="font-semibold">
                    {product.transparencyScore == null ? "Not yet scored — full label not available" : transparencyLabel}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {plural(product.certifications?.length ?? 0, "certification")} · {product.reviewCount > 0 ? reviewsAt(product.reviewCount, reviewSource) : "no reviews yet"}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-sand">
                {product.sources.map((src, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{src.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{src.count.toLocaleString()} {src.unit}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${src.credibility === "high" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
                        {src.credibility}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DetailItem>

            <DetailItem id="brand" title={`About ${brand.name}`}
              summary={[PRICE_POSITION_LABEL[brand.pricePosition], plural(brand.productCount, "product") + " on Pello"].join(" · ")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md ${PRICE_POSITION_STYLE[brand.pricePosition]}`}>{PRICE_POSITION_LABEL[brand.pricePosition]}</span>
                {(brand.founded || brand.hq) && (
                  <span className="text-xs text-muted">{[brand.founded && `Founded ${brand.founded}`, brand.hq].filter(Boolean).join(" · ")}</span>
                )}
              </div>
              <p className="text-sm text-muted mt-2">{brand.line}</p>
              <Link href={`/brands/${brand.slug}`} className="inline-block text-sm text-moss hover:underline mt-2">
                {brand.productCount > 1 ? `View all ${brand.productCount} ${brand.name} products →` : `About ${brand.name} →`}
              </Link>
            </DetailItem>
          </DetailList>
        </div>
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-2">
          <h2 className="font-display font-semibold text-base mb-3">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {similarProducts.map((p) => (
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
      )}

      {/* Recently viewed */}
      {recent.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-8">
          <h2 className="font-display font-semibold text-base mb-3">Recently viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recent.map((p) => (
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
      <div className="h-10" />
    </div>
  );
}

// Sentiment: only from Pello community reviews. Estimated values are shown grayed out.
function SentimentBreakdown({ product, community }: {
  product: Product;
  community: { count: number; averages: AttributeAverages | null } | null;
}) {
  if (community === null) return <p className="text-sm text-muted">Loading community reviews…</p>;
  const communityBars = community.count > 0 && community.averages
    ? getAttributesForCategory(product.category)
        .map(({ key, label }) => ({ label, value: community.averages![key as keyof AttributeAverages] }))
        .filter((b): b is { label: string; value: number } => b.value != null)
        .map((b) => ({ label: b.label, pct: Math.round((b.value / 5) * 100) }))
    : [];
  const estimated = Object.entries(product.sentiment).map(([label, pct]) => ({ label, pct }));
  const isCommunity = communityBars.length > 0;
  const bars = isCommunity ? communityBars : estimated;
  if (bars.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-widest text-muted mb-3">Sentiment breakdown{isCommunity ? "" : " · estimated"}</h3>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 ${isCommunity ? "" : "opacity-50"}`}>
        {bars.map(({ label, pct }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{label}</span>
              <span className="text-muted">{pct}%</span>
            </div>
            <div className="h-1.5 bg-sand rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 60 ? "bg-moss" : "bg-amber/70"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      {isCommunity && <p className="text-xs text-muted mt-3">From {plural(community.count, "Pello community review")}.</p>}
    </div>
  );
}

// A list of folded sections. One can start open; a link to a section's id or one of its
// aliases (#reviews, which also opens the review form) opens it and scrolls to it.
function DetailList({ initialOpen, children }: { initialOpen?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(initialOpen ? [initialOpen] : []));
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!/^[\w-]+$/.test(hash)) return;
      const section = document.querySelector<HTMLElement>(`[data-detail]#${hash}, [data-detail][data-aliases~="${hash}"]`);
      if (!section) return;
      setOpen((prev) => new Set(prev).add(section.id));
      requestAnimationFrame(() => section.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    // A click on a link to the current hash doesn't fire hashchange, so handle in-page links too.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']");
      if (a && a.getAttribute("href") === window.location.hash) openFromHash();
    };
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", openFromHash); document.removeEventListener("click", onClick); };
  }, []);
  const toggle = (id: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return (
    <DetailContext.Provider value={{ open, toggle }}>
      <div className="card !p-0 divide-y divide-sand">{children}</div>
    </DetailContext.Provider>
  );
}

const DetailContext = createContext<{ open: Set<string>; toggle: (id: string) => void }>({ open: new Set(), toggle: () => {} });

// The content stays rendered while folded (just hidden), so sections like reviews still load.
function DetailItem({ id, aliases, title, summary, children }: {
  id: string; aliases?: string; title: string; summary: string; children: React.ReactNode;
}) {
  const { open, toggle } = useContext(DetailContext);
  const isOpen = open.has(id);
  return (
    <section id={id} data-detail data-aliases={aliases} className="scroll-mt-20">
      <h3>
        <button type="button" onClick={() => toggle(id)} aria-expanded={isOpen} aria-controls={`${id}-panel`}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-sand/30 transition-colors first:rounded-t-2xl">
          <span className="flex-1 min-w-0">
            <span className="block font-medium text-sm">{title}</span>
            {summary && <span className="block text-xs text-muted mt-0.5">{summary}</span>}
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 text-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h3>
      <div id={`${id}-panel`} hidden={!isOpen} className="px-5 pb-5">{children}</div>
    </section>
  );
}
