import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ProductCard from "@/components/ProductCard";
import { getBrand, getBrandProducts, getBrands } from "@/lib/brands";
import { getProductSummaries } from "@/lib/catalog";
import { reviewsAt } from "@/lib/catalog-types";
import { productPelloScore } from "@/lib/product-score";
import { getFulensScoreLabel } from "@/lib/fulens-score";
import { formatPrice } from "@/lib/servings";
import { PRICE_POSITION_LABEL, PRICE_POSITION_STYLE } from "@/lib/brand-types";

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const brand = getBrand(params.slug);
  if (!brand) return { title: "Brand not found" };
  const title = `${brand.name} Review — Independent Analysis | Pello`;
  const description = `Independent analysis of ${brand.productCount} ${brand.name} product${brand.productCount !== 1 ? "s" : ""}: average Pello Score™ ${brand.avgPelloScore}/100${
    brand.avgTransparency != null ? `, average transparency ${brand.avgTransparency}%` : ""}, ingredients checked against the research.`;
  const url = `https://www.pellonutrition.com/brands/${brand.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { card: "summary", title, description },
  };
}

function Stat({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="card text-center">
      <div className="font-display font-bold text-2xl">{value}</div>
      <div className="text-muted text-xs mt-1">{label}</div>
      {sub && <div className="text-muted text-[11px] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = getBrand(params.slug);
  if (!brand) notFound();

  const products = getBrandProducts(brand.name);
  const scores = new Map(products.map((p) => [p.id, productPelloScore(p).overall]));
  const summaries = getProductSummaries()
    .filter((p) => p.brand === brand.name)
    .sort((a, b) => scores.get(b.id)! - scores.get(a.id)!);

  // Insights, from the products on Pello
  const best = summaries[0];
  const value = summaries.length > 1
    ? [...summaries].sort((a, b) => scores.get(b.id)! / b.pricePerServing - scores.get(a.id)! / a.pricePerServing)[0]
    : null;
  const mostReviewed = [...summaries].sort((a, b) => b.reviewCount - a.reviewCount)[0];
  const insights = [
    best && { label: "Best product", product: best, why: `Highest Pello Score: ${scores.get(best.id)}` },
    value && value.id !== best?.id && { label: "Best value", product: value, why: `Most Pello Score per dollar: ${scores.get(value.id)} at ${formatPrice(Number(value.pricePerServing.toFixed(2)))} a serving` },
    mostReviewed && mostReviewed.reviewCount > 0 && { label: "Most reviewed", product: mostReviewed, why: `${reviewsAt(mostReviewed.reviewCount, mostReviewed.reviewSource)}, ${mostReviewed.rating}/5` },
  ].filter(Boolean) as { label: string; product: (typeof summaries)[number]; why: string }[];

  const grade = getFulensScoreLabel(brand.avgPelloScore);
  const [lo, hi] = brand.pricePerServingRange;
  const range = lo === hi ? formatPrice(Number(lo.toFixed(2))) : `${formatPrice(Number(lo.toFixed(2)))}–${formatPrice(Number(hi.toFixed(2)))}`;
  const meta = [brand.founded && `Founded ${brand.founded}`, brand.hq].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/brands" className="text-xs text-muted hover:text-ink">← All brands</Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mt-4 mb-8">
          <BrandLogo logoDomain={brand.logoDomain ?? undefined} logo={brand.logo ?? undefined} brand={brand.name} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-3xl tracking-tight">{brand.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-md ${PRICE_POSITION_STYLE[brand.pricePosition]}`}>{PRICE_POSITION_LABEL[brand.pricePosition]}</span>
            </div>
            {meta && <div className="text-sm text-muted mb-3">{meta}</div>}
            <p className="text-sm leading-relaxed max-w-2xl mb-3">{brand.description}</p>
            {brand.philosophy && (
              <blockquote className="border-l-2 border-moss/40 pl-3 text-sm text-muted italic max-w-2xl mb-3">
                &ldquo;{brand.philosophy}&rdquo;
                <span className="not-italic text-xs block mt-1">In {brand.name}&apos;s own words</span>
              </blockquote>
            )}
            {brand.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {brand.badges.map((b) => (
                  <span key={b.label} title={b.detail} className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md cursor-help">✓ {b.label}</span>
                ))}
              </div>
            )}
            {brand.certifications.length > 0 && (
              <div className="text-xs text-muted mb-3">
                <span className="uppercase tracking-widest mr-2">Certifications</span>
                {brand.certifications.join(" · ")}
              </div>
            )}
            {brand.websiteUrl && (
              <a href={brand.websiteUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-sm text-moss hover:underline">
                Visit {brand.name}&apos;s website ↗
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Stat value={brand.productCount} label="Products on Pello" />
          <Stat value={brand.avgPelloScore} label="Avg Pello Score" sub={grade.label} />
          <Stat value={brand.avgTransparency != null ? `${brand.avgTransparency}%` : "—"} label="Avg transparency" sub={brand.avgTransparency == null ? "Not yet scored" : undefined} />
          <Stat value={range} label="Price per serving" />
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {insights.map(({ label, product, why }) => (
              <Link key={label} href={`/report/${product.id}`} className="card hover:shadow-md transition-all group">
                <div className="text-xs text-moss uppercase tracking-widest mb-1">{label}</div>
                <div className="font-display font-semibold leading-tight group-hover:text-moss transition-colors">{product.name}</div>
                <div className="text-xs text-muted mt-1">{why}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Catalog */}
        <h2 className="font-display font-semibold text-xl mb-1">{brand.name} products</h2>
        <p className="text-xs text-muted mb-4">Sorted by Pello Score</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {summaries.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <p className="text-xs text-muted max-w-2xl">
          Scores, badges and price position are calculated from Pello&apos;s analysis of the products listed here.
          Price position compares cost per serving with other products in the same category.
          {brand.sources.length > 0 && <> Company details are from {brand.name}&apos;s own website ({brand.sources.map((s, i) => (
            <span key={s}>{i > 0 && ", "}<a href={s} target="_blank" rel="nofollow noopener noreferrer" className="underline">{new URL(s).hostname.replace(/^www\./, "")}</a></span>
          ))}).</>}
        </p>
      </div>
    </div>
  );
}
