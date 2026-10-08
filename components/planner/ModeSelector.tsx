"use client";

// Step 0 of the planner: choose which planner to use. For members without Pro (while Pro is
// on), the planners they can use come first; the Pro ones are grouped underneath, dimmed and
// locked, with their descriptions blurred until hovered or selected. Choosing one still works:
// the planner then shows what Pro adds.
import { useState } from "react";
import { PLANNER_MODES, type PlannerMode, type ModeAccess } from "@/lib/planner-modes";
import { useProAccess, useSubscription } from "@/lib/subscription";
import { FREE_PLANS_PER_MONTH, TRIAL_DAYS } from "@/lib/pro";
import LockIcon from "@/components/pro/LockIcon";

const tag = "text-xs bg-moss/10 text-moss font-mono px-2 py-0.5 rounded-md";
type Mode = (typeof PLANNER_MODES)[number];

function freeTag(access: ModeAccess): string | null {
  if (access === "free-limited") return `${FREE_PLANS_PER_MONTH} free plan a month`;
  if (access === "free") return "Free";
  return null;
}

export default function ModeSelector({ onChoose }: { onChoose: (m: PlannerMode) => void }) {
  const [selected, setSelected] = useState<PlannerMode | null>(null);
  const { gating, isPro } = useProAccess();
  const { hadTrial } = useSubscription();
  const locked = gating && !isPro;

  const card = (m: Mode, isLocked: boolean) => {
    const on = selected === m.id;
    const access = locked ? freeTag(m.access) : null;
    return (
      <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setSelected(m.id)}
        aria-label={isLocked ? `${m.title} (Pello Pro)` : undefined}
        className={`group p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
          on ? "border-moss bg-moss/5" : isLocked ? "border-sand bg-sand/20 hover:border-muted" : "border-sand hover:border-muted bg-white/40"}`}>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
          {m.isNew && <span className={tag}>New</span>}
          {access && <span className={tag}>{access}</span>}
          {isLocked && <span className="ml-auto text-amber" title="Pello Pro"><LockIcon className="h-4 w-4" /></span>}
        </div>
        <div className={`font-display font-semibold text-sm ${isLocked && !on ? "text-ink/60" : ""}`}>{m.title}</div>
        <div className={`text-xs text-muted leading-relaxed transition-[filter,opacity] ${isLocked && !on ? "blur-[2px] opacity-70 group-hover:blur-0 group-hover:opacity-100 group-focus-visible:blur-0" : ""}`}>
          {m.desc}
        </div>
      </button>
    );
  };

  const grid = "grid grid-cols-2 md:grid-cols-3 gap-3";
  const free = PLANNER_MODES.filter((m) => m.access !== "pro");
  const pro = PLANNER_MODES.filter((m) => m.access === "pro");

  return (
    <div>
      <h2 className="font-display font-semibold text-xl mb-1">What do you need help with?</h2>
      <p className="text-sm text-muted mb-5">Choose a planner to get started</p>
      <div role="radiogroup" aria-label="Planner" className="mb-6">
        {locked ? (
          <>
            <div className="font-mono text-[11px] uppercase tracking-widest text-moss mb-2">Free</div>
            <div className={`${grid} mb-6`}>{free.map((m) => card(m, false))}</div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
              <div className="font-mono text-[11px] uppercase tracking-widest text-amber">Pello Pro</div>
              <div className="text-xs text-muted">{hadTrial ? "Upgrade to unlock these planners" : `Unlock with a free ${TRIAL_DAYS}-day trial`}</div>
            </div>
            <div className={grid}>{pro.map((m) => card(m, true))}</div>
          </>
        ) : (
          <div className={grid}>{PLANNER_MODES.map((m) => card(m, false))}</div>
        )}
      </div>
      <button type="button" disabled={!selected} onClick={() => selected && onChoose(selected)} className="btn-primary w-full justify-center flex disabled:opacity-40">
        Next
      </button>
    </div>
  );
}
