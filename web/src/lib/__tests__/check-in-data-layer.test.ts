import {
  saveCheckIn,
  loadCheckInHistory,
  getCheckInForDay,
  clearCheckInHistory,
  calculateCumulativeEarnings,
} from "../check-in-storage";
import { getCurrentDayNumber, isEvening, getDateForDay } from "../date-utils";
import { useCheckInStore } from "@/stores/check-in-store";
import type { Contract } from "@/types/contract";
import type { CheckInHistory } from "@/types/check-in";

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window and localStorage for Node.js test environment
Object.defineProperty(global, "window", {
  value: {},
  writable: true,
});
Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("Check-In Data Layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCheckInStore.getState().reset();
  });

  describe("Check-In Storage", () => {
    const contractId = "test-contract-123";

    it("saves and loads a check-in completion to localStorage", () => {
      saveCheckIn(contractId, 1, "completed", 50);

      const history = loadCheckInHistory(contractId);

      expect(history[1]).toBeDefined();
      expect(history[1].dayNumber).toBe(1);
      expect(history[1].status).toBe("completed");
      expect(history[1].rewardAmount).toBe(50);
      expect(history[1].timestamp).toBeDefined();
    });

    it("saves and loads a missed day to localStorage", () => {
      saveCheckIn(contractId, 2, "missed");

      const record = getCheckInForDay(contractId, 2);

      expect(record).not.toBeNull();
      expect(record?.dayNumber).toBe(2);
      expect(record?.status).toBe("missed");
      expect(record?.rewardAmount).toBeUndefined();
    });

    it("returns empty history when no check-ins exist", () => {
      const history = loadCheckInHistory("non-existent-contract");

      expect(history).toEqual({});
    });

    it("clears check-in history correctly", () => {
      saveCheckIn(contractId, 1, "completed", 100);
      saveCheckIn(contractId, 2, "completed", 50);

      clearCheckInHistory(contractId);

      const history = loadCheckInHistory(contractId);
      expect(history).toEqual({});
    });
  });

  describe("Date Utilities", () => {
    it("calculates current day number from contract start date", () => {
      // Contract created today with start date "today"
      const createdAt = new Date().toISOString();

      const dayNumber = getCurrentDayNumber("today", createdAt);

      // Today should be day 1
      expect(dayNumber).toBe(1);
    });

    it("returns 0 if contract has not started yet", () => {
      // Contract created today with start date "tomorrow"
      const createdAt = new Date().toISOString();

      const dayNumber = getCurrentDayNumber("tomorrow", createdAt);

      // Should return 0 since contract hasn't started
      expect(dayNumber).toBe(0);
    });

    it("gets correct date for a specific day number", () => {
      const createdAt = new Date().toISOString();

      const day1Date = getDateForDay("today", createdAt, 1);
      const day2Date = getDateForDay("today", createdAt, 2);

      // Day 2 should be 1 day after day 1
      const diffMs = day2Date.getTime() - day1Date.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(1);
    });
  });

  describe("Cumulative Earnings", () => {
    it("computes cumulative earnings from completed days", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", rewardAmount: 50 },
        2: { dayNumber: 2, status: "missed", timestamp: "" },
        3: { dayNumber: 3, status: "completed", timestamp: "", rewardAmount: 75 },
        4: { dayNumber: 4, status: "completed", timestamp: "", rewardAmount: 25 },
      };

      const total = calculateCumulativeEarnings(history, 4);

      // Only completed days count: 50 + 75 + 25 = 150
      expect(total).toBe(150);
    });

    it("computes cumulative earnings up to a specific day", () => {
      const history: CheckInHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "", rewardAmount: 50 },
        2: { dayNumber: 2, status: "completed", timestamp: "", rewardAmount: 75 },
        3: { dayNumber: 3, status: "completed", timestamp: "", rewardAmount: 25 },
      };

      // Only count up to day 2
      const total = calculateCumulativeEarnings(history, 2);

      expect(total).toBe(125); // 50 + 75
    });
  });

  describe("Check-In Store", () => {
    const mockContract: Contract = {
      id: "store-test-contract",
      habitTitle: "Test Habit",
      duration: 7,
      depositAmount: 500,
      startDate: "today",
      createdAt: new Date().toISOString(),
      rewardSchedule: {
        seed: "store-test-contract",
        duration: 7,
        depositAmount: 500,
        rewardDayCount: 3,
        rewards: [
          { day: 1, amount: 150 },
          { day: 4, amount: 200 },
          { day: 7, amount: 150 },
        ],
      },
    };

    it("initializes store with contract and calculates current day", () => {
      const store = useCheckInStore.getState();

      store.initialize(mockContract);

      const state = useCheckInStore.getState();
      expect(state.contract).toBe(mockContract);
      expect(state.currentDayNumber).toBe(1); // Started today
      expect(state.checkInHistory).toBeDefined();
    });

    it("completes check-in and persists to localStorage", () => {
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      store.completeCheckIn();

      const state = useCheckInStore.getState();
      expect(state.hasCheckedInToday()).toBe(true);
      expect(state.checkInHistory[1]?.status).toBe("completed");
      expect(state.checkInHistory[1]?.rewardAmount).toBe(150); // Day 1 has $150 reward

      // Verify persisted to localStorage
      const savedHistory = loadCheckInHistory(mockContract.id);
      expect(savedHistory[1]?.status).toBe("completed");
    });
  });
});
