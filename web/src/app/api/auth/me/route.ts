import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import { updateUserSchema } from "@/schemas/user";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in GET /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validation.data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error in PATCH /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
