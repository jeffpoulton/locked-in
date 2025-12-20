import { NextRequest, NextResponse } from "next/server";
import {
  simulateInputSchema,
  type RewardSchedule,
  type DayBreakdown,
  type SimulationResult,
  type PresetScenario,
} from "@/schemas/reward-simulator";
import { createSeededRandom } from "@/lib/prng";

/**
 * POST /api/admin/reward-simulator/simulate
 *
 * Simulates contract completion scenarios for a reward schedule.
 *
 * Request body:
 * - schedule: RewardSchedule - The generated reward schedule
 * - completedDays: number[] (optional) - Days marked as completed
 * - preset: string (optional) - Preset scenario identifier
 *
 * At least one of completedDays or preset must be provided.
 *
 * Response:
 * - 200: Simulation results with totals and day breakdown
 * - 400: Validation error with details
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = simulateInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { schedule, completedDays, preset } = validation.data;

    // Determine which days are completed
    const finalCompletedDays = preset
      ? getPresetCompletedDays(preset, schedule)
      : (completedDays as number[]);

    // Calculate simulation results
    const result = calculateSimulation(schedule, finalCompletedDays);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/admin/reward-simulator/simulate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generates the completed days array for a preset scenario.
 */
function getPresetCompletedDays(
  preset: PresetScenario,
  schedule: RewardSchedule
): number[] {
  const allDays = Array.from({ length: schedule.duration }, (_, i) => i + 1);

  switch (preset) {
    case "perfect":
      // Complete all days
      return allDays;

    case "miss-all":
      // Complete no days
      return [];

    case "weekend-skipper":
      // Skip Saturdays (day 6, 13, 20, 27) and Sundays (day 7, 14, 21, 28)
      // Assuming day 1 is Monday
      return allDays.filter((day) => {
        const dayOfWeek = ((day - 1) % 7) + 1; // 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun
        return dayOfWeek !== 6 && dayOfWeek !== 7;
      });

    case "random-80":
      // Randomly complete approximately 80% of days using the schedule seed
      const random = createSeededRandom(schedule.seed + "-simulation");
      const targetCount = Math.round(schedule.duration * 0.8);
      const shuffled = [...allDays];

      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled.slice(0, targetCount).sort((a, b) => a - b);

    default:
      return [];
  }
}

/**
 * Calculates the simulation results for a given schedule and completed days.
 */
function calculateSimulation(
  schedule: RewardSchedule,
  completedDays: number[]
): SimulationResult {
  const completedDaysSet = new Set(completedDays);
  const rewardsByDay = new Map(
    schedule.rewards.map((r) => [r.day, r.amount])
  );

  let totalRecovered = 0;
  let totalForfeited = 0;
  const dayBreakdown: DayBreakdown[] = [];

  for (let day = 1; day <= schedule.duration; day++) {
    const hasReward = rewardsByDay.has(day);
    const rewardAmount = rewardsByDay.get(day) ?? 0;
    const completed = completedDaysSet.has(day);

    const recovered = completed && hasReward ? rewardAmount : 0;
    const forfeited = !completed && hasReward ? rewardAmount : 0;

    totalRecovered += recovered;
    totalForfeited += forfeited;

    dayBreakdown.push({
      day,
      hasReward,
      rewardAmount,
      completed,
      recovered,
      forfeited,
    });
  }

  // Round to 2 decimal places for currency
  totalRecovered = Math.round(totalRecovered * 100) / 100;
  totalForfeited = Math.round(totalForfeited * 100) / 100;

  return {
    totalRecovered,
    totalForfeited,
    completedDays: completedDays.sort((a, b) => a - b),
    dayBreakdown,
  };
}
