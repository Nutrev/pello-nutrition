import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccountUser, accountAccess, productById } from "@/lib/account-server";
import { ModeProductCard } from "@/components/planner/shared";
import { STACK_GOALS, RACE_TYPES, RACE_DURATIONS, RACE_PRIORITIES } from "@/lib/planner-modes";
import PrintButton from "@/components/pro/PrintButton";
import { formatDate } from "@/lib/format-date";
import { formatWeight } from "@/lib/planner";
import { isModeContent, type SavedPlan, type PlanContent } from "@/lib/account-types";
import { STANDARD_CHOICES } from "@/lib/quality-standards";
import DeleteRowButton from "@/components/account/DeleteRowButton";

export const metadata: Metadata = { title: "Saved plan", robots: { index: false } };

const SECTIONS: { key: keyof PlanContent; title: string }[] = [
  { key: "preEvent", title: "Before" },
  { key: "duringEvent", title: "During" },
  { key: "postEvent", title: "After" },
  { key: "totals", title: "Totals" },
  { key: "keyNotes", title: "Key notes" },
];

export default async function PlanPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireAccountUser(`/account/plans/${params.id}`);
  const [{ data }, access] = await Promise.all([
    supabase.from("saved_plans").select("*").eq("id", params.id).maybeSingle(),
    accountAccess(supabase, user.id),
  ]);
  if (!data) notFound();
  const plan = data as SavedPlan;
  const i = plan.inputs;
  const content = plan.plan_content;
  // Summary tags for the newer planners' inputs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = plan.inputs as any;
  const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((x) => x.id === id)?.label;
  const modeTags: string[] | null =
    plan.plan_mode === "supplement-stack" ? [...(m.goals ?? []).map((g: string) => label(STACK_GOALS, g)), m.budget ? `$${m.budget} a month` : null, ...(m.dietary ?? [])]
    : plan.plan_mode === "race-week" ? [label(RACE_TYPES, m.raceType), label(RACE_DURATIONS, m.duration), label(RACE_PRIORITIES, m.priority), m.daysUntil ? `${m.daysUntil} days out` : null, m.weightKg ? formatWeight(m.weightKg, m.weightUnit ?? "kg") : null, ...(m.dietary ?? [])]
    : plan.plan_mode === "budget-optimiser" ? [label(STACK_GOALS, m.goal), m.budget ? `$${m.budget} a month` : null, ...(m.dietary ?? [])]
    : null;
  const classicTags = [
    i.workout ? `${i.workout.kind === "completed" ? "Completed" : "Planned"} workout: ${i.workout.name} (${i.workout.durationMin} min)` : null,
    // Garmin-sourced activities must credit Garmin (intervals.icu API terms).
    i.workout?.recordedWith ? `Recorded with ${i.workout.recordedWith}` : null,
    plan.plan_mode === "event" || plan.plan_mode === "workout" ? `${i.durationHours}hr · ${i.intensity}` : null,
    i.weightKg ? formatWeight(i.weightKg, i.weightUnit ?? "kg") : null,
    i.age ? `${i.age} · ${i.sex}` : null,
    i.trainingDaysPerWeek ? `${i.trainingDaysPerWeek} training days/week` : null,
    plan.plan_mode === "workout" ? null : `$${i.budget} budget`,
    ...(i.dietary ?? []),
    ...(i.standards ?? []).map((id) => STANDARD_CHOICES.find((c) => c.id === id)?.label),
  ];
  const tags = (modeTags ?? classicTags).filter(Boolean) as string[];
  // Section titles were saved as written by the planner (often in capitals).
  const nice = (t: string) => (t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/account/plans" className="text-xs text-muted hover:text-ink print:hidden">← Saved plans</Link>
      <div className="mt-3 mb-6">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">Saved {formatDate(plan.created_at)}</div>
        <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{plan.plan_name}</h1>
        <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="text-xs bg-sand px-2 py-0.5 rounded-md">{t}</span>)}</div>
      </div>
      {isModeContent(content) ? (
        <div className="space-y-4">
          {content.sections.filter((sec) => sec.lines.length).map((sec, n) => (
            <div key={n} className="card">
              <h2 className="font-display font-semibold mb-3">{nice(sec.title)}</h2>
              <div className="space-y-2">{sec.lines.map((l, k) => <p key={k} className="text-sm leading-relaxed">{l}</p>)}</div>
            </div>
          ))}
          {content.productGroups.map((g) => {
            const products = g.productIds.map((id) => productById(id)).filter((p) => p != null);
            if (!products.length) return null;
            return (
              <div key={g.title} className="card">
                <h2 className="font-display font-semibold mb-1">{g.title}</h2>
                {g.note && <p className="text-xs text-muted mb-3">{g.note}</p>}
                <p className="text-[11px] text-muted mb-3">Prices and ratings are today&apos;s, from Pello&apos;s database.</p>
                <div className="space-y-2">{products.map((p) => <ModeProductCard key={p!.id} p={p!} />)}</div>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="space-y-4">
        {SECTIONS.map(({ key, title }) => {
          const lines = content?.[key] ?? [];
          if (lines.length === 0) return null;
          return (
            <div key={key} className="card">
              <h2 className="font-display font-semibold mb-3">{title}</h2>
              <div className="space-y-2">{lines.map((l, n) => <p key={n} className="text-sm leading-relaxed">{l}</p>)}</div>
            </div>
          );
        })}
      </div>
      )}
      {plan.notes && <div className="card mt-4"><h2 className="font-display font-semibold mb-2">Notes</h2><p className="text-sm whitespace-pre-wrap">{plan.notes}</p></div>}
      <div className="flex items-center justify-between gap-3 mt-8 print:hidden">
        <div className="flex flex-wrap gap-2">
          <Link href="/quiz" className="btn-secondary">Build another plan</Link>
          {access.gating && access.allowed && <PrintButton label="Export as PDF" />}
        </div>
        <DeleteRowButton table="saved_plans" id={plan.id} label="Delete plan" redirectTo="/account/plans"
          confirmText={`Delete "${plan.plan_name}"? This can't be undone.`} />
      </div>
    </div>
  );
}
