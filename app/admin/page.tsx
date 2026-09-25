"use client";

import { useState } from "react";

interface EnrichedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  logoDomain: string;
  imageEmoji: string;
  rating: number;
  reviewCount: number;
  price: number;
  goals: string[];
  transparencyScore: number;
  sentiment: Record<string, number>;
  ingredients: {
    name: string;
    dose: string;
    verdict: string;
    note: string;
    pubmedUrl?: string;
    examineUrl?: string;
  }[];
  sources: {
    name: string;
    icon: string;
    count: number;
    unit: string;
    credibility: string;
  }[];
}

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Also support manual label entry
  const [mode, setMode] = useState<"url" | "label" | "manual">("url");
  const [labelText, setLabelText] = useState("");
  const [manualData, setManualData] = useState({
    name: "",
    brand: "",
    category: "Energy Gel",
    price: "",
    ingredients: "",
    carbs: "",
    sodium: "",
    caffeine: "",
    protein: "",
    certifications: "",
  });

  const enrichFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: "url" }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data.code); }
    } catch (e) {
      setError("Failed to enrich product. Check the URL and try again.");
    }
    setLoading(false);
  };

  const enrichFromLabel = async () => {
    if (!labelText.trim()) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelText, mode: "label" }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data.code); }
    } catch (e) {
      setError("Failed to enrich product.");
    }
    setLoading(false);
  };

  const enrichFromManual = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualData, mode: "manual" }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data.code); }
    } catch (e) {
      setError("Failed to enrich product.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CATEGORIES = [
    "Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix",
    "Hydration", "Protein", "Creatine", "Supplement", "Probiotic",
    "Omega-3", "Vitamin", "Mineral",
  ];

  return (
    <div className="min-h-screen">

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Admin tool</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Product enrichment</h1>
          <p className="text-muted text-sm">Add new products to the Pello Explore. Paste a product URL, enter label data, or fill in manually — Claude generates the TypeScript code ready to paste into <code className="font-mono text-xs bg-sand px-1 py-0.5 rounded">lib/products.ts</code>.</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: "url" as const, label: "Product URL", desc: "Paste any product page URL" },
            { id: "label" as const, label: "Label text", desc: "Paste ingredients & nutrition" },
            { id: "manual" as const, label: "Manual entry", desc: "Fill in key fields" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl border text-left transition-all ${mode === m.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted"}`}>
              <div className="font-medium text-sm">{m.label}</div>
              <div className="text-xs text-muted">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* URL mode */}
        {mode === "url" && (
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-4">Product URL</h3>
            <p className="text-xs text-muted mb-3">Works best with brand websites, The Feed, Running Warehouse, Amazon product pages</p>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.maurten.com/products/gel-100"
              className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted mb-4"
            />
            <button onClick={enrichFromUrl} disabled={loading || !url.trim()}
              className="btn-primary disabled:opacity-40">
              {loading ? "Enriching..." : "Generate product code →"}
            </button>
          </div>
        )}

        {/* Label mode */}
        {mode === "label" && (
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-4">Label / nutrition data</h3>
            <p className="text-xs text-muted mb-3">Paste the full ingredients list and nutrition facts — from a photo, website or manual transcription</p>
            <textarea
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              placeholder={`Product name: Maurten Gel 100
Brand: Maurten
Price: $38 (box of 12)

Ingredients: Water, Maltodextrin (from corn), Fructose, Sodium Alginate, Calcium Carbonate, Sodium Chloride, Glucono Delta-Lactone

Nutrition per gel (40g):
Calories: 100
Carbohydrates: 25g
  of which sugars: 10g
Sodium: 55mg
Protein: 0g
Fat: 0g`}
              rows={12}
              className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted mb-4 resize-none font-mono"
            />
            <button onClick={enrichFromLabel} disabled={loading || !labelText.trim()}
              className="btn-primary disabled:opacity-40">
              {loading ? "Enriching..." : "Generate product code →"}
            </button>
          </div>
        )}

        {/* Manual mode */}
        {mode === "manual" && (
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-4">Manual entry</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Product name</label>
                  <input value={manualData.name} onChange={e => setManualData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Gel 100" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Brand</label>
                  <input value={manualData.brand} onChange={e => setManualData(p => ({ ...p, brand: e.target.value }))}
                    placeholder="Maurten" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Category</label>
                  <select value={manualData.category} onChange={e => setManualData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Price (box/bottle)</label>
                  <input value={manualData.price} onChange={e => setManualData(p => ({ ...p, price: e.target.value }))}
                    placeholder="$38" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Carbs per serving (g)</label>
                  <input value={manualData.carbs} onChange={e => setManualData(p => ({ ...p, carbs: e.target.value }))}
                    placeholder="25" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Sodium per serving (mg)</label>
                  <input value={manualData.sodium} onChange={e => setManualData(p => ({ ...p, sodium: e.target.value }))}
                    placeholder="55" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Caffeine per serving (mg)</label>
                  <input value={manualData.caffeine} onChange={e => setManualData(p => ({ ...p, caffeine: e.target.value }))}
                    placeholder="0 or 100" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted mb-1 block">Certifications</label>
                  <input value={manualData.certifications} onChange={e => setManualData(p => ({ ...p, certifications: e.target.value }))}
                    placeholder="Informed Sport, NSF" className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted" />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-muted mb-1 block">Ingredients list</label>
                <textarea value={manualData.ingredients} onChange={e => setManualData(p => ({ ...p, ingredients: e.target.value }))}
                  placeholder="Maltodextrin, Fructose, Sodium Alginate, Calcium Carbonate..."
                  rows={3}
                  className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted resize-none" />
              </div>
              <button onClick={enrichFromManual} disabled={loading || !manualData.name || !manualData.brand}
                className="btn-primary disabled:opacity-40">
                {loading ? "Enriching..." : "Generate product code →"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card text-center py-10 mb-6">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-sand border-t-moss rounded-full mb-4" />
            <p className="text-sm text-muted">Claude is researching this product and generating the code...</p>
            <p className="text-xs text-muted mt-1">This takes 15-30 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rust/10 border border-rust/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-rust">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-moss uppercase tracking-widest">Generated code</div>
              <button onClick={copyToClipboard}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${copied ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                {copied ? "✓ Copied!" : "Copy code"}
              </button>
            </div>
            <div className="bg-ink rounded-xl p-5 overflow-auto max-h-[600px]">
              <pre className="text-xs text-cream/80 leading-relaxed font-mono whitespace-pre-wrap">{result}</pre>
            </div>
            <div className="mt-3 p-4 bg-moss/5 border border-moss/20 rounded-xl">
              <p className="text-xs text-moss font-medium mb-1">Next step</p>
              <p className="text-xs text-muted">Copy the code above and paste it into <code className="font-mono bg-sand px-1 rounded">lib/products.ts</code> inside the <code className="font-mono bg-sand px-1 rounded">PRODUCTS</code> array. Make sure to check the generated ID is unique.</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <div className="card bg-sand/30 mt-8">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">How it works</div>
            <div className="space-y-2">
              {[
                "Paste a product URL, label text or fill in manually",
                "Claude researches the product, cross-references ingredients with PubMed and generates a complete product entry",
                "Copy the generated TypeScript code",
                "Paste into lib/products.ts inside the PRODUCTS array",
                "The product instantly appears on pellonutrition.com",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-muted">
                  <span className="font-mono text-moss flex-shrink-0">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
