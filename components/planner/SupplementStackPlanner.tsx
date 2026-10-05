"use client";

// Supplement stack planner (Pello Pro): goals, what the athlete already takes, profile and budget,
// then a morning / training / evening protocol from products in Pello's database.
import { useEffect, useState } from "react";
import type { ProductSummary } from "@/lib/catalog-types";
import { STACK_GOALS, CURRENT_SUPPLEMENTS, STACK_DEFAULTS, MODE_PRO_PITCH, type StackInputs, type StackGoal, type CurrentSupplement } from "@/lib/planner-modes";
import type { DietaryRestriction } from "@/lib/planner";
import { useUser } from "@/lib/auth";
import { useProAccess } from "@/lib/subscription";
import ProGate from "@/components/ProGate";
import { StepIndicator, Loading, PlanCard, PlanLines, ModeProductCard, parseSections, mentionedIds, toggleClass, chipClass } from "./shared";
import { usePlanRequest } from "./usePlanRequest";
import SaveModePlanButton from "./SaveModePlanButton";

const HEADERS = ["MORNING", "AROUND TRAINING", "EVENING", "PRIORITY ORDER", "TOTALS", "KEY NOTES", "PRODUCTS USED"];

export default function SupplementStackPlanner({ catalog, onStartOver }: { catalog: ProductSummary[]; onStartOver: () => void }) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<StackInputs>(STACK_DEFAULTS);
  const { profile } = useUser();
  const { allowed } = useProAccess();
  const { run, loading, error, result, reset } = usePlanRequest("supplement-stack");

  // Start from the athlete profile where it has the answers.
  useEffect(() => {
    if (!profile) return;
    setInputs((i) => ({
      ...i,
      ...(profile.age != null ? { age: profile.age } : {}),
      ...(profile.sex ? { sex: profile.sex } : {}),
      ...(profile.training_days_per_week != null ? { trainingDaysPerWeek: profile.training_days_per_week } : {}),
      ...(profile.dietary?.length ? { dietary: profile.dietary as DietaryRestriction[] } : {}),
    }));
  }, [profile]);

  const set = <K extends keyof StackInputs>(k: K, v: StackInputs[K]) => setInputs((i) => ({ ...i, [k]: v }));
  // Toggles build on the latest state, so quick taps don't undo each other.
  const toggleGoal = (g: StackGoal) => setInputs((i) => ({ ...i, goals: i.goals.includes(g) ? i.goals.filter((x) => x !== g) : [...i.goals, g] }));
  const toggleCurrent = (c: CurrentSupplement) => setInputs((i) => {
    if (c === "none") return { ...i, current: i.current.includes("none") ? [] : ["none"] };
    const rest = i.current.filter((x) => x !== "none");
    return { ...i, current: rest.includes(c) ? rest.filter((x) => x !== c) : [...rest, c] };
  });
  const toggleDiet = (d: DietaryRestriction) => setInputs((i) => ({ ...i, dietary: i.dietary.includes(d) ? i.dietary.filter((x) => x !== d) : [...i.dietary, d] }));

  if (!allowed) {
    return (
      <div>
        <ProGate feature="Supplement stack planner" description={MODE_PRO_PITCH["supplement-stack"]} />
        <div className="text-center mt-4"><button type="button" onClick={onStartOver} className="text-sm text-muted hover:text-ink">Choose a different planner</button></div>
      </div>
    );
  }

  if (loading) return <Loading text="Matching supplements to your goals..." />;

  if (result) {
    const sections = parseSections(result.plan, (l) => HEADERS.includes(l.toUpperCase()));
    const get = (h: string) => sections.find((s) => s.title.toUpperCase() === h)?.lines ?? [];
    const ids = mentionedIds(result.plan, result.products);
    const recommended = ids.map((id) => catalog.find((p) => p.id === id)).filter((p): p is ProductSummary => !!p);
    return (
      <div>
        <div className="mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Your supplement stack</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-3">Supplement stack · ${inputs.budget} a month</h1>
          <div className="flex flex-wrap gap-2">
            {inputs.goals.map((g) => <span key={g} className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{STACK_GOALS.find((x) => x.id === g)?.label}</span>)}
            {inputs.dietary.map((d) => <span key={d} className="text-xs bg-sand px-2 py-0.5 rounded-md">{d}</span>)}
          </div>
        </div>
        <PlanCard label="AM" title="Morning" lines={get("MORNING")} tone="moss" />
        <PlanCard label="TRN" title="Around training" lines={get("AROUND TRAINING")} tone="amber" />
        <PlanCard label="PM" title="Evening" lines={get("EVENING")} tone="blue" />
        {get("PRIORITY ORDER").length > 0 && (
          <div className="card mb-4"><div className="text-xs text-muted uppercase tracking-widest mb-3">Priority order</div><PlanLines lines={get("PRIORITY ORDER")} /></div>
        )}
        {get("TOTALS").length > 0 && (
          <div className="card bg-moss/5 border-moss/20 mb-4"><div className="text-xs text-moss uppercase tracking-widest mb-3">Totals</div><PlanLines lines={get("TOTALS")} /></div>
        )}
        {get("KEY NOTES").length > 0 && (
          <div className="card bg-sand/30 mb-6"><div className="text-xs text-muted uppercase tracking-widest mb-3">Key notes</div><PlanLines lines={get("KEY NOTES")} /></div>
        )}
        {recommended.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-muted uppercase tracking-widest mb-2">Products in this plan</div>
            <p className="text-xs text-muted mb-3">Monthly costs assume one serving a day unless the plan says otherwise.</p>
            <div className="space-y-2">{recommended.map((p) => <ModeProductCard key={p.id} p={p} />)}</div>
          </div>
        )}
        <SaveModePlanButton mode="supplement-stack" inputs={inputs}
          defaultName={`Supplement stack: ${inputs.goals.map((g) => STACK_GOALS.find((x) => x.id === g)?.label).join(", ")}`.slice(0, 100)}
          content={{
            kind: "sections",
            sections: sections.filter((s) => s.title.toUpperCase() !== "PRODUCTS USED").map((s) => ({ title: s.title, lines: s.lines })),
            productGroups: [{ title: "Products in this plan", note: "Monthly costs assume one serving a day unless the plan says otherwise.", productIds: ids }],
          }} />
        <button type="button" onClick={() => { reset(); setStep(1); onStartOver(); }} className="btn-secondary w-full justify-center flex">Start over</button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">What are you trying to achieve?</h2>
          <p className="text-xs text-muted mb-4">Select all that apply</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {STACK_GOALS.map((g) => (
              <button key={g.id} type="button" aria-pressed={inputs.goals.includes(g.id)} onClick={() => toggleGoal(g.id)} className={toggleClass(inputs.goals.includes(g.id))}>{g.label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onStartOver} className="btn-secondary flex-1 justify-center flex">Change planner</button>
            <button type="button" onClick={() => setStep(2)} disabled={!inputs.goals.length} className="btn-primary flex-1 justify-center flex disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">What supplements are you currently taking?</h2>
          <p className="text-xs text-muted mb-4">Skip if starting from scratch</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {CURRENT_SUPPLEMENTS.map((c) => (
              <button key={c.id} type="button" aria-pressed={inputs.current.includes(c.id)} onClick={() => toggleCurrent(c.id)} className={toggleClass(inputs.current.includes(c.id))}>{c.label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center flex">Back</button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 justify-center flex">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Your profile and budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="card">
              <h3 className="font-display font-semibold mb-4">Age</h3>
              <input type="range" aria-label="Age" min={16} max={70} value={inputs.age} onChange={(e) => set("age", Number(e.target.value))} className="w-full accent-moss" />
              <div className="text-center font-display font-bold text-2xl text-moss">{inputs.age}</div>
            </div>
            <div className="card">
              <h3 className="font-display font-semibold mb-4">Sex</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["male", "female"] as const).map((s) => <button key={s} type="button" aria-pressed={inputs.sex === s} onClick={() => set("sex", s)} className={toggleClass(inputs.sex === s)}>{s === "male" ? "Male" : "Female"}</button>)}
              </div>
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-4">Training days per week</h3>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => <button key={d} type="button" aria-pressed={inputs.trainingDaysPerWeek === d} onClick={() => set("trainingDaysPerWeek", d)} className={`py-2 rounded-xl border text-sm ${inputs.trainingDaysPerWeek === d ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>{d}</button>)}
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="font-display font-semibold mb-4">Monthly supplement budget</h3>
            <input type="range" aria-label="Monthly budget" min={20} max={300} step={5} value={inputs.budget} onChange={(e) => set("budget", Number(e.target.value))} className="w-full accent-moss" />
            <div className="text-center font-display font-bold text-2xl text-moss">${inputs.budget}</div>
          </div>
          <div className="card mb-6">
            <h3 className="font-display font-semibold mb-1">Dietary restrictions</h3>
            <p className="text-xs text-muted mb-3">Only products labelled this way are recommended.</p>
            <div className="flex gap-2 flex-wrap">
              {(["vegan", "gluten-free", "dairy-free"] as DietaryRestriction[]).map((d) => <button key={d} type="button" aria-pressed={inputs.dietary.includes(d)} onClick={() => toggleDiet(d)} className={chipClass(inputs.dietary.includes(d))}>{d}</button>)}
            </div>
          </div>
          {error && (
            <div className="mb-4">
              {error.code === "pro" ? <ProGate feature="Supplement stack planner" description={MODE_PRO_PITCH["supplement-stack"]} /> : <p role="alert" className="text-sm text-rust">{error.message}</p>}
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center flex">Back</button>
            <button type="button" onClick={() => run(inputs)} className="btn-primary flex-1 justify-center flex">Build my stack</button>
          </div>
        </div>
      )}
    </div>
  );
}
