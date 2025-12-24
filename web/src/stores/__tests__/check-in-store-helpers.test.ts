/**
 * Tests for check-in store helper functions.
 *
 * Coverage:
 * - Locked amount calculation
 * - Current streak calculation
 * - Longest streak calculation
 * - Total forfeited calculation
 */

import { useCheckInStore } from "../check-in-store";
import type { Contract } from "@/schemas/contract";
import type { CheckInHistory } from "@/schemas/check-in";

describe("Check-In Store Helpers", () => {
  const mockContract: Contract = {
    id: "test-123",
    habitTitle: "Exercise",
    duration: 10,
    depositAmount: 100,
    startDate: "tomorrow" as const,
    createdAt: new Date().toISOString(),
    rewardSchedule: {
      rewards: [
        { day: 1, amount: 10 },
        { day: 2, amount: 0 },
        { day: 3, amount: 15 },
        { day: 4, amount: 20 },
        { day: 5, amount: 0 },
      ],
    },
  };

  beforeEach(() => {
    useCheckInStore.getState().reset();
  });

  describe("getLockedAmount", () => {
    it("should calculate locked amount correctly", () => {
      const { getLockedAmount } = useCheckInStore.getState();

      // Mock history with some revealed rewards
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", revealed: true, rewardAmount: 10 },
        2: { dayNumber: 2, status: "missed", timestamp: "", revealed: true, rewardAmount: 0 },
        3: { dayNumber: 3, status: "completed", timestamp: "", revealed: true, rewardAmount: 15 },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 4
      });

      // Locked = 100 (total) - 25 (earned: 10+15) - 0 (forfeited) = 75
      expect(getLockedAmount()).toBe(75);
    });

    it("should return total amount when nothing earned or forfeited", () => {
      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: {},
        currentDayNumber: 1
      });

      const { getLockedAmount } = useCheckInStore.getState();
      expect(getLockedAmount()).toBe(100);
    });
  });

  describe("getCurrentStreak", () => {
    it("should calculate current streak from most recent day backwards", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", revealed: true },
        2: { dayNumber: 2, status: "completed", timestamp: "", revealed: true },
        3: { dayNumber: 3, status: "completed", timestamp: "", revealed: true },
        4: { dayNumber: 4, status: "completed", timestamp: "", revealed: true },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 5
      });

      const { getCurrentStreak } = useCheckInStore.getState();
      expect(getCurrentStreak()).toBe(4);
    });

    it("should return 0 when most recent day is missed", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", revealed: true },
        2: { dayNumber: 2, status: "completed", timestamp: "", revealed: true },
        3: { dayNumber: 3, status: "missed", timestamp: "", revealed: true },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 4
      });

      const { getCurrentStreak } = useCheckInStore.getState();
      expect(getCurrentStreak()).toBe(0);
    });
  });

  describe("getLongestStreak", () => {
    it("should find longest consecutive completed days", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", revealed: true },
        2: { dayNumber: 2, status: "missed", timestamp: "", revealed: true },
        3: { dayNumber: 3, status: "completed", timestamp: "", revealed: true },
        4: { dayNumber: 4, status: "completed", timestamp: "", revealed: true },
        5: { dayNumber: 5, status: "completed", timestamp: "", revealed: true },
        6: { dayNumber: 6, status: "missed", timestamp: "", revealed: true },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 7
      });

      const { getLongestStreak } = useCheckInStore.getState();
      expect(getLongestStreak()).toBe(3); // Days 3-5
    });
  });

  describe("getTotalForfeited", () => {
    it("should sum revealed missed day rewards", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "missed", timestamp: "", revealed: true, rewardAmount: 10 },
        2: { dayNumber: 2, status: "completed", timestamp: "", revealed: true, rewardAmount: 15 },
        3: { dayNumber: 3, status: "missed", timestamp: "", revealed: true, rewardAmount: 20 },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 4
      });

      const { getTotalForfeited } = useCheckInStore.getState();
      expect(getTotalForfeited()).toBe(30); // 10 + 20
    });

    it("should not count unrevealed missed days", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "missed", timestamp: "", revealed: false, rewardAmount: 10 },
        2: { dayNumber: 2, status: "missed", timestamp: "", revealed: true, rewardAmount: 15 },
      };

      useCheckInStore.setState({
        contract: mockContract,
        checkInHistory: history,
        currentDayNumber: 3
      });

      const { getTotalForfeited } = useCheckInStore.getState();
      expect(getTotalForfeited()).toBe(15); // Only day 2
    });
  });
});
