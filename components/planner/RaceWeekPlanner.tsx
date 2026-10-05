"use client";

// Race week planner (Pello Pro): a day-by-day countdown to race day. Carbohydrate, fluid and
// race-day targets come from the 2016 position stand (lib/planner-modes.ts raceWeekTargets);
// the AI writes the days around them using products from Pello's database.
import { useEffect, useState } from "react";
import type { ProductSummary } from "@/lib/catalog-types";
import {
  RACE_TYPES, RACE_DURATIONS, RACE_PRIORITIES, RACE_WEEK_DEFAULTS, MODE_PRO_PITCH, raceWeekTargets,
  type RaceWeekInputs, type RaceType, type RaceDuration, type RacePriority,
} from "@/lib/planner-modes";
import { KG_PER_LB, formatWeight, type CaffeinePreference, type DietaryRestriction, type FormatPreference, type WeightUnit } from "@/lib/planner";
import { useUser } from "@/lib/auth";
import { useProAccess } from "@/lib/subscription";
import ProGate from "@/components/ProGate";
import { StepIndicator, Loading, PlanCard, PlanLines, ModeProductCard, parseSections, mentionedIds, toggleClass, chipClass } from "./shared";
import { usePlanRequest } from "./usePlanRequest";

type Draft = typeof RACE_WEEK_DEFAULTS;
const FORMATS: { id: FormatPreference; label: string }[] = [
  { id: "Energy Gel", label: "Gels" }, { id: "Energy Chew", label: "Chews" }, { id: "Energy Bar", label: "Bars" },
  { id: "Carbohydrate Mix", label: "Drink mix" }, { id: "Hydration", label: "Electrolytes" },
];
const POSITION_STAND = "https://www.dietitians.ca/DietitiansOfCanada/media/Documents/Resources/noap-position-paper.pdf";

