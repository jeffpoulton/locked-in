import { paymentStatusSchema, contractSchema } from "@/schemas/contract";
import { calculateStripeCharge, calculateStripeFee, dollarsToCents } from "../stripe-fee";

describe("Contract Schema Payment Fields", () => {
  describe("paymentStatus field", () => {
    it("accepts valid enum values: pending, completed, failed", () => {
      // Test all valid payment status values
      expect(paymentStatusSchema.safeParse("pending").success).toBe(true);
      expect(paymentStatusSchema.safeParse("completed").success).toBe(true);
      expect(paymentStatusSchema.safeParse("failed").success).toBe(true);

      // Test invalid values are rejected
      expect(paymentStatusSchema.safeParse("invalid").success).toBe(false);
      expect(paymentStatusSchema.safeParse("").success).toBe(false);
      expect(paymentStatusSchema.safeParse(null).success).toBe(false);
    });
  });

  describe("stripeSessionId field", () => {
    it("is optional and accepts string values", () => {
      const validContract = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        habitTitle: "Test habit",
        duration: 21,
        depositAmount: 100,
        startDate: "today",
        createdAt: new Date().toISOString(),
        rewardSchedule: {
          seed: "123e4567-e89b-12d3-a456-426614174000",
          duration: 21,
          depositAmount: 100,
          rewardDayCount: 1,
          rewards: [{ day: 1, amount: 100 }],
        },
        verificationType: "honor_system",
        paymentStatus: "pending",
      };

      // Contract is valid without stripeSessionId
      const resultWithoutSessionId = contractSchema.safeParse(validContract);
      expect(resultWithoutSessionId.success).toBe(true);

      // Contract is valid with stripeSessionId
      const resultWithSessionId = contractSchema.safeParse({
        ...validContract,
        stripeSessionId: "cs_test_123456789",
      });
      expect(resultWithSessionId.success).toBe(true);
    });
  });

  describe("existing contract validation with new fields", () => {
    it("validates complete contract with all payment fields", () => {
      const fullContract = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        habitTitle: "Meditate for 10 minutes",
        duration: 21,
        depositAmount: 500,
        startDate: "today",
        createdAt: new Date().toISOString(),
        rewardSchedule: {
          seed: "123e4567-e89b-12d3-a456-426614174000",
          duration: 21,
          depositAmount: 500,
          rewardDayCount: 4,
          rewards: [
            { day: 1, amount: 25 },
            { day: 5, amount: 50 },
            { day: 10, amount: 75 },
            { day: 21, amount: 350 },
          ],
        },
        verificationType: "honor_system",
        paymentStatus: "completed",
        stripeSessionId: "cs_test_session_id_here",
      };

      const result = contractSchema.safeParse(fullContract);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentStatus).toBe("completed");
        expect(result.data.stripeSessionId).toBe("cs_test_session_id_here");
      }
    });
  });
});

describe("Stripe Fee Calculation", () => {
  describe("calculateStripeCharge", () => {
    it("calculates correct charge for $100 deposit", () => {
      // $100 deposit using formula: (100 + 0.30) / (1 - 0.029) = 100.30 / 0.971 = ~103.30
      const charge = calculateStripeCharge(100);
      expect(charge).toBeCloseTo(103.30, 2);
    });

    it("calculates correct charge for minimum $100 deposit", () => {
      const charge = calculateStripeCharge(100);
      // Verify the formula: (100 + 0.30) / (1 - 0.029) = 100.30 / 0.971
      expect(charge).toBeGreaterThan(100);
      expect(charge).toBeLessThan(110);
    });

    it("calculates correct charge for maximum $1000 deposit", () => {
      const charge = calculateStripeCharge(1000);
      // For $1000: (1000 + 0.30) / 0.971 = ~1030.18
      expect(charge).toBeCloseTo(1030.18, 1);
    });
  });

  describe("calculateStripeFee", () => {
    it("calculates fee as difference between charge and deposit", () => {
      const fee = calculateStripeFee(100);
      const charge = calculateStripeCharge(100);
      expect(fee).toBeCloseTo(charge - 100, 2);
    });

    it("returns fee around $3.30 for $100 deposit", () => {
      const fee = calculateStripeFee(100);
      // The actual fee is (100 + 0.30) / 0.971 - 100 = ~3.30
      expect(fee).toBeCloseTo(3.30, 1);
    });
  });

  describe("dollarsToCents", () => {
    it("converts dollars to cents correctly", () => {
      expect(dollarsToCents(100)).toBe(10000);
      expect(dollarsToCents(103.30)).toBe(10330);
      expect(dollarsToCents(0.30)).toBe(30);
    });

    it("rounds to nearest cent", () => {
      expect(dollarsToCents(103.199)).toBe(10320);
      expect(dollarsToCents(103.201)).toBe(10320);
    });
  });
});
