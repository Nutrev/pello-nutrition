import type { Metadata } from "next";
import Link from "next/link";
import { requireAccountUser, productById, accountAccess } from "@/lib/account-server";
import ReadOnlyNote from "@/components/pro/ReadOnlyNote";
import type { StackItem } from "@/lib/account-types";
import BrandLogo from "@/components/BrandLogo";
import StackItemControls from "@/components/account/StackItemControls";

export const metadata: Metadata = { title: "Supplement stack", robots: { index: false } };

export default async function StackPage() {
  const { supabase, user } = await requireAccountUser("/account/stack");
  const [{ data }, access] = await Promise.all([
    supabase.from("supplement_stack").select("*").order("created_at", { ascending: false }),
    accountAccess(supabase, user.id),
  ]);
  const items = (data ?? []) as StackItem[];
  const active = items.filter((i) => i.is_active).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/account" className="text-xs text-muted hover:text-ink">← Account</Link>
      <div className="flex items-end justify-between gap-4 mt-3 mb-2">
        <h1 className="font-display font-bold text-3xl tracking-tight">Supplement stack</h1>
        {access.allowed && <Link href="/products" className="btn-primary whitespace-nowrap">Add a product</Link>}
      </div>
      {!access.allowed && (
        <ReadOnlyNote feature="Supplement stack tracker"
          text={items.length > 0
            ? "Your stack is read-only on the free plan. You can still view and remove items; adding and editing need Pello Pro."
            : "Track what you take, how much and when with Pello Pro."} />
      )}
      <p className="text-sm text-muted mb-6">
        {items.length > 0 ? `${active} active, ${items.length - active} paused. ` : ""}Add products from any product page with &ldquo;Add to my stack&rdquo;.
      </p>
      {items.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-muted mb-4">Your stack is empty. Track what you take, how much and when.</p>
          <Link href="/products" className="btn-primary inline-flex">Find products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const p = productById(item.product_id);
            const name = p ? `${p.brand} ${p.name}` : "Product no longer listed";
            return (
              <div key={item.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${item.is_active ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {p && <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="md" />}
                  <div className="min-w-0">
                    {p ? <Link href={`/report/${p.id}`} className="font-medium text-sm hover:text-moss">{name}</Link> : <span className="text-sm text-muted">{name}</span>}
                    <div className="text-xs text-muted mt-0.5">
                      {[item.daily_dose, item.timing].filter(Boolean).join(" · ") || "No dose or timing set"}
                      {!item.is_active && " · paused"}
                    </div>
                    {item.notes && <p className="text-xs text-muted mt-1 whitespace-pre-wrap">{item.notes}</p>}
                  </div>
                </div>
                <StackItemControls item={item} productName={name} readOnly={!access.allowed} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
