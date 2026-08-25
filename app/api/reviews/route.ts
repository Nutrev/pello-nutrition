import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
  const body = await req.json();
  const {
    productId, name, rating, comment,
    tasteRating, giComfortRating, energyRating,
    valueRating, effectivenessRating, mixabilityRating,
  } = body;

  if (!productId || !name || !rating || !comment) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (comment.length < 10) {
    return NextResponse.json({ error: "Comment must be at least 10 characters" }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data }, { status: 201 });
}