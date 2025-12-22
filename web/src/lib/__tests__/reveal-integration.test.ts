/**
 * Reveal Integration Tests
 *
 * Strategic tests to fill gaps in reveal experience coverage.
 * Focus: Store action integration, edge cases, and end-to-end workflows.
 */

import {
  saveCheckIn,
  loadCheckInHistory,
  clearCheckInHistory,
  markDayRevealed,
  getUnrevealedDays,
} from "@/lib/check-in-storage";

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

Object.defineProperty(global, "window", { value: {}, writable: true });
Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("Reveal Integration", () => {
  const testContractId = "test-contract-integration";

  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Store action integration", () => {
    it("reveal and check-in actions work independently", () => {
      // Setup: Create history with completed day 1 (unrevealed)
      saveCheckIn(testContractId, 1, "completed", 50);
      const day1History = loadCheckInHistory(testContractId);
      expect(day1History[1].revealed).toBe(false);

      // Day 2: User checks in (this should NOT affect day 1's reveal status)
      saveCheckIn(testContractId, 2, "completed", 30);

      // Verify day 1 is still unrevealed
      const afterDay2 = loadCheckInHistory(testContractId);
      expect(afterDay2[1].revealed).toBe(false);
      expect(afterDay2[2].revealed).toBe(false);

      // Now reveal day 1 (this should NOT affect day 2)
      markDayRevealed(testContractId, 1);

      const afterReveal = loadCheckInHistory(testContractId);
      expect(afterReveal[1].revealed).toBe(true);
      expect(afterReveal[2].revealed).toBe(false);
    });

    it("check-in completion preserves existing reveal states", () => {
      // Setup: Day 1 revealed, Day 2 unrevealed
      saveCheckIn(testContractId, 1, "completed", 50);
      markDayRevealed(testContractId, 1);
      saveCheckIn(testContractId, 2, "missed");

      // Verify initial state
      const before = loadCheckInHistory(testContractId);
      expect(before[1].revealed).toBe(true);
      expect(before[2].revealed).toBe(false);

      // User checks in for day 3
      saveCheckIn(testContractId, 3, "completed", 25);

      // All reveal states should be preserved
      const after = loadCheckInHistory(testContractId);
      expect(after[1].revealed).toBe(true);
      expect(after[2].revealed).toBe(false);
      expect(after[3].revealed).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles contract complete with unrevealed final day", () => {
      // Setup: 5-day contract, all checked in, only last day unrevealed
      for (let day = 1; day <= 4; day++) {
        saveCheckIn(testContractId, day, "completed", 20);
        markDayRevealed(testContractId, day);
      }
      saveCheckIn(testContractId, 5, "completed", 50); // Final day unrevealed

      const history = loadCheckInHistory(testContractId);
      const currentDay = 6; // Day after contract ends
      const unrevealed = getUnrevealedDays(testContractId, history, currentDay);

      // Final day should be in unrevealed list
      expect(unrevealed).toEqual([5]);
    });

    it("handles multiple consecutive missed days with varying rewards", () => {
      // Day 1: completed, revealed
      saveCheckIn(testContractId, 1, "completed", 100);
      markDayRevealed(testContractId, 1);

      // Days 2-4: missed, unrevealed
      saveCheckIn(testContractId, 2, "missed");
      saveCheckIn(testContractId, 3, "missed");
      saveCheckIn(testContractId, 4, "missed");

      const history = loadCheckInHistory(testContractId);
      const unrevealed = getUnrevealedDays(testContractId, history, 6);

      // All missed days should be unrevealed
      expect(unrevealed).toEqual([2, 3, 4]);

      // Reveal them in sequence
      markDayRevealed(testContractId, 2);
      let updated = loadCheckInHistory(testContractId);
      expect(getUnrevealedDays(testContractId, updated, 6)).toEqual([3, 4]);

      markDayRevealed(testContractId, 3);
      updated = loadCheckInHistory(testContractId);
      expect(getUnrevealedDays(testContractId, updated, 6)).toEqual([4]);

      markDayRevealed(testContractId, 4);
      updated = loadCheckInHistory(testContractId);
      expect(getUnrevealedDays(testContractId, updated, 6)).toEqual([]);
    });
  });

  describe("User workflow scenarios", () => {
    it("user opens app with unrevealed day, reveals, then checks in", () => {
      // Setup: User completed day 1 yesterday but did not see reveal
      saveCheckIn(testContractId, 1, "completed", 50);

      // User is now on day 2
      const history = loadCheckInHistory(testContractId);
      const currentDay = 2;
      let unrevealed = getUnrevealedDays(testContractId, history, currentDay);

      // Should show day 1 needs reveal
      expect(unrevealed).toEqual([1]);

      // User triggers reveal for day 1
      markDayRevealed(testContractId, 1);

      // Now check for unrevealed - should be empty
      const updatedHistory = loadCheckInHistory(testContractId);
      unrevealed = getUnrevealedDays(testContractId, updatedHistory, currentDay);
      expect(unrevealed).toEqual([]);

      // User can now check in for day 2
      saveCheckIn(testContractId, 2, "completed", 30);

      const finalHistory = loadCheckInHistory(testContractId);
      expect(finalHistory[1].revealed).toBe(true);
      expect(finalHistory[2].revealed).toBe(false); // Today's check-in not revealed yet
    });

    it("user skips reveal and checks in, reveal still available later", () => {
      // Setup: User completed day 1 yesterday
      saveCheckIn(testContractId, 1, "completed", 50);

      // User is on day 2 and skips reveal
      let history = loadCheckInHistory(testContractId);
      let unrevealed = getUnrevealedDays(testContractId, history, 2);
      expect(unrevealed).toEqual([1]); // Day 1 still needs reveal

      // User checks in for day 2 (skipping the reveal)
      saveCheckIn(testContractId, 2, "completed", 30);

      // Day 1 should STILL be unrevealed
      history = loadCheckInHistory(testContractId);
      unrevealed = getUnrevealedDays(testContractId, history, 3);
      expect(unrevealed).toContain(1);

      // Later, user decides to reveal day 1
      markDayRevealed(testContractId, 1);

      history = loadCheckInHistory(testContractId);
      expect(history[1].revealed).toBe(true);
    });

    it("alternating completed and missed days all track correctly", () => {
      // Create alternating pattern
      saveCheckIn(testContractId, 1, "completed", 50);
      saveCheckIn(testContractId, 2, "missed");
      saveCheckIn(testContractId, 3, "completed", 30);
      saveCheckIn(testContractId, 4, "missed");
      saveCheckIn(testContractId, 5, "completed", 100);

      // On day 6, all previous days need reveal
      let history = loadCheckInHistory(testContractId);
      let unrevealed = getUnrevealedDays(testContractId, history, 6);
      expect(unrevealed).toEqual([1, 2, 3, 4, 5]);

      // Reveal all days
      for (const day of [1, 2, 3, 4, 5]) {
        markDayRevealed(testContractId, day);
      }

      history = loadCheckInHistory(testContractId);
      unrevealed = getUnrevealedDays(testContractId, history, 6);
      expect(unrevealed).toEqual([]);

      // Verify each day's status is preserved
      expect(history[1].status).toBe("completed");
      expect(history[2].status).toBe("missed");
      expect(history[3].status).toBe("completed");
      expect(history[4].status).toBe("missed");
      expect(history[5].status).toBe("completed");
    });
  });
});
