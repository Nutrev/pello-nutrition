"use client";

// Gut-training program (Pello Pro): a week-by-week plan that raises carbs per hour in long
// sessions from what the athlete tolerates now toward their race target. The weekly steps are
// config values in lib/fueling.ts (GUT_TRAINING_WEEKS).
import { useState } from "react";
import ProGate from "@/components/ProGate";
import { gutTrainingPlan, GUT_TRAINING_START_OPTIONS, GUT_TRAINING_TARGET_OPTIONS } from "@/lib/fueling";

const chip = (on: boolean) => `text-sm px-3 py-1.5 rounded-lg border transition-colors ${on ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`;

export default function GutTrainingProgram() {
  const [start, setStart] = useState<number>(60);
  const [target, setTarget] = useState<number>(90);
  const weeks = gutTrainingPlan(start, target);

  return (
    <section className="card" aria-labelledby="gut-training">
      <h2 id="gut-training" className="font-display font-semibold text-xl mb-1">Gut-training program</h2>
      <p className="text-sm text-muted mb-5">
        Your gut can learn to absorb more carbohydrate. Raise the amount you take in long sessions a step at a time,
        from what you tolerate now toward your race target.
      </p>
      <ProGate feature="Gut-training program" description="A week-by-week plan to raise your carbs per hour toward your race target.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <div className="text-xs text-muted mb-2">What you take comfortably now</div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Current carbs per hour">
              {GUT_TRAINING_START_OPTIONS.map((g) => (
                <button key={g} type="button" role="radio" aria-checked={start === g} onClick={() => setStart(g)} className={chip(start === g)}>{g}g/hr</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-2">Your race target</div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Target carbs per hour">
              {GUT_TRAINING_TARGET_OPTIONS.map((g) => (
                <button key={g} type="button" role="radio" aria-checked={target === g} onClick={() => setTarget(g)} className={chip(target === g)}>{g}g/hr</button>
              ))}
            </div>
          </div>
        </div>

        <ol className="divide-y divide-sand border-y border-sand">
          {weeks.map((w) => (
            <li key={w.week} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="w-20 text-xs uppercase tracking-widest text-muted flex-shrink-0">Week {w.week}</div>
              <div className="font-display font-semibold w-28 flex-shrink-0">{w.carbsPerHour}g carbs/hr</div>
              <div className="text-sm text-muted">
                In {w.longSessions === 1 ? "one long session" : `${w.longSessions} long sessions`} this week. {w.note}
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted mt-4 leading-relaxed">
          Only move up when the current week sits well. If you get stomach trouble, repeat the week or drop back a step.
          Everyone tolerates carbohydrate differently.
        </p>
      </ProGate>
    </section>
  );
}
