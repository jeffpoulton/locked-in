import { z } from "zod";

/**
 * Schema for day status in the contract cycle.
 * - "pending": Day has not been completed or marked as missed yet
 * - "completed": User checked in and completed the habit
 * - "missed": User explicitly marked the day as missed, or day passed without action
 */
export const dayStatusSchema = z.enum(["pending", "completed", "missed"]);

/**
 * Schema for a single check-in record for a day in the contract.
 */
export const checkInRecordSchema = z.object({
  /** The day number in the contract cycle (1-indexed) */
  dayNumber: z.number().int().min(1),
  /** Current status of the day */
  status: dayStatusSchema,
  /** ISO timestamp when the status was recorded */
  timestamp: z.string().datetime(),
  /** Reward amount earned (only present for completed days with rewards) */
  rewardAmount: z.number().optional(),
  /** Whether the reward for this day has been revealed to the user */
  revealed: z.boolean().optional(),
  /** ISO timestamp when the reveal occurred (separate from check-in timestamp) */
  revealTimestamp: z.string().datetime().optional(),
});

/**
 * Schema for check-in history for a contract, keyed by day number.
 * The key is a string representation of the day number, validated via record schema.
 */
export const checkInHistorySchema = z.record(z.string(), checkInRecordSchema);

// Inferred TypeScript types from schemas
export type DayStatus = z.infer<typeof dayStatusSchema>;
export type CheckInRecord = z.infer<typeof checkInRecordSchema>;
export type CheckInHistory = z.infer<typeof checkInHistorySchema>;
