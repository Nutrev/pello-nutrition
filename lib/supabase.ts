import { createClient } from "@supabase/supabase-js";

// Server-only client. Only API routes use Supabase, so they connect with the
// service-role key, which bypasses row-level security. The public anon key is
// locked down in the database (read-only reviews, no price_alerts access), so
// nobody can skip the API's validation by calling Supabase directly.
// SUPABASE_SERVICE_ROLE_KEY must never get a NEXT_PUBLIC_ prefix.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set; falling back to the anon key. Writes will fail once RLS is locked down.");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

export interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  // Attribute ratings
  taste_rating?: number;
  gi_comfort_rating?: number;
  energy_rating?: number;
  value_rating?: number;
  effectiveness_rating?: number;
  mixability_rating?: number;
}

export interface AttributeAverages {
  taste: number | null;
  gi_comfort: number | null;
  energy: number | null;
  value: number | null;
  effectiveness: number | null;
  mixability: number | null;
  count: number;
}
