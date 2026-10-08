import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAccountUser, productById, accountAccess } from "@/lib/account-server";
import UpgradedBanner from "@/components/pro/UpgradedBanner";
import ManageSubscriptionButton from "@/components/pro/ManageSubscriptionButton";
import { PRO_FEATURES, PRO_PRICE_LABEL, type SubscriptionRow } from "@/lib/pro";
import { trialHasPaymentMethod } from "@/lib/subscription-server";
import { SAVED_PLAN_LABEL, type UserProfile, type SavedPlan, type FavouriteProduct, type StackItem } from "@/lib/account-types";
import { formatWeight } from "@/lib/planner";
import { PLANNER_MODES } from "@/lib/planner-modes";
import { formatDate } from "@/lib/format-date";
import ProductCard from "@/components/ProductCard";
import SignOutButton from "@/components/account/SignOutButton";
import PendingPlanBanner from "@/components/account/PendingPlanBanner";
import IntervalsConnection from "@/components/account/IntervalsConnection";
import { INTERVALS_ENABLED, getConnection, hasActivityAccess } from "@/lib/intervals";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="font-display font-semibold text-lg">{title}</h2>
      <Link href={href} className="text-sm text-moss hover:underline">{linkLabel} →</Link>
    </div>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="card text-center py-8">
      <p className="text-sm text-muted mb-4">{text}</p>
      <Link href={href} className="btn-primary inline-flex">{cta}</Link>
    </div>
  );
}

