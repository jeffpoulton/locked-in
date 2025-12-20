import { NextRequest, NextResponse } from "next/server";
import { generateScheduleInputSchema } from "@/schemas/reward-simulator";
import { generateRewardSchedule } from "@/lib/reward-algorithm";

/**
 * POST /api/admin/reward-simulator/generate
 *
 * Generates a deterministic reward schedule for a VIDC contract.
 *
 * Request body:
 * - seed: string - Unique identifier for reproducible generation
 * - duration: number - Contract duration in days (7-30)
 * - depositAmount: number - Deposit amount in dollars (100-1000)
 *
 * Response:
 * - 200: Generated reward schedule with metadata
 * - 400: Validation error with details
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = generateScheduleInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const schedule = generateRewardSchedule(validation.data);

    return NextResponse.json({
      totalDays: schedule.duration,
      rewardDayCount: schedule.rewardDayCount,
      depositAmount: schedule.depositAmount,
      seed: schedule.seed,
      rewards: schedule.rewards,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/reward-simulator/generate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
