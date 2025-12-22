import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates the Supabase client.
 * 
 * Note: During build time, env vars may not be available. We create the client
 * lazily to allow builds to succeed, but throw a clear error at runtime if
 * the client is used without proper configuration.
 */
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Lazily initialize the client to allow builds without env vars
let _supabaseClient: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createSupabaseClient();
    }
    return Reflect.get(_supabaseClient, prop);
  },
});
