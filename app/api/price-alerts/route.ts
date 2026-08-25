import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { productId, email } = await req.json();

  if (!productId || !email) {
    return NextResponse.json({ error: "Product and email required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { error } = await supabase
    .from("price_alerts")
    .insert([{ product_id: productId, email }]);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "already_subscribed" }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "subscribed" }, { status: 201 });
}