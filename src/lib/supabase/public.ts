import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/lib/env";

/** Cookie-less anon client for public, cacheable reads (RLS applies). */
export function createSupabasePublicClient(): SupabaseClient | null {
  const config = supabasePublicConfig();
  if (!config) return null;
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
