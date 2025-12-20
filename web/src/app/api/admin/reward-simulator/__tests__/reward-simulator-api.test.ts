import { POST as generateHandler } from "../generate/route";
import { POST as simulateHandler } from "../simulate/route";
import { NextRequest } from "next/server";

/**
 * Creates a mock NextRequest with JSON body.
 */
function createMockRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe("Reward Simulator API", () => {
  describe("POST /api/admin/reward-simulator/generate", () => {
    it("returns valid schedule for valid input", async () => {
      const request = createMockRequest({
        seed: "test-contract-123",
        duration: 21,
        depositAmount: 500,
      });

      const response = await generateHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalDays).toBe(21);
      expect(data.depositAmount).toBe(500);
      expect(data.seed).toBe("test-contract-123");
      expect(data.rewardDayCount).toBeGreaterThanOrEqual(4); // 20% of 21
      expect(data.rewardDayCount).toBeLessThanOrEqual(17); // 85% of 21
      expect(Array.isArray(data.rewards)).toBe(true);
      expect(data.rewards.length).toBe(data.rewardDayCount);

      // Verify rewards sum to deposit
      const totalRewards = data.rewards.reduce(
        (sum: number, r: { amount: number }) => sum + r.amount,
        0
      );
      expect(Math.round(totalRewards * 100) / 100).toBe(500);
    });

    it("returns 400 for invalid input", async () => {
      const request = createMockRequest({
        seed: "",
        duration: 5, // Below minimum of 7
        depositAmount: 50, // Below minimum of 100
      });

      const response = await generateHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request body");
      expect(data.details).toBeDefined();
    });
  });

  describe("POST /api/admin/reward-simulator/simulate", () => {
    // Create a consistent schedule for simulation tests
    const testSchedule = {
      seed: "simulation-test",
      duration: 14,
      depositAmount: 100,
      rewardDayCount: 5,
      rewards: [
        { day: 2, amount: 15 },
        { day: 5, amount: 25 },
        { day: 8, amount: 20 },
        { day: 11, amount: 30 },
        { day: 14, amount: 10 },
      ],
    };

    it("calculates correct recovered/forfeited amounts", async () => {
      const request = createMockRequest({
        schedule: testSchedule,
        completedDays: [1, 2, 3, 4, 5, 8], // Complete days 2, 5, 8 which have rewards
      });

      const response = await simulateHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Days 2, 5, 8 completed with rewards: 15 + 25 + 20 = 60
      expect(data.totalRecovered).toBe(60);
      // Days 11, 14 missed with rewards: 30 + 10 = 40
      expect(data.totalForfeited).toBe(40);
      expect(data.dayBreakdown).toHaveLength(14);
    });

    it("handles preset scenarios correctly", async () => {
      // Test perfect completion
      const perfectRequest = createMockRequest({
        schedule: testSchedule,
        preset: "perfect",
      });

      const perfectResponse = await simulateHandler(perfectRequest);
      const perfectData = await perfectResponse.json();

      expect(perfectResponse.status).toBe(200);
      expect(perfectData.totalRecovered).toBe(100); // All rewards recovered
      expect(perfectData.totalForfeited).toBe(0);
      expect(perfectData.completedDays).toHaveLength(14); // All days completed

      // Test miss-all completion
      const missAllRequest = createMockRequest({
        schedule: testSchedule,
        preset: "miss-all",
      });

      const missAllResponse = await simulateHandler(missAllRequest);
      const missAllData = await missAllResponse.json();

      expect(missAllResponse.status).toBe(200);
      expect(missAllData.totalRecovered).toBe(0);
      expect(missAllData.totalForfeited).toBe(100); // All rewards forfeited
      expect(missAllData.completedDays).toHaveLength(0);
    });
  });
});
