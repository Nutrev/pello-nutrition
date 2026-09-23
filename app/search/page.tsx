"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { PRODUCTS } from "@/lib/products";

interface OFFProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  image_url?: string;
  nutriments?: Record<string, number>;
  categories?: string;
}

interface PelloAnalysis {
  verdict: string;
  pros: string[];
  cons: string[];
  flags: string[];
  pelloCategoryGuess: string;
  scienceRating: string;
  athleteRating: number;
  keyIngredients: string[];
  whenToUse: string;
  suitableFor: string[];
}

const SCIENCE_COLORS: Record<string, string> = {
  "proven": "bg-moss/10 text-moss",
  "likely": "bg-amber/10 text-amber",
  "disputed": "bg-rust/10 text-rust",
  "insufficient-data": "bg-sand text-muted",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OFFProduct | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PelloAnalysis | null>(null);
  const [scanning, setScanning] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Search Pello Explore — name, brand, category, ingredients
  const pelloResults = query.length > 1
    ? PRODUCTS.filter(p => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.ingredients?.some((i: any) => i.name.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const searchExternal = async (q: string) => {
    if (!q.trim() || q.length < 3) return;
    setSearching(true);
    setHasSearched(true);
    setResults([]);
    setSelectedProduct(null);
    setAnalysis(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const analyzeProduct = async (product: OFFProduct) => {
    setSelectedProduct(product);
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      setAnalysis(data.analysis ?? null);
    } catch {
      setAnalysis(null);
    }
    setAnalyzing(false);
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Camera access denied. Please allow camera access to scan barcodes.");
    }
  };

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);
  };

  const lookupBarcode = async (barcode: string) => {
    stopScanner();
    setSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?barcode=${barcode}`);
      const data = await res.json();
      if (data.product) {
        setResults([data.product]);
        analyzeProduct(data.product);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const getNutrient = (product: OFFProduct, key: string) => {
    if (!product.nutriments) return null;
    return product.nutriments[`${key}_serving`] ?? product.nutriments[`${key}_100g`] ?? null;
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/compare" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
            <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Universal search</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Search any product</h1>
          <p className="text-muted text-sm">Search across the Pello Explore and 3 million+ products from Open Food Facts. Get an instant AI analysis for any product not yet in our Explore.</p>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchExternal(query)}
            placeholder="Search any product or brand..."
            className="w-full bg-white/80 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted pr-32"
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              onClick={startScanner}
              className="px-3 py-1.5 rounded-lg bg-sand text-xs font-mono hover:bg-sand/80 transition-all"
              title="Scan barcode"
            >
              Scan
            </button>
            <button
              onClick={() => searchExternal(query)}
              disabled={searching || query.length < 3}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
        </div>

        {/* Camera scanner */}
        {scanning && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Point camera at barcode</div>
              <button onClick={stopScanner} className="text-xs text-muted underline">Close</button>
            </div>
            <div className="relative bg-ink rounded-xl overflow-hidden aspect-video mb-3">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-moss rounded-lg opacity-70" />
              </div>
            </div>
            <div className="flex gap-2">
              {["5060219070060", "0722252337618", "0021908503935"].map(code => (
                <button key={code} onClick={() => lookupBarcode(code)}
                  className="text-xs bg-sand px-2 py-1 rounded-md font-mono">
                  Test: {code.slice(-4)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Auto-detection coming soon — use test barcodes above to try the feature</p>
          </div>
        )}

        {/* Pello Explore results — always shown when query matches */}
        {pelloResults.length > 0 && !selectedProduct && (
          <div className="mb-6">
            <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">
              In Pello Explore · {pelloResults.length} result{pelloResults.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-2">
              {pelloResults.map(p => (
                <Link key={p.id} href={`/report/${p.id}`}>
                  <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4">
                    {(p as any).logoDomain ? (
                      <img src={`https://logo.clearbit.com/${(p as any).logoDomain}`} alt={p.brand}
                        className="h-8 w-auto object-contain flex-shrink-0"
                        onError={e => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center text-xs font-mono flex-shrink-0">
                        {p.brand.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono bg-moss/10 text-moss px-1.5 py-0.5 rounded">Pello</span>
                        <span className="text-xs font-mono text-muted">{p.category}</span>
                      </div>
                      <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                      <div className="text-xs text-muted">{p.brand} · {p.rating}★ · {p.reviewCount.toLocaleString()} reviews</div>
                    </div>
                    <div className="text-xs text-moss flex-shrink-0">Full report →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* External search results */}
        {hasSearched && !selectedProduct && (searching || results.length > 0) && (
          <div>
            {pelloResults.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-sand" />
                <span className="text-xs font-mono text-muted">External results</span>
                <div className="flex-1 h-px bg-sand" />
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-muted uppercase tracking-widest">
                {searching ? "Searching Open Food Facts..." : `${results.length} external results`}
              </div>
              {results.length > 0 && (
                <div className="text-xs text-muted">Click for Pello analysis</div>
              )}
            </div>

            {searching && (
              <div className="text-center py-10">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-sand border-t-moss rounded-full" />
              </div>
            )}

            {!searching && results.length === 0 && (
              <div className="text-center py-10 text-muted">
                <p className="font-display font-medium mb-1">No results found</p>
                <p className="text-sm">Try a different search term or brand name</p>
              </div>
            )}

            <div className="space-y-2">
              {results.filter(p => p.product_name).map((product, i) => (
                <button key={i} onClick={() => analyzeProduct(product)}
                  className="w-full card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4 text-left">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name}
                      className="w-12 h-12 object-contain rounded-lg bg-sand flex-shrink-0"
                      onError={e => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-sand flex items-center justify-center text-lg flex-shrink-0">
                      {product.brands?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors truncate">
                      {product.product_name}
                    </div>
                    <div className="text-xs text-muted">{product.brands ?? "Unknown brand"}</div>
                    {product.nutriments?.carbohydrates_100g && (
                      <div className="text-xs font-mono text-muted mt-0.5">
                        {product.nutriments.carbohydrates_100g}g carbs/100g
                        {product.nutriments?.sodium_100g ? ` · ${Math.round(product.nutriments.sodium_100g * 1000)}mg sodium` : ""}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-moss flex-shrink-0">Analyse →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product analysis */}
        {selectedProduct && (
          <div>
            {/* Back button */}
            <button onClick={() => { setSelectedProduct(null); setAnalysis(null); }}
              className="text-xs text-muted hover:text-ink transition-colors mb-4 flex items-center gap-1">
              ← Back to results
            </button>

            {/* Product header */}
            <div className="card mb-4 flex items-start gap-4">
              {selectedProduct.image_url && (
                <img src={selectedProduct.image_url} alt={selectedProduct.product_name}
                  className="w-20 h-20 object-contain rounded-xl bg-sand flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-xs font-mono text-muted mb-1">External product</div>
                <h2 className="font-display font-bold text-xl mb-1">{selectedProduct.product_name}</h2>
                <div className="text-sm text-muted">{selectedProduct.brands}</div>

                {/* Quick nutrition */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {getNutrient(selectedProduct, "energy-kcal") && (
                    <span className="text-xs font-mono bg-sand px-2 py-0.5 rounded-md">
                      {Math.round(getNutrient(selectedProduct, "energy-kcal") ?? 0)} kcal
                    </span>
                  )}
                  {getNutrient(selectedProduct, "carbohydrates") && (
                    <span className="text-xs font-mono bg-sand px-2 py-0.5 rounded-md">
                      {Math.round(getNutrient(selectedProduct, "carbohydrates") ?? 0)}g carbs
                    </span>
                  )}
                  {getNutrient(selectedProduct, "proteins") && (
                    <span className="text-xs font-mono bg-sand px-2 py-0.5 rounded-md">
                      {Math.round(getNutrient(selectedProduct, "proteins") ?? 0)}g protein
                    </span>
                  )}
                  {getNutrient(selectedProduct, "sodium") && (
                    <span className="text-xs font-mono bg-sand px-2 py-0.5 rounded-md">
                      {Math.round((getNutrient(selectedProduct, "sodium") ?? 0) * 1000)}mg sodium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Loading analysis */}
            {analyzing && (
              <div className="card text-center py-10">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-sand border-t-moss rounded-full mb-4" />
                <p className="text-sm text-muted">Running Pello analysis...</p>
              </div>
            )}

            {/* Analysis results */}
            {analysis && !analyzing && (
              <div className="space-y-4">

                {/* Verdict */}
                <div className="card bg-moss/5 border-moss/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Pello Analysis</div>
                      <p className="text-sm leading-relaxed font-medium">{analysis.verdict}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold text-3xl text-moss">{analysis.athleteRating}<span className="text-lg text-muted">/5</span></div>
                      <div className="text-xs text-muted">athlete rating</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${SCIENCE_COLORS[analysis.scienceRating] ?? "bg-sand text-muted"}`}>
                      {analysis.scienceRating}
                    </span>
                    <span className="text-xs font-mono bg-sand px-2 py-0.5 rounded-md">{analysis.pelloCategoryGuess}</span>
                    {analysis.suitableFor?.map(s => (
                      <span key={s} className="text-xs font-mono bg-moss/10 text-moss px-2 py-0.5 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Pros & cons */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card bg-moss/5 border-moss/20">
                    <div className="text-xs font-mono text-moss uppercase tracking-widest mb-3">Strengths</div>
                    <ul className="space-y-1.5">
                      {analysis.pros?.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted">
                          <span className="text-moss flex-shrink-0">✓</span>{pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card bg-rust/5 border-rust/20">
                    <div className="text-xs font-mono text-rust uppercase tracking-widest mb-3">Watch out for</div>
                    {analysis.cons?.length > 0 ? (
                      <ul className="space-y-1.5">
                        {analysis.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted">
                            <span className="text-rust flex-shrink-0">→</span>{con}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">No major concerns</p>
                    )}
                  </div>
                </div>

                {/* Flags */}
                {analysis.flags?.length > 0 && (
                  <div className="bg-amber/10 border border-amber/20 rounded-xl p-4">
                    <div className="text-xs font-mono text-amber uppercase tracking-widest mb-2">Flagged ingredients</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.flags.map((flag, i) => (
                        <span key={i} className="text-xs bg-amber/10 text-amber font-mono px-2 py-0.5 rounded-md">⚠ {flag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key ingredients + timing */}
                <div className="card">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Key ingredients</div>
                      <ul className="space-y-1">
                        {analysis.keyIngredients?.map((ing, i) => (
                          <li key={i} className="text-xs text-muted flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-moss flex-shrink-0" />{ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">When to use</div>
                      <p className="text-xs text-muted leading-relaxed">{analysis.whenToUse}</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients text */}
                {selectedProduct.ingredients_text && (
                  <div className="card bg-sand/30">
                    <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Full ingredients</div>
                    <p className="text-xs text-muted leading-relaxed">{selectedProduct.ingredients_text}</p>
                  </div>
                )}

                {/* CTA */}
                <div className="card text-center py-6">
                  <p className="text-sm font-medium mb-1">This product isn't in the Pello Explore yet</p>
                  <p className="text-xs text-muted mb-4">Browse similar products with full Pello reports, ingredient science and community reviews</p>
                  <Link href={`/products?q=${encodeURIComponent(analysis.pelloCategoryGuess)}`} className="btn-primary text-sm">
                    Browse {analysis.pelloCategoryGuess}s →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
