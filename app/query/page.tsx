"use client";

import { useState, useMemo } from "react";
import BrandLogo from "@/components/BrandLogo";
import { PRODUCTS } from "@/lib/products";
import { pricePerServing as getPricePerServing } from "@/lib/servings";
import { productNutrition } from "@/lib/nutrition";

// ── TYPES ─────────────────────────────────────────────────────

type SortKey = "rating" | "pricePerServing" | "carbsPerServing" | "sodiumPerServing" | "transparencyScore" | "caffeinePerServing" | "reviewCount";

// ── ENRICH PRODUCTS WITH DERIVED FIELDS ───────────────────────

function enrichProduct(p: any) {
  const pricePerServing = getPricePerServing(p);

  const {
    carbsPerServing, sodiumPerServing, caffeinePerServing, proteinPerServing,
    hasCaffeine, isHydrogel, glucoseFructoseRatio, isBatchTested, isVegan,
  } = productNutrition(p);

  const isCleanLabel = p.transparencyScore >= 85;
  const costPerGramCarb = carbsPerServing ? pricePerServing / carbsPerServing : null;

  return {
    ...p,
    pricePerServing: Math.round(pricePerServing * 100) / 100,
    carbsPerServing,
    sodiumPerServing,
    caffeinePerServing,
    proteinPerServing,
    hasCaffeine,
    isHydrogel,
    glucoseFructoseRatio,
    isBatchTested,
    isVegan,
    isCleanLabel,
    costPerGramCarb: costPerGramCarb ? Math.round(costPerGramCarb * 1000) / 1000 : null,
  };
}

const ALL_CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();

const EXAMPLE_QUERIES = [
  { label: "Gels under $2.50, 25g+ carbs, no caffeine", filters: { category: ["Energy Gel"], maxPricePerServing: 2.50, minCarbsPerServing: 25, hasCaffeine: "no" } },
  { label: "Batch-tested products only", filters: { isBatchTested: true } },
  { label: "Vegan & clean label only", filters: { isVegan: true, isCleanLabel: true } },
  { label: "Highest sodium hydration", filters: { category: ["Hydration"], minSodiumPerServing: 300 } },
  { label: "Hydrogel gels only", filters: { category: ["Energy Gel"], isHydrogel: true } },
  { label: "High carb drink mixes 60g+", filters: { category: ["Carbohydrate Mix"], minCarbsPerServing: 60 } },
  { label: "Caffeinated gels", filters: { category: ["Energy Gel"], hasCaffeine: "yes" } },
  { label: "Top rated protein", filters: { category: ["Protein"] } },
];

