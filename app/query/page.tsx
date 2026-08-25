"use client";

import { useState } from "react";
import Link from "next/link";

const DEMO_PRODUCTS = [
  { id: "maurten-gel-100", name: "Gel 100", brand: "Maurten", category: "Energy Gel", logoDomain: "maurten.com", price: 38, servingsPerContainer: 12, pricePerServing: 3.17, carbsPerServing: 25, sodiumPerServing: 55, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.5, transparencyScore: 96, availableAtRetailers: ["The Feed", "Running Warehouse", "Amazon"] },
  { id: "sis-beta-fuel-gel", name: "Beta Fuel Gel", brand: "Science in Sport", category: "Energy Gel", logoDomain: "scienceinsport.com", price: 42, servingsPerContainer: 15, pricePerServing: 2.80, carbsPerServing: 40, sodiumPerServing: 115, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: false, hasProprietaryBlend: false, isBatchTested: true, bannedSubstanceTested: true, rating: 4.3, transparencyScore: 84, availableAtRetailers: ["The Feed", "Amazon"] },
  { id: "gu-energy-gel", name: "Original Energy Gel", brand: "GU Energy", category: "Energy Gel", logoDomain: "guenergy.com", price: 24, servingsPerContainer: 15, pricePerServing: 1.60, carbsPerServing: 21, sodiumPerServing: 55, caffeinePerServing: 20, hasCaffeine: true, isVegan: false, isGlutenFree: true, isDairyFree: true, isCleanLabel: false, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.2, transparencyScore: 78, availableAtRetailers: ["REI", "Amazon", "Running Warehouse", "The Feed"] },
  { id: "precision-fuel-pf30", name: "PF 30 Gel", brand: "Precision Fuel & Hydration", category: "Energy Gel", logoDomain: "precisionfuelandhydration.com", price: 36, servingsPerContainer: 20, pricePerServing: 1.80, carbsPerServing: 30, sodiumPerServing: 0, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: true, bannedSubstanceTested: true, rating: 4.5, transparencyScore: 93, availableAtRetailers: ["The Feed", "Running Warehouse", "Amazon"] },
  { id: "skratch-super-high-carb", name: "Super High-Carb Sport Drink Mix", brand: "Skratch Labs", category: "Carbohydrate Mix", logoDomain: "skratchlabs.com", price: 55, servingsPerContainer: 28, pricePerServing: 1.96, carbsPerServing: 50, sodiumPerServing: 380, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.6, transparencyScore: 92, availableAtRetailers: ["REI", "Amazon", "The Feed"] },
  { id: "maurten-drink-mix-320", name: "Drink Mix 320", brand: "Maurten", category: "Carbohydrate Mix", logoDomain: "maurten.com", price: 50, servingsPerContainer: 14, pricePerServing: 3.57, carbsPerServing: 80, sodiumPerServing: 500, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.4, transparencyScore: 94, availableAtRetailers: ["The Feed", "Running Warehouse", "Amazon"] },
  { id: "lmnt-electrolyte-mix", name: "Recharge Electrolyte Mix", brand: "LMNT", category: "Hydration", logoDomain: "drinklmnt.com", price: 40, servingsPerContainer: 30, pricePerServing: 1.33, carbsPerServing: 0, sodiumPerServing: 1000, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.6, transparencyScore: 90, availableAtRetailers: ["Amazon", "Walmart", "The Feed"] },
  { id: "momentous-whey-isolate", name: "Whey Protein Isolate", brand: "Momentous", category: "Protein", logoDomain: "livemomentous.com", price: 65, servingsPerContainer: 25, pricePerServing: 2.60, carbsPerServing: 2, sodiumPerServing: 135, caffeinePerServing: 0, hasCaffeine: false, isVegan: false, isGlutenFree: true, isDairyFree: false, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: true, bannedSubstanceTested: true, rating: 4.8, transparencyScore: 97, availableAtRetailers: ["Amazon", "The Feed"] },
  { id: "thorne-creatine", name: "Creatine", brand: "Thorne", category: "Creatine", logoDomain: "thorne.com", price: 38, servingsPerContainer: 90, pricePerServing: 0.42, carbsPerServing: 0, sodiumPerServing: 0, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: true, bannedSubstanceTested: true, rating: 4.8, transparencyScore: 97, availableAtRetailers: ["Amazon", "Walmart", "The Feed"] },
  { id: "carbs-fuel-gel", name: "Fuel Original Energy Gel", brand: "Carbs", category: "Energy Gel", logoDomain: "carbsfuel.com", price: 36, servingsPerContainer: 15, pricePerServing: 2.40, carbsPerServing: 50, sodiumPerServing: 200, caffeinePerServing: 0, hasCaffeine: false, isVegan: true, isGlutenFree: true, isDairyFree: true, isCleanLabel: true, hasProprietaryBlend: false, isBatchTested: false, bannedSubstanceTested: false, rating: 4.5, transparencyScore: 96, availableAtRetailers: ["The Feed", "Amazon"] },
];

