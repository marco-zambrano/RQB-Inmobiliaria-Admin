import { createClient } from "@supabase/supabase-js";

// These env vars should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
