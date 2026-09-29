import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccountUser } from "@/lib/account-server";
import { formatDate } from "@/lib/format-date";
import { formatWeight } from "@/lib/planner";
import type { SavedPlan } from "@/lib/account-types";
import DeleteRowButton from "@/components/account/DeleteRowButton";

export const metadata: Metadata = { title: "Saved plan", robots: { index: false } };

const SECTIONS: { key: keyof SavedPlan["plan_content"]; title: string }[] = [
  { key: "preEvent", title: "Before" },
  { key: "duringEvent", title: "During" },
  { key: "postEvent", title: "After" },
  { key: "totals", title: "Totals" },
  { key: "keyNotes", title: "Key notes" },
];

export default async function PlanPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireAccountUser(`/account/plans/${params.id}`);
  const { data } = await supabase.from("saved_plans").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const plan = data as SavedPlan;
  const i = plan.inputs;
  const tags = [
    plan.plan_mode === "event" ? `${i.durationHours}hr · ${i.intensity}` : null,
    i.weightKg ? formatWeight(i.weightKg, i.weightUnit ?? "kg") : null,
    i.age ? `${i.age} · ${i.sex}` : null,
    i.trainingDaysPerWeek ? `${i.trainingDaysPerWeek} training days/week` : null,
    `$${i.budget} budget`,
    ...(i.dietary ?? []),
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/account/plans" className="text-xs text-muted hover:text-ink">← Saved plans</Link>
      <div className="mt-3 mb-6">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">Saved {formatDate(plan.created_at)}</div>
        <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{plan.plan_name}</h1>
        <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="text-xs bg-sand px-2 py-0.5 rounded-md">{t}</span>)}</div>
      </div>
      <div className="space-y-4">
        {SECTIONS.map(({ key, title }) => {
          const lines = plan.plan_content?.[key] ?? [];
          if (lines.length === 0) return null;
          return (
            <div key={key} className="card">
              <h2 className="font-display font-semibold mb-3">{title}</h2>
              <div className="space-y-2">{lines.map((l, n) => <p key={n} className="text-sm leading-relaxed">{l}</p>)}</div>
            </div>
          );
        })}
      </div>
      {plan.notes && <div className="card mt-4"><h2 className="font-display font-semibold mb-2">Notes</h2><p className="text-sm whitespace-pre-wrap">{plan.notes}</p></div>}
      <div className="flex items-center justify-between mt-8">
        <Link href="/quiz" className="btn-secondary">Build another plan</Link>
        <DeleteRowButton table="saved_plans" id={plan.id} label="Delete plan" redirectTo="/account/plans"
          confirmText={`Delete "${plan.plan_name}"? This can't be undone.`} />
      </div>
    </div>
  );
}
