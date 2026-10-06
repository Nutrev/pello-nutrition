"use client";

// Budget optimizer (free): ranks goal-relevant products from Pello's database by value, with no
// AI involved in the picks. An optional AI budget strategy (no product picks) needs a free account.
import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog-types";
import {
  STACK_GOALS, BUDGET_HAVE, BUDGET_DEFAULTS, FUEL_CATEGORIES, budgetTiers, monthlyAtOneServing,
  type BudgetInputs, type StackGoal, type CurrentSupplement, type ValuePick,
} from "@/lib/planner-modes";
import { EVENT_TYPES, type CaffeinePreference, type DietaryRestriction, type EventType } from "@/lib/planner";
import { useUser } from "@/lib/auth";
import { PRO_ENABLED } from "@/lib/pro";
import { StepIndicator, Loading, PlanLines, ModeProductCard, parseSections, toggleClass, chipClass } from "./shared";
import { usePlanRequest } from "./usePlanRequest";
import SaveModePlanButton from "./SaveModePlanButton";
import { FieldList, RangeSlider } from "@/components/form/Fields";

type Draft = typeof BUDGET_DEFAULTS;
const $ = (n: number) => `$${n.toFixed(2)}`;

function Tier({ title, desc, picks, tone }: { title: string; desc: string; picks: ValuePick[]; tone: "moss" | "plain" | "amber" }) {
  if (!picks.length) return null;
  const box = tone === "moss" ? "bg-moss/5 border-moss/20" : tone === "amber" ? "bg-amber/5 border-amber/30" : "";
  const head = tone === "moss" ? "text-moss" : tone === "amber" ? "text-amber" : "text-muted";
  return (
    <div className={`card ${box} mb-4`}>
      <div className={`text-xs uppercase tracking-widest mb-1 ${head}`}>{title}</div>
      <p className="text-xs text-muted mb-3">{desc}</p>
      <div className="space-y-2">
        {picks.map((x) => (
          <ModeProductCard key={x.product.id} p={x.product}
            note={`Pello Score ${x.product.pelloScore} · value score ${x.valueScore}${FUEL_CATEGORIES.includes(x.product.category) ? "" : ` · ${$(x.monthly)} a month at one serving a day`}`} />
        ))}
      </div>
    </div>
  );
}

