"use client";

// Form fields for profile-style inputs (weight, age, sex, budgets), shared by onboarding,
// the planners and the calculators so they all look and behave the same:
// - FieldList / FieldRow: one card with a row per field, label on the left, control on the right
// - NumberStepper: a typed number between round − / + buttons, for values people know exactly
// - WeightStepper: a NumberStepper for weight kept in kg, shown in kg or lbs
// - PillToggle: a pill-shaped switch (kg | lbs, Male | Female)
// - RangeSlider: a slim green slider, for estimates such as a budget
import { useEffect, useId, useState } from "react";
import type { WeightUnit } from "@/lib/planner";

export function FieldList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card !py-1 divide-y divide-sand ${className}`}>{children}</div>;
}

// `aside` sits under the label (e.g. a unit toggle); `hint` is a line of help text.
export function FieldRow({ label, aside, hint, children }: {
  label: string; aside?: React.ReactNode; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="font-display font-semibold">{label}</div>
        {aside && <div className="mt-1.5">{aside}</div>}
        {hint && <p className="text-xs text-muted mt-1 max-w-xs">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// `value` may be null when nothing has been chosen yet.
export function PillToggle<T extends string>({ label, options, value, onChange, size = "md" }: {
  label: string; options: { id: T; label: string }[]; value: T | null; onChange: (v: T) => void; size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm";
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-sand/70 p-0.5">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={`${pad} rounded-full transition-colors ${value === o.id ? "bg-white text-ink font-medium shadow-sm" : "text-muted hover:text-ink"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const clampTo = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// A number you can type or nudge. Typing is committed when the field loses focus or on
// Enter; a value outside min–max is set to the nearest limit, with a short note.
export function NumberStepper({ label, value, onChange, min, max, step = 1, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string;
}) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const noteId = useId();

  // Follow outside changes (buttons, unit switches) except while someone is typing.
  useEffect(() => { if (!editing) setText(String(value)); }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const typed = Math.round(Number(text));
    if (text.trim() === "" || Number.isNaN(typed)) { setText(String(value)); setNote(null); return; }
    const v = clampTo(typed, min, max);
    setNote(v === typed ? null : `Set to ${v}: the range is ${min}–${max}`);
    setText(String(v));
    onChange(v);
  };
  const nudge = (dir: 1 | -1) => { setNote(null); onChange(clampTo(value + dir * step, min, max)); };

  const button = "h-8 w-8 rounded-full bg-sand/70 text-moss text-lg leading-none hover:bg-sand disabled:opacity-40 disabled:hover:bg-sand/70 transition-colors";
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => nudge(-1)} className={button}>−</button>
        <label className="flex items-baseline justify-center gap-1 min-w-[4.5rem]">
          <input
            type="text"
            inputMode="numeric"
            aria-label={unit ? `${label} in ${unit}` : label}
            aria-describedby={note ? noteId : undefined}
            value={text}
            onFocus={(e) => { setEditing(true); e.target.select(); }}
            onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, "").slice(0, String(max).length))}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            style={{ width: `${String(max).length}ch` }}
            className="bg-transparent border-b-2 border-transparent focus:border-moss outline-none text-right font-display font-bold text-xl text-ink p-0"
          />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </label>
        <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => nudge(1)} className={button}>+</button>
      </div>
      {note && <p id={noteId} role="status" className="text-xs text-rust mt-1">{note}</p>}
    </div>
  );
}

const LBS_PER_KG = 2.205;
export const WEIGHT_RANGE: Record<WeightUnit, [number, number]> = { kg: [40, 120], lbs: [88, 264] };

// Converts a weight shown in one unit to the other, kept within that unit's range.
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  const [min, max] = WEIGHT_RANGE[to];
  return clampTo(Math.round(to === "lbs" ? value * LBS_PER_KG : value / LBS_PER_KG), min, max);
}

// Weight stored in kg (as the planners do), shown and edited in the chosen unit.
export function WeightStepper({ weightKg, unit, onChange }: { weightKg: number; unit: WeightUnit; onChange: (kg: number) => void }) {
  const [min, max] = WEIGHT_RANGE[unit];
  const shown = unit === "lbs" ? Math.round(weightKg * LBS_PER_KG) : Math.round(weightKg);
  return (
    <NumberStepper label="Body weight" unit={unit} min={min} max={max} value={shown}
      onChange={(v) => onChange(unit === "lbs" ? Math.round((v / LBS_PER_KG) * 10) / 10 : v)} />
  );
}

export function WeightUnitToggle({ value, onChange }: { value: WeightUnit; onChange: (u: WeightUnit) => void }) {
  return <PillToggle<WeightUnit> label="Weight unit" size="sm" value={value} onChange={onChange}
    options={[{ id: "kg", label: "kg" }, { id: "lbs", label: "lbs" }]} />;
}

// A slim slider that fills in green up to the thumb (styles: .range-slider in app/globals.css).
// `display` overrides the value shown beside the label; `aside` adds a control next to it.
export function RangeSlider({ label, value, onChange, min, max, step = 1, format = String, display, aside }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
  format?: (v: number) => string; display?: string; aside?: React.ReactNode;
}) {
  const filled = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-4">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div className="font-display font-semibold flex items-baseline gap-3">{label}{aside}</div>
        <div className="font-display font-bold text-xl">{display ?? format(value)}</div>
      </div>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider" style={{ "--filled": `${filled}%` } as React.CSSProperties} />
      <div className="flex justify-between text-xs text-muted mt-2">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}
