import type { Metadata } from "next";
import Link from "next/link";
import { requireAccountUser, productById } from "@/lib/account-server";
import type { FavouriteProduct } from "@/lib/account-types";
import ProductCard from "@/components/ProductCard";
import DeleteRowButton from "@/components/account/DeleteRowButton";

export const metadata: Metadata = { title: "Favorite products", robots: { index: false } };

export default async function FavouritesPage() {
  const { supabase } = await requireAccountUser("/account/favourites");
  const { data } = await supabase.from("favourite_products").select("*").order("created_at", { ascending: false });
  const favourites = (data ?? []) as FavouriteProduct[];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/account" className="text-xs text-muted hover:text-ink">← Account</Link>
      <div className="flex items-end justify-between gap-4 mt-3 mb-6">
        <h1 className="font-display font-bold text-3xl tracking-tight">Favorite products</h1>
        <Link href="/products" className="btn-secondary whitespace-nowrap">Browse products</Link>
      </div>
      {favourites.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-muted mb-4">No favorites yet. Tap the heart on any product page to save it here.</p>
          <Link href="/products" className="btn-primary inline-flex">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map((f) => {
            const p = productById(f.product_id);
            return (
              <div key={f.id} className="flex flex-col gap-2">
                {p ? <ProductCard product={p} /> : <div className="card text-sm text-muted flex-1">This product is no longer listed on Pello.</div>}
                <div className="text-right">
                  <DeleteRowButton table="favourite_products" id={f.id} label="Remove from favorites"
                    confirmText={`Remove ${p ? p.name : "this product"} from your favorites?`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
