import type { Metadata } from "next";
import Link from "next/link";
import GutTrainingProgram from "@/components/fueling/GutTrainingProgram";
import SodiumPlanner from "@/components/fueling/SodiumPlanner";

export const metadata: Metadata = {
  title: "Gut training and race-day fueling",
  description: "Pello Pro tools for race day: a gut-training program to raise your carbs per hour, a personalized sodium plan, and a race-day fueling timeline from your saved plan.",
};

// Pello Pro fueling tools. Each tool gates itself (components/ProGate): free visitors see a
// faded preview and an upgrade note.
export default function FuelingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-xs text-muted uppercase tracking-widest mb-2">Pello Pro tools</div>
      <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Train your gut and race-day fueling</h1>
      <p className="text-muted mb-8">
        Raise the carbs you can take per hour, set your sodium, and turn a saved event plan into a timeline you can follow on race day.
      </p>
      <div className="space-y-6">
        <GutTrainingProgram />
        <SodiumPlanner />
        <section className="card" aria-labelledby="race-day-card">
          <h2 id="race-day-card" className="font-display font-semibold text-xl mb-1">Race-day plan</h2>
          <p className="text-sm text-muted mb-4">
            Every saved event plan has a race-day card: when to take each gel, how much to drink and where the sodium comes from,
            with a printable version and a phone-friendly view.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/quiz" className="btn-primary text-sm">Build an event plan</Link>
            <Link href="/account/plans" className="btn-secondary text-sm">Your saved plans</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
