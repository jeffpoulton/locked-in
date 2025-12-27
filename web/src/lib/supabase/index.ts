/**
 * Supabase Client Utilities
 *
 * This module provides SSR-compatible Supabase clients for different contexts:
 * - browser: For client components
 * - server: For server components and API routes
 * - middleware: For Next.js middleware
 *
 * Usage:
 * ```ts
 * // In client components
 * import { createClient } from "@/lib/supabase/browser";
 * const supabase = createClient();
 *
 * // In server components or API routes
 * import { createClient } from "@/lib/supabase/server";
 * const supabase = await createClient();
 *
 * // In middleware
 * import { createClient } from "@/lib/supabase/middleware";
 * const { supabase, response } = createClient(request);
 * ```
 */

export { createClient as createBrowserClient } from "./browser";
export { createClient as createServerClient } from "./server";
export { createClient as createMiddlewareClient } from "./middleware";
