import type { RewardSchedule } from "@/schemas/reward-simulator";

/**
 * Start date options for a contract.
 * Users can only choose to start today or tomorrow.
 */
export type StartDate = "today" | "tomorrow";

/**
 * Valid duration options for a contract.
 * Pre-defined options: 7, 14, 21, or 30 days.
 */
export type ContractDuration = 7 | 14 | 21 | 30;

/**
 * The complete contract data structure stored in localStorage.
 * Created after user completes the wizard and confirms.
 */
export interface Contract {
  /** Unique identifier for the contract (UUID), also used as seed for reward algorithm */
  id: string;
  /** Short, action-oriented title for the daily habit (e.g., "Meditate for 10 minutes") */
  habitTitle: string;
  /** Contract duration in days */
  duration: ContractDuration;
  /** Amount the user is putting on the line ($100-$1000) */
  depositAmount: number;
  /** When the contract starts */
  startDate: StartDate;
  /** Timestamp when the contract was created */
  createdAt: string;
  /** The generated reward schedule (hidden from user but stored for later use) */
  rewardSchedule: RewardSchedule;
}

/**
 * Form data collected during the wizard flow.
 * Does not include id, createdAt, or rewardSchedule as those are generated on submission.
 */
export interface ContractFormData {
  /** Short, action-oriented title for the daily habit */
  habitTitle?: string;
  /** Contract duration in days */
  duration?: ContractDuration;
  /** Amount the user is putting on the line ($100-$1000) */
  depositAmount?: number;
  /** When the contract starts */
  startDate?: StartDate;
}
