/**
 * Reveal State Persistence Tests
 *
 * Tests for the data layer supporting next-day reveal experience.
 * Focus: reveal field persistence, unrevealed day detection, storage updates.
 */

import { checkInRecordSchema } from "@/schemas/check-in";
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

describe("Reveal State Persistence", () => {
  const testContractId = "test-contract-123";

  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("revealed field persistence", () => {
    it("saves revealed field correctly in check-in record", () => {
      // Save a check-in (should initialize revealed as false)
      saveCheckIn(testContractId, 1, "completed", 50);

      const history = loadCheckInHistory(testContractId);
      expect(history[1]).toBeDefined();
      expect(history[1].revealed).toBe(false);

      // Mark day as revealed
      markDayRevealed(testContractId, 1);

      const updatedHistory = loadCheckInHistory(testContractId);
      expect(updatedHistory[1].revealed).toBe(true);
      expect(updatedHistory[1].revealTimestamp).toBeDefined();
    });

    it("saves revealTimestamp separately from check-in timestamp", () => {
      // Save a check-in
      saveCheckIn(testContractId, 1, "completed", 50);
      const history = loadCheckInHistory(testContractId);
      const checkInTimestamp = history[1].timestamp;

      // Wait a tiny bit and mark as revealed
      markDayRevealed(testContractId, 1);

      const updatedHistory = loadCheckInHistory(testContractId);
      expect(updatedHistory[1].timestamp).toBe(checkInTimestamp);
      expect(updatedHistory[1].revealTimestamp).toBeDefined();
      // Reveal timestamp should be different (or same) but exists separately
      expect(typeof updatedHistory[1].revealTimestamp).toBe("string");
    });
  });

  describe("unrevealed day detection", () => {
    it("correctly identifies days needing reveal", () => {
      // Create history with mix of revealed and unrevealed days
      saveCheckIn(testContractId, 1, "completed", 50);
      markDayRevealed(testContractId, 1); // Day 1 revealed

      saveCheckIn(testContractId, 2, "completed", 30);
      // Day 2 NOT revealed

      saveCheckIn(testContractId, 3, "missed");
      // Day 3 NOT revealed

      const history = loadCheckInHistory(testContractId);
      const currentDayNumber = 5; // User is on day 5
      const unrevealed = getUnrevealedDays(testContractId, history, currentDayNumber);

      // Should find days 2 and 3 as unrevealed (day 4 has no record yet)
      expect(unrevealed).toContain(2);
      expect(unrevealed).toContain(3);
      expect(unrevealed).not.toContain(1); // Day 1 was revealed
      expect(unrevealed).not.toContain(4); // Day 4 has no check-in record yet
      expect(unrevealed).not.toContain(5); // Current day shouldn't be revealed yet
    });

    it("treats existing records without revealed field as unrevealed", () => {
      // Simulate old record format without revealed field
      const oldFormatHistory = {
        1: {
          dayNumber: 1,
          status: "completed",
          timestamp: new Date().toISOString(),
          rewardAmount: 50,
          // No revealed field - backward compatibility test
        },
      };

      localStorage.setItem(
        `locked-in-checkins-${testContractId}`,
        JSON.stringify(oldFormatHistory)
      );

      const history = loadCheckInHistory(testContractId);
      const unrevealed = getUnrevealedDays(testContractId, history, 3);

      // Day 1 should be in unrevealed list since it lacks revealed: true
      expect(unrevealed).toContain(1);
    });
  });

  describe("reveal state updates", () => {
    it("updates reveal state correctly in storage", () => {
      // Save check-in for multiple days
      saveCheckIn(testContractId, 1, "completed", 50);
      saveCheckIn(testContractId, 2, "missed");
      saveCheckIn(testContractId, 3, "completed", 25);

      // Mark day 1 as revealed
      markDayRevealed(testContractId, 1);

      const history = loadCheckInHistory(testContractId);

      // Verify only day 1 is revealed
      expect(history[1].revealed).toBe(true);
      expect(history[2].revealed).toBe(false);
      expect(history[3].revealed).toBe(false);

      // Mark day 2 as revealed
      markDayRevealed(testContractId, 2);

      const updatedHistory = loadCheckInHistory(testContractId);
      expect(updatedHistory[1].revealed).toBe(true);
      expect(updatedHistory[2].revealed).toBe(true);
      expect(updatedHistory[3].revealed).toBe(false);
    });
  });

  describe("schema validation", () => {
    it("schema accepts records with reveal tracking fields", () => {
      const recordWithReveal = {
        dayNumber: 1,
        status: "completed",
        timestamp: "2025-12-22T10:00:00.000Z",
        rewardAmount: 50,
        revealed: true,
        revealTimestamp: "2025-12-23T10:00:00.000Z",
      };

      const result = checkInRecordSchema.safeParse(recordWithReveal);
      expect(result.success).toBe(true);
    });

    it("schema accepts records without reveal fields for backward compatibility", () => {
      const recordWithoutReveal = {
        dayNumber: 1,
        status: "completed",
        timestamp: "2025-12-22T10:00:00.000Z",
        rewardAmount: 50,
      };

      const result = checkInRecordSchema.safeParse(recordWithoutReveal);
      expect(result.success).toBe(true);
    });
  });
});
