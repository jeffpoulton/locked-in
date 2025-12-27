/**
 * @deprecated This file is deprecated. Use the SSR-compatible clients instead:
 *
 * For client components:
 *   import { createClient } from "@/lib/supabase/browser";
 *   const supabase = createClient();
 *
 * For server components or API routes:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *
 * For middleware:
 *   import { createClient } from "@/lib/supabase/middleware";
 *   const { supabase, response } = createClient(request);
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * @deprecated Use createClient from @/lib/supabase/browser instead.
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

/**
 * @deprecated Use createClient from @/lib/supabase/browser instead.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createSupabaseClient();
    }
    return Reflect.get(_supabaseClient, prop);
  },
});
