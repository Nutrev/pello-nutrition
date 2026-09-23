"use client";

import { FulensScoreBreakdown, getFulensScoreLabel } from "@/lib/fulens-score";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useState } from "react";

interface FulensScoreProps {
  score: FulensScoreBreakdown;
  compact?: boolean;
}

const PILLAR_CONFIG = [
  { key: "science", label: "Science", max: 25, color: "#2D4A2D" },
  { key: "transparency", label: "Transparency", max: 25, color: "#3B6D11" },
  { key: "value", label: "Value", max: 20, color: "#C8860A" },
  { key: "athleteExperience", label: "Athlete experience", max: 20, color: "#185FA5" },
  { key: "quality", label: "Quality", max: 10, color: "#534AB7" },
];

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { color } = getFulensScoreLabel(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E0D0" strokeWidth={size * 0.07} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.07}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size * 0.22}
        fontWeight="600" fill="#1A1A1A" fontFamily="DM Mono">{score}</text>
    </svg>
  );
}

export default function FulensScoreDisplay({ score, compact = false }: FulensScoreProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { label, description } = getFulensScoreLabel(score.overall);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <ScoreRing score={score.overall} size={48} />
        <div>
          <div className="text-xs font-mono font-medium">{label}</div>
          <div className="text-xs text-muted">Fulens Score™</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-moss/5 border-moss/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-mono text-moss uppercase tracking-widest mb-1">
            Fulens Score™
          </div>
          <h2 className="font-display font-bold text-2xl">{label}</h2>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
        <ScoreRing score={score.overall} size={96} />
      </div>

      {/* Pillar breakdown */}
      <div className="space-y-3 mb-4">
        {PILLAR_CONFIG.map((pillar) => {
          const raw = score[pillar.key as keyof FulensScoreBreakdown] as number;
          const pct = Math.round((raw / pillar.max) * 100);
          return (
            <div key={pillar.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted">{pillar.label}</span>
                <span className="text-xs font-mono">
                  {raw}<span className="text-muted">/{pillar.max}</span>
                </span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: pillar.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes toggle */}
      <div className="border-t border-sand pt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-moss underline underline-offset-2"
        >
          {showNotes ? "Hide" : "Show"} scoring notes
        </button>
        {showNotes && score.notes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {score.notes.map((note, i) => (
              <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                <span className="flex-shrink-0 mt-0.5">·</span>{note}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <Link href="/methodology" className="text-xs text-muted underline underline-offset-2">
            How is the Fulens Score calculated? →
          </Link>
        </div>
      </div>
    </div>
  );
}
