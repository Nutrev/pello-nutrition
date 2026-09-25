// lib/servings.ts
// Price per serving, shared by every page so the same product always shows the same cost.
// `price` is for a whole pack; `servingsPerContainer` says how many servings that pack
// holds. When a product doesn't record it, a typical pack size for its category is used.

import type { Category, Product } from "./products";

export const DEFAULT_SERVINGS: Record<Category, number> = {
  "Energy Gel": 12,
  "Energy Chew": 12,
  "Energy Bar": 12,
  "Energy": 12,
  "Carbohydrate Mix": 30,
  "Hydration": 30,
  "Protein": 28,
  "Creatine": 90,
  "Supplement": 30,
  "Probiotic": 30,
  "Omega-3": 30,
  "Vitamin": 90,
  "Mineral": 60,
};

export function servingsPerContainer(p: Pick<Product, "category" | "servingsPerContainer">): number {
  return p.servingsPerContainer ?? DEFAULT_SERVINGS[p.category] ?? 30;
}

export function pricePerServing(p: Pick<Product, "price" | "category" | "servingsPerContainer">): number {
  return p.price / servingsPerContainer(p);
}

// "$32.3" -> "$32.30", "$45" -> "$45": whole-dollar prices stay short, others show cents.
export function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}