export default function BudgetOptimiser({ catalog, onStartOver }: { catalog: ProductSummary[]; onStartOver: () => void }) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<Draft>(BUDGET_DEFAULTS);
  const [done, setDone] = useState(false);
  const { user } = useUser();
  const { run, loading, error, result, reset } = usePlanRequest("budget-optimiser");

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = <T,>(k: "dietary" | "have", v: T) => setD((x) => {
    const arr = x[k] as T[];
    return { ...x, [k]: arr.includes(v) ? arr.filter((a) => a !== v) : [...arr, v] };
  });

  const tiers = useMemo(() => (done && d.goal ? budgetTiers(catalog, d as BudgetInputs) : null), [done, d, catalog]);
  const canUseAi = !PRO_ENABLED || !!user;

  if (loading) return <Loading text="Calculating value scores across the database..." />;

  if (done && tiers && d.goal) {
    const monthlyPicks = tiers.tier1.filter((x) => !FUEL_CATEGORIES.includes(x.product.category));
    const used = monthlyPicks.reduce((a, x) => a + x.monthly, 0);
    const shown = Math.min(used, d.budget);
    const strategy = result ? parseSections(result.plan, (l) => /^(BUDGET STRATEGY|PRIORITY ORDER|WHAT TO AVOID)$/i.test(l)) : [];
    const goalLabel = STACK_GOALS.find((g) => g.id === d.goal)?.label;
    return (
      <div>
        <div className="mb-6">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Budget optimizer</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{goalLabel} · ${d.budget} a month</h1>
          <p className="text-sm text-muted">
            Ranked from {tiers.considered} products in Pello&apos;s database that fit your goal and choices, by value score: rating × transparency score ÷ price per serving.
            Products without a price, rating or transparency score aren&apos;t ranked.
          </p>
        </div>

        {monthlyPicks.length > 0 && (
          <div className="card mb-6">
            <div className="text-xs text-muted uppercase tracking-widest mb-2">Your budget</div>
            <div className="flex h-4 rounded-full overflow-hidden bg-sand/60 mb-2" role="img" aria-label={`Best value picks use ${$(used)} of your $${d.budget} monthly budget`}>
              {monthlyPicks.map((x, i) => (
                <div key={x.product.id} title={`${x.product.brand} ${x.product.name}: ${$(x.monthly)}`}
                  style={{ width: `${(Math.min(x.monthly, d.budget) / Math.max(d.budget, used)) * 100}%`, background: ["#2D4A2D", "#5E8C5E", "#9DB59D"][i % 3] }} />
              ))}
            </div>
            <p className="text-sm">
              Best value picks: <strong>{$(used)} a month</strong> at one serving a day, of your ${d.budget} budget
              {used <= d.budget ? `, leaving ${$(d.budget - shown)}.` : `, ${$(used - d.budget)} over.`}
              {d.currentSpend != null && <> You currently spend ${d.currentSpend}.</>}
            </p>
          </div>
        )}

        <Tier title="Best value picks" desc="Pello Score above 75 and under $1.50 a serving." picks={tiers.tier1} tone="moss" />
        <Tier title="Good value alternatives" desc="Pello Score 60 to 75 and under $2.00 a serving." picks={tiers.tier2} tone="plain" />
        <Tier title="Premium options" desc="Pello Score above 80, at any price, if your budget allows." picks={tiers.tier3} tone="amber" />
        {!tiers.tier1.length && !tiers.tier2.length && !tiers.tier3.length && (
          <div className="card mb-4 text-sm text-muted">No products in Pello&apos;s database meet these choices with a full price, rating and transparency score. Try removing a restriction.</div>
        )}

        <div className="card mb-6">
          <div className="text-xs text-muted uppercase tracking-widest mb-3">Budget strategy</div>
          {result ? (
            strategy.map((s) => (
              <div key={s.title} className="mb-4 last:mb-0">
                <h3 className="font-display font-semibold mb-2">{s.title.charAt(0) + s.title.slice(1).toLowerCase()}</h3>
                <PlanLines lines={s.lines} />
              </div>
            ))
          ) : canUseAi ? (
            <>
              <p className="text-sm text-muted mb-3">Get AI guidance on how to split your budget across categories for this goal. It doesn&apos;t pick products; those come from the database above.</p>
              {error && <p role="alert" className="text-sm text-rust mb-3">{error.message}</p>}
              <button type="button" onClick={() => run(d)} className="btn-primary">Get my budget strategy</button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted mb-3">Create a free account to get AI guidance on how to split your budget across categories.</p>
              <Link href="/auth/login?mode=signup&redirect=%2Fquiz" className="btn-primary inline-flex">Create a free account</Link>
            </>
          )}
        </div>
        <SaveModePlanButton mode="budget-optimiser" inputs={d}
          defaultName={`Budget: ${goalLabel}, $${d.budget} a month`.slice(0, 100)}
          content={{
            kind: "sections",
            sections: [
              { title: "How these were ranked", lines: [`Ranked from ${tiers.considered} products that fit the goal and choices, by value score: rating × transparency score ÷ price per serving.`] },
              ...(monthlyPicks.length ? [{ title: "Your budget", lines: [`Best value picks: ${$(used)} a month at one serving a day, of a $${d.budget} budget.`] }] : []),
              ...strategy.map((s) => ({ title: s.title, lines: s.lines })),
            ],
            productGroups: [
              { title: "Best value picks", note: "Pello Score above 75 and under $1.50 a serving.", productIds: tiers.tier1.map((x) => x.product.id) },
              { title: "Good value alternatives", note: "Pello Score 60 to 75 and under $2.00 a serving.", productIds: tiers.tier2.map((x) => x.product.id) },
              { title: "Premium options", note: "Pello Score above 80, at any price.", productIds: tiers.tier3.map((x) => x.product.id) },
            ].filter((g) => g.productIds.length),
          }} />
        <button type="button" onClick={() => { reset(); setDone(false); setStep(1); onStartOver(); }} className="btn-secondary w-full justify-center flex">Start over</button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} total={2} />

      {step === 1 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">What&apos;s your main goal?</h2>
          <p className="text-xs text-muted mb-4">Choose one</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {STACK_GOALS.map((g) => <button key={g.id} type="button" aria-pressed={d.goal === g.id} onClick={() => set("goal", g.id as StackGoal)} className={toggleClass(d.goal === g.id)}>{g.label}</button>)}
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Do you race or train for endurance events?</h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={d.eventFocus} onClick={() => set("eventFocus", true)} className={toggleClass(d.eventFocus)}>Yes, endurance events</button>
              <button type="button" aria-pressed={!d.eventFocus} onClick={() => setD((x) => ({ ...x, eventFocus: false, eventType: null }))} className={toggleClass(!d.eventFocus)}>No, general training and health</button>
            </div>
          </div>
          {d.eventFocus && (
            <div className="card mb-6">
              <h3 className="font-display font-semibold mb-3">Event type</h3>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.filter((e) => e.id !== "recovery").map((e) => <button key={e.id} type="button" aria-pressed={d.eventType === e.id} onClick={() => set("eventType", e.id as EventType)} className={toggleClass(d.eventType === e.id)}>{e.label}</button>)}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onStartOver} className="btn-secondary flex-1 justify-center flex">Change planner</button>
            <button type="button" onClick={() => setStep(2)} disabled={!d.goal} className="btn-primary flex-1 justify-center flex disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Budget and constraints</h2>
          <FieldList className="mb-4">
            <RangeSlider label="Monthly nutrition budget" min={20} max={200} step={5} value={d.budget} onChange={(v) => set("budget", v)} format={(v) => `$${v}`} />
            <RangeSlider label="What you spend now (optional)" min={0} max={200} step={5} value={d.currentSpend ?? 0}
              onChange={(v) => set("currentSpend", v)} format={(v) => `$${v}`}
              display={d.currentSpend == null ? "Not set" : `$${d.currentSpend}`}
              aside={d.currentSpend != null && <button type="button" onClick={() => set("currentSpend", null)} className="text-xs font-body font-normal text-muted hover:text-ink">Clear</button>} />
          </FieldList>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-1">Dietary restrictions</h3>
            <p className="text-xs text-muted mb-3">Only products labeled this way are included.</p>
            <div className="flex gap-2 flex-wrap">
              {(["vegan", "gluten-free", "dairy-free"] as DietaryRestriction[]).map((x) => <button key={x} type="button" aria-pressed={d.dietary.includes(x)} onClick={() => toggle("dietary", x)} className={chipClass(d.dietary.includes(x))}>{x}</button>)}
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Caffeine preference</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "moderate", "high"] as CaffeinePreference[]).map((c) => <button key={c} type="button" aria-pressed={d.caffeinePreference === c} onClick={() => set("caffeinePreference", c)} className={toggleClass(d.caffeinePreference === c)}>{c === "none" ? "None" : c === "moderate" ? "Moderate" : "High"}</button>)}
            </div>
          </div>
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-1">Already have</h3>
            <p className="text-xs text-muted mb-3">We&apos;ll leave these out</p>
            <div className="flex gap-2 flex-wrap">
              {BUDGET_HAVE.map((h) => <button key={h.id} type="button" aria-pressed={d.have.includes(h.id)} onClick={() => toggle("have", h.id as CurrentSupplement)} className={chipClass(d.have.includes(h.id))}>{h.label}</button>)}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center flex">Back</button>
            <button type="button" onClick={() => setDone(true)} className="btn-primary flex-1 justify-center flex">Show best value</button>
          </div>
        </div>
      )}
    </div>
  );
}
