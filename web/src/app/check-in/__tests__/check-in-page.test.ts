/**
 * Tests for check-in page routing and integration.
 */

import { loadContract, saveContract, clearContract } from "@/lib/contract-storage";
import { useCheckInStore } from "@/stores/check-in-store";
import { getCurrentDayNumber } from "@/lib/date-utils";
import type { Contract } from "@/schemas/contract";

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

describe("Check-In Page", () => {
  const mockContract: Contract = {
    id: "test-contract-page",
    habitTitle: "Meditate for 10 minutes",
    duration: 7,
    depositAmount: 500,
    startDate: "today",
    createdAt: new Date().toISOString(),
    rewardSchedule: {
      seed: "test-contract-page",
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

  beforeEach(() => {
    localStorageMock.clear();
    useCheckInStore.getState().reset();
  });

  describe("Routing", () => {
    it("should redirect to /contract/new when no active contract", () => {
      const contract = loadContract();

      // No contract should trigger redirect to /contract/new
      expect(contract).toBeNull();
    });

    it("should display check-in interface when contract exists", () => {
      saveContract(mockContract);
      const contract = loadContract();

      expect(contract).not.toBeNull();
      expect(contract?.habitTitle).toBe("Meditate for 10 minutes");
    });
  });

  describe("Day Calculation", () => {
    it("should correctly determine current day from contract", () => {
      // Contract starts today
      const currentDay = getCurrentDayNumber("today", mockContract.createdAt);

      expect(currentDay).toBe(1);
    });

    it("should return 0 for contract starting tomorrow", () => {
      const currentDay = getCurrentDayNumber("tomorrow", mockContract.createdAt);

      expect(currentDay).toBe(0);
    });
  });

  describe("Check-In Flow", () => {
    it("should transition from pending to done on check-in", () => {
      saveContract(mockContract);
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      // Initial state
      expect(store.hasCheckedInToday()).toBe(false);

      // Complete check-in
      store.completeCheckIn();

      // Verify done state
      const updatedStore = useCheckInStore.getState();
      expect(updatedStore.hasCheckedInToday()).toBe(true);
      expect(updatedStore.checkInHistory[1]?.status).toBe("completed");
    });

    it("should persist check-in to localStorage", () => {
      saveContract(mockContract);
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      // Complete check-in
      store.completeCheckIn();

      // Verify localStorage was updated
      const stored = localStorage.getItem(`locked-in-checkins-${mockContract.id}`);
      expect(stored).not.toBeNull();

      const history = JSON.parse(stored!);
      expect(history[1]).toBeDefined();
      expect(history[1].status).toBe("completed");
    });

    it("should transition to done on marking day as missed", () => {
      saveContract(mockContract);
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      // Mark as missed
      store.markDayMissed();

      // Verify done state with missed status
      const updatedStore = useCheckInStore.getState();
      expect(updatedStore.hasCheckedInToday()).toBe(true);
      expect(updatedStore.checkInHistory[1]?.status).toBe("missed");
    });
  });

  describe("Reward Integration", () => {
    it("should record correct reward amount on check-in", () => {
      saveContract(mockContract);
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      // Day 1 has $150 reward
      store.completeCheckIn();

      const updatedStore = useCheckInStore.getState();
      expect(updatedStore.checkInHistory[1]?.rewardAmount).toBe(150);
    });

    it("should calculate total earned correctly", () => {
      saveContract(mockContract);
      const store = useCheckInStore.getState();
      store.initialize(mockContract);

      // Complete day 1
      store.completeCheckIn();

      const totalEarned = useCheckInStore.getState().getTotalEarned();
      expect(totalEarned).toBe(150);
    });
  });
});
