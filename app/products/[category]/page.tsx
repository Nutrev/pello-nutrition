import { getProductSummaries } from "@/lib/catalog";
import { byWeightedRating, categorySlug } from "@/lib/catalog-types";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage({ params }: { params: { category: string } }) {
  const PRODUCTS = getProductSummaries();
  // Convert URL slug back to category name e.g. "energy-gel" → "Energy Gel"
  const slug = params.category;
  const allCategories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const matched = allCategories.find(
    (cat) => categorySlug(cat) === slug
  );

  if (!matched) notFound();

  const products = PRODUCTS
    .filter((p) => p.category === matched)
    .sort(byWeightedRating);

  const topProduct = products[0];

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">Category</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">{matched}</h1>
          <p className="text-muted text-sm">
            {products.length} product{products.length !== 1 ? "s" : ""} · sorted by rating
          </p>
        </div>

        {/* Top rated callout */}
        {topProduct && (
          <div className="card bg-moss/5 border-moss/20 flex items-center gap-4 mb-8">
            <BrandLogo logoDomain={topProduct.logoDomain} logo={topProduct.logo} brand={topProduct.brand} size="lg" />
            <div className="flex-1">
              <div className="text-xs text-moss mb-0.5">★ Top rated in {matched}</div>
              <div className="font-display font-semibold">{topProduct.name}</div>
              <div className="text-xs text-muted">{topProduct.brand}{topProduct.reviewCount > 0 && ` · ${topProduct.rating}/5 · ${topProduct.reviewCount.toLocaleString()} reviews`}</div>
            </div>
            <Link href={`/report/${topProduct.id}`} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
              View report →
            </Link>
          </div>
        )}

        {/* Other categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from(new Set(PRODUCTS.map((p) => p.category)))
            .filter((cat) => cat !== matched)
            .map((cat) => (
              <Link
                key={cat}
                href={`/products/${categorySlug(cat)}`}
                className="text-xs bg-white/60 border border-sand px-3 py-1.5 rounded-lg hover:border-muted transition-all"
              >
                {cat}
              </Link>
            ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}