export default function RaceWeekPlanner({ catalog, onStartOver }: { catalog: ProductSummary[]; onStartOver: () => void }) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<Draft>(RACE_WEEK_DEFAULTS);
  const { profile } = useUser();
  const { allowed } = useProAccess();
  const { run, loading, error, result, reset } = usePlanRequest("race-week");

  useEffect(() => {
    if (!profile) return;
    setD((x) => ({
      ...x,
      ...(profile.weight_kg != null ? { weightKg: profile.weight_kg } : {}),
      weightUnit: profile.weight_unit ?? x.weightUnit,
      ...(profile.caffeine_preference ? { caffeinePreference: profile.caffeine_preference } : {}),
      ...(profile.dietary?.length ? { dietary: profile.dietary as DietaryRestriction[] } : {}),
    }));
  }, [profile]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = <T,>(k: "dietary" | "formats", v: T) => setD((x) => {
    const arr = x[k] as T[];
    return { ...x, [k]: arr.includes(v) ? arr.filter((a) => a !== v) : [...arr, v] };
  });
  const inLbs = d.weightUnit === "lbs";

  if (!allowed) {
    return (
      <div>
        <ProGate feature="Race week protocol" description={MODE_PRO_PITCH["race-week"]} />
        <div className="text-center mt-4"><button type="button" onClick={onStartOver} className="text-sm text-muted hover:text-ink">Choose a different planner</button></div>
      </div>
    );
  }
  if (loading) return <Loading text="Building your countdown protocol..." />;

  if (result && d.raceType && d.duration && d.priority) {
    const t = raceWeekTargets({ duration: d.duration, weightKg: d.weightKg });
    const sections = parseSections(result.plan, (l) => /^DAY \d+\b/i.test(l) || /^(RACE DAY|WHAT TO AVOID THIS WEEK|KEY NOTES|PRODUCTS USED)$/i.test(l));
    const days = sections.filter((s) => /^DAY \d+/i.test(s.title));
    const race = sections.find((s) => /^RACE DAY$/i.test(s.title));
    const avoid = sections.find((s) => /^WHAT TO AVOID/i.test(s.title));
    const notes = sections.find((s) => /^KEY NOTES$/i.test(s.title));
    const recommended = mentionedIds(result.plan, result.products).map((id) => catalog.find((p) => p.id === id)).filter((p): p is ProductSummary => !!p);
    const raceLabel = RACE_TYPES.find((r) => r.id === d.raceType)?.label;
    return (
      <div>
        <div className="mb-6">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Race week protocol</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{raceLabel} · {RACE_DURATIONS.find((x) => x.id === d.duration)?.label} · {d.daysUntil} days out</h1>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{RACE_PRIORITIES.find((p) => p.id === d.priority)?.label}</span>
            <span className="text-xs bg-sand px-2 py-0.5 rounded-md">{formatWeight(d.weightKg, d.weightUnit)}</span>
            {d.dietary.map((x) => <span key={x} className="text-xs bg-sand px-2 py-0.5 rounded-md">{x}</span>)}
          </div>
        </div>

        <div className="card bg-moss/5 border-moss/20 mb-6 text-sm">
          <div className="text-xs text-moss uppercase tracking-widest mb-3">Your targets</div>
          <div className="space-y-1.5">
            <p>{t.loading
              ? <>Carbohydrate loading: <strong>{t.dailyCarbs.grams[0]}-{t.dailyCarbs.grams[1]}g a day</strong> ({t.dailyCarbs.gPerKg[0]}-{t.dailyCarbs.gPerKg[1]} g/kg) for the last 36-48 hours.</>
              : <>No carbohydrate loading for races under 90 minutes: <strong>{t.dailyCarbs.grams[0]}-{t.dailyCarbs.grams[1]}g</strong> ({t.dailyCarbs.gPerKg[0]}-{t.dailyCarbs.gPerKg[1]} g/kg) in the 24 hours before.</>}</p>
            <p>Pre-race meal: <strong>{t.preRaceMeal.grams[0]}-{t.preRaceMeal.grams[1]}g carbohydrate</strong>, 1-4 hours before the start.</p>
            <p>Pre-race fluid: <strong>{t.preRaceFluidMl[0]}-{t.preRaceFluidMl[1]}ml</strong> in the 2-4 hours before.</p>
            <p>During the race: {t.duringCarbs}.</p>
          </div>
          <p className="text-[11px] text-muted mt-3">
            From the <a href={POSITION_STAND} target="_blank" rel="noopener noreferrer" className="underline">2016 position stand on Nutrition and Athletic Performance</a> (Academy of Nutrition and Dietetics, Dietitians of Canada, American College of Sports Medicine).
          </p>
        </div>

        {days.map((s) => <PlanCard key={s.title} label={s.title.match(/\d+/)?.[0] ?? ""} title={s.title.replace(/:/, " ·")} lines={s.lines} tone="sand" />)}
        {race && <PlanCard label="RACE" title="Race day" lines={race.lines} tone="moss" />}
        {avoid && avoid.lines.length > 0 && <div className="card mb-4"><div className="text-xs text-muted uppercase tracking-widest mb-3">What to avoid this week</div><PlanLines lines={avoid.lines} /></div>}
        {notes && notes.lines.length > 0 && <div className="card bg-sand/30 mb-6"><div className="text-xs text-muted uppercase tracking-widest mb-3">Key notes</div><PlanLines lines={notes.lines} /></div>}
        {recommended.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-muted uppercase tracking-widest mb-2">Products in this plan</div>
            <div className="space-y-2">{recommended.map((p) => <ModeProductCard key={p.id} p={p} />)}</div>
          </div>
        )}
        <button type="button" onClick={() => { reset(); setStep(1); onStartOver(); }} className="btn-secondary w-full justify-center flex">Start over</button>
      </div>
    );
  }

  const ready1 = d.raceType && d.duration && d.priority;
  return (
    <div>
      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Your race</h2>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Race type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RACE_TYPES.map((r) => <button key={r.id} type="button" aria-pressed={d.raceType === r.id} onClick={() => set("raceType", r.id as RaceType)} className={toggleClass(d.raceType === r.id)}>{r.label}</button>)}
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Expected race duration</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RACE_DURATIONS.map((r) => <button key={r.id} type="button" aria-pressed={d.duration === r.id} onClick={() => set("duration", r.id as RaceDuration)} className={toggleClass(d.duration === r.id)}>{r.label}</button>)}
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Days until race</h3>
            <div className="grid grid-cols-6 gap-2">
              {[2, 3, 4, 5, 6, 7].map((n) => <button key={n} type="button" aria-pressed={d.daysUntil === n} onClick={() => set("daysUntil", n)} className={`py-2 rounded-xl border text-sm ${d.daysUntil === n ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>{n}</button>)}
            </div>
          </div>
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-3">Race priority</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RACE_PRIORITIES.map((r) => (
                <button key={r.id} type="button" aria-pressed={d.priority === r.id} onClick={() => set("priority", r.id as RacePriority)} className={toggleClass(d.priority === r.id)}>
                  <div>{r.label}</div><div className="text-xs text-muted font-normal">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onStartOver} className="btn-secondary flex-1 justify-center flex">Change planner</button>
            <button type="button" onClick={() => setStep(2)} disabled={!ready1} className="btn-primary flex-1 justify-center flex disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">About you</h2>
          <div className="card mb-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display font-semibold">Body weight</h3>
              <div role="radiogroup" aria-label="Weight unit" className="inline-flex rounded-lg border border-sand bg-white/40 p-0.5">
                {(["kg", "lbs"] as WeightUnit[]).map((u) => <button key={u} type="button" role="radio" aria-checked={d.weightUnit === u} onClick={() => set("weightUnit", u)} className={`px-3 py-1 text-xs rounded-md ${d.weightUnit === u ? "bg-moss text-cream font-medium" : "text-muted hover:text-ink"}`}>{u}</button>)}
              </div>
            </div>
            <input type="range" aria-label={`Body weight in ${d.weightUnit}`} min={inLbs ? 88 : 40} max={inLbs ? 264 : 120} step={1}
              value={inLbs ? Math.round(d.weightKg * 2.205) : Math.round(d.weightKg)}
              onChange={(e) => { const v = Number(e.target.value); set("weightKg", inLbs ? Math.round(v * KG_PER_LB * 10) / 10 : v); }} className="w-full accent-moss" />
            <div className="text-center font-display font-bold text-2xl text-moss">{formatWeight(d.weightKg, d.weightUnit)}</div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-3">Caffeine preference</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "moderate", "high"] as CaffeinePreference[]).map((c) => <button key={c} type="button" aria-pressed={d.caffeinePreference === c} onClick={() => set("caffeinePreference", c)} className={toggleClass(d.caffeinePreference === c)}>{c === "none" ? "None" : c === "moderate" ? "Moderate" : "High"}</button>)}
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-1">Dietary restrictions</h3>
            <p className="text-xs text-muted mb-3">Only products labelled this way are recommended.</p>
            <div className="flex gap-2 flex-wrap">
              {(["vegan", "gluten-free", "dairy-free"] as DietaryRestriction[]).map((x) => <button key={x} type="button" aria-pressed={d.dietary.includes(x)} onClick={() => toggle("dietary", x)} className={chipClass(d.dietary.includes(x))}>{x}</button>)}
            </div>
          </div>
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-4">Budget for race week products</h3>
            <input type="range" aria-label="Budget" min={10} max={200} step={5} value={d.budget} onChange={(e) => set("budget", Number(e.target.value))} className="w-full accent-moss" />
            <div className="text-center font-display font-bold text-2xl text-moss">${d.budget}</div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center flex">Back</button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 justify-center flex">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Your preferences</h2>
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-1">Preferred formats</h3>
            <p className="text-xs text-muted mb-3">Leave blank for all formats</p>
            <div className="flex gap-2 flex-wrap">
              {FORMATS.map((f) => <button key={f.id} type="button" aria-pressed={d.formats.includes(f.id)} onClick={() => toggle("formats", f.id)} className={chipClass(d.formats.includes(f.id))}>{f.label}</button>)}
            </div>
          </div>
          {error && (
            <div className="mb-4">
              {error.code === "pro" ? <ProGate feature="Race week protocol" description={MODE_PRO_PITCH["race-week"]} /> : <p role="alert" className="text-sm text-rust">{error.message}</p>}
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center flex">Back</button>
            <button type="button" onClick={() => run(d as RaceWeekInputs)} className="btn-primary flex-1 justify-center flex">Build my race week</button>
          </div>
        </div>
      )}
    </div>
  );
}
