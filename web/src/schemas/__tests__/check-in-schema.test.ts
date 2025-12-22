import {
  dayStatusSchema,
  checkInRecordSchema,
  checkInHistorySchema,
} from "../check-in";

describe("Check-In Schema Validation", () => {
  describe("dayStatusSchema", () => {
    it("accepts valid status values", () => {
      expect(dayStatusSchema.safeParse("pending").success).toBe(true);
      expect(dayStatusSchema.safeParse("completed").success).toBe(true);
      expect(dayStatusSchema.safeParse("missed").success).toBe(true);
    });

    it("rejects invalid status values", () => {
      expect(dayStatusSchema.safeParse("invalid").success).toBe(false);
      expect(dayStatusSchema.safeParse("").success).toBe(false);
      expect(dayStatusSchema.safeParse(123).success).toBe(false);
      expect(dayStatusSchema.safeParse(null).success).toBe(false);
    });
  });

  describe("checkInRecordSchema", () => {
    it("accepts valid check-in records", () => {
      const validRecord = {
        dayNumber: 1,
        status: "completed",
        timestamp: "2025-12-22T10:00:00.000Z",
        rewardAmount: 50,
      };
      const result = checkInRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it("accepts records without optional rewardAmount", () => {
      const validRecord = {
        dayNumber: 2,
        status: "missed",
        timestamp: "2025-12-22T10:00:00.000Z",
      };
      const result = checkInRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it("rejects records with invalid dayNumber", () => {
      const invalidRecord = {
        dayNumber: 0, // Must be >= 1
        status: "completed",
        timestamp: "2025-12-22T10:00:00.000Z",
      };
      const result = checkInRecordSchema.safeParse(invalidRecord);
      expect(result.success).toBe(false);
    });

    it("rejects records with non-integer dayNumber", () => {
      const invalidRecord = {
        dayNumber: 1.5,
        status: "completed",
        timestamp: "2025-12-22T10:00:00.000Z",
      };
      const result = checkInRecordSchema.safeParse(invalidRecord);
      expect(result.success).toBe(false);
    });

    it("rejects records with invalid status", () => {
      const invalidRecord = {
        dayNumber: 1,
        status: "invalid",
        timestamp: "2025-12-22T10:00:00.000Z",
      };
      const result = checkInRecordSchema.safeParse(invalidRecord);
      expect(result.success).toBe(false);
    });

    it("rejects records with invalid timestamp format", () => {
      const invalidRecord = {
        dayNumber: 1,
        status: "completed",
        timestamp: "not-a-date",
      };
      const result = checkInRecordSchema.safeParse(invalidRecord);
      expect(result.success).toBe(false);
    });

    it("rejects records missing required fields", () => {
      const incompleteRecord = {
        dayNumber: 1,
        // missing status and timestamp
      };
      const result = checkInRecordSchema.safeParse(incompleteRecord);
      expect(result.success).toBe(false);
    });
  });

  describe("checkInHistorySchema", () => {
    it("accepts valid check-in history", () => {
      const validHistory = {
        1: { dayNumber: 1, status: "completed", timestamp: "2025-12-22T10:00:00.000Z", rewardAmount: 50 },
        2: { dayNumber: 2, status: "missed", timestamp: "2025-12-23T10:00:00.000Z" },
        3: { dayNumber: 3, status: "pending", timestamp: "2025-12-24T10:00:00.000Z" },
      };
      const result = checkInHistorySchema.safeParse(validHistory);
      expect(result.success).toBe(true);
    });

    it("accepts empty history", () => {
      const result = checkInHistorySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("coerces string keys to numbers", () => {
      const historyWithStringKeys = {
        "1": { dayNumber: 1, status: "completed", timestamp: "2025-12-22T10:00:00.000Z" },
      };
      const result = checkInHistorySchema.safeParse(historyWithStringKeys);
      expect(result.success).toBe(true);
    });

    it("rejects history with invalid records", () => {
      const invalidHistory = {
        1: { dayNumber: "one", status: "completed", timestamp: "2025-12-22T10:00:00.000Z" }, // dayNumber should be number
      };
      const result = checkInHistorySchema.safeParse(invalidHistory);
      expect(result.success).toBe(false);
    });
  });
});