// Recent plans, before any are saved: every planner as a tile that opens it directly.
// Pro-only planners carry a PRO badge for members without Pro (only while Pro is on).
function PlannerTiles({ locked }: { locked: boolean }) {
  return (
    <div className="card">
      <p className="text-sm text-muted mb-4">
        You haven&apos;t saved a plan yet. {locked ? "Pick a planner to start:" : "Every planner is ready for you. Pick one to start:"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLANNER_MODES.map((m) => {
          const pro = locked && m.access === "pro";
          return (
            <Link key={m.id} href={`/quiz?mode=${m.id}`}
              className="group rounded-xl border border-sand bg-white/70 p-4 hover:border-moss hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{m.title}</span>
                {pro ? <span className="text-[10px] font-semibold tracking-wider bg-moss text-cream px-2 py-0.5 rounded-full">PRO</span>
                  : m.isNew ? <span className="text-[10px] font-semibold tracking-wider bg-moss/10 text-moss px-2 py-0.5 rounded-full">NEW</span>
                  : null}
              </div>
              <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
              <div className="text-xs text-moss mt-2">{pro ? "See what Pro adds →" : "Start →"}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Supplement stack, before anything is added: what the tracker does. The tracker is a Pro
// feature, so members without Pro are pointed to Pello Pro instead of to products.
function StackIntro({ locked }: { locked: boolean }) {
  const features = [
    { title: "Doses and timing", text: "Morning, pre-training or evening, for each product." },
    { title: "Built on Pello data", text: "Every product links to its score and ingredients." },
    { title: "A stack plan", text: "The supplement stack planner builds a protocol for your goals and budget." },
  ];
  return (
    <div className="card">
      <p className="text-sm text-muted mb-4">Keep track of what you take, how much and when.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {features.map((f) => (
          <div key={f.title}>
            <div className="font-display font-semibold text-sm mb-0.5">{f.title}</div>
            <p className="text-xs text-muted leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
      {locked
        ? <Link href="/pricing" className="btn-primary inline-flex">See Pello Pro</Link>
        : <Link href="/products" className="btn-primary inline-flex">Find products to add</Link>}
    </div>
  );
}

// hasCard: for a trial that will carry on into a paid subscription, whether a payment method
// is on file (null when Stripe couldn't say). Without one, the trial ends with Pro.
function SubscriptionSection({ isPro, sub, hasCard }: { isPro: boolean; sub: SubscriptionRow | null; hasCard: boolean | null }) {
  if (isPro && sub) {
    const end = sub.current_period_end ? formatDate(sub.current_period_end) : null;
    const trialing = sub.stripe_status === "trialing";
    const pastDue = sub.stripe_status === "past_due";
    const trialEnd = trialing && sub.trial_end ? formatDate(sub.trial_end) : null;
    const needsCard = !!trialEnd && !sub.cancel_at_period_end && hasCard === false;
    const line = pastDue
      ? "Your last payment didn't go through. Update your card to keep Pro."
      : trialEnd && sub.cancel_at_period_end
      ? `Free trial ends ${trialEnd}, then Pro ends.`
      : needsCard
      ? `Free trial ends ${trialEnd}. Add a card before then to keep Pro. Without one, your account goes back to the free plan on that date and you aren't charged.`
      : trialEnd && hasCard
      ? `Free trial ends ${trialEnd}. Pro then continues at ${PRO_PRICE_LABEL}/month (USD) plus any applicable tax, charged to the card you added.`
      : trialEnd
      ? `Free trial ends ${trialEnd}. If you haven't added a card by then, your account goes back to the free plan and you aren't charged.`
      : sub.cancel_at_period_end && end
      ? `Canceled. You keep Pro until ${end}.`
      : end ? `Renews ${end}.` : null;
    return (
      <div className={`card flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 ${needsCard ? "bg-amber/5 border-amber/30" : ""}`}>
        <div>
          <span className="text-[11px] uppercase tracking-widest bg-amber/10 text-amber px-2 py-0.5 rounded-md">Pello Pro</span>
          {line && <p className={`text-sm mt-2 ${pastDue ? "text-rust" : needsCard ? "text-ink" : "text-muted"}`}>{line}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {needsCard && <ManageSubscriptionButton addCard className="btn-primary text-sm whitespace-nowrap" label="Add a card" />}
          <ManageSubscriptionButton className={needsCard ? "text-xs text-muted hover:text-ink" : "btn-secondary text-sm whitespace-nowrap"} />
        </div>
      </div>
    );
  }
  return (
    <div className="card bg-amber/5 border-amber/30 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="font-display font-semibold">You&apos;re on the free plan</div>
          <p className="text-sm text-muted mb-2">Pello Pro adds:</p>
          <ul className="text-sm text-muted space-y-0.5">
            {PRO_FEATURES.map((f) => <li key={f}>· {f}</li>)}
          </ul>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/pricing" className="btn-primary whitespace-nowrap">Upgrade to Pello Pro</Link>
          {sub?.stripe_customer_id && <ManageSubscriptionButton className="text-xs text-muted hover:text-ink" label="Billing history" />}
        </div>
      </div>
    </div>
  );
}

// Shown after returning from intervals.icu (/api/intervals/callback).
const INTERVALS_RESULT: Record<string, string> = {
  connected: "intervals.icu is connected. In the Today's workout planner, use today's planned workout or a completed one.",
  declined: "intervals.icu wasn't connected, as you declined access.",
  failed: "Connecting intervals.icu didn't work. Please try again.",
};

export default async function AccountPage({ searchParams }: { searchParams: { intervals?: string } }) {
  const { supabase, user } = await requireAccountUser("/account");

  const [profileRes, plansRes, planCount, favRes, favCount, stackRes, access, intervals] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("saved_plans").select("id, plan_name, plan_mode, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("saved_plans").select("id", { count: "exact", head: true }),
    supabase.from("favourite_products").select("*").order("created_at", { ascending: false }).limit(4),
    supabase.from("favourite_products").select("id", { count: "exact", head: true }),
    supabase.from("supplement_stack").select("*").order("created_at", { ascending: false }),
    accountAccess(supabase, user.id),
    INTERVALS_ENABLED ? getConnection(user.id) : Promise.resolve(null),
  ]);

  // Only a trial that will carry on needs to know whether a card is on file.
  const trialSub = access.isPro && access.subscription?.stripe_status === "trialing" && !access.subscription.cancel_at_period_end ? access.subscription : null;
  const hasCard = trialSub ? await trialHasPaymentMethod(trialSub) : null;
  const profile = profileRes.data as UserProfile | null;
  const plans = (plansRes.data ?? []) as Pick<SavedPlan, "id" | "plan_name" | "plan_mode" | "created_at">[];
  const favourites = ((favRes.data ?? []) as FavouriteProduct[]).map((f) => productById(f.product_id)).filter((p) => p != null);
  const stack = (stackRes.data ?? []) as StackItem[];
  const activeStack = stack.filter((s) => s.is_active);
  const name = profile?.username || user.email?.split("@")[0] || "athlete";

  const profileBits = profile ? [
    profile.weight_kg != null ? formatWeight(profile.weight_kg, profile.weight_unit) : null,
    profile.age != null ? `${profile.age} years` : null,
    profile.training_days_per_week != null ? `${profile.training_days_per_week} training days a week` : null,
  ].filter(Boolean) : [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted mb-1">Your account</div>
          <h1 className="font-display font-bold text-3xl tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1">
            Welcome back, {name}
            {access.gating && access.isPro && (
              <span className="text-xs font-semibold tracking-wider bg-moss text-cream px-2.5 py-1 rounded-full">PELLO PRO</span>
            )}
          </h1>
          {profileBits.length > 0 && <p className="text-sm text-muted mt-1">{profileBits.join(" · ")}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/account/onboarding?edit=1" className="btn-secondary text-sm">Edit profile</Link>
          <SignOutButton />
        </div>
      </div>

      {!profile && (
        <div className="card bg-moss/5 border-moss/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="font-display font-semibold">Finish setting up your profile</div>
            <p className="text-sm text-muted">Add your weight, training and goals so the planner can tailor your plans.</p>
          </div>
          <Link href="/account/onboarding" className="btn-primary whitespace-nowrap">Set up profile →</Link>
        </div>
      )}

      <Suspense fallback={null}><UpgradedBanner /></Suspense>
      {searchParams.intervals && INTERVALS_RESULT[searchParams.intervals] && (
        <div role="status" className="card mb-6 text-sm">{INTERVALS_RESULT[searchParams.intervals]}</div>
      )}
      {access.gating && <SubscriptionSection isPro={access.isPro} sub={access.subscription} hasCard={hasCard} />}

      {access.allowed && <PendingPlanBanner />}

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        {[
          { n: planCount.count ?? 0, label: "Saved plans", href: "/account/plans" },
          { n: favCount.count ?? 0, label: "Favorites", href: "/account/favourites" },
          { n: activeStack.length, label: "In your stack", href: "/account/stack" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="card text-center hover:shadow-md transition-all">
            <div className="font-display font-bold text-2xl">{s.n}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <section className="mb-10">
        <SectionHeader title="Recent plans" href="/account/plans" linkLabel="All plans" />
        {plans.length === 0 ? (
          <PlannerTiles locked={access.gating && !access.isPro} />
        ) : (
          <div className="card divide-y divide-sand p-0">
            {plans.map((p) => (
              <Link key={p.id} href={`/account/plans/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-sand/30 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{p.plan_name}</div>
                  <div className="text-xs text-muted">{formatDate(p.created_at)}</div>
                </div>
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md flex-shrink-0">{SAVED_PLAN_LABEL[p.plan_mode] ?? "Plan"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionHeader title="Favorite products" href="/account/favourites" linkLabel="All favorites" />
        {favourites.length === 0 ? (
          <Empty text="Tap the heart on any product to keep it here." href="/products" cta="Browse products" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favourites.map((p) => <ProductCard key={p!.id} product={p!} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Your supplement stack" href="/account/stack" linkLabel="Manage stack" />
        {activeStack.length === 0 ? (
          <StackIntro locked={access.gating && !access.isPro} />
        ) : (
          <div className="card divide-y divide-sand p-0">
            {activeStack.slice(0, 6).map((s) => {
              const p = productById(s.product_id);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p ? `${p.brand} ${p.name}` : "Product no longer listed"}</div>
                    <div className="text-xs text-muted">{[s.daily_dose, s.timing].filter(Boolean).join(" · ") || "No dose or timing set"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {INTERVALS_ENABLED && (
        <section className="mt-10">
          <h2 className="font-display font-semibold text-lg mb-3">Connected apps</h2>
          <IntervalsConnection connected={!!intervals} athleteName={intervals?.athlete_name ?? null} locked={access.gating && !access.isPro}
            needsReconnect={!!intervals && !hasActivityAccess(intervals)} />
        </section>
      )}
    </div>
  );
}
