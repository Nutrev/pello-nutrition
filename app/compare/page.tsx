"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PRODUCTS, Product } from "@/lib/products";
import { pricePerServing, servingsPerContainer, formatPrice } from "@/lib/servings";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import IngredientFlags from "@/components/IngredientFlags";

const MAX_PRODUCTS = 3;

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: value >= 80 ? "#2D4A2D" : value >= 60 ? "#C8860A" : "#B84C2E",
          }}
        />
      </div>
      <span className="text-xs text-muted w-8 text-right">{value}%</span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-amber text-sm">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  if (typeof window !== "undefined") {
    document.title = "Compare Products | Pello";
  }

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const parsed = ids.split(",").filter((id) =>
        PRODUCTS.find((p) => p.id === id)
      ).slice(0, MAX_PRODUCTS);
      setSelectedIds(parsed);
    }
  }, [searchParams]);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedIds.length > 0) {
      router.replace(`/compare?ids=${selectedIds.join(",")}`, { scroll: false });
    } else {
      router.replace("/compare", { scroll: false });
    }
  }, [selectedIds, router]);

  const selectedProducts = selectedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const BRAND_ALIASES: Record<string, string> = {
      "sis": "science in sport",
      "tl": "transparent labs",
      "pf": "precision fuel",
      "ph": "precision fuel",
      "gu": "gu energy",
};

