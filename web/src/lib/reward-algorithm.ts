import { createSeededRandom, randomInt, shuffleArray } from "./prng";
import type { GenerateScheduleInput, Reward, RewardSchedule } from "@/schemas/reward-simulator";

/**
 * Algorithm constraints as defined in the spec.
 */
const CONSTRAINTS = {
  /** Minimum percentage of days that can have rewards (20%) */
  MIN_REWARD_DAY_PERCENTAGE: 0.2,
  /** Maximum percentage of days that can have rewards (85%) */
  MAX_REWARD_DAY_PERCENTAGE: 0.85,
  /** Minimum percentage of deposit for a single reward (2%) */
  MIN_REWARD_PERCENTAGE: 0.02,
  /** Maximum percentage of deposit for a single reward (80%) */
  MAX_REWARD_PERCENTAGE: 0.8,
} as const;

/**
 * Generates a deterministic reward schedule for a VIDC contract.
 *
 * The algorithm:
 * 1. Determines how many days will have rewards (20-85% of duration)
 * 2. Randomly selects which days receive rewards
 * 3. Distributes the deposit across reward days (each 2-80% of deposit)
 * 4. Ensures all rewards sum to exactly 100% of the deposit
 *
 * @param input - The generation parameters (seed, duration, depositAmount)
 * @returns A complete reward schedule with metadata
 *
 * @example
 * const schedule = generateRewardSchedule({
 *   seed: "contract-123",
 *   duration: 21,
 *   depositAmount: 500,
 * });
 */
export function generateRewardSchedule(input: GenerateScheduleInput): RewardSchedule {
  const { seed, duration, depositAmount } = input;
  const random = createSeededRandom(seed);

  // Step 1: Calculate how many days will have rewards (20-85% of duration)
  const minRewardDays = Math.max(1, Math.floor(duration * CONSTRAINTS.MIN_REWARD_DAY_PERCENTAGE));
  const maxRewardDays = Math.floor(duration * CONSTRAINTS.MAX_REWARD_DAY_PERCENTAGE);
  const rewardDayCount = randomInt(random, minRewardDays, maxRewardDays);

  // Step 2: Select which days receive rewards
  // Create array of all days [1, 2, 3, ..., duration]
  const allDays = Array.from({ length: duration }, (_, i) => i + 1);
  // Shuffle and take the first rewardDayCount days
  shuffleArray(random, allDays);
  const rewardDays = allDays.slice(0, rewardDayCount).sort((a, b) => a - b);

  // Step 3: Generate reward amounts ensuring constraints
  const rewards = distributeRewards(random, rewardDays, depositAmount);

  return {
    seed,
    duration,
    depositAmount,
    rewardDayCount,
    rewards,
  };
}

/**
 * Distributes the deposit amount across the selected reward days.
 *
 * Uses a weighted random distribution that:
 * - Ensures each reward is between 2-80% of the deposit
 * - Guarantees all rewards sum to exactly 100% of the deposit
 * - All rewards are whole dollar amounts (no cents)
 *
 * @param random - The seeded random number generator
 * @param rewardDays - Array of day numbers that will receive rewards
 * @param depositAmount - The total deposit to distribute
 * @returns Array of Reward objects with day and amount
 */
function distributeRewards(
  random: () => number,
  rewardDays: number[],
  depositAmount: number
): Reward[] {
  const numRewards = rewardDays.length;

  // Calculate absolute min/max amounts per reward (in whole dollars)
  // Round min up and max down to ensure constraints are respected
  const minAmount = Math.ceil(depositAmount * CONSTRAINTS.MIN_REWARD_PERCENTAGE);
  const maxAmount = Math.floor(depositAmount * CONSTRAINTS.MAX_REWARD_PERCENTAGE);

  // Special case: single reward day gets the entire deposit (rounded to whole dollar)
  if (numRewards === 1) {
    return [{ day: rewardDays[0], amount: Math.round(depositAmount) }];
  }

  // Generate random weights and distribute proportionally
  const amounts = generateConstrainedAmounts(random, numRewards, depositAmount, minAmount, maxAmount);

  return rewardDays.map((day, index) => ({
    day,
    amount: amounts[index],
  }));
}

/**
 * Generates an array of amounts that sum to the target while respecting min/max constraints.
 *
 * Algorithm:
 * 1. Start with minimum amounts for all rewards (in whole dollars)
 * 2. Distribute remaining amount randomly while respecting max constraint
 * 3. Handle rounding to ensure exact sum (any remainder goes to one reward)
 *
 * @param random - The seeded random number generator
 * @param count - Number of amounts to generate
 * @param target - Total amount that all values must sum to
 * @param min - Minimum value for each amount (in whole dollars)
 * @param max - Maximum value for each amount (in whole dollars)
 * @returns Array of whole dollar amounts that sum exactly to target
 */
function generateConstrainedAmounts(
  random: () => number,
  count: number,
  target: number,
  min: number,
  max: number
): number[] {
  // Round target to nearest whole dollar (handle any cents)
  const targetDollars = Math.round(target);
  
  // Start each reward at minimum (already whole dollars)
  const amounts = new Array(count).fill(min);
  let remainingDollars = targetDollars - min * count;

  // Distribute remaining amount using random weights
  if (remainingDollars > 0) {
    // Generate random weights for distribution
    const weights: number[] = [];
    for (let i = 0; i < count; i++) {
      weights.push(random());
    }
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Distribute proportionally to weights, respecting max constraint
    for (let i = 0; i < count - 1 && remainingDollars > 0; i++) {
      const proportionalShare = Math.floor((weights[i] / totalWeight) * remainingDollars);
      const maxAddition = max - amounts[i];
      const addition = Math.min(proportionalShare, maxAddition, remainingDollars);

      amounts[i] += addition;
      remainingDollars -= addition;
    }

    // Put any remaining amount in the last reward
    const lastIndex = count - 1;
    const maxLastAddition = max - amounts[lastIndex];

    if (remainingDollars > maxLastAddition) {
      // Need to redistribute - find other rewards with room
      amounts[lastIndex] += maxLastAddition;
      remainingDollars -= maxLastAddition;

      // Distribute remaining to other slots that have room
      for (let i = 0; i < lastIndex && remainingDollars > 0; i++) {
        const room = max - amounts[i];
        const addition = Math.min(room, remainingDollars);
        amounts[i] += addition;
        remainingDollars -= addition;
      }
    } else {
      amounts[lastIndex] += remainingDollars;
    }
  }

  return amounts;
}
