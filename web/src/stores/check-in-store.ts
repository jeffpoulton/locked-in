import { create } from "zustand";
import type { CheckInHistory, DayStatus } from "@/schemas/check-in";
import type { Contract } from "@/schemas/contract";
import type { Reward } from "@/schemas/reward-simulator";
import {
  saveCheckIn,
  loadCheckInHistory,
  calculateCumulativeEarnings,
} from "@/lib/check-in-storage";
import { getCurrentDayNumber } from "@/lib/date-utils";

/**
 * Check-in store state and actions.
 */
export interface CheckInState {
  /** The active contract */
  contract: Contract | null;
  /** Current day number in the contract cycle */
  currentDayNumber: number;
  /** All check-in records for the contract */
  checkInHistory: CheckInHistory;
  /** Whether the reward reveal animation is playing */
  isRevealing: boolean;
  /** The reward amount being revealed (during animation) */
  revealedReward: number | null;

  // Actions
  /** Initialize the store with a contract */
  initialize: (contract: Contract) => void;
  /** Complete today's check-in */
  completeCheckIn: () => void;
  /** Mark today as missed */
  markDayMissed: () => void;
  /** Reload check-in history from storage */
  loadHistory: () => void;
  /** Set the revealing state */
  setRevealing: (isRevealing: boolean, reward?: number | null) => void;
  /** Mark past days without check-ins as missed */
  autoMarkMissedDays: () => void;
  /** Reset the store */
  reset: () => void;

  // Computed helpers
  /** Get total earnings from all completed days */
  getTotalEarned: () => number;
  /** Get cumulative earnings up to a specific day */
  getCumulativeTotalForDay: (dayNumber: number) => number;
  /** Get status for a specific day */
  getDayStatus: (dayNumber: number) => DayStatus;
  /** Check if today has been checked in */
  hasCheckedInToday: () => boolean;
  /** Get the reward amount for a specific day from the schedule */
  getRewardForDay: (dayNumber: number) => number;
}

const initialState = {
  contract: null,
  currentDayNumber: 0,
  checkInHistory: {},
  isRevealing: false,
  revealedReward: null,
};

/**
 * Zustand store for managing daily check-in state.
 *
 * Handles:
 * - Loading and persisting check-in history
 * - Completing check-ins and marking days as missed
 * - Computing cumulative earnings
 * - Managing reward reveal animation state
 */
export const useCheckInStore = create<CheckInState>((set, get) => ({
  ...initialState,

  initialize: (contract: Contract) => {
    const currentDayNumber = getCurrentDayNumber(contract.startDate, contract.createdAt);
    const checkInHistory = loadCheckInHistory(contract.id);

    set({
      contract,
      currentDayNumber,
      checkInHistory,
      isRevealing: false,
      revealedReward: null,
    });

    // Auto-mark missed days after initialization
    get().autoMarkMissedDays();
  },

  completeCheckIn: () => {
    const { contract, currentDayNumber, checkInHistory } = get();
    if (!contract || currentDayNumber <= 0) return;

    // Check if already checked in
    if (checkInHistory[currentDayNumber]) return;

    // Find reward for this day
    const reward = contract.rewardSchedule.rewards.find(
      (r: Reward) => r.day === currentDayNumber
    );
    const rewardAmount = reward?.amount ?? 0;

    // Save to localStorage
    saveCheckIn(contract.id, currentDayNumber, "completed", rewardAmount);

    // Update state
    set({
      checkInHistory: {
        ...checkInHistory,
        [currentDayNumber]: {
          dayNumber: currentDayNumber,
          status: "completed",
          timestamp: new Date().toISOString(),
          rewardAmount,
        },
      },
    });
  },

  markDayMissed: () => {
    const { contract, currentDayNumber, checkInHistory } = get();
    if (!contract || currentDayNumber <= 0) return;

    // Check if already has a record
    if (checkInHistory[currentDayNumber]) return;

    // Save to localStorage
    saveCheckIn(contract.id, currentDayNumber, "missed");

    // Update state
    set({
      checkInHistory: {
        ...checkInHistory,
        [currentDayNumber]: {
          dayNumber: currentDayNumber,
          status: "missed",
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  loadHistory: () => {
    const { contract } = get();
    if (!contract) return;

    const checkInHistory = loadCheckInHistory(contract.id);
    set({ checkInHistory });
  },

  setRevealing: (isRevealing: boolean, reward: number | null = null) => {
    set({ isRevealing, revealedReward: reward });
  },

  autoMarkMissedDays: () => {
    const { contract, currentDayNumber, checkInHistory } = get();
    if (!contract || currentDayNumber <= 0) return;

    let updated = false;
    const newHistory = { ...checkInHistory };

    // Check all past days (before today)
    for (let day = 1; day < currentDayNumber; day++) {
      if (!newHistory[day]) {
        // Day has no record - mark as missed
        saveCheckIn(contract.id, day, "missed");
        newHistory[day] = {
          dayNumber: day,
          status: "missed",
          timestamp: new Date().toISOString(),
        };
        updated = true;
      }
    }

    if (updated) {
      set({ checkInHistory: newHistory });
    }
  },

  reset: () => {
    set(initialState);
  },

  getTotalEarned: () => {
    const { checkInHistory, contract } = get();
    if (!contract) return 0;
    return calculateCumulativeEarnings(checkInHistory, contract.duration);
  },

  getCumulativeTotalForDay: (dayNumber: number) => {
    const { checkInHistory } = get();
    return calculateCumulativeEarnings(checkInHistory, dayNumber);
  },

  getDayStatus: (dayNumber: number): DayStatus => {
    const { checkInHistory, currentDayNumber } = get();
    const record = checkInHistory[dayNumber];

    if (record) {
      return record.status;
    }

    // No record - determine status based on day
    if (dayNumber < currentDayNumber) {
      // Past day with no record should be missed (handled by autoMarkMissedDays)
      return "missed";
    }

    // Today or future
    return "pending";
  },

  hasCheckedInToday: () => {
    const { checkInHistory, currentDayNumber } = get();
    const record = checkInHistory[currentDayNumber];
    return record !== undefined;
  },

  getRewardForDay: (dayNumber: number): number => {
    const { contract } = get();
    if (!contract) return 0;

    const reward = contract.rewardSchedule.rewards.find(
      (r: Reward) => r.day === dayNumber
    );
    return reward?.amount ?? 0;
  },
}));