const filteredProducts = PRODUCTS.filter((p) => {
  const q = search.toLowerCase();
  const resolvedExplore = BRAND_ALIASES[q] ?? q;
  return (
    !selectedIds.includes(p.id) &&
    (search === "" ||
      p.name.toLowerCase().includes(resolvedExplore) ||
      p.brand.toLowerCase().includes(resolvedExplore) ||
      p.category.toLowerCase().includes(resolvedExplore))
  );
});

  const addProduct = (id: string) => {
    if (selectedIds.length >= MAX_PRODUCTS) return;
    setSelectedIds((prev) => [...prev, id]);
    setSearch("");
  };

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // All sentiment keys across selected products
  const allSentimentKeys = Array.from(
    new Set(selectedProducts.flatMap((p) => Object.keys(p.sentiment)))
  );

  // Column width based on number of products
  const colClass =
    selectedProducts.length === 1
      ? "w-64"
      : selectedProducts.length === 2
      ? "w-56"
      : "w-48";

  return (
    <div className="min-h-screen">

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">
            Side by side
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">
            Compare products
          </h1>
          <p className="text-muted text-sm">
            Select up to 3 products to compare side by side — then share the link.
          </p>
        </div>

        {/* Product selector */}
        <div className="card mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">
              {selectedIds.length === 0
                ? "Search for products to compare"
                : `${selectedIds.length} of ${MAX_PRODUCTS} selected`}
            </h2>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLink}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  {copied ? "✓ Copied!" : "🔗 Share comparison"}
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-muted hover:text-rust transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Selected pills */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-moss/10 border border-moss/20 px-3 py-1.5 rounded-lg"
                >
                  <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="xs" />
                  <span className="text-xs font-medium">{p.name}</span>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="text-muted hover:text-rust transition-colors ml-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          {selectedIds.length < MAX_PRODUCTS && (
            <div className="relative z-50">
              <input
                type="text"
                placeholder="Search by product name, brand or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 border border-sand rounded-xl px-4 py-2.5 text-sm outline-none focus:border-muted font-body placeholder:text-muted"
              />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-sand rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted">No products found</div>
                  ) : (
                    filteredProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sand/50 transition-colors text-left"
                      >
                        <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="sm" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-muted">{p.brand} · {p.category}</div>
                        </div>
                        <div className="flex text-amber text-xs">
                          {"★".repeat(Math.round(p.rating))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {selectedProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <td className="w-40 pr-4" />
                  {selectedProducts.map((p) => (
                    <th key={p.id} className={`${colClass} px-4 pb-4 text-left align-top`}>
                      <div className="card">
                        <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} className="mb-2" />
                        <div className="text-xs text-muted mb-0.5">{p.brand}</div>
                        <div className="font-display font-semibold text-sm leading-tight mb-1">
                          {p.name}
                        </div>
                        <div className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md inline-block mb-2">
                          {p.category}
                        </div>
                        <IngredientFlags
                          ingredientNames={p.ingredients?.map((i: any) => i.name) ?? []}
                          compact
/>
                        <Link
                          href={`/report/${p.id}`}
                          className="text-xs text-moss underline underline-offset-2 block"
                        >
                          View full report →
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-sand">
                {/* Rating */}
                <tr>
                  <td className="py-4 pr-4 text-xs text-muted uppercase tracking-wide">
                    Rating
                  </td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-4">
                      {p.reviewCount > 0 ? (
                        <>
                          <StarRating rating={p.rating} />
                          <div className="text-sm font-medium mt-0.5">{p.rating} / 5</div>
                          <div className="text-xs text-muted">{p.reviewCount.toLocaleString()} reviews</div>
                        </>
                      ) : (
                        <div className="text-xs text-muted">No reviews yet</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr>
                  <td className="py-4 pr-4 text-xs text-muted uppercase tracking-wide">
                    Price
                  </td>
                  {selectedProducts.map((p) => {
                    // Compare on price per serving: pack sizes differ, so pack price alone is misleading.
                    const perServing = (x: Product) => pricePerServing(x);
                    const minPerServing = Math.min(...selectedProducts.map(perServing));
                    const isBest = perServing(p) === minPerServing;
                    return (
                      <td key={p.id} className="px-4 py-4">
                        <span className={`font-display font-bold text-lg ${isBest ? "text-moss" : ""}`}>
                          ${perServing(p).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted"> / serving</span>
                        <div className="text-xs text-muted mt-0.5">{formatPrice(p.price)} for {servingsPerContainer(p)}</div>
                        {isBest && selectedProducts.length > 1 && (
                          <div className="text-xs text-moss mt-0.5">Best value</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Transparency */}
                <tr>
                  <td className="py-4 pr-4 text-xs text-muted uppercase tracking-wide">
                    Transparency
                  </td>
                  {selectedProducts.map((p) => {
                    const scores = selectedProducts.map((x) => x.transparencyScore).filter((x): x is number => x != null);
                    const maxScore = scores.length ? Math.max(...scores) : null;
                    if (p.transparencyScore == null) {
                      return (
                        <td key={p.id} className="px-4 py-4">
                          <div className="text-sm text-muted">Not yet scored</div>
                        </td>
                      );
                    }
                    return (
                      <td key={p.id} className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-lg ${p.transparencyScore === maxScore ? "text-moss" : ""}`}>
                            {p.transparencyScore}
                          </span>
                          <span className="text-xs text-muted">/ 100</span>
                        </div>
                        <ScoreBar value={p.transparencyScore} />
                        {p.transparencyScore === maxScore && scores.length > 1 && (
                          <div className="text-xs text-moss mt-1">Most transparent</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Goals */}
                <tr>
                  <td className="py-4 pr-4 text-xs text-muted uppercase tracking-wide">
                    Best for
                  </td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.goals.map((g) => (
                          <span
                            key={g}
                            className="text-xs bg-sand px-2 py-0.5 rounded-md"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Sentiment */}
                {allSentimentKeys.length > 0 && (
                  <tr>
                    <td
                      colSpan={selectedProducts.length + 1}
                      className="pt-6 pb-2 text-xs text-muted uppercase tracking-wide"
                    >
                      Sentiment breakdown
                    </td>
                  </tr>
                )}
                {allSentimentKeys.map((key) => (
                  <tr key={key}>
                    <td className="py-3 pr-4 text-xs text-muted">{key}</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        {p.sentiment[key] !== undefined ? (
                          <ScoreBar value={p.sentiment[key]} />
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Ingredients */}
                <tr>
                  <td
                    colSpan={selectedProducts.length + 1}
                    className="pt-6 pb-2 text-xs text-muted uppercase tracking-wide"
                  >
                    Key ingredients
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4" />
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        {p.ingredients.map((ing, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                                ing.verdict === "proven"
                                  ? "bg-moss/10 text-moss"
                                  : ing.verdict === "likely"
                                  ? "bg-amber/10 text-amber"
                                  : "bg-rust/10 text-rust"
                              }`}
                            >
                              {ing.verdict === "proven" ? "✓" : ing.verdict === "likely" ? "~" : "⚠"}
                            </span>
                            <span className="text-xs leading-relaxed">
                              {ing.name}
                              {ing.dose ? ` (${ing.dose})` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Sources */}
                <tr>
                  <td className="py-4 pr-4 text-xs text-muted uppercase tracking-wide">
                    Reviews & certifications
                  </td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-4">
                      <div className="text-sm font-display font-bold">
                        {p.reviewCount > 0 ? `${p.reviewCount.toLocaleString()} reviews` : "No reviews yet"}
                      </div>
                      <div className="text-xs text-muted">
                        {p.certifications?.length ? p.certifications.join(", ") : "No certifications"}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {selectedProducts.length === 0 && (
            <div className="card text-center py-16 relative z-0">
            <div className="text-4xl mb-3"></div>
            <h3 className="font-display font-bold text-xl mb-2">Pick products to compare</h3>
            <p className="text-muted text-sm max-w-sm mx-auto mb-6">
              Search for any two or three products above — gels, proteins, probiotics, anything — and we'll line them up side by side.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Maurten", "SiS", "Skratch", "Thorne", "Momentous"].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSearch(brand)}
                  className="text-xs bg-sand px-3 py-1.5 rounded-lg hover:bg-sand/80 transition-all"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}