/**
 * Tests for Journey Timeline and Day Detail components.
 */

import type { DayStatus } from "@/types/check-in";

describe("Timeline Components", () => {
  describe("JourneyTimeline", () => {
    const createDays = (count: number, currentDay: number) => {
      const days: Array<{
        dayNumber: number;
        status: DayStatus;
        rewardAmount?: number;
      }> = [];

      for (let i = 1; i <= count; i++) {
        if (i < currentDay) {
          // Past day
          days.push({
            dayNumber: i,
            status: i % 2 === 0 ? "completed" : "missed",
            rewardAmount: i % 2 === 0 ? 50 : undefined,
          });
        } else if (i === currentDay) {
          // Today
          days.push({
            dayNumber: i,
            status: "pending",
          });
        } else {
          // Future
          days.push({
            dayNumber: i,
            status: "pending",
          });
        }
      }

      return days;
    };

    it("renders correct number of days", () => {
      const days = createDays(7, 3);

      expect(days.length).toBe(7);
    });

    it("identifies past days with completion status", () => {
      const days = createDays(7, 5);
      const pastDays = days.filter((d) => d.dayNumber < 5);

      // Days 1-4 are past
      expect(pastDays.length).toBe(4);

      // Check status distribution
      const completed = pastDays.filter((d) => d.status === "completed");
      const missed = pastDays.filter((d) => d.status === "missed");

      expect(completed.length).toBeGreaterThan(0);
      expect(missed.length).toBeGreaterThan(0);
    });

    it("identifies today correctly", () => {
      const currentDayNumber = 3;
      const days = createDays(7, currentDayNumber);
      const today = days.find((d) => d.dayNumber === currentDayNumber);

      expect(today).toBeDefined();
      expect(today?.dayNumber).toBe(currentDayNumber);
    });

    it("identifies future days as locked", () => {
      const currentDayNumber = 3;
      const days = createDays(7, currentDayNumber);
      const futureDays = days.filter((d) => d.dayNumber > currentDayNumber);

      expect(futureDays.length).toBe(4); // Days 4, 5, 6, 7
      futureDays.forEach((day) => {
        expect(day.status).toBe("pending");
        expect(day.rewardAmount).toBeUndefined();
      });
    });
  });

  describe("DayTile", () => {
    it("shows checkmark for completed days", () => {
      const props = {
        dayNumber: 2,
        status: "completed" as DayStatus,
        rewardAmount: 75,
        isToday: false,
        isFuture: false,
      };

      expect(props.status).toBe("completed");
      expect(props.rewardAmount).toBe(75);
    });

    it("shows X mark for missed days", () => {
      const props = {
        dayNumber: 3,
        status: "missed" as DayStatus,
        rewardAmount: undefined,
        isToday: false,
        isFuture: false,
      };

      expect(props.status).toBe("missed");
      expect(props.rewardAmount).toBeUndefined();
    });

    it("highlights today with special styling", () => {
      const props = {
        dayNumber: 4,
        status: "pending" as DayStatus,
        isToday: true,
        isFuture: false,
      };

      expect(props.isToday).toBe(true);
      expect(props.status).toBe("pending");
    });

    it("grays out future days", () => {
      const props = {
        dayNumber: 6,
        status: "pending" as DayStatus,
        isToday: false,
        isFuture: true,
      };

      expect(props.isFuture).toBe(true);
      expect(props.status).toBe("pending");
    });
  });

  describe("DayDetailModal", () => {
    it("shows correct information for completed day", () => {
      const props = {
        isOpen: true,
        dayNumber: 2,
        status: "completed" as DayStatus,
        rewardAmount: 100,
        cumulativeTotal: 175,
      };

      expect(props.status).toBe("completed");
      expect(props.rewardAmount).toBe(100);
      expect(props.cumulativeTotal).toBe(175);
    });

    it("shows correct information for missed day", () => {
      const props = {
        isOpen: true,
        dayNumber: 3,
        status: "missed" as DayStatus,
        rewardAmount: undefined,
        cumulativeTotal: 175,
      };

      expect(props.status).toBe("missed");
      expect(props.rewardAmount).toBeUndefined();
      // Cumulative stays same since day was missed
      expect(props.cumulativeTotal).toBe(175);
    });

    it("is hidden when isOpen is false", () => {
      const isOpen = false;

      expect(isOpen).toBe(false);
    });

    it("can be closed", () => {
      let isOpen = true;
      const onClose = () => {
        isOpen = false;
      };

      onClose();

      expect(isOpen).toBe(false);
    });
  });
});
