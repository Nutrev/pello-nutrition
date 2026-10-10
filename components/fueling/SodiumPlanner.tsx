"use client";

// Personalized sodium plan (Pello Pro): session length, intensity, conditions and whether the
// athlete is a salty sweater give a per-hour figure from lib/fueling.ts (sodiumPlan). The
// salty-sweater answer comes from, and is saved to, the athlete profile.
import { useEffect, useState } from "react";
import Link from "next/link";
import ProGate from "@/components/ProGate";
import { useUser, updateProfile } from "@/lib/auth";
import { CONDITIONS, sodiumPlan, type Conditions, type Intensity } from "@/lib/fueling";

const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "moderate", label: "Moderate" },
  { id: "hard", label: "Hard" },
  { id: "race", label: "Race pace" },
];
const chip = (on: boolean) => `text-sm px-3 py-1.5 rounded-lg border transition-colors ${on ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`;

export default function SodiumPlanner() {
  const { user, profile } = useUser();
  const [hours, setHours] = useState(3);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [conditions, setConditions] = useState<Conditions>("mild");
  const [salty, setSalty] = useState(false);

  useEffect(() => {
    if (profile?.salty_sweater != null) setSalty(profile.salty_sweater);
  }, [profile?.salty_sweater]);

  const toggleSalty = (v: boolean) => {
    setSalty(v);
    if (user) updateProfile({ salty_sweater: v }).catch(() => undefined);
  };

  const plan = sodiumPlan({ durationHours: hours, intensity, conditions, saltySweater: salty });

  return (
    <section className="card" aria-labelledby="sodium-plan">
      <h2 id="sodium-plan" className="font-display font-semibold text-xl mb-1">Sodium plan</h2>
      <p className="text-sm text-muted mb-5">
        How much sodium to take per hour, from your session and how you sweat. Based on the ranges in our{" "}
        <Link href="/blog/sodium-endurance-athletes" className="text-moss underline">sodium guide</Link>.
      </p>
      <ProGate feature="Personalized sodium plan" description="Sodium per hour from your session length, conditions and sweat.">
        <div className="space-y-4 mb-5">
          <div>
            <label htmlFor="sodium-hours" className="text-xs text-muted">Session length: <span className="text-ink font-medium">{hours} hours</span></label>
            <input id="sodium-hours" type="range" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-moss" />
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Intensity">
            {INTENSITIES.map((i) => <button key={i.id} type="button" role="radio" aria-checked={intensity === i.id} onClick={() => setIntensity(i.id)} className={chip(intensity === i.id)}>{i.label}</button>)}
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Conditions">
            {CONDITIONS.map((c) => <button key={c.id} type="button" role="radio" aria-checked={conditions === c.id} onClick={() => setConditions(c.id)} className={chip(conditions === c.id)}>{c.label}</button>)}
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={salty} onChange={(e) => toggleSalty(e.target.checked)} className="mt-1 accent-moss" />
            <span>
              I&apos;m a salty sweater
              <span className="block text-xs text-muted">White residue on your skin or kit after long sessions.{user ? " Saved to your athlete profile." : ""}</span>
            </span>
          </label>
        </div>

        <div className="rounded-xl bg-moss/5 border border-moss/20 p-4">
          {plan.perHour === 0 ? (
            <p className="text-sm">{plan.basis}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <div><span className="font-display font-bold text-2xl text-moss">{plan.perHour}mg</span> <span className="text-sm text-muted">per hour</span></div>
                <div className="text-sm text-muted">{plan.total.toLocaleString()}mg in total</div>
              </div>
              <p className="text-xs text-muted mt-2">
                Range for {plan.basis.toLowerCase()}: {plan.perHourLow}-{plan.perHourHigh}mg per hour.
                This is a starting point; a sweat test gives your own figure.
              </p>
            </>
          )}
        </div>
      </ProGate>
    </section>
  );
}
