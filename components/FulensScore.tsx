"use client";

import { FulensScoreBreakdown, getFulensScoreLabel } from "@/lib/fulens-score";
import Link from "next/link";
import { useState } from "react";

interface FulensScoreProps {
  score: FulensScoreBreakdown;
  compact?: boolean;
}

type PillarKey = "science" | "transparency" | "value" | "athleteExperience" | "quality";

const PILLAR_CONFIG: { key: PillarKey; label: string; max: number }[] = [
  { key: "science", label: "Science", max: 25 },
  { key: "transparency", label: "Transparency", max: 25 },
  { key: "value", label: "Value", max: 20 },
  { key: "athleteExperience", label: "Athlete experience", max: 20 },
  { key: "quality", label: "Quality", max: 10 },
];

// Each pillar's share of its maximum, as a percentage.
function pillarScores(score: FulensScoreBreakdown) {
  return PILLAR_CONFIG.map((p) => ({ ...p, raw: score[p.key], pct: Math.round((score[p.key] / p.max) * 100) }));
}

// A pillar at or under half its points is marked as the weak spot.
const WEAK_AT = 50;

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E0D0" strokeWidth={size * 0.08} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2D4A2D" strokeWidth={size * 0.08}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + size * 0.08} textAnchor="middle" fontSize={size * 0.26}
        fontWeight="700" fill="#1A1A1A">{score}</text>
    </svg>
  );
}

// The score card at the top of a product page: the number, its label and what the label means.
// Links down to the breakdown.
export function ScoreSummary({ score, href = "#score-breakdown" }: { score: FulensScoreBreakdown; href?: string }) {
  const { label, description } = getFulensScoreLabel(score.overall);
  return (
    <a href={href} className="card flex md:flex-col items-center md:items-start gap-4 md:gap-2 hover:shadow-md transition-all"
      aria-label={`Pello Score ${score.overall} out of 100, ${label}. See the breakdown.`}>
      <ScoreRing score={score.overall} size={64} />
      <div>
        <div className="text-[11px] text-muted uppercase tracking-widest">Pello Score™</div>
        <div className="font-display font-semibold text-lg leading-tight">{label}</div>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
    </a>
  );
}

export default function FulensScoreDisplay({ score, compact = false }: FulensScoreProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { label } = getFulensScoreLabel(score.overall);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <ScoreRing score={score.overall} size={48} />
        <div>
          <div className="text-xs font-medium">{label}</div>
          <div className="text-xs text-muted">Pello Score™</div>
        </div>
      </div>
    );
  }

  const pillars = pillarScores(score);
  const weakest = pillars.reduce((a, b) => (b.pct < a.pct ? b : a));
  return (
    <div className="card" id="score-breakdown">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="font-display font-semibold text-base">Why it scores {score.overall}</h2>
        <Link href="/methodology" className="text-xs text-muted hover:text-ink">How scoring works →</Link>
      </div>

      {/* One color for every pillar; only the weakest, if at or under half its points, is marked. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {pillars.map((p) => {
          const weak = p === weakest && p.pct <= WEAK_AT;
          return (
            <div key={p.key}>
              <div className="flex items-center justify-between text-sm">
                <span>{p.label}{weak && <span className="text-xs text-amber ml-1.5">weakest</span>}</span>
                <span className="text-muted">{p.raw}/{p.max}</span>
              </div>
              <div className="h-1.5 bg-sand rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full ${weak ? "bg-amber/70" : "bg-moss"}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {score.notes.length > 0 && (
        <div className="mt-4">
          <button type="button" onClick={() => setShowNotes(!showNotes)} aria-expanded={showNotes}
            className="text-xs text-moss underline underline-offset-2">
            {showNotes ? "Hide" : "Show"} scoring notes
          </button>
          {showNotes && (
            <ul className="mt-2 space-y-1">
              {score.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">·</span>{note}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="text-[11px] text-muted uppercase tracking-widest mt-4">
        Independent analysis <span aria-hidden="true">·</span> No brand partnerships
      </p>
    </div>
  );
}
