import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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