export default function ExplorePage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeExplore, setActiveExplore] = useState<string | null>(null);

  const enrichedProducts = useMemo(() => PRODUCTS.map(enrichProduct), []);

  const applyFilter = (key: string, value: any) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilter = (key: string) => setFilters(prev => { const n = { ...prev }; delete n[key]; return n; });

  const applyExampleExplore = (q: typeof EXAMPLE_QUERIES[0]) => {
    setFilters(q.filters as Record<string, any>);
    setActiveExplore(q.label);
  };

  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter((p: any) => {
      if (filters.category?.length && !filters.category.includes(p.category)) return false;
      if (filters.maxPricePerServing && p.pricePerServing > filters.maxPricePerServing) return false;
      if (filters.minCarbsPerServing && (p.carbsPerServing ?? 0) < filters.minCarbsPerServing) return false;
      if (filters.minSodiumPerServing && (p.sodiumPerServing ?? 0) < filters.minSodiumPerServing) return false;
      if (filters.minProteinPerServing && (p.proteinPerServing ?? 0) < filters.minProteinPerServing) return false;
      if (filters.hasCaffeine === "no" && p.hasCaffeine) return false;
      if (filters.hasCaffeine === "yes" && !p.hasCaffeine) return false;
      if (filters.isVegan && !p.isVegan) return false;
      if (filters.isCleanLabel && !p.isCleanLabel) return false;
      if (filters.isBatchTested && !p.isBatchTested) return false;
      if (filters.isHydrogel && !p.isHydrogel) return false;
      if (filters.minTransparencyScore && p.transparencyScore < filters.minTransparencyScore) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.glucoseFructoseRatio && p.glucoseFructoseRatio !== filters.glucoseFructoseRatio) return false;
      if (filters.search && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    }).sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedProducts, filters, sortBy, sortDir]);

  const activeFilterCount = Object.keys(filters).filter(k => filters[k] !== null && filters[k] !== undefined && filters[k] !== "").length;

  return (
    <div className="min-h-screen">

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">Explore</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-1">Product Database</h1>
          <p className="text-muted text-sm">{PRODUCTS.length} products — filter by carbs, sodium, caffeine, G:F ratio, certifications and more.</p>
        </div>

        {/* Example queries */}
        <div className="mb-6">
          <div className="text-xs text-muted mb-2">Example queries</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button key={q.label} onClick={() => applyExampleExplore(q)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeExplore === q.label ? "bg-moss text-cream border-moss" : "bg-white/60 border-sand hover:border-muted"}`}>
                {q.label}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button onClick={() => { setFilters({}); setActiveExplore(null); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-rust/30 text-rust bg-rust/5">
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter panel */}
          <div className="w-full lg:w-56 lg:flex-shrink-0 space-y-5">
            <div className="text-xs text-muted uppercase tracking-widest">Filters</div>

            {/* Search */}
            <div>
              <div className="text-xs text-muted mb-1.5">Search</div>
              <input type="text" placeholder="Brand or product..." value={filters.search ?? ""}
                onChange={(e) => e.target.value ? applyFilter("search", e.target.value) : clearFilter("search")}
                className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-xs outline-none focus:border-muted" />
            </div>

            {/* Category */}
            <div>
              <div className="text-xs text-muted mb-1.5">Category</div>
              <div className="space-y-1">
                {ALL_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" className="accent-moss"
                      checked={filters.category?.includes(cat) ?? false}
                      onChange={(e) => {
                        const current = filters.category ?? [];
                        const updated = e.target.checked ? [...current, cat] : current.filter((c: string) => c !== cat);
                        updated.length ? applyFilter("category", updated) : clearFilter("category");
                      }} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Price per serving */}
            <div>
              <div className="text-xs text-muted mb-1.5">Max price/serving</div>
              <div className="flex gap-1 flex-wrap">
                {[1.00, 1.50, 2.00, 2.50, 3.00].map((p) => (
                  <button key={p} onClick={() => filters.maxPricePerServing === p ? clearFilter("maxPricePerServing") : applyFilter("maxPricePerServing", p)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.maxPricePerServing === p ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    ${p.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="text-xs text-muted mb-1.5">Min carbs/serving</div>
              <div className="flex gap-1 flex-wrap">
                {[15, 25, 40, 60, 80].map((g) => (
                  <button key={g} onClick={() => filters.minCarbsPerServing === g ? clearFilter("minCarbsPerServing") : applyFilter("minCarbsPerServing", g)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.minCarbsPerServing === g ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {g}g+
                  </button>
                ))}
              </div>
            </div>

            {/* Sodium */}
            <div>
              <div className="text-xs text-muted mb-1.5">Min sodium</div>
              <div className="flex gap-1 flex-wrap">
                {[100, 300, 500, 1000].map((mg) => (
                  <button key={mg} onClick={() => filters.minSodiumPerServing === mg ? clearFilter("minSodiumPerServing") : applyFilter("minSodiumPerServing", mg)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.minSodiumPerServing === mg ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {mg}mg+
                  </button>
                ))}
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="text-xs text-muted mb-1.5">Min protein/serving</div>
              <div className="flex gap-1 flex-wrap">
                {[10, 20, 25, 30].map((g) => (
                  <button key={g} onClick={() => filters.minProteinPerServing === g ? clearFilter("minProteinPerServing") : applyFilter("minProteinPerServing", g)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.minProteinPerServing === g ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {g}g+
                  </button>
                ))}
              </div>
            </div>

            {/* Caffeine */}
            <div>
              <div className="text-xs text-muted mb-1.5">Caffeine</div>
              <div className="flex gap-1">
                {[{ label: "Any", val: "" }, { label: "None", val: "no" }, { label: "Yes", val: "yes" }].map((opt) => (
                  <button key={opt.label} onClick={() => opt.val === "" ? clearFilter("hasCaffeine") : applyFilter("hasCaffeine", opt.val)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.hasCaffeine === opt.val || (!filters.hasCaffeine && opt.val === "") ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* G:F Ratio */}
            <div>
              <div className="text-xs text-muted mb-1.5">Glucose:Fructose ratio</div>
              <div className="flex gap-1 flex-wrap">
                {["2:1", "1:0.8", "1:1"].map((ratio) => (
                  <button key={ratio} onClick={() => filters.glucoseFructoseRatio === ratio ? clearFilter("glucoseFructoseRatio") : applyFilter("glucoseFructoseRatio", ratio)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.glucoseFructoseRatio === ratio ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Min rating */}
            <div>
              <div className="text-xs text-muted mb-1.5">Min rating</div>
              <div className="flex gap-1 flex-wrap">
                {[4.0, 4.3, 4.5, 4.7].map((r) => (
                  <button key={r} onClick={() => filters.minRating === r ? clearFilter("minRating") : applyFilter("minRating", r)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.minRating === r ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {r}★+
                  </button>
                ))}
              </div>
            </div>

            {/* Min transparency */}
            <div>
              <div className="text-xs text-muted mb-1.5">Min transparency</div>
              <div className="flex gap-1 flex-wrap">
                {[70, 80, 90, 95].map((t) => (
                  <button key={t} onClick={() => filters.minTransparencyScore === t ? clearFilter("minTransparencyScore") : applyFilter("minTransparencyScore", t)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all ${filters.minTransparencyScore === t ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {t}%+
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div>
              <div className="text-xs text-muted mb-1.5">Special filters</div>
              <div className="space-y-1.5">
                {[
                  { key: "isVegan", label: "Vegan" },
                  { key: "isCleanLabel", label: "Clean label (90%+ transparency)" },
                  { key: "isBatchTested", label: "Batch tested" },
                  { key: "isHydrogel", label: "Hydrogel delivery" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" className="accent-moss"
                      checked={filters[key] === true}
                      onChange={(e) => e.target.checked ? applyFilter(key, true) : clearFilter(key)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-muted">
                {filteredProducts.length} of {PRODUCTS.length} products
                {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="text-xs bg-white/60 border border-sand rounded-lg px-2 py-1 outline-none">
                  <option value="rating">Rating</option>
                  <option value="pricePerServing">Price/serving</option>
                  <option value="carbsPerServing">Carbs</option>
                  <option value="sodiumPerServing">Sodium</option>
                  <option value="caffeinePerServing">Caffeine</option>
                  <option value="transparencyScore">Transparency</option>
                  <option value="reviewCount">Review count</option>
                </select>
                <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                  className="text-xs border border-sand rounded-lg px-2 py-1 hover:border-muted">
                  {sortDir === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="font-display font-medium mb-1">No products match</p>
                <p className="text-xs mb-3">Try removing some filters</p>
                <button onClick={() => { setFilters({}); setActiveExplore(null); }} className="text-xs text-moss underline">Clear all filters</button>
              </div>
            ) : (
              <div className="bg-white/60 border border-sand rounded-xl overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 bg-sand/40 border-b border-sand text-xs text-muted">
                    <div>Product</div>
                    <div>$/serving</div>
                    <div>Carbs</div>
                    <div>Sodium</div>
                    <div>Caffeine</div>
                    <div>G:F</div>
                    <div>Rating</div>
                    <div>Transp.</div>
                  </div>

                  {/* Rows */}
                  {filteredProducts.map((p: any, i: number) => (
                    <div key={p.id} onClick={() => window.location.href = `/report/${p.id}`}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-b border-sand last:border-0 hover:bg-moss/5 transition-colors cursor-pointer ${i % 2 !== 0 ? "bg-white/20" : ""}`}>

                      {/* Product */}
                      <div className="flex items-center gap-2 min-w-0">
                        <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="xs" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium leading-tight truncate">{p.name}</div>
                          <div className="text-xs text-muted truncate">{p.brand}</div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center text-xs">
                        ${p.pricePerServing.toFixed(2)}
                      </div>

                      {/* Carbs */}
                      <div className="flex items-center">
                        <span className={`text-xs ${(p.carbsPerServing ?? 0) >= 40 ? "text-moss font-medium" : "text-muted"}`}>
                          {p.carbsPerServing != null ? `${p.carbsPerServing}g` : "—"}
                        </span>
                      </div>

                      {/* Sodium */}
                      <div className="flex items-center">
                        <span className={`text-xs ${(p.sodiumPerServing ?? 0) >= 500 ? "text-moss font-medium" : "text-muted"}`}>
                          {p.sodiumPerServing != null ? `${p.sodiumPerServing}mg` : "—"}
                        </span>
                      </div>

                      {/* Caffeine */}
                      <div className="flex items-center">
                        <span className={`text-xs ${p.hasCaffeine ? "text-amber font-medium" : "text-muted"}`}>
                          {p.hasCaffeine ? (p.caffeinePerServing != null ? `${p.caffeinePerServing}mg` : "Varies") : "None"}
                        </span>
                      </div>

                      {/* G:F ratio */}
                      <div className="flex items-center">
                        <span className="text-xs text-muted">
                          {p.glucoseFructoseRatio ?? "—"}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center text-xs font-medium">
                        {p.reviewCount > 0 ? `${p.rating}★` : "—"}
                      </div>

                      {/* Transparency */}
                      <div className="flex items-center">
                        <span className={`text-xs ${p.transparencyScore >= 90 ? "text-moss font-medium" : p.transparencyScore >= 75 ? "text-amber" : "text-muted"}`}>
                          {p.transparencyScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary stats */}
            {filteredProducts.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Avg rating",
                    value: (() => { const rated = filteredProducts.filter((p: any) => p.reviewCount > 0); return rated.length ? (rated.reduce((a: number, p: any) => a + p.rating, 0) / rated.length).toFixed(1) + "★" : "—"; })()
                  },
                  {
                    label: "Avg price/serving",
                    value: "$" + (filteredProducts.reduce((a: number, p: any) => a + p.pricePerServing, 0) / filteredProducts.length).toFixed(2)
                  },
                  {
                    label: "Avg transparency",
                    value: Math.round(filteredProducts.reduce((a: number, p: any) => a + p.transparencyScore, 0) / filteredProducts.length) + "%"
                  },
                  {
                    label: "Batch tested",
                    value: filteredProducts.filter((p: any) => p.isBatchTested).length + "/" + filteredProducts.length
                  },
                ].map(stat => (
                  <div key={stat.label} className="card text-center py-3">
                    <div className="font-display font-bold text-lg">{stat.value}</div>
                    <div className="text-xs text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