const EXAMPLE_QUERIES = [
  { label: "Gels under $2.50, 25g+ carbs, no caffeine", filters: { category: ["Energy Gel"], maxPricePerServing: 2.50, minCarbsPerServing: 25, hasCaffeine: false } },
  { label: "Batch-tested products only", filters: { isBatchTested: true } },
  { label: "Vegan & clean label only", filters: { isVegan: true, isCleanLabel: true } },
  { label: "Highest sodium hydration", filters: { category: ["Hydration"], minSodiumPerServing: 500 } },
  { label: "Available at REI", filters: { availableAt: ["REI"] } },
];

type SortKey = "rating" | "pricePerServing" | "carbsPerServing" | "sodiumPerServing" | "transparencyScore";

export default function QueryPage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  const applyFilter = (key: string, value: any) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilter = (key: string) => setFilters((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const applyExampleQuery = (q: typeof EXAMPLE_QUERIES[0]) => {
    setFilters(q.filters as Record<string, any>);
    setActiveQuery(q.label);
  };

  const filteredProducts = DEMO_PRODUCTS.filter((p: any) => {
    if (filters.category?.length && !filters.category.includes(p.category)) return false;
    if (filters.maxPricePerServing && p.pricePerServing > filters.maxPricePerServing) return false;
    if (filters.minCarbsPerServing && (p.carbsPerServing ?? 0) < filters.minCarbsPerServing) return false;
    if (filters.minSodiumPerServing && (p.sodiumPerServing ?? 0) < filters.minSodiumPerServing) return false;
    if (filters.hasCaffeine === false && p.hasCaffeine) return false;
    if (filters.hasCaffeine === true && !p.hasCaffeine) return false;
    if (filters.isVegan && !p.isVegan) return false;
    if (filters.isGlutenFree && !p.isGlutenFree) return false;
    if (filters.isDairyFree && !p.isDairyFree) return false;
    if (filters.isCleanLabel && !p.isCleanLabel) return false;
    if (filters.isBatchTested && !p.isBatchTested) return false;
    if (filters.noArtificialSweeteners && p.hasArtificialSweeteners) return false;
    if (filters.noSeedOils && p.hasSeedOils) return false;
    if (filters.noGums && p.hasGums) return false;
    if (filters.noArtificialPreservatives && p.hasArtificialPreservatives) return false;
    if (filters.availableAt?.length && !filters.availableAt.some((r: string) => p.availableAtRetailers?.includes(r))) return false;
    if (filters.search && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }).sort((a: any, b: any) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Pel<span className="text-moss">lo</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-moss/10 text-moss px-2 py-1 rounded-md">Beta</span>
            <Link href="/products" className="text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">My Goals →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Pello Query</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Product Database</h1>
          <p className="text-muted text-sm">Filter across {DEMO_PRODUCTS.length} demo products by any attribute. Full database coming soon.</p>
        </div>

        {/* Example queries */}
        <div className="mb-6">
          <div className="text-xs font-mono text-muted mb-2">Example queries</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button key={q.label} onClick={() => applyExampleQuery(q)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${activeQuery === q.label ? "bg-moss text-cream border-moss" : "bg-white/60 border-sand hover:border-muted"}`}>
                {q.label}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button onClick={() => { setFilters({}); setActiveQuery(null); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-rust/30 text-rust bg-rust/5 font-mono">
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter panel */}
          <div className="w-52 flex-shrink-0 space-y-4">
            <div className="text-xs font-mono text-muted uppercase tracking-widest">Filters</div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Search</div>
              <input type="text" placeholder="Brand or product..." value={filters.search ?? ""}
                onChange={(e) => applyFilter("search", e.target.value)}
                className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-xs outline-none focus:border-muted" />
            </div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Category</div>
              <div className="space-y-1">
                {["Energy Gel", "Carbohydrate Mix", "Hydration", "Protein", "Creatine"].map((cat) => (
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

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Max price/serving</div>
              <div className="flex gap-1 flex-wrap">
                {[1.00, 1.50, 2.00, 2.50, 3.00].map((p) => (
                  <button key={p} onClick={() => filters.maxPricePerServing === p ? clearFilter("maxPricePerServing") : applyFilter("maxPricePerServing", p)}
                    className={`text-xs px-2 py-1 rounded-md border font-mono transition-all ${filters.maxPricePerServing === p ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    ${p.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Min carbs/serving</div>
              <div className="flex gap-1 flex-wrap">
                {[15, 25, 40, 60, 80].map((g) => (
                  <button key={g} onClick={() => filters.minCarbsPerServing === g ? clearFilter("minCarbsPerServing") : applyFilter("minCarbsPerServing", g)}
                    className={`text-xs px-2 py-1 rounded-md border font-mono transition-all ${filters.minCarbsPerServing === g ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {g}g+
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Min sodium</div>
              <div className="flex gap-1 flex-wrap">
                {[100, 300, 500, 1000].map((mg) => (
                  <button key={mg} onClick={() => filters.minSodiumPerServing === mg ? clearFilter("minSodiumPerServing") : applyFilter("minSodiumPerServing", mg)}
                    className={`text-xs px-2 py-1 rounded-md border font-mono transition-all ${filters.minSodiumPerServing === mg ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {mg}mg+
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Caffeine</div>
              <div className="flex gap-1 flex-wrap">
                {[{ label: "Any", val: null }, { label: "None", val: false }, { label: "Yes", val: true }].map((opt) => (
                  <button key={opt.label} onClick={() => opt.val === null ? clearFilter("hasCaffeine") : applyFilter("hasCaffeine", opt.val)}
                    className={`text-xs px-2 py-1 rounded-md border font-mono transition-all ${filters.hasCaffeine === opt.val ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Dietary & certifications</div>
              <div className="space-y-1.5">
                {[
                  { key: "isVegan", label: "Vegan" },
                  { key: "isGlutenFree", label: "Gluten-free" },
                  { key: "isDairyFree", label: "Dairy-free" },
                  { key: "isCleanLabel", label: "Clean label" },
                  { key: "isBatchTested", label: "Batch tested" },
                  { key: "noArtificialSweeteners", label: "No artificial sweeteners" },
                  { key: "noSeedOils", label: "No seed oils" },
                  { key: "noGums", label: "No gums" },
                  { key: "noArtificialPreservatives", label: "No artificial preservatives" },
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

            <div>
              <div className="text-xs font-mono text-muted mb-1.5">Available at</div>
              <div className="space-y-1">
                {["REI", "Amazon", "The Feed", "Running Warehouse"].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" className="accent-moss"
                      checked={filters.availableAt?.includes(r) ?? false}
                      onChange={(e) => {
                        const current = filters.availableAt ?? [];
                        const updated = e.target.checked ? [...current, r] : current.filter((x: string) => x !== r);
                        updated.length ? applyFilter("availableAt", updated) : clearFilter("availableAt");
                      }} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-muted">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="text-xs bg-white/60 border border-sand rounded-lg px-2 py-1 outline-none font-mono">
                  <option value="rating">Rating</option>
                  <option value="pricePerServing">Price/serving</option>
                  <option value="carbsPerServing">Carbs</option>
                  <option value="sodiumPerServing">Sodium</option>
                  <option value="transparencyScore">Transparency</option>
                </select>
                <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                  className="text-xs border border-sand rounded-lg px-2 py-1 font-mono hover:border-muted">
                  {sortDir === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="font-display font-medium mb-1">No products match</p>
                <button onClick={() => { setFilters({}); setActiveQuery(null); }} className="text-xs text-moss underline mt-2">Clear filters</button>
              </div>
            ) : (
              <div className="bg-white/60 border border-sand rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2.5 bg-sand/40 border-b border-sand text-xs font-mono text-muted">
                  <div>Product</div>
                  <div>$/serving</div>
                  <div>Carbs</div>
                  <div>Sodium</div>
                  <div>Caffeine</div>
                  <div>Rating</div>
                  <div>Certified</div>
                </div>
                {filteredProducts.map((p: any, i: number) => (
                  <div key={p.id} onClick={() => window.location.href = `/report/${p.id}`}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 border-b border-sand last:border-0 hover:bg-sand/20 transition-colors cursor-pointer ${i % 2 !== 0 ? "bg-white/20" : ""}`}>
                    <div className="flex items-center gap-2">
                      <img src={`https://logo.clearbit.com/${p.logoDomain}`} alt={p.brand}
                        className="h-5 w-auto object-contain flex-shrink-0"
                        onError={(e) => (e.currentTarget.style.display = "none")} />
                      <div>
                        <div className="text-xs font-medium leading-tight">{p.name}</div>
                        <div className="text-xs text-muted">{p.brand}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-mono font-medium">${p.pricePerServing.toFixed(2)}</div>
                    <div className="flex items-center">
                      <span className={`text-xs font-mono ${(p.carbsPerServing ?? 0) >= 40 ? "text-moss font-medium" : "text-muted"}`}>
                        {p.carbsPerServing ?? "—"}g
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-mono ${(p.sodiumPerServing ?? 0) >= 500 ? "text-moss font-medium" : "text-muted"}`}>
                        {p.sodiumPerServing ? `${p.sodiumPerServing}mg` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-mono ${p.hasCaffeine ? "text-amber" : "text-muted"}`}>
                        {p.hasCaffeine ? `${p.caffeinePerServing}mg` : "None"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs font-mono font-medium">{p.rating}★</div>
                    <div className="flex items-center">
                      {p.isBatchTested
                        ? <span className="text-xs bg-moss/10 text-moss font-mono px-1.5 py-0.5 rounded">✓ Tested</span>
                        : <span className="text-xs text-muted font-mono">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-sand/30 rounded-xl border border-sand">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Coming soon</div>
              <div className="flex flex-wrap gap-2">
                {["G:F ratio filter", "Osmolality", "Hydrogel filter", "Cost per gram carb", "Formula history", "Price alerts", "Full database", "Country filter", "Pello Score™"].map((attr) => (
                  <span key={attr} className="text-xs bg-white/60 border border-sand px-2 py-1 rounded-md font-mono text-muted">{attr}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
