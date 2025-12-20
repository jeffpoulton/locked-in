import { z } from "zod";

/**
 * Schema for the seed input - must be a non-empty string.
 * Typically a contract ID or similar unique identifier.
 */
export const seedSchema = z.string().min(1, "Seed is required");

/**
 * Schema for contract duration - must be an integer between 7 and 30 days.
 */
export const durationSchema = z
  .number()
  .int("Duration must be a whole number")
  .min(7, "Duration must be at least 7 days")
  .max(30, "Duration must be at most 30 days");

/**
 * Schema for deposit amount - must be a number between 100 and 1000.
 */
export const depositAmountSchema = z
  .number()
  .min(100, "Deposit must be at least $100")
  .max(1000, "Deposit must be at most $1,000");

/**
 * Combined schema for reward schedule generation input.
 */
export const generateScheduleInputSchema = z.object({
  seed: seedSchema,
  duration: durationSchema,
  depositAmount: depositAmountSchema,
});

/**
 * Schema for a single reward in the schedule.
 */
export const rewardSchema = z.object({
  day: z.number().int().min(1),
  amount: z.number().min(0),
});

/**
 * Schema for the generated reward schedule output.
 */
export const rewardScheduleSchema = z.object({
  seed: z.string(),
  duration: z.number(),
  depositAmount: z.number(),
  rewardDayCount: z.number(),
  rewards: z.array(rewardSchema),
});

/**
 * Preset scenario identifiers for simulation.
 */
export const presetScenarioSchema = z.enum([
  "perfect",
  "miss-all",
  "weekend-skipper",
  "random-80",
]);

/**
 * Schema for simulate completion API input.
 * Accepts either a preset scenario or manual completed days array.
 */
export const simulateInputSchema = z.object({
  schedule: rewardScheduleSchema,
  completedDays: z.array(z.number().int().min(1)).optional(),
  preset: presetScenarioSchema.optional(),
}).refine(
  (data) => data.completedDays !== undefined || data.preset !== undefined,
  { message: "Either completedDays or preset must be provided" }
);

/**
 * Schema for a day breakdown item in simulation results.
 */
export const dayBreakdownSchema = z.object({
  day: z.number().int().min(1),
  hasReward: z.boolean(),
  rewardAmount: z.number(),
  completed: z.boolean(),
  recovered: z.number(),
  forfeited: z.number(),
});

/**
 * Schema for simulation result output.
 */
export const simulationResultSchema = z.object({
  totalRecovered: z.number(),
  totalForfeited: z.number(),
  completedDays: z.array(z.number()),
  dayBreakdown: z.array(dayBreakdownSchema),
});

// Inferred TypeScript types
export type Seed = z.infer<typeof seedSchema>;
export type Duration = z.infer<typeof durationSchema>;
export type DepositAmount = z.infer<typeof depositAmountSchema>;
export type GenerateScheduleInput = z.infer<typeof generateScheduleInputSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type RewardSchedule = z.infer<typeof rewardScheduleSchema>;
export type PresetScenario = z.infer<typeof presetScenarioSchema>;
export type SimulateInput = z.infer<typeof simulateInputSchema>;
export type DayBreakdown = z.infer<typeof dayBreakdownSchema>;
export type SimulationResult = z.infer<typeof simulationResultSchema>;
