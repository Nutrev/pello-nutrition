"use client";

// A category page's product grid with filters and sorting. The cards are rendered on the server
// (in the default order, top rated first); this only decides which to show and in what order,
// from a few facts per product, so the page doesn't carry extra product data.
import { useMemo, type ReactNode } from "react";
import ProductFilterBar from "@/components/ProductFilterBar";
import { useUrlFilters } from "@/components/useUrlFilters";
import { applyFilters, type FilterFacts } from "@/lib/product-filters";

export default function CategoryBrowser({ category, facts, cards, carbs }: {
  category: string;
  facts: FilterFacts[];
  cards: Record<string, ReactNode>;
  carbs: boolean;
}) {
  const [filters, setFilters] = useUrlFilters(`category:${category}`);
  const ids = useMemo(() => applyFilters(facts, filters), [facts, filters]);
  const byId = useMemo(() => new Map(facts.map((f) => [f.id, f])), [facts]);

  return (
    <>
      <ProductFilterBar filters={filters} onChange={setFilters} carbs={carbs} shown={ids.length} total={facts.length} />
      {ids.length === 0 ? (
        <p className="text-sm text-muted">No {category.toLowerCase()} products match all of these filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ids.map((id) => {
            const hourly = byId.get(id)?.costPerHour;
            return (
              <div key={id} className="flex flex-col">
                {cards[id]}
                {filters.sort === "cost" && (
                  <p className="text-xs text-muted mt-1.5 px-1">{hourly != null ? `$${hourly.toFixed(2)} an hour at 60g of carbs an hour` : "No cost per hour (under 15g of carbs per serving)"}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
