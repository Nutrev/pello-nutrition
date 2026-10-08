"use client";

// Profile setup after sign-up, and "Edit profile" (?edit=1). Three steps, saved to user_profiles.
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, updateProfile } from "@/lib/auth";
import { GOAL_OPTIONS, type UserProfile } from "@/lib/account-types";
import { FieldList, FieldRow, NumberStepper, PillToggle, WeightStepper, WeightUnitToggle } from "@/components/form/Fields";
import { safeRedirect } from "@/lib/safe-redirect";

type Draft = Pick<UserProfile, "username" | "weight_unit" | "sex" | "caffeine_preference" | "dietary" | "goals"> & {
  weight_kg: number; age: number; training_days_per_week: number; ftp_watts: number | null;
  threshold_pace: string; threshold_hr: number | null;
};

const KM_PER_MILE = 1.609344;
const paceText = (secPerKm: number | null, unit: "km" | "mi") => {
  if (!secPerKm) return "";
  const s = Math.round(unit === "mi" ? secPerKm * KM_PER_MILE : secPerKm);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const parsePace = (text: string, unit: "km" | "mi"): number | null => {
  const m = text.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  const sec = Number(m[1]) * 60 + Number(m[2]);
  return unit === "mi" ? Math.round(sec / KM_PER_MILE) : sec;
};

const DEFAULT_DRAFT: Draft = {
  username: "", weight_kg: 70, weight_unit: "kg", age: 30, sex: "male", training_days_per_week: 4, ftp_watts: null, threshold_pace: "", threshold_hr: null,
  caffeine_preference: "moderate", dietary: [], goals: [],
};

const DIETARY = [
  { id: "vegan", label: "Vegan" }, { id: "gluten-free", label: "Gluten-free" }, { id: "dairy-free", label: "Dairy-free" },
];

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`p-3 rounded-xl border text-sm text-left transition-all ${selected ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted bg-white/40"}`}>
      {children}
    </button>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const editing = params.get("edit") === "1";
  const then = safeRedirect(params.get("then"), "/account");
  const { user, profile, loading, refreshProfile } = useUser();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start from the saved profile when there is one.
  useEffect(() => {
    if (!profile) return;
    setDraft({
      username: profile.username ?? "",
      weight_kg: profile.weight_kg ?? DEFAULT_DRAFT.weight_kg,
      weight_unit: profile.weight_unit ?? "kg",
      age: profile.age ?? DEFAULT_DRAFT.age,
      sex: profile.sex ?? "male",
      training_days_per_week: profile.training_days_per_week ?? DEFAULT_DRAFT.training_days_per_week,
      ftp_watts: profile.ftp_watts ?? null,
      threshold_pace: paceText(profile.threshold_pace_sec_per_km ?? null, profile.weight_unit === "lbs" ? "mi" : "km"),
      threshold_hr: profile.threshold_hr ?? null,
      caffeine_preference: profile.caffeine_preference ?? "moderate",
      dietary: profile.dietary ?? [],
      goals: profile.goals ?? [],
    });
  }, [profile]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggle = (k: "dietary" | "goals", v: string) =>
    setDraft((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  const save = async () => {
    setBusy(true); setError(null);
    // FTP is only sent when it's set, so profiles save even where the ftp_watts column hasn't been added yet.
    const { ftp_watts, threshold_pace, threshold_hr, ...rest } = draft;
    const ftp = ftp_watts != null && ftp_watts >= 50 && ftp_watts <= 700 ? Math.round(ftp_watts) : null;
    const paceUnit = draft.weight_unit === "lbs" ? "mi" : "km";
    const pace = parsePace(threshold_pace, paceUnit);
    if (threshold_pace.trim() && (pace == null || pace < 120 || pace > 900)) { setError(`Enter threshold pace as minutes:seconds per ${paceUnit}, e.g. ${paceUnit === "km" ? "4:30" : "7:15"}.`); setBusy(false); return; }
    const hr = threshold_hr != null && threshold_hr >= 80 && threshold_hr <= 230 ? Math.round(threshold_hr) : null;
    const { error } = await updateProfile({
      ...rest, username: draft.username?.trim() || null,
      ...(ftp != null || profile?.ftp_watts != null ? { ftp_watts: ftp } : {}),
      ...(pace != null || profile?.threshold_pace_sec_per_km != null ? { threshold_pace_sec_per_km: pace } : {}),
      ...(hr != null || profile?.threshold_hr != null ? { threshold_hr: hr } : {}),
    });
    if (error) { setError("Couldn't save your profile. Please try again."); setBusy(false); return; }
    await refreshProfile();
    router.replace(then);
    router.refresh();
  };

  if (loading || !user) {
    return <div className="max-w-xl mx-auto px-6 py-16 text-center text-sm text-muted">Loading your profile…</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <div className="text-[11px] uppercase tracking-widest text-muted mb-1">
        {editing ? "Edit profile" : "Welcome to Pello"} · Step {step} of 3
      </div>
      <h1 className="font-display font-bold text-3xl tracking-tight mb-2">
        {step === 1 ? "About you" : step === 2 ? "Your goals" : "Diet and caffeine"}
      </h1>
      <p className="text-sm text-muted mb-6">
        {step === 1 ? "Used to tailor carb, sodium and protein targets in your plans."
          : step === 2 ? "Pick everything you're working towards."
          : "So we can leave out products that don't suit you."}
      </p>
      <div className="flex gap-1.5 mb-6" aria-hidden="true">
        {[1, 2, 3].map((n) => <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-moss" : "bg-sand"}`} />)}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="card">
            <label className="block">
              <span className="block font-display font-semibold mb-2">What should we call you?</span>
              <input value={draft.username ?? ""} onChange={(e) => set("username", e.target.value)} maxLength={40} placeholder="First name or nickname"
                className="w-full text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss" />
            </label>
          </div>

          <FieldList>
            <FieldRow label="Body weight" aside={<WeightUnitToggle value={draft.weight_unit} onChange={(u) => set("weight_unit", u)} />}>
              <WeightStepper weightKg={draft.weight_kg} unit={draft.weight_unit} onChange={(kg) => set("weight_kg", kg)} />
            </FieldRow>
            <FieldRow label="Age">
              <NumberStepper label="Age" unit="yrs" min={16} max={70} value={draft.age} onChange={(v) => set("age", v)} />
            </FieldRow>
            <FieldRow label="Sex">
              <PillToggle<"male" | "female"> label="Sex" value={draft.sex} onChange={(v) => set("sex", v)}
                options={[{ id: "male", label: "Male" }, { id: "female", label: "Female" }]} />
            </FieldRow>
          </FieldList>

          <div className="card">
            <h2 className="font-display font-semibold mb-3">Training days per week</h2>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button key={d} type="button" onClick={() => set("training_days_per_week", d)} aria-pressed={draft.training_days_per_week === d}
                  className={`py-2 rounded-xl border text-sm ${draft.training_days_per_week === d ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>{d}</button>
              ))}
            </div>
          </div>

          <div className="card">
            <label className="block">
              <span className="block font-display font-semibold mb-1">Cycling FTP <span className="text-xs font-normal text-muted">(optional)</span></span>
              <span className="block text-xs text-muted mb-2">Your functional threshold power, in watts. Used to read power-based workout files in the planner.</span>
              <div className="flex items-center gap-2">
                <input type="number" inputMode="numeric" min={50} max={700} placeholder="e.g. 250" value={draft.ftp_watts ?? ""}
                  onChange={(e) => set("ftp_watts", e.target.value === "" ? null : Number(e.target.value))}
                  className="w-32 text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss" />
                <span className="text-sm text-muted">watts</span>
              </div>
            </label>
          </div>

          <div className="card">
            <span className="block font-display font-semibold mb-1">Running thresholds <span className="text-xs font-normal text-muted">(optional)</span></span>
            <span className="block text-xs text-muted mb-3">The pace and heart rate you could hold for about an hour of hard running. Used to read run workout files in the planner.</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex items-center gap-2">
                <span className="text-sm text-muted">Pace</span>
                <input inputMode="numeric" placeholder={draft.weight_unit === "lbs" ? "7:15" : "4:30"} value={draft.threshold_pace}
                  onChange={(e) => set("threshold_pace", e.target.value)}
                  className="w-20 text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss" />
                <span className="text-sm text-muted">/{draft.weight_unit === "lbs" ? "mi" : "km"}</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-muted">Heart rate</span>
                <input type="number" inputMode="numeric" min={80} max={230} placeholder="e.g. 168" value={draft.threshold_hr ?? ""}
                  onChange={(e) => set("threshold_hr", e.target.value === "" ? null : Number(e.target.value))}
                  className="w-20 text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss" />
                <span className="text-sm text-muted">bpm</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((g) => (
            <Choice key={g.id} selected={draft.goals.includes(g.id)} onClick={() => toggle("goals", g.id)}>
              {draft.goals.includes(g.id) ? "✓ " : ""}{g.label}
            </Choice>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-display font-semibold mb-3">Dietary requirements</h2>
            <div className="grid grid-cols-3 gap-2">
              {DIETARY.map((d) => (
                <Choice key={d.id} selected={draft.dietary.includes(d.id)} onClick={() => toggle("dietary", d.id)}>{d.label}</Choice>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Leave blank if none apply.</p>
          </div>
          <div className="card">
            <h2 className="font-display font-semibold mb-3">Caffeine</h2>
            <div className="grid grid-cols-3 gap-2">
              {([["none", "None"], ["moderate", "Moderate"], ["high", "High"]] as const).map(([id, label]) => (
                <Choice key={id} selected={draft.caffeine_preference === id} onClick={() => set("caffeine_preference", id)}>{label}</Choice>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-rust mt-4">{error}</p>}

      <div className="flex gap-3 mt-6">
        {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex-1 justify-center flex">← Back</button>}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="btn-primary flex-1 justify-center flex">Next →</button>
        ) : (
          <button type="button" onClick={save} disabled={busy} className="btn-primary flex-1 justify-center flex disabled:opacity-50">
            {busy ? "Saving…" : editing ? "Save changes" : "Finish setup"}
          </button>
        )}
      </div>
      {!editing && step === 1 && (
        <p className="text-center mt-4"><button type="button" onClick={() => router.replace(then)} className="text-xs text-muted hover:text-ink">Skip for now</button></p>
      )}
    </div>
  );
}
