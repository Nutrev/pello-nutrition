"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SavePlanButton from "@/components/account/SavePlanButton";
import ProGate from "@/components/ProGate";
import PrintButton from "@/components/pro/PrintButton";
import { ProTag } from "@/components/pro/LockIcon";
import { useUser } from "@/lib/auth";
import { useProAccess } from "@/lib/subscription";
import { PRO_ENABLED } from "@/lib/pro";
import { STANDARD_CHOICES, meetsAll, meetsDiet, type StandardChoice } from "@/lib/quality-standards";
import WorkoutUpload, { WorkoutChart, workoutIntensityNote } from "@/components/planner/WorkoutUpload";
import { intensityFrom, type WorkoutSummary } from "@/lib/workout-file";
import ModeSelector from "@/components/planner/ModeSelector";
import dynamic from "next/dynamic";
// The newer planners load only when chosen.
const SupplementStackPlanner = dynamic(() => import("@/components/planner/SupplementStackPlanner"));
const RaceWeekPlanner = dynamic(() => import("@/components/planner/RaceWeekPlanner"));
const BudgetOptimiser = dynamic(() => import("@/components/planner/BudgetOptimiser"));
import { MODE_BY_ID, MODE_PRO_PITCH, type PlannerMode } from "@/lib/planner-modes";
import { primaryRetailerLink, linkRel } from "@/lib/retailers";
import { byWeightedRating, type ProductSummary } from "@/lib/catalog-types";
import { servingsPerContainer } from "@/lib/servings";
import { FieldList, FieldRow, NumberStepper, PillToggle, RangeSlider, WeightStepper, WeightUnitToggle } from "@/components/form/Fields";
import {
  type PlannerInputs, type EventType, type OutcomeType, type Intensity,
  type CaffeinePreference, type DietaryRestriction, type FormatPreference, type Retailer,
  type WeightUnit, type Sex, type SessionTime,
  EVENT_TYPES, OUTCOME_TYPES, WORKOUT_TYPES, SESSION_TIMES, LAST_MEALS, INTENSITY_OPTIONS, DEFAULT_INPUTS,
  carbsNeeded, sessionCarbTarget, sodiumNeeded, formatWeight,
} from "@/lib/planner";
import { CONDITIONS, type Conditions } from "@/lib/fueling";
import FuelingCost from "@/components/fueling/FuelingCost";

// ── TYPES ─────────────────────────────────────────────────────

interface ParsedPlan {
  preEvent: string[];
  duringEvent: string[];
  postEvent: string[];
  totals: string[];
  keyNotes: string[];
}

interface PhaseProduct {
  product: ProductSummary;
  phase: "pre" | "during" | "post" | "daily";
  quantity: number;
  totalCost: number;
  reason: string;
  // During an event: carb products are alternatives (each covers the target); electrolytes are extra.
  group?: "carb-option" | "electrolytes";
}

// ── CONSTANTS ─────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: 0.5, label: "30 min" }, { value: 0.75, label: "45 min" },
  { value: 1, label: "1 hr" }, { value: 1.5, label: "1.5 hrs" },
  { value: 2, label: "2 hrs" }, { value: 2.5, label: "2.5 hrs" },
  { value: 3, label: "3 hrs" }, { value: 4, label: "4 hrs" },
  { value: 5, label: "5 hrs" }, { value: 6, label: "6 hrs" },
  { value: 8, label: "8 hrs" }, { value: 10, label: "10+ hrs" },
];

const FORMAT_OPTIONS: { id: FormatPreference; label: string; desc: string }[] = [
  { id: "Energy Gel", label: "Gels", desc: "Fast-acting, portable" },
  { id: "Energy Chew", label: "Chews", desc: "Chewable, slower release" },
  { id: "Energy Bar", label: "Bars", desc: "Solid food, lower intensity" },
  { id: "Carbohydrate Mix", label: "Drink mix", desc: "Carbs + hydration combined" },
  { id: "Hydration", label: "Electrolytes", desc: "Salt + hydration" },
];


// ── OUTCOME → CATEGORY PRIORITY MAP ──────────────────────────

const OUTCOME_CATEGORY_PRIORITY: Record<OutcomeType, string[]> = {
  "finish-first-marathon": ["Energy Gel", "Energy Chew", "Hydration", "Carbohydrate Mix", "Energy Bar"],
  "finish-first-triathlon": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Energy Chew", "Protein"],
  "improve-cycling-endurance": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Energy Chew", "Performance", "Creatine"],
  "improve-recovery": ["Protein", "Recovery", "Sleep", "Omega-3", "Mineral"],
  "build-muscle-endurance": ["Protein", "Creatine", "Performance", "Energy Gel", "Recovery"],
  "lose-weight-perform": ["Protein", "Hydration", "Energy Gel", "Sleep", "Omega-3"],
  "race-faster": ["Energy Gel", "Carbohydrate Mix", "Hydration", "Performance", "Creatine"],
  "gut-health": ["Probiotic", "Gut Health", "Hydration", "Energy Gel", "Omega-3"],
};

// ── PHASE → CATEGORY MAP ──────────────────────────────────────

const PHASE_CATEGORIES = {
  pre: ["Energy Bar", "Carbohydrate Mix", "Hydration"],
  during: ["Energy Gel", "Energy Chew", "Carbohydrate Mix", "Hydration"],
  post: ["Protein", "Recovery", "Sleep", "Omega-3", "Mineral"],
};

// ── HELPERS ───────────────────────────────────────────────────

// Carbs per serving as stated on the label; null when the label doesn't say, so it's never sized by a guess.
function getCarbsPerServing(p: ProductSummary): number | null {
  return p.nutrition.carbsPerServing ?? null;
}

// ── SMART RECOMMENDATION ENGINE ───────────────────────────────

// Whether a product meets the plan's diet, quality-standard and caffeine choices (the same rules
// the recommendations use). Used by the fueling cost tool's cheapest-equivalent suggestion.
function fitsPlan(p: ProductSummary, inputs: PlannerInputs): boolean {
  return inputs.dietary.every(d => meetsDiet({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens }, d)) &&
    meetsAll(p.standards, inputs.standards ?? []) &&
    !(inputs.caffeinePreference === "none" && p.ingredients?.some(i => /caffeine|green tea/i.test(i.name)));
}

