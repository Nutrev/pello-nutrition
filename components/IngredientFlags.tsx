"use client";

import { INGREDIENT_TAXONOMY, IngredientFlag } from "@/lib/ingredient-taxonomy";

interface IngredientFlagsProps {
  ingredientNames: string[];
  compact?: boolean;
}

const FLAG_CONFIG: Record<IngredientFlag, { label: string; note: string; severity: "warn" | "info" }> = {
  "artificial-sweetener": { label: "Artificial sweetener", note: "Contains sucralose, acesulfame-K or similar", severity: "warn" },
  "artificial-colour": { label: "Artificial colour", note: "Contains synthetic food dyes", severity: "warn" },
  "artificial-preservative": { label: "Artificial preservative", note: "Contains sodium benzoate or potassium sorbate", severity: "info" },
  "seed-oil": { label: "Seed oil", note: "Contains sunflower, canola or similar refined oil", severity: "info" },
  "gum": { label: "Gum / stabiliser", note: "Contains xanthan, gellan or similar gum", severity: "info" },
  "soy": { label: "Contains soy", note: "Soy lecithin or soy-derived ingredient present", severity: "warn" },
  "gluten": { label: "Contains gluten", note: "Not suitable for coeliac or gluten-sensitive athletes", severity: "warn" },
  "proprietary-blend": { label: "Proprietary blend", note: "Ingredient doses are not fully disclosed", severity: "warn" },
  "high-fructose-corn-syrup": { label: "HFCS", note: "Contains high fructose corn syrup", severity: "warn" },
  "hydrogenated-fat": { label: "Hydrogenated fat", note: "Contains partially or fully hydrogenated oils", severity: "warn" },
  "carrageenan": { label: "Carrageenan", note: "Some research links to gut inflammation", severity: "warn" },
  "maltitol": { label: "Maltitol", note: "Sugar alcohol — can cause GI distress at high doses", severity: "info" },
  "sorbitol": { label: "Sorbitol", note: "Sugar alcohol — can cause GI distress at high doses", severity: "info" },
  "natural-flavours": { label: "Ambiguous natural flavours", note: "Exact source not disclosed — may not be vegan", severity: "info" },
  "caramel-colour": { label: "Caramel colour", note: "Class IV caramel colour has 4-MEI concerns", severity: "warn" },
  "silicon-dioxide": { label: "Silicon dioxide", note: "Anti-caking agent", severity: "info" },
  "titanium-dioxide": { label: "Titanium dioxide", note: "Nanoparticle concerns in some research", severity: "warn" },
  "carnauba-wax": { label: "Carnauba wax", note: "Coating agent from palm leaves", severity: "info" },
  "modified-starch": { label: "Modified starch", note: "Highly processed starch derivative", severity: "info" },
  "enriched-flour": { label: "Enriched flour", note: "Refined flour with added synthetic vitamins", severity: "info" },
};

function detectFlags(ingredientNames: string[]): IngredientFlag[] {
  const flags = new Set<IngredientFlag>();
  ingredientNames.forEach((name) => {
    const nameLower = name.toLowerCase();
    INGREDIENT_TAXONOMY.forEach((taxIngredient) => {
      const matches =
        taxIngredient.name.toLowerCase() === nameLower ||
        taxIngredient.aliases.some((a) => nameLower.includes(a.toLowerCase())) ||
        nameLower.includes(taxIngredient.name.toLowerCase());
      if (matches) taxIngredient.flags.forEach((f) => flags.add(f));
    });
  });
  return Array.from(flags);
}

export default function IngredientFlags({ ingredientNames, compact = false }: IngredientFlagsProps) {
  const flags = detectFlags(ingredientNames);

  if (flags.length === 0) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-xs text-moss font-mono">
        <span>✓</span><span>No flagged ingredients detected</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {flags.map((flag) => {
          const config = FLAG_CONFIG[flag];
          return (
            <span key={flag} title={config.note}
              className={`text-xs font-mono px-1.5 py-0.5 rounded ${config.severity === "warn" ? "bg-rust/10 text-rust" : "bg-amber/10 text-amber"}`}>
              ⚠ {config.label}
            </span>
          );
        })}
      </div>
    );
  }

  const warnings = flags.filter((f) => FLAG_CONFIG[f].severity === "warn");
  const info = flags.filter((f) => FLAG_CONFIG[f].severity === "info");

  return (
    <div className="space-y-2">
      {warnings.length > 0 && (
        <div className="bg-rust/5 border border-rust/20 rounded-xl p-4">
          <div className="text-xs font-mono text-rust uppercase tracking-widest mb-2">Watch out for</div>
          <div className="space-y-1.5">
            {warnings.map((flag) => {
              const config = FLAG_CONFIG[flag];
              return (
                <div key={flag} className="flex items-start gap-2">
                  <span className="text-rust text-xs flex-shrink-0 mt-0.5">⚠</span>
                  <div>
                    <span className="text-xs font-medium text-rust">{config.label}</span>
                    <span className="text-xs text-muted ml-2">{config.note}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {info.length > 0 && (
        <div className="bg-amber/5 border border-amber/20 rounded-xl p-4">
          <div className="text-xs font-mono text-amber uppercase tracking-widest mb-2">Also noted</div>
          <div className="space-y-1.5">
            {info.map((flag) => {
              const config = FLAG_CONFIG[flag];
              return (
                <div key={flag} className="flex items-start gap-2">
                  <span className="text-amber text-xs flex-shrink-0 mt-0.5">→</span>
                  <div>
                    <span className="text-xs font-medium text-amber">{config.label}</span>
                    <span className="text-xs text-muted ml-2">{config.note}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}