"use client";

// The filter controls for category pages and search (lib/product-filters.ts). Stateless: the
// page owns the filters and keeps them in the URL.
import { FILTER_DIETS, SORTS, NO_FILTERS, activeFilterCount, type ProductFilters } from "@/lib/product-filters";

const chip = (on: boolean) =>
  `text-xs px-3 py-1.5 rounded-lg border transition-all ${on ? "bg-moss text-cream border-moss" : "border-sand bg-white/60 hover:border-muted"}`;

function NumberField({ label, unit, prefix, value, step, onChange }: {
  label: string; unit: string; prefix?: string; value: number | null; step: number; onChange: (v: number | null) => void;
}) {
  return (
    <label className="text-xs flex items-center gap-1.5 border border-sand bg-white/60 rounded-lg px-2.5 py-1">
      <span className="text-muted">{label}</span>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <input type="number" inputMode="decimal" min={0} step={step} value={value ?? ""} placeholder="any"
        onChange={(e) => { const n = Number(e.target.value); onChange(e.target.value === "" || !(n > 0) ? null : n); }}
        className="w-14 bg-transparent outline-none" aria-label={`${label} (${unit})`} />
      <span className="text-muted">{unit}</span>
    </label>
  );
}

export default function ProductFilterBar({ filters, onChange, carbs, sorting = true, shown, total }: {
  filters: ProductFilters;
  onChange: (f: ProductFilters) => void;
  carbs: boolean;     // show "minimum carbs" and the cost-per-hour sort (carb categories only)
  sorting?: boolean;
  shown?: number;
  total?: number;
}) {
  const set = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });
  const toggleDiet = (d: ProductFilters["diets"][number]) =>
    set({ diets: filters.diets.includes(d) ? filters.diets.filter((x) => x !== d) : [...filters.diets, d] });
  const active = activeFilterCount(filters);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter products">
        <button type="button" aria-pressed={filters.tested} onClick={() => set({ tested: !filters.tested })} className={chip(filters.tested)}
          title="NSF Certified for Sport, Informed Sport or Cologne List">Tested for sport</button>
        <button type="button" aria-pressed={filters.noCaffeine} onClick={() => set({ noCaffeine: !filters.noCaffeine })} className={chip(filters.noCaffeine)}
          title="No caffeine or other stimulant on the label. Products with caffeine in some flavors are left out.">Caffeine-free</button>
        {FILTER_DIETS.map((d) => (
          <button key={d.id} type="button" aria-pressed={filters.diets.includes(d.id)} onClick={() => toggleDiet(d.id)} className={chip(filters.diets.includes(d.id))}>{d.label}</button>
        ))}
        <NumberField label="Max" prefix="$" unit="/ serving" step={0.25} value={filters.maxPrice} onChange={(v) => set({ maxPrice: v })} />
        {carbs && <NumberField label="Min" unit="g carbs" step={5} value={filters.minCarbs} onChange={(v) => set({ minCarbs: v })} />}
        {sorting && (
          <label className="text-xs flex items-center gap-1.5 sm:ml-auto">
            <span className="text-muted">Sort</span>
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value as ProductFilters["sort"] })}
              className="border border-sand bg-white/60 rounded-lg px-2 py-1.5">
              {SORTS.filter((s) => carbs || !s.carbOnly).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        )}
      </div>
      {(active > 0 || shown != null) && (
        <p className="text-xs text-muted mt-2">
          {shown != null && total != null && <>{shown} of {total} products</>}
          {active > 0 && (
            <>
              {shown != null && " · "}
              <button type="button" onClick={() => onChange({ ...NO_FILTERS, sort: filters.sort })} className="text-moss hover:underline">Clear filters</button>
            </>
          )}
          {filters.sort === "cost" && <> · Cost per hour at 60g of carbs an hour; products under 15g of carbs per serving are listed last</>}
        </p>
      )}
    </div>
  );
}
