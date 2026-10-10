"use client";

// Ask Pello's answer on the search page: how the question was read, the ranked products with the
// figure the question is about, a note on products without that figure, and for free visitors the
// top results with an upgrade note. Every figure comes from Pello's data (app/api/ask).
import { useEffect, useState } from "react";
import Link from "next/link";
import LockIcon from "@/components/pro/LockIcon";
import { INDEPENDENCE_SHORT } from "@/lib/pro";
import type { AskItem } from "@/lib/ask/run";

type Answer =
  | { unsupported: string; examples: string[] }
  | { chips: string[]; exploreHref: string; items: AskItem[]; total: number; available: number; locked: boolean; missing: { count: number; label: string } | null };

export default function AskPanel({ question, onAsk }: { question: string; onAsk: (q: string) => void }) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setAnswer(null); setError(null);
    fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!active) return;
        if (!r.ok) setError(data.error ?? "Couldn't answer that right now. Try again in a moment.");
        else setAnswer(data);
      })
      .catch(() => active && setError("Couldn't answer that right now. Try again in a moment."));
    return () => { active = false; };
  }, [question]);

  return (
    <section aria-labelledby="ask-pello" aria-live="polite" className="card mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 id="ask-pello" className="font-display font-semibold text-base">Ask Pello</h2>
        {answer && "chips" in answer && (
          <Link href={answer.exploreHref} className="text-xs text-moss hover:underline whitespace-nowrap">Open in Explore →</Link>
        )}
      </div>

      {!answer && !error && <p className="text-sm text-muted">Reading your question…</p>}
      {error && <p role="alert" className="text-sm text-rust">{error}</p>}

      {answer && "unsupported" in answer && (
        <div>
          <p className="text-sm mb-3">{answer.unsupported}</p>
          <p className="text-xs text-muted mb-2">Try asking about carbs, sodium, caffeine, protein, price, ratings, Pello Score, certifications or diet labels:</p>
          <div className="flex flex-wrap gap-2">
            {answer.examples.map((e) => (
              <button key={e} type="button" onClick={() => onAsk(e)} className="text-xs px-3 py-1.5 rounded-full border border-sand bg-white/50 hover:border-moss hover:text-moss transition-colors">{e}</button>
            ))}
          </div>
        </div>
      )}

      {answer && "chips" in answer && (
        <div>
          <p className="text-xs text-muted mb-1.5">Here&apos;s how we read your question</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {answer.chips.map((c) => <span key={c} className="text-xs bg-moss/10 text-moss px-2.5 py-1 rounded-full">{c}</span>)}
          </div>

          {answer.items.length === 0 ? (
            <p className="text-sm text-muted">No products match all of that. Try loosening one part of the question.</p>
          ) : (
            <ol className="divide-y divide-sand border-y border-sand">
              {answer.items.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/report/${p.id}`} className="flex items-center gap-3 py-3 group">
                    <span className="w-5 text-xs text-muted flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs text-muted">{p.brand}</span>
                      <span className="block font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</span>
                      {p.details.length > 0 && <span className="block text-xs text-muted">{p.details.join(" · ")}</span>}
                    </span>
                    {p.highlight && <span className="font-display font-semibold text-moss text-sm text-right flex-shrink-0">{p.highlight}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          )}

          {answer.missing && (
            <p className="text-xs text-muted mt-3">
              {answer.missing.count} product{answer.missing.count === 1 ? "" : "s"} in this search {answer.missing.count === 1 ? "has" : "have"} no {answer.missing.label} figure in our data, so {answer.missing.count === 1 ? "it isn't" : "they aren't"} included.
            </p>
          )}

          {answer.locked && (
            <div className="mt-4 rounded-xl bg-amber/5 border border-amber/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-amber mt-0.5"><LockIcon /></span>
                <div>
                  <p className="text-sm font-medium">See all {answer.available} results with Pello Pro</p>
                  <p className="text-xs text-muted">{INDEPENDENCE_SHORT}</p>
                </div>
              </div>
              <Link href="/pricing" className="btn-primary text-xs py-2 px-4 whitespace-nowrap self-start sm:self-auto">See Pello Pro</Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
