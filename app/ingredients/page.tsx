"use client";

import { useState } from "react";
import Link from "next/link";
import {
  INGREDIENT_TAXONOMY,
  IngredientCategory,
  IngredientFlag,
  TaxonomyIngredient,
} from "@/lib/ingredient-taxonomy";

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  "carbohydrate": "Carbohydrates",
  "electrolyte": "Electrolytes",
  "stimulant": "Stimulants",
  "amino-acid": "Amino Acids",
  "protein": "Protein",
  "vitamin": "Vitamins",
  "mineral": "Minerals",
  "adaptogen": "Adaptogens",
  "probiotic": "Probiotics",
  "prebiotic": "Prebiotics",
  "botanical": "Botanicals",
  "omega-fatty-acid": "Omega Fatty Acids",
  "gelling-agent": "Gelling Agents",
  "emulsifier": "Emulsifiers",
  "sweetener": "Sweeteners",
  "preservative": "Preservatives",
  "colourant": "Colourants",
  "seed-oil": "Seed Oils",
  "gum": "Gums",
  "filler": "Fillers",
  "flavouring": "Flavourings",
  "antioxidant": "Antioxidants",
  "thickener": "Thickeners",
};

const FLAG_LABELS: Record<IngredientFlag, string> = {
  "artificial-sweetener": "Artificial sweetener",
  "artificial-colour": "Artificial colour",
  "artificial-preservative": "Artificial preservative",
  "seed-oil": "Seed oil",
  "gum": "Gum / stabiliser",
  "soy": "Contains soy",
  "gluten": "Contains gluten",
  "proprietary-blend": "Proprietary blend",
  "high-fructose-corn-syrup": "High fructose corn syrup",
  "hydrogenated-fat": "Hydrogenated fat",
  "carrageenan": "Carrageenan",
  "maltitol": "Maltitol",
  "sorbitol": "Sorbitol",
  "natural-flavours": "Ambiguous natural flavours",
  "caramel-colour": "Caramel colour",
  "silicon-dioxide": "Silicon dioxide",
  "titanium-dioxide": "Titanium dioxide",
  "carnauba-wax": "Carnauba wax",
  "modified-starch": "Modified starch",
  "enriched-flour": "Enriched flour",
};

const EVIDENCE_COLORS: Record<string, string> = {
  "strong": "bg-moss/10 text-moss",
  "moderate": "bg-amber/10 text-amber",
  "emerging": "bg-amber/10 text-amber",
  "traditional": "bg-sand text-muted",
  "disputed": "bg-rust/10 text-rust",
  "insufficient": "bg-sand text-muted",
};

function IngredientCard({ ingredient }: { ingredient: TaxonomyIngredient }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-display font-semibold text-sm">{ingredient.name}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${EVIDENCE_COLORS[ingredient.evidenceLevel]}`}>
              {ingredient.evidenceLevel}
            </span>
            {ingredient.flags.map((flag) => (
              <span key={flag} className="text-xs font-mono px-2 py-0.5 rounded-md bg-rust/10 text-rust">
                ⚠ {FLAG_LABELS[flag]}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted leading-relaxed">{ingredient.primaryBenefit}</p>
        </div>
        <span className="text-muted text-sm flex-shrink-0">{expanded ? "↑" : "↓"}</span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-sand space-y-3">
          {ingredient.mechanismOfAction && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">How it works</div>
              <p className="text-xs text-muted leading-relaxed">{ingredient.mechanismOfAction}</p>
            </div>
          )}
          {ingredient.optimalDose && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Optimal dose</div>
              <p className="text-xs text-muted">{ingredient.optimalDose}</p>
            </div>
          )}
          {ingredient.safetyNotes && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Safety notes</div>
              <p className="text-xs text-muted leading-relaxed">{ingredient.safetyNotes}</p>
            </div>
          )}
          {ingredient.preferredForms && ingredient.preferredForms.length > 0 && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Preferred forms</div>
              <div className="flex flex-wrap gap-1">
                {ingredient.preferredForms.map((f) => (
                  <span key={f} className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{f}</span>
                ))}
              </div>
            </div>
          )}
          {ingredient.inferiorForms && ingredient.inferiorForms.length > 0 && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Inferior forms to avoid</div>
              <div className="flex flex-wrap gap-1">
                {ingredient.inferiorForms.map((f) => (
                  <span key={f} className="text-xs bg-rust/10 text-rust px-2 py-0.5 rounded-md">{f}</span>
                ))}
              </div>
            </div>
          )}
          {ingredient.aliases.length > 0 && (
            <div>
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Also known as</div>
              <p className="text-xs text-muted">{ingredient.aliases.join(", ")}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            {!ingredient.isVegan && (
              <span className="text-xs bg-amber/10 text-amber px-2 py-0.5 rounded-md font-mono">Not vegan</span>
            )}
            {!ingredient.isGlutenFree && (
              <span className="text-xs bg-rust/10 text-rust px-2 py-0.5 rounded-md font-mono">Contains gluten</span>
            )}
            {ingredient.pubmedUrl && (
              <a href={ingredient.pubmedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">
                PubMed →
              </a>
            )}
            {ingredient.examineUrl && (
              <a href={ingredient.examineUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss underline underline-offset-2">
                Examine →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | "all">("all");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const allCategories = Array.from(new Set(INGREDIENT_TAXONOMY.map((i) => i.category)));

  const filtered = INGREDIENT_TAXONOMY.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch = search === "" ||
      i.name.toLowerCase().includes(q) ||
      i.aliases.some((a) => a.toLowerCase().includes(q)) ||
      i.primaryBenefit.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || i.category === selectedCategory;
    const matchesFlag = !showFlaggedOnly || i.flags.length > 0;
    return matchesSearch && matchesCategory && matchesFlag;
  });

  const grouped = allCategories.reduce<Record<string, TaxonomyIngredient[]>>((acc, cat) => {
    const inCat = filtered.filter((i) => i.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  const flaggedCount = INGREDIENT_TAXONOMY.filter((i) => i.flags.length > 0).length;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      Pel<span className="text-moss">lo</span>
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden sm:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
      <Link href="/guides" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
      <Link href="/compare" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Query</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      
      <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
<Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Reference</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Ingredient encyclopedia</h1>
          <p className="text-muted text-sm">
            {INGREDIENT_TAXONOMY.length} ingredients — evidence ratings, optimal doses, preferred forms and flag alerts for {flaggedCount} commonly avoided additives.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${selectedCategory === "all" ? "bg-moss text-cream border-moss" : "bg-white/60 border-sand hover:border-muted"}`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${selectedCategory === cat ? "bg-moss text-cream border-moss" : "bg-white/60 border-sand hover:border-muted"}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked)}
              className="accent-moss"
            />
            <span className="text-muted">Show flagged ingredients only ({flaggedCount})</span>
          </label>
        </div>

        {/* Results */}
        {Object.entries(grouped).map(([category, ingredients]) => (
          <div key={category} className="mb-8">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3 pb-2 border-b border-sand">
              {CATEGORY_LABELS[category as IngredientCategory]} · {ingredients.length}
            </div>
            <div className="space-y-3">
              {ingredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="font-display font-medium mb-1">No ingredients match</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("all"); setShowFlaggedOnly(false); }} className="text-xs text-moss underline mt-2">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}