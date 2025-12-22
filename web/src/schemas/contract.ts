import { z } from "zod";
import { depositAmountSchema as baseDepositAmountSchema, rewardScheduleSchema } from "./reward-simulator";

/**
 * Schema for habit title - must be 3-60 characters.
 * Short, action-oriented titles like "Meditate for 10 minutes".
 */
export const habitTitleSchema = z
  .string()
  .min(3, "Habit title must be at least 3 characters")
  .max(60, "Habit title must be at most 60 characters");

/**
 * Schema for contract duration - must be one of the pre-defined options.
 * Not a continuous range like the reward simulator, but discrete choices.
 */
export const contractDurationSchema = z.enum(["7", "14", "21", "30"]).transform(Number) as z.ZodType<7 | 14 | 21 | 30>;

/**
 * Alternative duration schema that accepts numbers directly.
 * Validates that duration is one of the allowed values.
 */
export const durationSchema = z
  .number()
  .int("Duration must be a whole number")
  .refine((val) => [7, 14, 21, 30].includes(val), {
    message: "Duration must be 7, 14, 21, or 30 days",
  });

/**
 * Schema for deposit amount - reuse the existing schema from reward simulator.
 * Validates $100 minimum, $1000 maximum.
 */
export const depositAmountSchema = baseDepositAmountSchema;

/**
 * Schema for start date - either today or tomorrow.
 */
export const startDateSchema = z.enum(["today", "tomorrow"]);

/**
 * Combined schema for all wizard form inputs.
 * Used to validate the complete form data before contract creation.
 */
export const contractFormSchema = z.object({
  habitTitle: habitTitleSchema,
  duration: durationSchema,
  depositAmount: depositAmountSchema,
  startDate: startDateSchema,
});

/**
 * Schema for the complete contract stored in localStorage.
 * Includes generated fields: id, createdAt, rewardSchedule.
 */
export const contractSchema = z.object({
  id: z.string().uuid("Contract ID must be a valid UUID"),
  habitTitle: habitTitleSchema,
  duration: durationSchema,
  depositAmount: depositAmountSchema,
  startDate: startDateSchema,
  createdAt: z.string().datetime({ message: "createdAt must be a valid ISO datetime" }),
  rewardSchedule: rewardScheduleSchema,
});

// Inferred TypeScript types from schemas
export type HabitTitle = z.infer<typeof habitTitleSchema>;
export type ContractDuration = z.infer<typeof durationSchema>;
export type DepositAmount = z.infer<typeof depositAmountSchema>;
export type StartDate = z.infer<typeof startDateSchema>;
export type ContractFormData = z.infer<typeof contractFormSchema>;
export type Contract = z.infer<typeof contractSchema>;
