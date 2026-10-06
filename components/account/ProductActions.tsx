"use client";

// Favorite (heart) and "Add to my stack" on a product page.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import AuthPrompt from "./AuthPrompt";
import StackModal from "./StackModal";
import UpgradePrompt from "@/components/pro/UpgradePrompt";
import { ProTag } from "@/components/pro/LockIcon";
import { useProAccess } from "@/lib/subscription";

export default function ProductActions({ productId, productName, servingSize }: { productId: string; productName: string; servingSize?: string }) {
  const { user, loading } = useUser();
  const [favId, setFavId] = useState<string | null>(null);
  const [inStack, setInStack] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [stackOpen, setStackOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { allowed: canStack, gating } = useProAccess();

  useEffect(() => {
    if (!user) { setFavId(null); setInStack(false); return; }
    let active = true;
    (async () => {
      const supabase = await loadBrowserSupabase();
      const [fav, stack] = await Promise.all([
        supabase.from("favourite_products").select("id").eq("product_id", productId).maybeSingle(),
        supabase.from("supplement_stack").select("id", { count: "exact", head: true }).eq("product_id", productId),
      ]);
      if (!active) return;
      setFavId(fav.data?.id ?? null);
      setInStack((stack.count ?? 0) > 0);
    })();
    return () => { active = false; };
  }, [user, productId]);

  const toggleFavourite = async () => {
    if (!user) { setPrompt("save favorites"); return; }
    setBusy(true);
    const supabase = await loadBrowserSupabase();
    if (favId) {
      const { error } = await supabase.from("favourite_products").delete().eq("id", favId);
      if (!error) setFavId(null);
    } else {
      const { data, error } = await supabase.from("favourite_products").insert({ user_id: user.id, product_id: productId }).select("id").single();
      if (!error) setFavId(data.id);
    }
    setBusy(false);
  };

  const saved = !!favId;
  return (
    <div className={`flex flex-col gap-2 ${loading ? "invisible" : ""}`}>
      <button type="button" onClick={toggleFavourite} disabled={busy} aria-pressed={saved}
        className={`btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-60 ${saved ? "text-rust border-rust/30" : ""}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.5C12 6.1 13.4 5 15.4 5 18.8 5 21 8.4 21.5 11.8 19.5 16.4 12 21 12 21z" />
        </svg>
        {saved ? "Saved to favorites" : "Save to favorites"}
      </button>
      {inStack ? (
        <Link href="/account/stack" className="btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap">✓ In your stack</Link>
      ) : (
        <button type="button" onClick={() => (!user ? setPrompt("build your supplement stack") : canStack ? setStackOpen(true) : setUpgradeOpen(true))}
          className="btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap">
          + Add to my stack {gating && !canStack && user && <ProTag />}
        </button>
      )}
      <AuthPrompt open={!!prompt} onClose={() => setPrompt(null)} action={prompt ?? ""} />
      <UpgradePrompt open={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="Supplement stack tracker"
        description="Track what you take, how much and when, and pause or edit items as your training changes." />
      <StackModal open={stackOpen} onClose={() => setStackOpen(false)} productId={productId} productName={productName}
        defaultDose={servingSize} onSaved={() => setInStack(true)} />
    </div>
  );
}
