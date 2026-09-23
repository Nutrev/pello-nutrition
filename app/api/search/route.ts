import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Explore = searchParams.get("q");
  const barcode = searchParams.get("barcode");

  try {
    let product = null;

    if (barcode) {
      // Barcode lookup
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,ingredients_text,nutriments,categories,image_url,ecoscore_grade,nutriscore_grade`,
        { headers: { "User-Agent": "PelloNutrition/1.0" } }
      );
      const data = await res.json();
      if (data.status === 1) product = data.product;
    } else if (Explore) {
      // Text search
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(Explore)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,ingredients_text,nutriments,categories,image_url,code`,
        { headers: { "User-Agent": "PelloNutrition/1.0" } }
      );
      const data = await res.json();
      return NextResponse.json({ results: data.products ?? [] });
    }

    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}