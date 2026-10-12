import { describe, expect, it } from "vitest";
import { PRODUCTS } from "./products";

// A product's price and serving count describe its default size, so the report page, scores and
// lists agree whichever one they read.
describe("size options", () => {
  it("the default size matches the product's own price and servings", () => {
    for (const p of PRODUCTS.filter((x) => x.variants?.length)) {
      const def = p.variants!.find((v) => v.id === (p.defaultVariantId ?? p.variants![0].id));
      expect(def, p.id).toBeDefined();
      expect([p.id, def!.price, def!.servingsPerContainer]).toEqual([p.id, p.price, p.servingsPerContainer]);
    }
  });
  it("every size has a unique id, a price and a serving count", () => {
    for (const p of PRODUCTS.filter((x) => x.variants?.length)) {
      expect(new Set(p.variants!.map((v) => v.id)).size, p.id).toBe(p.variants!.length);
      for (const v of p.variants!) expect(v.price > 0 && v.servingsPerContainer > 0, `${p.id} ${v.id}`).toBe(true);
    }
  });
});
