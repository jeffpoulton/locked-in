import { generateRewardSchedule } from "../reward-algorithm";
import { POST as generateHandler } from "@/app/api/admin/reward-simulator/generate/route";
import { POST as simulateHandler } from "@/app/api/admin/reward-simulator/simulate/route";
import { NextRequest } from "next/server";

/**
 * Integration tests for reward algorithm - Task Group 4: Gap Analysis
 *
 * These tests fill critical gaps identified during test review:
 * 1. Boundary combinations (min deposit + max duration, max deposit + min duration)
 * 2. Rounding verification across multiple seeds
 * 3. End-to-end flow from generation to simulation
 */

/**
 * Creates a mock NextRequest with JSON body for API testing.
 */
function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe("Reward Algorithm Integration Tests", () => {
  describe("boundary combination edge cases", () => {
    it("handles minimum deposit ($100) with maximum duration (30 days)", () => {
      const schedule = generateRewardSchedule({
        seed: "boundary-min-deposit-max-duration",
        duration: 30,
        depositAmount: 100,
      });

      // Verify basic structure
      expect(schedule.duration).toBe(30);
      expect(schedule.depositAmount).toBe(100);

      // Verify reward day count is within bounds (20-85% of 30 days = 6-25 days)
      expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(6);
      expect(schedule.rewardDayCount).toBeLessThanOrEqual(25);

      // Verify individual rewards are within bounds (2-80% of $100 = $2-$80)
      // With 30 days / many reward days, we should always have multiple rewards
      for (const reward of schedule.rewards) {
        expect(reward.amount).toBeGreaterThanOrEqual(1.99); // Small tolerance for rounding
        expect(reward.amount).toBeLessThanOrEqual(80.01);
      }

      // Verify sum equals deposit exactly
      const totalRewards = schedule.rewards.reduce((sum, r) => sum + r.amount, 0);
      expect(Math.round(totalRewards * 100) / 100).toBe(100);
    });

    it("handles maximum deposit ($1,000) with minimum duration (7 days)", () => {
      const schedule = generateRewardSchedule({
        seed: "boundary-max-deposit-min-duration",
        duration: 7,
        depositAmount: 1000,
      });

      // Verify basic structure
      expect(schedule.duration).toBe(7);
      expect(schedule.depositAmount).toBe(1000);

      // Verify reward day count is within bounds (20-85% of 7 days = 1-5 days)
      expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(1);
      expect(schedule.rewardDayCount).toBeLessThanOrEqual(5);

      // Note: When there's only 1 reward day, the algorithm assigns the entire
      // deposit to that day (by design) since splitting would violate the minimum
      // constraint. This is acceptable per the spec which prioritizes sum accuracy.
      if (schedule.rewardDayCount === 1) {
        // Single reward day gets entire deposit
        expect(schedule.rewards[0].amount).toBe(1000);
      } else {
        // Multiple rewards should respect the 2-80% bounds
        for (const reward of schedule.rewards) {
          expect(reward.amount).toBeGreaterThanOrEqual(19.99);
          expect(reward.amount).toBeLessThanOrEqual(800.01);
        }
      }

      // Verify sum equals deposit exactly (critical constraint)
      const totalRewards = schedule.rewards.reduce((sum, r) => sum + r.amount, 0);
      expect(Math.round(totalRewards * 100) / 100).toBe(1000);
    });
  });

  describe("rounding consistency verification", () => {
    it("never causes sum deviation from deposit across many seeds", () => {
      // Test 20 different seeds with varying amounts to catch rounding edge cases
      const testCases = [
        { depositAmount: 100, duration: 7 },
        { depositAmount: 100, duration: 30 },
        { depositAmount: 333.33, duration: 14 },
        { depositAmount: 499.99, duration: 21 },
        { depositAmount: 666.67, duration: 28 },
        { depositAmount: 1000, duration: 7 },
        { depositAmount: 1000, duration: 30 },
        { depositAmount: 123.45, duration: 15 },
        { depositAmount: 777.77, duration: 23 },
        { depositAmount: 250.50, duration: 10 },
      ];

      for (let seedNum = 1; seedNum <= 2; seedNum++) {
        for (const { depositAmount, duration } of testCases) {
          const schedule = generateRewardSchedule({
            seed: `rounding-test-${seedNum}-${depositAmount}-${duration}`,
            duration,
            depositAmount,
          });

          const totalRewards = schedule.rewards.reduce((sum, r) => sum + r.amount, 0);
          const roundedTotal = Math.round(totalRewards * 100) / 100;
          const roundedDeposit = Math.round(depositAmount * 100) / 100;

          expect(roundedTotal).toBe(roundedDeposit);
        }
      }
    });
  });

  describe("end-to-end workflow integration", () => {
    it("generates schedule via API, simulates completion, and verifies amounts", async () => {
      // Step 1: Generate a schedule via the API
      const generateRequest = createMockRequest({
        seed: "e2e-integration-test",
        duration: 14,
        depositAmount: 500,
      });

      const generateResponse = await generateHandler(generateRequest);
      expect(generateResponse.status).toBe(200);

      const apiSchedule = await generateResponse.json();
      expect(apiSchedule.rewards).toBeDefined();
      expect(apiSchedule.rewards.length).toBeGreaterThan(0);

      // Transform API response to match the schema expected by simulate endpoint
      // The generate API returns totalDays, but simulate expects duration
      const schedule = {
        seed: apiSchedule.seed,
        duration: apiSchedule.totalDays,
        depositAmount: apiSchedule.depositAmount,
        rewardDayCount: apiSchedule.rewardDayCount,
        rewards: apiSchedule.rewards,
      };

      // Step 2: Simulate perfect completion via the API
      const perfectRequest = createMockRequest({
        schedule,
        preset: "perfect",
      });

      const perfectResponse = await simulateHandler(perfectRequest);
      expect(perfectResponse.status).toBe(200);

      const perfectResult = await perfectResponse.json();
      expect(perfectResult.totalRecovered).toBe(500);
      expect(perfectResult.totalForfeited).toBe(0);

      // Step 3: Simulate complete miss via the API
      const missAllRequest = createMockRequest({
        schedule,
        preset: "miss-all",
      });

      const missAllResponse = await simulateHandler(missAllRequest);
      expect(missAllResponse.status).toBe(200);

      const missAllResult = await missAllResponse.json();
      expect(missAllResult.totalRecovered).toBe(0);
      expect(missAllResult.totalForfeited).toBe(500);

      // Step 4: Verify recovered + forfeited always equals deposit
      expect(perfectResult.totalRecovered + perfectResult.totalForfeited).toBe(500);
      expect(missAllResult.totalRecovered + missAllResult.totalForfeited).toBe(500);
    });

    it("simulates partial completion and verifies recovered plus forfeited equals deposit", async () => {
      // Generate a schedule
      const generateRequest = createMockRequest({
        seed: "partial-completion-test",
        duration: 21,
        depositAmount: 750,
      });

      const generateResponse = await generateHandler(generateRequest);
      const apiSchedule = await generateResponse.json();

      // Transform API response to match the schema expected by simulate endpoint
      const schedule = {
        seed: apiSchedule.seed,
        duration: apiSchedule.totalDays,
        depositAmount: apiSchedule.depositAmount,
        rewardDayCount: apiSchedule.rewardDayCount,
        rewards: apiSchedule.rewards,
      };

      // Complete only the first half of days
      const completedDays = Array.from({ length: 10 }, (_, i) => i + 1);

      const simulateRequest = createMockRequest({
        schedule,
        completedDays,
      });

      const simulateResponse = await simulateHandler(simulateRequest);
      expect(simulateResponse.status).toBe(200);

      const result = await simulateResponse.json();

      // Verify that recovered + forfeited always equals the deposit
      const total = Math.round((result.totalRecovered + result.totalForfeited) * 100) / 100;
      expect(total).toBe(750);

      // Verify breakdown consistency
      const breakdownRecovered = result.dayBreakdown.reduce(
        (sum: number, day: { recovered: number }) => sum + day.recovered,
        0
      );
      const breakdownForfeited = result.dayBreakdown.reduce(
        (sum: number, day: { forfeited: number }) => sum + day.forfeited,
        0
      );

      expect(Math.round(breakdownRecovered * 100) / 100).toBe(result.totalRecovered);
      expect(Math.round(breakdownForfeited * 100) / 100).toBe(result.totalForfeited);
    });
  });
});
