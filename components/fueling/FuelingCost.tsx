"use client";

// Fueling cost on a plan's results (Pello Pro): what the session or event's during-fueling costs
// from The Feed's prices, and the cheapest product that meets the same carb and format
// requirements, shown with its Pello Score. It never reorders the recommendations.
import Link from "next/link";
import ProGate from "@/components/ProGate";
import { cheapestEquivalent, fuelingCost } from "@/lib/cost";
import { formatPrice } from "@/lib/servings";
import type { ProductSummary } from "@/lib/catalog-types";

export default function FuelingCost({ scope, carbTarget, carbOptions, extrasCost, catalog, eligible }: {
  scope: "session" | "event";
  carbTarget: number;
  carbOptions: ProductSummary[];   // the plan's carb options, in their recommended order
  extrasCost: number;              // electrolytes and anything else taken during
  catalog: ProductSummary[];
  eligible: (p: ProductSummary) => boolean;  // the plan's diet, standards and caffeine filters
}) {
  const costs = carbOptions
    .map((p) => ({ p, c: fuelingCost(p, carbTarget) }))
    .filter((x): x is { p: ProductSummary; c: { servings: number; cost: number } } => x.c != null);
  if (!costs.length) return null;
  const low = Math.min(...costs.map((x) => x.c.cost)) + extrasCost;
  const high = Math.max(...costs.map((x) => x.c.cost)) + extrasCost;
  const first = costs[0];
  const cheaper = cheapestEquivalent(first.p, catalog, eligible);
  const cheaperCost = cheaper ? fuelingCost(cheaper, carbTarget) : null;

  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-widest mb-2">Fueling cost</div>
      <ProGate compact feature="Fueling cost" description="What this plan costs to fuel, and the cheapest equivalent product with its Pello Score.">
        <div className="rounded-xl bg-sand/40 p-3 text-sm space-y-2">
          <div>
            Estimated product cost for this {scope}:{" "}
            <span className="font-display font-semibold">{low === high ? formatPrice(Math.round(low * 100) / 100) : `${formatPrice(Math.round(low * 100) / 100)}-${formatPrice(Math.round(high * 100) / 100)}`}</span>
            <span className="text-xs text-muted"> depending on the carb option, from The Feed&apos;s prices per serving</span>
          </div>
          {cheaper && cheaperCost && (
            <div className="text-xs text-muted">
              Cheapest equivalent to {first.p.brand} {first.p.name} ({formatPrice(first.c.cost)}, Pello Score {first.p.pelloScore ?? "not scored"}):{" "}
              <Link href={`/report/${cheaper.id}`} className="text-moss hover:underline">{cheaper.brand} {cheaper.name}</Link>,{" "}
              {formatPrice(cheaperCost.cost)} for {cheaperCost.servings} servings, Pello Score {cheaper.pelloScore ?? "not scored"}.
              Same format and carbs per serving within 25%.
            </div>
          )}
        </div>
      </ProGate>
    </div>
  );
}
