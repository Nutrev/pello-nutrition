import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "price-alerts", 5, 10 * 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const productId = body?.productId;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!productId || !email) {
    return NextResponse.json({ error: "Product and email required" }, { status: 400 });
  }
  if (!PRODUCTS.some((p) => p.id === productId)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length > 254 || !emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { error } = await supabase
    .from("price_alerts")
    .insert([{ product_id: productId, email }]);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "already_subscribed" }, { status: 200 });
    }
    console.error("Price alert insert error:", error);
    return NextResponse.json({ error: "Couldn't save your alert. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "subscribed" }, { status: 201 });
}