"use client";

// The interactive parts of the methodology page: the five pillars as a bar sized by their
// weight (on phones, two rows: the two biggest pillars, then the rest, since weight-sized tiles
// get too narrow; choose one to see what it measures), and the score bands as a slim scale.
import { useState } from "react";
import type { ScoreBand } from "@/lib/pello-grade";

type Pillar = { name: string; weight: number; description: string; factors: string[] };

export function PillarSwitcher({ pillars }: { pillars: Pillar[] }) {
  const [current, setCurrent] = useState(0);
  const pillar = pillars[current];
  return (
    <div className="card">
      <h2 className="font-display font-semibold text-base">The five pillars</h2>
      <div role="tablist" aria-label="Pillars" className="grid grid-cols-6 gap-1 mt-3 sm:flex">
        {pillars.map((p, i) => {
          const on = i === current;
          return (
            <button key={p.name} type="button" role="tab" aria-selected={on} aria-controls="pillar-panel" onClick={() => setCurrent(i)}
              style={{ flexGrow: p.weight, flexBasis: 0 }}
              className={`${i < 2 ? "col-span-3" : "col-span-2"} min-w-0 text-left rounded-xl px-2 sm:px-2.5 py-2 transition-colors ${on ? "bg-moss text-cream" : "bg-sand/60 text-ink hover:bg-sand"}`}>
              <span className="block text-xs sm:text-[13px] font-semibold leading-tight [overflow-wrap:anywhere] hyphens-auto">{p.name}</span>
              <span className={`block text-[11px] ${on ? "text-cream/80" : "text-muted"}`}>{p.weight} pts</span>
            </button>
          );
        })}
      </div>
      <div id="pillar-panel" role="tabpanel" aria-label={pillar.name} className="mt-4">
        <p className="text-sm text-muted">{pillar.description}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
          {pillar.factors.map((f) => (
            <li key={f} className="relative pl-3.5 text-sm leading-snug before:absolute before:left-0 before:top-[0.45rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-muted/70">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Bands are shown lowest first, left to right, each with its name and range.
export function ScoreScale({ bands }: { bands: ScoreBand[] }) {
  const ordered = [...bands].sort((a, b) => a.min - b.min);
  const [current, setCurrent] = useState(Math.max(0, ordered.length - 2));
  const band = ordered[current];
  return (
    <div className="card">
      <h2 className="font-display font-semibold text-base">Score labels</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-1 gap-y-3 mt-4">
        {ordered.map((b, i) => {
          const on = i === current;
          return (
            <button key={b.label} type="button" aria-pressed={on} onClick={() => setCurrent(i)} className="text-left group">
              <span className={`block h-1.5 rounded-full mb-2 transition-colors ${on ? "bg-moss" : "bg-sand group-hover:bg-muted/40"}`} />
              <span className="block text-xs font-semibold leading-tight">{b.label}</span>
              <span className="block text-[11px] text-muted">{b.min}–{b.max}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm mt-4" aria-live="polite">
        <span className="font-semibold">{band.label}</span> <span className="text-muted">· {band.description}</span>
      </p>
    </div>
  );
}
