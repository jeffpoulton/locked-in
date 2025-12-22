/**
 * Status of a day in the contract cycle.
 * - "pending": Day has not been completed or marked as missed yet
 * - "completed": User checked in and completed the habit
 * - "missed": User explicitly marked the day as missed, or day passed without action
 */
export type DayStatus = "pending" | "completed" | "missed";

/**
 * A single check-in record for a day in the contract.
 */
export interface CheckInRecord {
  /** The day number in the contract cycle (1-indexed) */
  dayNumber: number;
  /** Current status of the day */
  status: DayStatus;
  /** ISO timestamp when the status was recorded */
  timestamp: string;
  /** Reward amount earned (only present for completed days with rewards) */
  rewardAmount?: number;
}

/**
 * Check-in history for a contract, keyed by day number.
 */
export type CheckInHistory = Record<number, CheckInRecord>;
