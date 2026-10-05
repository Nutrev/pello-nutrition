"use client";

// Step 0 of the planner: choose which planner to use.
import { useState } from "react";
import { PLANNER_MODES, type PlannerMode, type ModeAccess } from "@/lib/planner-modes";
import { useProAccess } from "@/lib/subscription";
import { FREE_PLANS_PER_MONTH } from "@/lib/pro";

const tag = "text-xs bg-moss/10 text-moss font-mono px-2 py-0.5 rounded-md";

function accessTag(access: ModeAccess, gating: boolean, isPro: boolean): string | null {
  if (!gating || isPro) return null;
  if (access === "free-limited") return `${FREE_PLANS_PER_MONTH} free plan a month`;
  if (access === "free") return "Free";
  return "Pro";
}

export default function ModeSelector({ onChoose }: { onChoose: (m: PlannerMode) => void }) {
  const [selected, setSelected] = useState<PlannerMode | null>(null);
  const { gating, isPro } = useProAccess();
  return (
    <div>
      <h2 className="font-display font-semibold text-xl mb-1">What do you need help with?</h2>
      <p className="text-sm text-muted mb-5">Choose a planner to get started</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6" role="radiogroup" aria-label="Planner">
        {PLANNER_MODES.map((m) => {
          const on = selected === m.id;
          const access = accessTag(m.access, gating, isPro);
          return (
            <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setSelected(m.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${on ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
              <div className="flex flex-wrap gap-1.5">
                {m.isNew && <span className={tag}>New</span>}
                {access && <span className={access === "Pro" ? "text-xs bg-amber/10 text-amber font-mono px-2 py-0.5 rounded-md" : tag}>{access}</span>}
              </div>
              <div className="font-display font-semibold text-sm">{m.title}</div>
              <div className="text-xs text-muted leading-relaxed">{m.desc}</div>
            </button>
          );
        })}
      </div>
      <button type="button" disabled={!selected} onClick={() => selected && onChoose(selected)} className="btn-primary w-full justify-center flex disabled:opacity-40">
        Next
      </button>
    </div>
  );
}