function buildPhaseRecommendations(PRODUCTS: ProductSummary[], inputs: PlannerInputs, carbTarget: number, sodiumTarget: number): {
  pre: PhaseProduct[];
  during: PhaseProduct[];
  post: PhaseProduct[];
} {
  const isEvent = inputs.mode !== "outcome"; // race day and today's workout are single sessions
  const hasCaffeine = inputs.caffeinePreference !== "none";
  const needsFuelling = inputs.durationHours >= 1;

  // Only products that meet every diet requirement (as labeled; unknown never counts) and
  // every quality standard the athlete chose.
  const pool = PRODUCTS.filter(p =>
    inputs.dietary.every(d => meetsDiet({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens }, d)) &&
    meetsAll(p.standards, inputs.standards ?? [])
  );

  const bestByCategory = (categories: string[], maxPerCat = 2, preferCaffeine = false): ProductSummary[] => {
    const results: ProductSummary[] = [];
    categories.forEach(cat => {
      const inCat = pool
        .filter(p => p.category === cat)
        .filter(p => {
          if (inputs.caffeinePreference === "none") {
            return !p.ingredients?.some((i: any) =>
              i.name.toLowerCase().includes("caffeine") ||
              i.name.toLowerCase().includes("green tea")
            );
          }
          return true;
        })
        .sort((a, b) => {
          // Prefer caffeinated products during event if caffeine preference is high
          if (preferCaffeine && inputs.caffeinePreference === "high") {
            const aHasCaf = a.ingredients?.some((i: any) => i.name.toLowerCase().includes("caffeine")) ?? false;
            const bHasCaf = b.ingredients?.some((i: any) => i.name.toLowerCase().includes("caffeine")) ?? false;
            if (aHasCaf && !bHasCaf) return -1;
            if (!aHasCaf && bHasCaf) return 1;
          }
          return byWeightedRating(a, b);
        })
        .slice(0, maxPerCat);
      results.push(...inCat);
    });
    return results;
  };

  if (isEvent) {
    // PRE — bar + hydration
    const preProducts = bestByCategory(PHASE_CATEGORIES.pre, 1);

    // DURING. Carbs: up to two alternatives, each sized so it covers the carb target on its own.
    // Electrolytes: one product sized to the sodium target. Only products whose label states
    // carbs (or sodium) per serving are sized; a serving far above the target is left out.
    const minutes = Math.round(inputs.durationHours * 60);
    const formatPicks = inputs.formats.filter(f => PHASE_CATEGORIES.during.includes(f));
    const carbCategories = (formatPicks.length ? formatPicks : PHASE_CATEGORIES.during).filter(c => c !== "Hydration");
    const wantsElectrolytes = formatPicks.length === 0 || formatPicks.includes("Hydration");

    const carbOptions: PhaseProduct[] = carbTarget <= 0 ? [] : bestByCategory(carbCategories.length ? carbCategories : ["Energy Gel", "Energy Chew", "Carbohydrate Mix"], 3, true)
      .filter(p => { const c = getCarbsPerServing(p); return c != null && c > 0 && c <= carbTarget * 1.5; })
      .slice(0, 2)
      .map(p => {
        const cps = getCarbsPerServing(p)!;
        const qty = Math.max(1, Math.round(carbTarget / cps));
        const totalCost = parseFloat(((p.price / servingsPerContainer(p)) * qty).toFixed(2));
        const every = qty > 1 ? ` — about one every ${Math.round(minutes / qty)} min` : "";
        const reason = p.category === "Carbohydrate Mix"
          ? `${qty} serving${qty === 1 ? "" : "s"} × ${cps}g = ${qty * cps}g carbs, mixed into your bottles. Covers your ${carbTarget}g target on its own.`
          : `${qty} × ${cps}g = ${qty * cps}g carbs${every}. Covers your ${carbTarget}g target on its own.`;
        return { product: p, phase: "during" as const, quantity: qty, totalCost, reason, group: "carb-option" as const };
      });

    // Prefer a product whose total lands within 50% of the sodium target; otherwise say it's over.
    const hydration = wantsElectrolytes && sodiumTarget > 0 ? bestByCategory(["Hydration"], 8).filter(p => (p.nutrition.sodiumPerServing ?? 0) > 0) : [];
    const sodiumTotal = (p: ProductSummary) => Math.max(1, Math.round(sodiumTarget / p.nutrition.sodiumPerServing!)) * p.nutrition.sodiumPerServing!;
    const electrolyte = hydration.find(p => Math.abs(sodiumTotal(p) - sodiumTarget) <= sodiumTarget * 0.5) ?? hydration[0];
    const electrolytes: PhaseProduct[] = !electrolyte ? [] : [electrolyte].map(p => {
      const sps = p.nutrition.sodiumPerServing!;
      const qty = Math.max(1, Math.round(sodiumTarget / sps));
      const over = qty * sps > sodiumTarget * 1.5;
      return {
        product: p, phase: "during" as const, quantity: qty, group: "electrolytes" as const,
        totalCost: parseFloat(((p.price / servingsPerContainer(p)) * qty).toFixed(2)),
        reason: `${qty} × ${sps}mg = ${qty * sps}mg sodium, against an estimated ${sodiumTarget}mg lost in sweat.` +
          (over ? " That's more than you need; a smaller amount, or a lower-sodium mix, would cover it." : ""),
      };
    });

    const duringPhase: PhaseProduct[] = [...carbOptions, ...electrolytes];

    const prePhase: PhaseProduct[] = preProducts.slice(0, 1).map(p => ({
      product: p,
      phase: "pre" as const,
      quantity: 1,
      totalCost: parseFloat((p.price / servingsPerContainer(p)).toFixed(2)),
      reason: `Slow-release carbs 2-3 hours before — provides sustained energy without GI distress`,
    }));

    // POST — protein + recovery
    const postProducts = bestByCategory(PHASE_CATEGORIES.post, 1);
    const postPhase: PhaseProduct[] = postProducts.slice(0, 2).map(p => ({
      product: p,
      phase: "post" as const,
      quantity: 1,
      totalCost: parseFloat((p.price / servingsPerContainer(p)).toFixed(2)),
      reason: p.category === "Protein"
        ? `30-min recovery window — protein synthesis peaks immediately post-event`
        : p.category === "Sleep"
        ? `Sleep support — sleep is one of the biggest drivers of recovery after a hard event`
        : `Recovery support in the days after the event`,
    }));

    return { pre: prePhase, during: duringPhase, post: postPhase };

  } else {
    // OUTCOME MODE
    const outcomeType = inputs.outcomeType!;
    const priorityCategories = OUTCOME_CATEGORY_PRIORITY[outcomeType] ?? [];

    const allProducts = bestByCategory(priorityCategories, 2);

    // Split into phases based on category
    const pre = allProducts
      .filter(p => ["Energy Bar", "Carbohydrate Mix", "Hydration"].includes(p.category))
      .slice(0, 1)
      .map(p => ({
        product: p,
        phase: "pre" as const,
        quantity: 1,
        totalCost: parseFloat((p.price / servingsPerContainer(p)).toFixed(2)),
        reason: "Daily preparation and pre-training nutrition",
      }));

    const during = allProducts
      .filter(p => ["Energy Gel", "Energy Chew", "Carbohydrate Mix"].includes(p.category))
      .slice(0, 2)
      .map(p => ({
        product: p,
        phase: "during" as const,
        quantity: 1,
        totalCost: parseFloat((p.price / servingsPerContainer(p)).toFixed(2)),
        reason: "Intra-workout fueling to support your goal",
      }));

    const post = allProducts
      .filter(p => ["Protein", "Creatine", "Performance", "Recovery", "Sleep", "Omega-3", "Supplement", "Mineral", "Probiotic", "Gut Health", "Immune", "Greens"].includes(p.category))
      // One product per category first, so three picks cover three kinds of support.
      .filter((p, i, list) => list.findIndex(q => q.category === p.category) === i)
      .slice(0, 3)
      .map(p => ({
        product: p,
        phase: "post" as const,
        quantity: 30,
        totalCost: p.price,
        reason: outcomeType === "build-muscle-endurance" && p.category === "Creatine"
          ? "3-5g daily — most researched performance supplement. Take consistently."
          : outcomeType === "improve-recovery" && p.category === "Omega-3"
          ? "Daily anti-inflammatory — reduces DOMS and accelerates tissue repair"
          : outcomeType === "gut-health" && p.category === "Probiotic"
          ? "Daily gut support — diversifies microbiome and reduces GI distress during exercise"
          : p.category === "Performance"
          ? "Performance supplement — check its doses against the research on its page"
          : p.category === "Recovery"
          ? "Recovery support between hard sessions"
          : p.category === "Sleep"
          ? "Sleep support — sleep is one of the biggest drivers of recovery"
          : p.category === "Gut Health"
          ? "Daily gut support"
          : "Daily supplement to support your goal",
      }));

    return { pre, during, post };
  }
}

