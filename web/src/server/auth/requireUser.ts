import { createClient } from "@/lib/supabase/server";
import { prisma } from "../db/prisma";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Retrieves the authenticated user from the current session.
 *
 * This function uses cookie-based session management via @supabase/ssr.
 * It reads the session from cookies, validates it with Supabase, and
 * returns the corresponding Prisma user (creating one if it doesn't exist).
 *
 * @returns The authenticated Prisma User
 * @throws AuthError if no valid session exists
 */
export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    throw new AuthError("Not authenticated");
  }

  // Get or create user in database
  let user = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
  });

  if (!user) {
    // Determine email - phone-based auth may not have email
    const email =
      supabaseUser.email || supabaseUser.phone || `${supabaseUser.id}@anonymous`;

    user = await prisma.user.create({
      data: {
        supabaseUserId: supabaseUser.id,
        email: email,
        name: supabaseUser.user_metadata?.name || null,
      },
    });
  }

  return user;
}
