import { contractFormSchema } from "@/schemas/contract";
import { saveContract, loadContract, generateContractId, clearContract } from "../contract-storage";
import type { Contract } from "@/types/contract";

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

// Mock crypto.randomUUID for Node.js
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => {
      // Generate a valid UUID v4 format
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },
});

describe("Contract Foundation Layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Contract Schema Validation", () => {
    it("validates a complete valid contract form data", () => {
      const validFormData = {
        habitTitle: "Meditate for 10 minutes",
        duration: 21,
        depositAmount: 500,
        startDate: "today" as const,
      };

      const result = contractFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid contract form data", () => {
      // Habit title too short
      const shortTitle = contractFormSchema.safeParse({
        habitTitle: "ab",
        duration: 21,
        depositAmount: 500,
        startDate: "today",
      });
      expect(shortTitle.success).toBe(false);

      // Invalid duration
      const badDuration = contractFormSchema.safeParse({
        habitTitle: "Valid habit title",
        duration: 15,
        depositAmount: 500,
        startDate: "today",
      });
      expect(badDuration.success).toBe(false);

      // Deposit below minimum
      const lowDeposit = contractFormSchema.safeParse({
        habitTitle: "Valid habit title",
        duration: 21,
        depositAmount: 50,
        startDate: "today",
      });
      expect(lowDeposit.success).toBe(false);

      // Invalid start date
      const badStartDate = contractFormSchema.safeParse({
        habitTitle: "Valid habit title",
        duration: 21,
        depositAmount: 500,
        startDate: "next-week",
      });
      expect(badStartDate.success).toBe(false);
    });
  });

  describe("localStorage save/load", () => {
    it("saves and loads a contract correctly", () => {
      const contract: Contract = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        habitTitle: "Exercise for 30 minutes",
        duration: 14,
        depositAmount: 250,
        startDate: "tomorrow",
        createdAt: new Date().toISOString(),
        rewardSchedule: {
          seed: "123e4567-e89b-12d3-a456-426614174000",
          duration: 14,
          depositAmount: 250,
          rewardDayCount: 5,
          rewards: [
            { day: 2, amount: 50 },
            { day: 5, amount: 50 },
            { day: 8, amount: 50 },
            { day: 11, amount: 50 },
            { day: 14, amount: 50 },
          ],
        },
      };

      saveContract(contract);
      const loaded = loadContract();

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(contract.id);
      expect(loaded?.habitTitle).toBe(contract.habitTitle);
      expect(loaded?.duration).toBe(contract.duration);
      expect(loaded?.depositAmount).toBe(contract.depositAmount);
      expect(loaded?.startDate).toBe(contract.startDate);
      expect(loaded?.rewardSchedule.rewards).toEqual(contract.rewardSchedule.rewards);
    });

    it("returns null when no contract is stored", () => {
      const loaded = loadContract();
      expect(loaded).toBeNull();
    });
  });

  describe("Contract ID Generation", () => {
    it("generates valid UUID format", () => {
      const id = generateContractId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it("generates unique IDs on each call", () => {
      const id1 = generateContractId();
      const id2 = generateContractId();
      const id3 = generateContractId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
});