function parsePlan(raw: string): ParsedPlan {
  const sections: ParsedPlan = {
    preEvent: [], duringEvent: [], postEvent: [], totals: [], keyNotes: [],
  };
  let current: keyof ParsedPlan = "preEvent";

  raw.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.match(/^PRE.EVENT/i) || trimmed.match(/^BEFORE/i)) { current = "preEvent"; return; }
    if (trimmed.match(/^DURING/i) || trimmed.match(/^INTRA/i)) { current = "duringEvent"; return; }
    if (trimmed.match(/^POST.EVENT/i) || trimmed.match(/^AFTER/i) || trimmed.match(/^RECOVERY/i)) { current = "postEvent"; return; }
    if (trimmed.match(/^PRODUCT/i) || trimmed.match(/^RECOMMENDED/i)) return; // skip — we handle products ourselves
    if (trimmed.match(/^TOTAL/i) || trimmed.match(/^SUMMARY/i)) { current = "totals"; return; }
    if (trimmed.match(/^KEY NOTE/i) || trimmed.match(/^IMPORTANT/i) || trimmed.match(/^NOTE/i)) { current = "keyNotes"; return; }
    sections[current].push(trimmed);
  });
  return sections;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all ${i + 1 === current ? "bg-moss text-cream" : i + 1 < current ? "bg-moss/30 text-moss" : "bg-sand text-muted"}`}>
            {i + 1 < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 ${i + 1 < current ? "bg-moss/30" : "bg-sand"}`} />}
        </div>
      ))}
    </div>
  );
}

// Replace the PlanLines function in app/quiz/page.tsx with this:

function PlanLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Strip markdown
        const clean = line
          .replace(/^#+\s*/, "")           // remove ## headers
          .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold
          .replace(/^[-*]\s+/, "")         // remove bullet markers
          .replace(/^\*(.+)\*$/, "$1")     // remove italic wrappers
          .replace(/^---+$/, "")           // remove dividers
          .replace(/^--$/, "")             // remove --
          .trim();

        if (!clean) return null;

        // Table rows — pipe separated
        if (clean.startsWith("|") && clean.endsWith("|")) {
          // Skip separator rows like |---|---|
          if (clean.match(/^\|[\s\-|]+\|$/)) return null;
          const cells = clean.split("|").filter(c => c.trim());
          // Header row (first table row)
          if (cells.length >= 2) {
            return (
              <div key={i} className="grid gap-2 text-xs py-1.5 border-b border-sand last:border-0"
                style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
                {cells.map((cell, ci) => (
                  <span key={ci} className={ci === 0 ? "font-medium text-ink" : "text-muted"}>{cell.trim()}</span>
                ))}
              </div>
            );
          }
        }

        // Timing headers (e.g. "2.5-3 Hours Before", "0-30 Minutes", "60 Minutes Before")
        if (clean.match(/^\d[\d\s\-–]+(?:hour|min|minute)/i) || clean.match(/^(?:meal total|hour \d)/i)) {
          return (
            <div key={i} className="font-semibold text-sm text-ink mt-4 mb-1 pt-2 border-t border-sand first:border-0 first:pt-0">
              {clean}
            </div>
          );
        }

        // Section subheaders (ALL CAPS or ends with colon)
        if ((clean === clean.toUpperCase() && clean.length > 3) || (clean.endsWith(":") && clean.length < 40)) {
          return (
            <div key={i} className="font-semibold text-sm text-ink mt-3 mb-1">{clean}</div>
          );
        }

        // Totals / summary lines (start with key metric)
        if (clean.match(/^(total|estimated|daily|monthly|target|budget)/i)) {
          const parts = clean.split(":");
          if (parts.length === 2) {
            return (
              <div key={i} className="flex items-center justify-between py-1 border-b border-sand/50 last:border-0">
                <span className="text-xs text-muted">{parts[0].trim()}</span>
                <span className="text-xs font-medium text-ink">{parts[1].trim()}</span>
              </div>
            );
          }
        }

        // Regular line
        return (
          <div key={i} className="flex items-start gap-2 text-sm text-muted">
            <span className="text-moss flex-shrink-0 mt-1 text-xs">→</span>
            <span className="leading-relaxed">{clean}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhaseProductCard({ item, borderColor }: { item: PhaseProduct; borderColor: string }) {
  const p = item.product;
  const pricePerServing = (p.price / servingsPerContainer(p)).toFixed(2);
  const buy = primaryRetailerLink(p);

  return (
    <div className={`bg-white/60 border ${borderColor} rounded-xl p-3 hover:shadow-md transition-all`}>
      <Link href={`/report/${p.id}`} className="block group">
        <div className="flex items-start gap-3">
          <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted mb-0.5">{p.category}</div>
            <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors leading-tight">{p.name}</div>
            <div className="text-xs text-muted">{p.brand}</div>
          </div>
          <div className="text-right flex-shrink-0">
            {item.quantity > 1 ? (
              <>
                <div className="text-xs font-bold text-ink">x{item.quantity}</div>
                <div className="text-xs text-moss">${item.totalCost.toFixed(2)}</div>
              </>
            ) : (
              <div className="text-xs text-muted">${pricePerServing}/srv</div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted mt-2 leading-relaxed">{item.reason}</p>
      </Link>
      {buy && (
        <div className="text-right mt-1.5">
          <a href={buy.url} target="_blank" rel={linkRel(buy)} className="text-xs text-moss font-medium hover:underline">
            Buy at {buy.name} →
          </a>
        </div>
      )}
    </div>
  );
}

// Shown in a plan phase when no product meets every diet and quality choice.
function NoMatch() {
  return (
    <p className="mt-4 pt-4 border-t border-sand text-xs text-muted">
      No product in our catalog meets all of your diet and quality-standard choices for this phase, so we haven&apos;t
      recommended one. Try removing a standard, or <Link href="/query" className="text-moss hover:underline">explore products</Link> yourself.
    </p>
  );
}

// Below a plan built while signed out. The plan itself is never gated; saving is part of
// Pello Pro, which starts with a free account and a free trial.
function GuestSaveCard() {
  return (
    <div className="card bg-moss/5 border-moss/20 text-center mb-3">
      <h3 className="font-display font-semibold mb-1">Want to save this plan?</h3>
      <p className="text-sm text-muted mb-4 max-w-md mx-auto">
        Create a free Pello account, then start your free Pello Pro trial to save plans, track your supplement stack and get plans
        tailored to your athlete profile.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Link href="/auth/login?mode=signup&redirect=%2Fpricing" className="btn-primary justify-center flex">Create free account →</Link>
        <Link href="/auth/login?redirect=%2Fquiz" className="btn-secondary justify-center flex">Sign in →</Link>
      </div>
    </div>
  );
}

interface PlanUsage { pro: boolean; used: number; limit: number | null; resetsOn: string }

const monthName = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
const resetDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

// ── MAIN COMPONENT ────────────────────────────────────────────

export default function PlannerClient({ catalog, initialMode = null }: { catalog: ProductSummary[]; initialMode?: PlannerMode | null }) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<PlannerInputs>(
    initialMode === "event" || initialMode === "outcome" || initialMode === "workout" ? { ...DEFAULT_INPUTS, mode: initialMode } : DEFAULT_INPUTS,
  );
  const [loading, setLoading] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const { user, profile, loading: authLoading } = useUser();
  const { allowed: proAccess, gating, loading: accessLoading } = useProAccess();
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [blocked, setBlocked] = useState<"limit" | "pro" | "signup" | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [workout, setWorkout] = useState<WorkoutSummary | null>(null);
  // Step 0: which planner. Null until chosen.
  const [plannerMode, setPlannerMode] = useState<PlannerMode | null>(initialMode);
  const chooseMode = (m: PlannerMode) => {
    setPlannerMode(m);
    if (m === "event" || m === "outcome" || m === "workout") { setInputs(prev => ({ ...prev, mode: m })); setStep(1); }
  };

  // An uploaded workout sets the session's sport, duration and (for bike files with power) intensity.
  const applyWorkout = (w: WorkoutSummary | null) => {
    setWorkout(w);
    if (!w) { setInputs(prev => ({ ...prev, workout: null })); return; }
    const detected = intensityFrom(w.intensityFactor, w.basis);
    setInputs(prev => ({
      ...prev,
      mode: prev.mode === "workout" ? "workout" : "event",
      eventType: prev.eventType ?? (w.sport === "bike" ? "road-cycling" : w.sport === "run" ? "running" : "training-day"),
      durationHours: Math.max(0.25, Math.round((w.durationMin / 60) * 100) / 100),
      intensity: detected ?? prev.intensity,
      workout: {
        kind: w.kind, sport: w.sport, name: w.name, durationMin: w.durationMin, basis: w.basis, intensityFactor: w.intensityFactor,
        blocks: w.blocks, avgPower: w.avgPower, kj: w.kj,
        ...(w.recordedWith ? { recordedWith: w.recordedWith } : {}),
      },
    }));
  };

  // This month's free allowance (only once Pro is on).
  useEffect(() => {
    if (!PRO_ENABLED || !user) { setUsage(null); return; }
    let active = true;
    fetch("/api/plan").then((r) => r.json()).then((d) => { if (active && d.usage) setUsage(d.usage); }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  // Pro: start from the saved athlete profile.
  useEffect(() => {
    if (prefilled || !profile || !proAccess || !user) return;
    setInputs((prev) => ({
      ...prev,
      ...(profile.weight_kg != null ? { weightKg: profile.weight_kg } : {}),
      weightUnit: profile.weight_unit ?? prev.weightUnit,
      ...(profile.age != null ? { age: profile.age } : {}),
      ...(profile.sex ? { sex: profile.sex } : {}),
      ...(profile.training_days_per_week != null ? { trainingDaysPerWeek: profile.training_days_per_week } : {}),
      ...(profile.caffeine_preference ? { caffeinePreference: profile.caffeine_preference } : {}),
      ...(profile.dietary?.length ? { dietary: profile.dietary as DietaryRestriction[] } : {}),
      ...(profile.salty_sweater != null ? { saltySweater: profile.salty_sweater } : {}),
    }));
    setPrefilled(true);
  }, [profile, proAccess, user, prefilled]);

  const limitReached = !!usage && !usage.pro && usage.limit != null && usage.used >= usage.limit;

  const update = (key: keyof PlannerInputs, value: any) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const toggleArray = <T,>(key: keyof PlannerInputs, value: T) => {
    const arr = inputs[key] as T[];
    setInputs(prev => ({ ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }));
  };

  // Today's workout drops the carb target to 0 for sessions that don't need fuel (lib/planner.ts).
  const carbTarget = sessionCarbTarget(inputs);
  const sodiumTarget = sodiumNeeded(inputs);
  const isWorkout = inputs.mode === "workout";
  const isEvent = inputs.mode === "event" || isWorkout; // single-session planners share the event flow

  // Build phase-specific recommendations
  const phaseRecs = useMemo(() => {
    if (!parsedPlan) return null;
    return buildPhaseRecommendations(catalog, inputs, carbTarget, sodiumTarget);
  }, [parsedPlan, inputs, carbTarget, sodiumTarget, catalog]);

  // Total cost
  const totalCost = useMemo(() => {
    if (!phaseRecs) return 0;
    // Carb options are alternatives, so only the cheapest one counts.
    const options = phaseRecs.during.filter(i => i.group === "carb-option").map(i => i.totalCost);
    const rest = [...phaseRecs.pre, ...phaseRecs.during.filter(i => i.group !== "carb-option"), ...phaseRecs.post];
    return rest.reduce((sum, item) => sum + item.totalCost, 0) + (options.length ? Math.min(...options) : 0);
  }, [phaseRecs]);

  const generatePlan = async () => {
    setLoading(true);
    setParsedPlan(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      const data = await res.json();
      if (data.usage) setUsage(data.usage);
      if (res.status === 403 && (data.code === "limit" || data.code === "pro" || data.code === "signup")) {
        setBlocked(data.code);
        setStep(1);
        setLoading(false);
        return;
      }
      setParsedPlan(parsePlan(data.plan ?? data.error ?? "Failed to generate plan."));
    } catch {
      setParsedPlan(parsePlan("Failed to generate plan. Please try again."));
    }
    setLoading(false);
  };

  const reset = () => {
    setParsedPlan(null);
    setStep(1);
    setInputs(DEFAULT_INPUTS);
    setPrefilled(false);
    setWorkout(null);
    setBlocked(null);
    setPlannerMode(null);
  };
  const completed = workout?.kind === "completed";

  // No account is needed to build a plan: signed-out visitors get one free plan (checked by
  // /api/plan), then are asked to sign up.
  const classicMode = plannerMode === "event" || plannerMode === "outcome" || plannerMode === "workout";
  const guestLimit = classicMode && blocked === "signup" && !parsedPlan && !loading;
  const filtersOn = inputs.dietary.length > 0 || (inputs.standards ?? []).length > 0;
  const showLimitGate = classicMode && (plannerMode === "event" || plannerMode === "workout") && gating && !proAccess && (limitReached || blocked === "limit") && !parsedPlan && !loading;

  const planTitle = workout
    ? `${workout.name} · ${completed ? "recovery & review" : "fueling plan"}`
    : isWorkout
    ? `${WORKOUT_TYPES.find(w => w.id === inputs.eventType)?.label ?? "Workout"} · ${Math.round(inputs.durationHours * 60)} min fueling plan`
    : isEvent
    ? `${EVENT_TYPES.find(e => e.id === inputs.eventType)?.label} · ${inputs.durationHours}hr plan`
    : OUTCOME_TYPES.find(o => o.id === inputs.outcomeType)?.label ?? "Your plan";

  return (
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        {!parsedPlan && !loading && (
          <div className="mb-8">
            <div className="text-xs text-muted uppercase tracking-widest mb-2">Pello Planner{plannerMode ? ` · ${MODE_BY_ID[plannerMode].title}` : ""}</div>
            <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Build your nutrition plan</h1>
            <p className="text-muted">Science-backed nutrition from Pello&apos;s product database, for your race, your goals and your budget.</p>
          </div>
        )}

        {/* Step 0: choose a planner */}
        {!plannerMode && <ModeSelector onChoose={chooseMode} />}
        {plannerMode === "supplement-stack" && <SupplementStackPlanner catalog={catalog} onStartOver={reset} />}
        {plannerMode === "race-week" && <RaceWeekPlanner catalog={catalog} onStartOver={reset} />}
        {plannerMode === "budget-optimiser" && <BudgetOptimiser catalog={catalog} onStartOver={reset} />}

        {/* Signed out and the free guest plan is used: sign up for one a month */}
        {guestLimit && (
          <div className="card text-center py-10">
            <h2 className="font-display font-semibold text-lg mb-2">You&apos;ve used your free plan</h2>
            <p className="text-sm text-muted mb-5 max-w-md mx-auto">
              Create a free account to build another. Free accounts get one plan a month, for race day or today&apos;s workout.
              Pello Pro adds unlimited plans, goal-based plans and saving.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/login?mode=signup&redirect=%2Fquiz" className="btn-primary justify-center flex">Create free account →</Link>
              <Link href="/auth/login?redirect=%2Fquiz" className="btn-secondary justify-center flex">Sign in →</Link>
            </div>
          </div>
        )}

        {/* Free allowance used up */}
        {showLimitGate && usage && (
          <ProGate feature="Unlimited plans with Pello Pro"
            description={`You've used your free plan for ${monthName(new Date().toISOString())}. Your next free plan is available on ${resetDay(usage.resetsOn)}.`} />
        )}

        {/* Goal planner is Pro only */}
        {plannerMode === "outcome" && gating && !proAccess && !authLoading && (
          <div>
            <ProGate feature="Goal-based plans" description={MODE_PRO_PITCH.outcome} />
            <div className="text-center mt-4"><button type="button" onClick={reset} className="text-sm text-muted hover:text-ink">Choose a different planner</button></div>
          </div>
        )}

        {/* Form */}
        {classicMode && !parsedPlan && !loading && !guestLimit && !showLimitGate && !(plannerMode === "outcome" && gating && !proAccess) && (
          <>
            {prefilled && proAccess && gating && step === 1 && (
              <p className="text-xs text-muted mb-4">Weight, age, sex, training and preferences are pre-filled from your <Link href="/account/onboarding?edit=1" className="text-moss hover:underline">athlete profile</Link>.</p>
            )}
            <StepIndicator current={step} total={3} />

            {/* Step 1 */}
            {step === 1 && (
              <div>
                {/* Pro (or Pro switched off): the workout file / intervals.icu panel comes first, as a
                    shortcut. Everyone else starts on the session choices; the Pro option is a quiet
                    line further down, so the step never opens on a locked panel. */}
                {isEvent && proAccess && !accessLoading && (
                  <WorkoutUpload workout={workout} onChange={applyWorkout} />
                )}
                {isEvent && (
                  <div>
                    <h2 className="font-display font-semibold text-base mb-4">{isWorkout ? "What's the session?" : "What are you planning for?"}</h2>
                    <div className="space-y-2 mb-6">
                      {(isWorkout ? WORKOUT_TYPES : EVENT_TYPES).map(e => (
                        <button key={e.id} onClick={() => update("eventType", e.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${inputs.eventType === e.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{e.label}</div>
                            <div className="text-xs text-muted">{e.desc}</div>
                          </div>
                          {inputs.eventType === e.id && <span className="text-moss text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                    {inputs.eventType && (
                      <div className="card mb-6">
                        <h3 className="font-display font-semibold mb-4">Duration</h3>
                        {workout && <p className="text-xs text-moss -mt-2 mb-3">From your workout file: {Math.floor(workout.durationMin / 60)}h {String(workout.durationMin % 60).padStart(2, "0")}m (planned as {inputs.durationHours} hours)</p>}
                        <div className="grid grid-cols-4 gap-2">
                          {DURATION_OPTIONS.map(d => (
                            <button key={d.value} onClick={() => update("durationHours", d.value)}
                              className={`py-2 px-2 rounded-xl border text-xs transition-all ${inputs.durationHours === d.value ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inputs.mode === "outcome" && (
                  <ProGate feature="Goal-based plans" description="Nutrition plans built around a goal, like finishing your first marathon, recovering faster or building muscle.">
                  <div>
                    <h2 className="font-display font-semibold text-base mb-4">What do you want to achieve?</h2>
                    <div className="space-y-2 mb-6">
                      {OUTCOME_TYPES.map(o => (
                        <button key={o.id} onClick={() => update("outcomeType", o.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${inputs.outcomeType === o.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{o.label}</div>
                            <div className="text-xs text-muted">{o.desc}</div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            {inputs.outcomeType === o.id
                              ? <span className="text-moss text-xs">✓</span>
                              : <span className="text-xs text-muted">{o.timeframe}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  </ProGate>
                )}

                {isEvent && !proAccess && !accessLoading && (
                  <div className="flex items-start gap-3 rounded-xl border border-dashed border-sand px-4 py-3 mb-6">
                    <ProTag />
                    <p className="text-xs text-muted leading-relaxed">
                      <span className="font-medium text-ink">Plan from a workout file or intervals.icu.</span>{" "}
                      Get fueling timed to your session&apos;s actual intervals.{" "}
                      <Link href="/pricing" className="text-moss hover:underline whitespace-nowrap">See Pello Pro →</Link>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={reset} className="btn-secondary flex-1 justify-center flex">Change planner</button>
                  <button onClick={() => setStep(2)} disabled={isEvent ? !inputs.eventType : (!inputs.outcomeType || !proAccess)}
                    className="btn-primary flex-1 justify-center flex disabled:opacity-40">
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-1">Your targets</h2>
                <p className="text-xs text-muted mb-5">We&apos;ll use these to calculate your exact nutrition needs</p>

                {isEvent && (
                  <div className="card mb-4">
                    <h3 className="font-display font-semibold mb-4">Intensity</h3>
                    {workout && (workoutIntensityNote(workout)
                      ? <p className="text-xs text-moss -mt-2 mb-3">Set from your workout file. {workoutIntensityNote(workout)}.</p>
                      : <p className="text-xs text-muted -mt-2 mb-3">Your workout file doesn&apos;t give a power-based intensity, so choose the closest.</p>)}
                    <div className="space-y-2">
                      {INTENSITY_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => update("intensity", opt.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${inputs.intensity === opt.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div>
                            <div className="font-medium text-sm">{opt.label}</div>
                            <div className="text-xs text-muted">{opt.desc}</div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm font-medium text-moss">{opt.carbsPerHr}g</div>
                            <div className="text-xs text-muted">carbs/hr</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isEvent && (
                  <div className="card mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display font-semibold">Conditions</h3>
                        <p className="text-xs text-muted">Heat raises how much sodium you need.</p>
                      </div>
                      <PillToggle<Conditions> label="Conditions" value={inputs.conditions ?? "mild"} onChange={v => update("conditions", v)}
                        options={CONDITIONS} />
                    </div>
                  </div>
                )}

                {isWorkout && (
                  <div className="card mb-4">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <h3 className="font-display font-semibold">Time of day</h3>
                      <PillToggle<SessionTime> label="Time of day" value={inputs.sessionTime ?? null} onChange={v => update("sessionTime", v)}
                        options={SESSION_TIMES} />
                    </div>
                    <h3 className="font-display font-semibold mb-1">When did you last eat?</h3>
                    <p className="text-xs text-muted mb-3">Decides whether you need anything before you start.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {LAST_MEALS.map(m => (
                        <button key={m.id} type="button" onClick={() => update("lastMeal", m.id)} aria-pressed={inputs.lastMeal === m.id}
                          className={`p-3 rounded-xl border text-left transition-all ${inputs.lastMeal === m.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="font-medium text-sm">{m.label}</div>
                          <div className="text-xs text-muted">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <FieldList className="mb-4">
                  <FieldRow label="Body weight" aside={<WeightUnitToggle value={inputs.weightUnit} onChange={v => update("weightUnit", v)} />}>
                    {/* Stored in kg for every calculation; shown in the chosen unit. */}
                    <WeightStepper weightKg={inputs.weightKg} unit={inputs.weightUnit} onChange={kg => update("weightKg", kg)} />
                  </FieldRow>
                  <FieldRow label="Age">
                    <NumberStepper label="Age" unit="yrs" min={16} max={70} value={inputs.age} onChange={v => update("age", v)} />
                  </FieldRow>
                  <FieldRow label="Sex" hint="Used to estimate sweat sodium losses, which are lower for women on average.">
                    <PillToggle<Sex> label="Sex" value={inputs.sex} onChange={v => update("sex", v)}
                      options={[{ id: "male", label: "Male" }, { id: "female", label: "Female" }]} />
                  </FieldRow>
                </FieldList>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-4">Caffeine preference</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "none" as CaffeinePreference, label: "None", desc: "Caffeine-free" },
                      { id: "moderate" as CaffeinePreference, label: "Moderate", desc: "1-2 products" },
                      { id: "high" as CaffeinePreference, label: "High", desc: "Maximize" },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => update("caffeinePreference", opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${inputs.caffeinePreference === opt.id ? "border-moss bg-moss/5" : "border-sand hover:border-muted"}`}>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-muted">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-1">Training days per week</h3>
                  <p className="text-xs text-muted mb-4">More training days put more weight on recovery nutrition.</p>
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button key={d} onClick={() => update("trainingDaysPerWeek", d)} aria-pressed={inputs.trainingDaysPerWeek === d}
                        aria-label={`${d} day${d === 1 ? "" : "s"} a week`}
                        className={`py-2 rounded-xl border text-sm transition-all ${inputs.trainingDaysPerWeek === d ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted text-muted"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {!isWorkout && (
                  <div className="card !py-1 mb-4">
                    <RangeSlider label={isEvent ? "Event budget" : "Monthly supplement budget"} min={10} max={200} step={5}
                      value={inputs.budget} onChange={v => update("budget", v)} format={v => `$${v}`} />
                  </div>
                )}

                {isEvent && (
                  <div className="bg-moss/5 border border-moss/20 rounded-xl p-4 mb-6">
                    <div className="text-xs text-moss uppercase tracking-widest mb-3">Calculated targets</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-display font-bold text-xl">{isWorkout && carbTarget === 0 ? "None" : `${carbTarget}g`}</div>
                        <div className="text-xs text-muted">{isWorkout && carbTarget === 0 ? "carbs needed" : "total carbs"}</div>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xl">{sodiumTarget}mg</div>
                        <div className="text-xs text-muted">sodium</div>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xl">{Math.round(inputs.durationHours * 500)}ml</div>
                        <div className="text-xs text-muted">fluid</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center flex">← Back</button>
                  <button onClick={() => setStep(3)} disabled={isWorkout && (!inputs.sessionTime || !inputs.lastMeal)}
                    className="btn-primary flex-1 justify-center flex disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-1">Your preferences</h2>
                <p className="text-xs text-muted mb-5">All optional — helps tailor product recommendations</p>

                <div className="card mb-4">
                  <h3 className="font-display font-semibold mb-1">Dietary requirements</h3>
                  <p className="text-xs text-muted mb-3">Select all that apply. We only recommend products labeled that way; dairy-free also uses the allergen list.</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["vegan", "gluten-free", "dairy-free"] as DietaryRestriction[]).map(d => (
                      <button key={d} onClick={() => toggleArray("dietary", d)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${inputs.dietary.includes(d) ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-display font-semibold">Quality standards</h3>
                    <Link href="/guides/certifications" target="_blank" className="text-xs text-moss hover:underline">What these mean →</Link>
                  </div>
                  <p className="text-xs text-muted mb-3">Only recommend products that meet all of these</p>
                  <div className="space-y-2">
                    {STANDARD_CHOICES.map(c => {
                      const on = (inputs.standards ?? []).includes(c.id);
                      return (
                        <button key={c.id} type="button" aria-pressed={on} onClick={() => toggleArray("standards", c.id as StandardChoice)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${on ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{c.label}</div>
                            <div className="text-xs text-muted">{c.hint}</div>
                          </div>
                          {on && <span className="text-moss text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isEvent && (
                  <div className="card mb-4">
                    <h3 className="font-display font-semibold mb-1">Preferred formats</h3>
                    <p className="text-xs text-muted mb-3">Leave blank for all formats</p>
                    <div className="space-y-2">
                      {FORMAT_OPTIONS.map(f => (
                        <button key={f.id} onClick={() => toggleArray("formats", f.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${inputs.formats.includes(f.id) ? "border-moss bg-moss/5" : "border-sand hover:border-muted bg-white/40"}`}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{f.label}</div>
                            <div className="text-xs text-muted">{f.desc}</div>
                          </div>
                          {inputs.formats.includes(f.id) && <span className="text-moss text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center flex">← Back</button>
                  <button onClick={() => { setStep(4); generatePlan(); }} className="btn-primary flex-1 justify-center flex">
                    Generate my plan →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-sand border-t-moss rounded-full mb-6" />
            <h2 className="font-display font-semibold text-lg mb-2">Building your plan...</h2>
            <p className="text-muted text-sm">Calculating targets, matching products and building your protocol</p>
          </div>
        )}

        {/* Results */}
        {parsedPlan && !loading && phaseRecs && (
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="text-xs text-muted uppercase tracking-widest mb-2">Your nutrition plan</div>
              <h1 className="font-display font-bold text-3xl tracking-tight mb-3">{planTitle}</h1>
              <div className="flex flex-wrap gap-2">
                {isEvent && <span className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{carbTarget}g carbs</span>}
                {isEvent && <span className="text-xs bg-sand px-2 py-0.5 rounded-md">{inputs.intensity} intensity</span>}
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md">{formatWeight(inputs.weightKg, inputs.weightUnit)}</span>
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md">{inputs.age} · {inputs.sex}</span>
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md">{inputs.trainingDaysPerWeek} training day{inputs.trainingDaysPerWeek === 1 ? "" : "s"}/week</span>
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md">${inputs.budget} budget</span>
                {inputs.caffeinePreference === "none" && <span className="text-xs bg-sand px-2 py-0.5 rounded-md">caffeine-free</span>}
                {inputs.dietary.map(d => <span key={d} className="text-xs bg-sand px-2 py-0.5 rounded-md">{d}</span>)}
                {(inputs.standards ?? []).map(id => <span key={id} className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{STANDARD_CHOICES.find(c => c.id === id)?.label}</span>)}
              </div>
              {workout && (
                <div className="card mt-4">
                  <div className="text-xs text-muted mb-2">
                    {completed ? "Completed workout" : "Planned workout"} · {workout.durationMin} min{workoutIntensityNote(workout) ? ` · ${workoutIntensityNote(workout)}` : ""}
                  </div>
                  <WorkoutChart blocks={workout.blocks} basis={workout.basis} />
                  {workout.recordedWith && <p className="text-xs text-muted mt-2">Recorded with {workout.recordedWith}</p>}
                </div>
              )}
            </div>

            {/* PRE phase */}
            <div className="card border-l-4 border-l-moss mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-moss/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-moss text-xs font-bold">PRE</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{completed ? "Before a session like this" : isWorkout ? "Before your session" : isEvent ? "Pre-event" : "Before training"}</h3>
                  <p className="text-xs text-muted">{completed ? "For next time" : isWorkout ? "Based on when you last ate" : isEvent ? "2-3 hours before" : "Daily preparation"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.preEvent} />
              {phaseRecs.pre.length === 0 && filtersOn && <NoMatch />}
              {phaseRecs.pre.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.pre.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-moss/20" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DURING phase */}
            <div className="card border-l-4 border-l-amber mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber text-xs font-bold">DUR</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{completed ? "What this session called for" : isWorkout ? "During your session" : isEvent ? "During event" : "During training"}</h3>
                  <p className="text-xs text-muted">{completed ? "Compare with what you took" : workout ? "Timed to your workout" : isWorkout && carbTarget === 0 ? "No fuel needed for this one" : isEvent ? "Per-hour fueling plan" : "Intra-workout nutrition"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.duringEvent} />
              {phaseRecs.during.length === 0 && filtersOn && <NoMatch />}
              {phaseRecs.during.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  {phaseRecs.during.some(i => i.group) ? (
                    <div className="space-y-4">
                      {phaseRecs.during.some(i => i.group === "carb-option") && (
                        <div>
                          <div className="text-xs text-muted uppercase tracking-widest mb-1">Carbs: pick one</div>
                          <p className="text-xs text-muted mb-2">Each option covers your {carbTarget}g carb target on its own.</p>
                          <div className="space-y-2">
                            {phaseRecs.during.filter(i => i.group === "carb-option").map(item => (
                              <PhaseProductCard key={item.product.id} item={item} borderColor="border-amber/20" />
                            ))}
                          </div>
                        </div>
                      )}
                      {phaseRecs.during.some(i => i.group === "electrolytes") && (
                        <div>
                          <div className="text-xs text-muted uppercase tracking-widest mb-2">Electrolytes: as well</div>
                          <div className="space-y-2">
                            {phaseRecs.during.filter(i => i.group === "electrolytes").map(item => (
                              <PhaseProductCard key={item.product.id} item={item} borderColor="border-amber/20" />
                            ))}
                          </div>
                        </div>
                      )}
                      {isEvent && carbTarget > 0 && (
                        <FuelingCost scope={inputs.mode === "workout" ? "session" : "event"} carbTarget={carbTarget}
                          carbOptions={phaseRecs.during.filter(i => i.group === "carb-option").map(i => i.product)}
                          extrasCost={phaseRecs.during.filter(i => i.group === "electrolytes").reduce((s, i) => s + i.totalCost, 0)}
                          catalog={catalog} eligible={(p) => fitsPlan(p, inputs)} />
                      )}
                    </div>
                  ) : (
                  <>
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.during.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-amber/20" />
                    ))}
                  </div>
                  </>
                  )}
                </div>
              )}
            </div>

            {/* POST phase */}
            <div className="card border-l-4 border-l-blue-400 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">POST</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{completed ? "Recovery: the next 24 hours" : isWorkout ? "After your session" : isEvent ? "Post-event recovery" : "Recovery protocol"}</h3>
                  <p className="text-xs text-muted">{completed ? "Starting now" : isWorkout ? "Sized to this session" : isEvent ? "0-30 min · 30-120 min · overnight" : "Daily recovery habits"}</p>
                </div>
              </div>
              <PlanLines lines={parsedPlan.postEvent} />
              {phaseRecs.post.length === 0 && filtersOn && <NoMatch />}
              {phaseRecs.post.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sand">
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">Recommended products</div>
                  <div className="space-y-2">
                    {phaseRecs.post.map(item => (
                      <PhaseProductCard key={item.product.id} item={item} borderColor="border-blue-100" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost summary */}
            <div className="card bg-moss/5 border-moss/20 mb-4">
              <div className="text-xs text-moss uppercase tracking-widest mb-3">
                {isWorkout ? "Products for this session" : isEvent ? "Estimated event cost" : "Monthly supplement stack"}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{isEvent ? "Recommended products total (cheapest carb option)" : "Recommended products total"}</span>
                <span className="font-display font-bold text-xl text-moss">${totalCost.toFixed(2)}</span>
              </div>
              {isEvent && (
                <div className={`text-xs ${totalCost <= inputs.budget ? "text-moss" : "text-amber"}`}>
                  {totalCost <= inputs.budget
                    ? `Within your $${inputs.budget} budget`
                    : `Over budget by $${(totalCost - inputs.budget).toFixed(2)} (your budget is $${inputs.budget})`}
                </div>
              )}
              {parsedPlan.totals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sand">
                  <PlanLines lines={parsedPlan.totals} />
                </div>
              )}
            </div>

            {/* Key notes */}
            {parsedPlan.keyNotes.length > 0 && (
              <div className="card bg-sand/30 mb-6">
                <div className="text-xs text-muted uppercase tracking-widest mb-3">Key notes</div>
                <PlanLines lines={parsedPlan.keyNotes} />
              </div>
            )}

            {usage && !usage.pro && usage.limit != null && (
              <p className="text-xs text-muted text-center mb-3 print:hidden">
                You have used {Math.min(usage.used, usage.limit)}/{usage.limit} free plan{usage.limit === 1 ? "" : "s"} this month.{" "}
                <Link href="/pricing" className="text-amber hover:underline">Unlimited plans with Pello Pro</Link>
              </p>
            )}
            <div className="print:hidden">
              {proAccess ? (
                <>
                  <SavePlanButton inputs={inputs} planContent={parsedPlan} defaultName={planTitle} />
                  {gating && <PrintButton label="Export plan as PDF" className="btn-secondary w-full justify-center flex mb-3" />}
                </>
              ) : !user && !authLoading ? (
                <GuestSaveCard />
              ) : (
                <div className="mb-3">
                  <ProGate compact feature="Save and export plans" description="Keep this plan in your account, revisit it any time and export it as a PDF." />
                </div>
              )}
            </div>
            <div className="flex gap-3 print:hidden">
              <button onClick={reset} className="btn-secondary flex-1 justify-center flex">Start over</button>
              <Link href="/products" className="btn-primary flex-1 justify-center flex text-center">Browse all products →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}