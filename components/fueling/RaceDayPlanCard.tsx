"use client";

// Race-day plan card (Pello Pro), on a saved event plan: a gel/fluid/sodium timeline built from
// the plan's own targets and products the athlete picks, with the fueling cost (and the cheapest
// equivalent product, shown with its Pello Score). Printable on its own, and readable on a phone.
import { useMemo, useState } from "react";
import Link from "next/link";
import ProGate from "@/components/ProGate";
import { clockTime, raceDayTimeline, servingInterval, timelineTotals } from "@/lib/fueling";
import { cheapestEquivalent, fuelingCost } from "@/lib/cost";
import { formatPrice } from "@/lib/servings";

export interface RaceDayProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerServing: number;
  pelloScore: number | null;
  nutrition: { carbsPerServing: number | null; sodiumPerServing: number | null; hasCaffeine: boolean };
}

export default function RaceDayPlanCard({ durationHours, carbsPerHour, sodiumPerHour, sodiumBasis, fluidPerHourMl, carbOptions, sodiumOptions }: {
  durationHours: number;
  carbsPerHour: number;
  sodiumPerHour: number;
  sodiumBasis: string;
  fluidPerHourMl: number;
  carbOptions: RaceDayProduct[];    // already filtered to the plan's diet, standards and caffeine choices
  sodiumOptions: RaceDayProduct[];
}) {
  const [carbId, setCarbId] = useState(carbOptions[0]?.id ?? "");
  const [sodiumId, setSodiumId] = useState(sodiumOptions[0]?.id ?? "");
  const [distance, setDistance] = useState("");
  const [unit, setUnit] = useState<"km" | "mi">("km");

  const carb = carbOptions.find((p) => p.id === carbId) ?? null;
  const salt = sodiumOptions.find((p) => p.id === sodiumId) ?? null;
  const label = (p: RaceDayProduct) => `${p.brand} ${p.name}`;
  const dist = Number(distance) > 0 ? Number(distance) : null;

  const rows = useMemo(() => (!carb ? [] : raceDayTimeline({
    durationHours, carbsPerHour, sodiumPerHour, fluidPerHourMl,
    carbProduct: { name: label(carb), carbsPerServing: carb.nutrition.carbsPerServing ?? 0, sodiumPerServing: carb.nutrition.sodiumPerServing ?? 0 },
    sodiumProduct: salt ? { name: label(salt), carbsPerServing: salt.nutrition.carbsPerServing ?? 0, sodiumPerServing: salt.nutrition.sodiumPerServing ?? 0 } : null,
    distanceKm: dist,
  })), [carb, salt, dist, durationHours, carbsPerHour, sodiumPerHour, fluidPerHourMl]);
  const totals = timelineTotals(rows);

  // Cost of the timeline: servings of each product it uses.
  const carbServings = carb ? rows.filter((r) => r.product === label(carb)).length : 0;
  const saltServings = salt ? rows.filter((r) => r.product.startsWith(label(salt))).reduce((s, r) => s + Math.max(1, Math.round(r.sodium / (salt.nutrition.sodiumPerServing || 1))), 0) : 0;
  const cost = (carb ? carbServings * carb.pricePerServing : 0) + (salt ? saltServings * salt.pricePerServing : 0);
  const cheaper = carb ? cheapestEquivalent(carb, carbOptions) : null;
  const cheaperCost = cheaper ? fuelingCost(cheaper, carbServings * (carb?.nutrition.carbsPerServing ?? 0)) : null;

  const print = () => {
    document.body.dataset.print = "race-card";
    window.print();
    delete document.body.dataset.print;
  };

  const select = "w-full text-sm bg-white/60 border border-sand rounded-lg px-3 py-2 focus:outline-none focus:border-moss";

  return (
    <section className="card race-day-card" aria-labelledby="race-day">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 id="race-day" className="font-display font-semibold text-xl">Race-day plan</h2>
      </div>
      <p className="text-sm text-muted mb-5 print:hidden">
        A timeline for race day from this plan: {carbsPerHour}g of carbs and {sodiumPerHour}mg of sodium per hour, about {fluidPerHourMl}ml of fluid per hour, over {durationHours} hours.
      </p>
      <ProGate feature="Race-day plan" description="A gel, fluid and sodium timeline for race day, printable and phone-friendly.">
        {!carbOptions.length ? (
          <p className="text-sm text-muted">No gels, chews or drink mixes meet this plan&apos;s diet and quality choices, so there&apos;s nothing to schedule. <Link href="/quiz" className="text-moss underline">Build a new plan</Link> with fewer restrictions.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 print:hidden">
              <label className="text-xs text-muted">Carb product
                <select value={carbId} onChange={(e) => setCarbId(e.target.value)} className={`${select} mt-1`}>
                  {carbOptions.map((p) => <option key={p.id} value={p.id}>{label(p)} ({p.nutrition.carbsPerServing}g carbs)</option>)}
                </select>
              </label>
              <label className="text-xs text-muted">Electrolyte (for sodium the carb product doesn&apos;t cover)
                <select value={sodiumId} onChange={(e) => setSodiumId(e.target.value)} className={`${select} mt-1`}>
                  <option value="">None</option>
                  {sodiumOptions.map((p) => <option key={p.id} value={p.id}>{label(p)} ({p.nutrition.sodiumPerServing}mg sodium)</option>)}
                </select>
              </label>
              <label className="text-xs text-muted">Race distance (optional, to show distance markers)
                <div className="flex gap-2 mt-1">
                  <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value.replace(/[^\d.]/g, ""))} placeholder="e.g. 42.2" className={select} />
                  <select value={unit} onChange={(e) => setUnit(e.target.value as "km" | "mi")} className={`${select} w-20`} aria-label="Distance unit">
                    <option value="km">km</option><option value="mi">mi</option>
                  </select>
                </div>
              </label>
              <div className="text-xs text-muted self-end">
                {carb && `One ${carb.category.toLowerCase().replace("carbohydrate mix", "serving of drink mix")} every ${servingInterval(carb.nutrition.carbsPerServing ?? 0, carbsPerHour)} minutes.`}
              </div>
            </div>

            {/* Phones: one block per stop. */}
            <ol className="sm:hidden divide-y divide-sand border-y border-sand">
              {rows.map((r, n) => (
                <li key={n} className="py-2.5">
                  <div className="flex justify-between text-sm"><span className="font-display font-semibold">{clockTime(r.minute)}{r.km != null ? ` · ${r.km} ${unit}` : ""}</span><span className="text-muted text-xs">{r.carbs}g carbs · {r.sodium}mg sodium{r.fluidMl ? ` · ${r.fluidMl}ml` : ""}</span></div>
                  <div className="text-sm">{r.product}</div>
                </li>
              ))}
            </ol>
            {/* Larger screens and print: a table. */}
            <div className="hidden sm:block print:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-sand">
                    <th className="py-2 pr-3 font-normal">Time</th>
                    {dist != null && <th className="py-2 pr-3 font-normal">Distance</th>}
                    <th className="py-2 pr-3 font-normal">Product</th>
                    <th className="py-2 pr-3 font-normal text-right">Carbs</th>
                    <th className="py-2 pr-3 font-normal text-right">Fluid</th>
                    <th className="py-2 font-normal text-right">Sodium</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, n) => (
                    <tr key={n} className="border-b border-sand/60">
                      <td className="py-2 pr-3 font-display font-semibold whitespace-nowrap">{clockTime(r.minute)}</td>
                      {dist != null && <td className="py-2 pr-3 whitespace-nowrap">{r.km} {unit}</td>}
                      <td className="py-2 pr-3">{r.product}</td>
                      <td className="py-2 pr-3 text-right">{r.carbs}g</td>
                      <td className="py-2 pr-3 text-right">{r.fluidMl ? `${r.fluidMl}ml` : "-"}</td>
                      <td className="py-2 text-right">{r.sodium}mg</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-2 pr-3" colSpan={dist != null ? 3 : 2}>Total</td>
                    <td className="py-2 pr-3 text-right">{totals.carbs}g</td>
                    <td className="py-2 pr-3 text-right">{totals.fluidMl}ml</td>
                    <td className="py-2 text-right">{totals.sodium}mg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted mt-2">
              Plan target: {Math.round(carbsPerHour * durationHours)}g carbs and {Math.round(sodiumPerHour * durationHours).toLocaleString()}mg sodium.
              {totals.sodium < sodiumPerHour * durationHours * 0.85 && " This timeline falls short on sodium; add an electrolyte or choose one with more sodium per serving."}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-sand/40 p-3">
                <div className="text-xs text-muted">Estimated product cost for this event</div>
                <div className="font-display font-semibold">{formatPrice(Math.round(cost * 100) / 100)}</div>
                <div className="text-[11px] text-muted">From The Feed&apos;s current prices per serving.</div>
              </div>
              {cheaper && cheaperCost && carb && (
                <div className="rounded-xl bg-sand/40 p-3 print:hidden">
                  <div className="text-xs text-muted">Cheapest equivalent {carb.category.toLowerCase()}</div>
                  <div className="font-medium">
                    <Link href={`/report/${cheaper.id}`} className="hover:text-moss">{label(cheaper)}</Link>
                  </div>
                  <div className="text-[11px] text-muted">
                    {cheaper.nutrition.carbsPerServing}g carbs a serving · {formatPrice(cheaperCost.cost)} for this event · Pello Score {cheaper.pelloScore ?? "not scored"} (vs {carb.pelloScore ?? "not scored"})
                  </div>
                  <button type="button" onClick={() => setCarbId(cheaper.id)} className="text-xs text-moss hover:underline mt-1">Use this instead</button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted mt-4 leading-relaxed">
              Sodium: {sodiumBasis.toLowerCase()} range. Fluid is a starting point; drink to thirst and adjust for the day. Practice this plan in training at race intensity before race day.
            </p>
            <div className="mt-4 print:hidden">
              <button type="button" onClick={print} className="btn-secondary text-sm">Print race-day card</button>
            </div>
          </>
        )}
      </ProGate>
    </section>
  );
}
