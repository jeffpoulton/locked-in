/**
 * Tests for Strava data layer - schema updates and storage utilities
 *
 * These tests verify:
 * - Contract schema validates new verification fields correctly
 * - Strava token storage save/load/clear operations
 * - Strava sync state storage operations
 * - Backward compatibility (contracts without new fields)
 */

import { contractFormSchema, contractSchema } from "@/schemas/contract";
import {
  saveStravaTokens,
  loadStravaTokens,
  clearStravaTokens,
  saveSyncState,
  loadSyncState,
  clearSyncState,
  isStravaConnected,
  isTokenExpired,
} from "../strava-storage";

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

describe("Strava Data Layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Contract Schema with Verification Fields", () => {
    it("validates contract form data with Strava verification type", () => {
      const formDataWithStrava = {
        habitTitle: "Run every morning",
        duration: 21,
        depositAmount: 500,
        startDate: "today" as const,
        verificationType: "strava" as const,
        stravaActivityTypes: ["Run", "Walk"],
      };

      const result = contractFormSchema.safeParse(formDataWithStrava);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verificationType).toBe("strava");
        expect(result.data.stravaActivityTypes).toEqual(["Run", "Walk"]);
      }
    });

    it("validates contract form data with honor_system verification type", () => {
      const formDataWithHonorSystem = {
        habitTitle: "Meditate daily",
        duration: 14,
        depositAmount: 300,
        startDate: "tomorrow" as const,
        verificationType: "honor_system" as const,
      };

      const result = contractFormSchema.safeParse(formDataWithHonorSystem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verificationType).toBe("honor_system");
        expect(result.data.stravaActivityTypes).toBeUndefined();
      }
    });

    it("defaults to honor_system when verificationType is not provided (backward compatibility)", () => {
      const formDataWithoutVerificationType = {
        habitTitle: "Read for 30 minutes",
        duration: 7,
        depositAmount: 200,
        startDate: "today" as const,
      };

      const result = contractFormSchema.safeParse(formDataWithoutVerificationType);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verificationType).toBe("honor_system");
      }
    });

    it("validates complete contract schema with verification fields", () => {
      const completeContract = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        habitTitle: "Cycle to work",
        duration: 30,
        depositAmount: 1000,
        startDate: "today" as const,
        createdAt: new Date().toISOString(),
        verificationType: "strava" as const,
        stravaActivityTypes: ["Ride", "Run"],
        rewardSchedule: {
          seed: "123e4567-e89b-12d3-a456-426614174000",
          duration: 30,
          depositAmount: 1000,
          rewardDayCount: 10,
          rewards: [{ day: 3, amount: 100 }],
        },
        paymentStatus: "completed" as const,
      };

      const result = contractSchema.safeParse(completeContract);
      expect(result.success).toBe(true);
    });
  });

  describe("Strava Token Storage", () => {
    it("saves and loads Strava tokens correctly", () => {
      const tokens = {
        access_token: "test_access_token_123",
        refresh_token: "test_refresh_token_456",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      saveStravaTokens(tokens);
      const loaded = loadStravaTokens();

      expect(loaded).not.toBeNull();
      expect(loaded?.access_token).toBe(tokens.access_token);
      expect(loaded?.refresh_token).toBe(tokens.refresh_token);
      expect(loaded?.expires_at).toBe(tokens.expires_at);
    });

    it("returns null when no tokens are stored", () => {
      const loaded = loadStravaTokens();
      expect(loaded).toBeNull();
    });

    it("clears Strava tokens correctly", () => {
      const tokens = {
        access_token: "test_access_token",
        refresh_token: "test_refresh_token",
        expires_at: 1735000000,
      };

      saveStravaTokens(tokens);
      expect(loadStravaTokens()).not.toBeNull();

      clearStravaTokens();
      expect(loadStravaTokens()).toBeNull();
    });
  });

  describe("Strava Sync State Storage", () => {
    it("saves and loads sync state correctly", () => {
      const syncState = {
        lastSyncTimestamp: 1735000000000,
      };

      saveSyncState(syncState);
      const loaded = loadSyncState();

      expect(loaded).not.toBeNull();
      expect(loaded?.lastSyncTimestamp).toBe(syncState.lastSyncTimestamp);
    });

    it("returns null when no sync state is stored", () => {
      const loaded = loadSyncState();
      expect(loaded).toBeNull();
    });

    it("clears sync state correctly", () => {
      const syncState = {
        lastSyncTimestamp: Date.now(),
      };

      saveSyncState(syncState);
      expect(loadSyncState()).not.toBeNull();

      clearSyncState();
      expect(loadSyncState()).toBeNull();
    });
  });

  describe("Strava Connection Helper Functions", () => {
    it("isStravaConnected returns true when valid tokens exist", () => {
      const tokens = {
        access_token: "valid_token",
        refresh_token: "refresh_token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      saveStravaTokens(tokens);
      expect(isStravaConnected()).toBe(true);
    });

    it("isStravaConnected returns false when no tokens exist", () => {
      expect(isStravaConnected()).toBe(false);
    });

    it("isTokenExpired returns true when token is expired", () => {
      const expiredTokens = {
        access_token: "expired_token",
        refresh_token: "refresh_token",
        expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      saveStravaTokens(expiredTokens);
      expect(isTokenExpired()).toBe(true);
    });

    it("isTokenExpired returns false when token is valid", () => {
      const validTokens = {
        access_token: "valid_token",
        refresh_token: "refresh_token",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      saveStravaTokens(validTokens);
      expect(isTokenExpired()).toBe(false);
    });

    it("isTokenExpired returns true when no tokens exist", () => {
      expect(isTokenExpired()).toBe(true);
    });
  });
});
