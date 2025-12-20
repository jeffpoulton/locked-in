import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";
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

export async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);

  const {
    data: { user: supabaseUser },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !supabaseUser) {
    throw new AuthError("Invalid or expired token");
  }

  // Get or create user in database
  let user = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || null,
      },
    });
  }

  return user;
}
