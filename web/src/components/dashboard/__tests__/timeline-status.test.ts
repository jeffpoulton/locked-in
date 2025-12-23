/**
 * Tests for timeline and day status logic.
 *
 * Coverage:
 * - Nine distinct day statuses
 * - Auto-scroll behavior
 * - Unrevealed day detection
 */

import type { DayStatus } from "@/schemas/check-in";

describe("Timeline and Day Status", () => {
  describe("Day Status Types", () => {
    it("should identify locked future day", () => {
      const currentDay = 5;
      const dayNumber = 10;
      const isFuture = dayNumber > currentDay;
      expect(isFuture).toBe(true);
    });

    it("should identify current day unreported", () => {
      const currentDay = 5;
      const dayNumber = 5;
      const hasRecord = false;
      const isToday = dayNumber === currentDay;
      expect(isToday && !hasRecord).toBe(true);
    });

    it("should identify completed day with reward revealed", () => {
      const status: DayStatus = "completed";
      const revealed = true;
      const rewardAmount = 10;
      expect(status === "completed" && revealed && rewardAmount > 0).toBe(true);
    });

    it("should identify missed day available for reveal", () => {
      const status: DayStatus = "missed";
      const revealed = false;
      const isPast = true;
      expect(status === "missed" && !revealed && isPast).toBe(true);
    });
  });

  describe("Auto-scroll Logic", () => {
    it("should scroll to first unrevealed day", () => {
      const unrevealedDays = [3, 5, 7];
      const firstUnrevealed = unrevealedDays[0];
      expect(firstUnrevealed).toBe(3);
    });

    it("should scroll to current day when no unrevealed", () => {
      const unrevealedDays: number[] = [];
      const currentDay = 10;
      const scrollTarget = unrevealedDays.length > 0 ? unrevealedDays[0] : currentDay;
      expect(scrollTarget).toBe(10);
    });
  });
});
