import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAccountUser, productById, accountAccess } from "@/lib/account-server";
import UpgradedBanner from "@/components/pro/UpgradedBanner";
import ManageSubscriptionButton from "@/components/pro/ManageSubscriptionButton";
import { PRO_FEATURES, type SubscriptionRow } from "@/lib/pro";
import type { UserProfile, SavedPlan, FavouriteProduct, StackItem } from "@/lib/account-types";
import { formatWeight } from "@/lib/planner";
import { formatDate } from "@/lib/format-date";
import ProductCard from "@/components/ProductCard";
import SignOutButton from "@/components/account/SignOutButton";
import PendingPlanBanner from "@/components/account/PendingPlanBanner";

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

function SubscriptionSection({ isPro, sub }: { isPro: boolean; sub: SubscriptionRow | null }) {
  if (isPro && sub) {
    const end = sub.current_period_end ? formatDate(sub.current_period_end) : null;
    const trialing = sub.stripe_status === "trialing";
    const pastDue = sub.stripe_status === "past_due";
    const line = pastDue
      ? "Your last payment didn't go through. Update your card to keep Pro."
      : trialing && sub.trial_end
      ? `Free trial ends ${formatDate(sub.trial_end)}${sub.cancel_at_period_end ? ", then Pro ends" : ""}.`
      : sub.cancel_at_period_end && end
      ? `Cancelled. You keep Pro until ${end}.`
      : end ? `Renews ${end}.` : null;
    return (
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest bg-amber/10 text-amber px-2 py-0.5 rounded-md">Pello Pro</span>
          {line && <p className={`text-sm mt-2 ${pastDue ? "text-rust" : "text-muted"}`}>{line}</p>}
        </div>
        <ManageSubscriptionButton className="btn-secondary text-sm whitespace-nowrap" />
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

export default async function AccountPage() {
  const { supabase, user } = await requireAccountUser("/account");

  const [profileRes, plansRes, planCount, favRes, favCount, stackRes, access] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("saved_plans").select("id, plan_name, plan_mode, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("saved_plans").select("id", { count: "exact", head: true }),
    supabase.from("favourite_products").select("*").order("created_at", { ascending: false }).limit(4),
    supabase.from("favourite_products").select("id", { count: "exact", head: true }),
    supabase.from("supplement_stack").select("*").order("created_at", { ascending: false }),
    accountAccess(supabase, user.id),
  ]);

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
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">Your account</div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Welcome back, {name}</h1>
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
      {access.gating && <SubscriptionSection isPro={access.isPro} sub={access.subscription} />}

      {access.allowed && <PendingPlanBanner />}

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        {[
          { n: planCount.count ?? 0, label: "Saved plans", href: "/account/plans" },
          { n: favCount.count ?? 0, label: "Favourites", href: "/account/favourites" },
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
          <Empty text="Plans you save from the Pello Planner will appear here." href="/quiz" cta="Build a plan" />
        ) : (
          <div className="card divide-y divide-sand p-0">
            {plans.map((p) => (
              <Link key={p.id} href={`/account/plans/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-sand/30 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{p.plan_name}</div>
                  <div className="text-xs text-muted">{formatDate(p.created_at)}</div>
                </div>
                <span className="text-xs bg-sand px-2 py-0.5 rounded-md flex-shrink-0">{p.plan_mode === "event" ? "Event" : "Goal"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionHeader title="Favourite products" href="/account/favourites" linkLabel="All favourites" />
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
          <Empty text="Add products to your stack from any product page to track what you take and when." href="/products" cta="Find products" />
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
    </div>
  );
}
