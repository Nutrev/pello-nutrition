import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";

const isStarRating = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json({ error: "Couldn't load reviews" }, { status: 500 });
  }

  // Calculate attribute averages
  const reviews = data ?? [];
  const withAttr = (field: string) => reviews.filter((r: any) => r[field] != null);

  const avg = (field: string) => {
    const vals = withAttr(field);
    if (vals.length === 0) return null;
    return Math.round((vals.reduce((a: number, r: any) => a + r[field], 0) / vals.length) * 10) / 10;
  };

  const attributeAverages = {
    taste: avg("taste_rating"),
    gi_comfort: avg("gi_comfort_rating"),
    energy: avg("energy_rating"),
    value: avg("value_rating"),
    effectiveness: avg("effectiveness_rating"),
    mixability: avg("mixability_rating"),
    count: reviews.length,
  };

  return NextResponse.json({ reviews: data, attributeAverages });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "reviews", 3, 10 * 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  const {
    productId, rating,
    tasteRating, giComfortRating, energyRating,
    valueRating, effectivenessRating, mixabilityRating,
  } = body;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!productId || !name || !rating || !comment) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!PRODUCTS.some((p) => p.id === productId)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!isStarRating(rating)) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (name.length > 50) {
    return NextResponse.json({ error: "Name must be 50 characters or fewer" }, { status: 400 });
  }
  if (comment.length < 10 || comment.length > 2000) {
    return NextResponse.json({ error: "Comment must be between 10 and 2000 characters" }, { status: 400 });
  }

  const attributeRatings = {
    taste_rating: tasteRating,
    gi_comfort_rating: giComfortRating,
    energy_rating: energyRating,
    value_rating: valueRating,
    effectiveness_rating: effectivenessRating,
    mixability_rating: mixabilityRating,
  };
  for (const value of Object.values(attributeRatings)) {
    if (value != null && !isStarRating(value)) {
      return NextResponse.json({ error: "Attribute ratings must be between 1 and 5" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([{
      product_id: productId,
      name,
      rating,
      comment,
      taste_rating: tasteRating ?? null,
      gi_comfort_rating: giComfortRating ?? null,
      energy_rating: energyRating ?? null,
      value_rating: valueRating ?? null,
      effectiveness_rating: effectivenessRating ?? null,
      mixability_rating: mixabilityRating ?? null,
    }])
    .select()
    .single();

  if (error) {
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Couldn't save your review. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ review: data }, { status: 201 });
}
