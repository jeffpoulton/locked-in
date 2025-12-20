import { generateRewardSchedule } from "../reward-algorithm";

describe("generateRewardSchedule", () => {
  describe("determinism", () => {
    it("produces identical output for the same seed", () => {
      const input = {
        seed: "test-contract-123",
        duration: 21,
        depositAmount: 500,
      };

      const schedule1 = generateRewardSchedule(input);
      const schedule2 = generateRewardSchedule(input);

      expect(schedule1).toEqual(schedule2);
    });

    it("produces different output for different seeds", () => {
      const input1 = {
        seed: "contract-abc",
        duration: 21,
        depositAmount: 500,
      };
      const input2 = {
        seed: "contract-xyz",
        duration: 21,
        depositAmount: 500,
      };

      const schedule1 = generateRewardSchedule(input1);
      const schedule2 = generateRewardSchedule(input2);

      // Reward days should be different (statistically almost certain)
      expect(schedule1.rewards.map((r) => r.day)).not.toEqual(
        schedule2.rewards.map((r) => r.day)
      );
    });
  });

  describe("reward day count constraints", () => {
    it("generates reward days within 20-85% of duration", () => {
      // Test multiple seeds to ensure statistical compliance
      const seeds = ["seed-1", "seed-2", "seed-3", "seed-4", "seed-5"];

      for (const seed of seeds) {
        const schedule = generateRewardSchedule({
          seed,
          duration: 20,
          depositAmount: 500,
        });

        const minDays = Math.floor(20 * 0.2); // 4 days
        const maxDays = Math.floor(20 * 0.85); // 17 days

        expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(minDays);
        expect(schedule.rewardDayCount).toBeLessThanOrEqual(maxDays);
        expect(schedule.rewards.length).toBe(schedule.rewardDayCount);
      }
    });
  });

  describe("individual reward amount constraints", () => {
    it("keeps each reward between 2-80% of deposit", () => {
      // Test multiple configurations
      const testCases = [
        { seed: "test-1", duration: 15, depositAmount: 500 },
        { seed: "test-2", duration: 21, depositAmount: 100 },
        { seed: "test-3", duration: 30, depositAmount: 1000 },
      ];

      for (const input of testCases) {
        const schedule = generateRewardSchedule(input);

        const minReward = input.depositAmount * 0.02;
        const maxReward = input.depositAmount * 0.8;

        for (const reward of schedule.rewards) {
          expect(reward.amount).toBeGreaterThanOrEqual(minReward - 0.01); // Small tolerance for cent rounding
          expect(reward.amount).toBeLessThanOrEqual(maxReward + 0.01);
        }
      }
    });
  });

  describe("sum constraint", () => {
    it("ensures all rewards sum to exactly 100% of deposit (no rounding errors)", () => {
      // Test multiple configurations to catch rounding issues
      const testCases = [
        { seed: "sum-test-1", duration: 7, depositAmount: 100 },
        { seed: "sum-test-2", duration: 14, depositAmount: 333.33 },
        { seed: "sum-test-3", duration: 21, depositAmount: 500 },
        { seed: "sum-test-4", duration: 30, depositAmount: 999.99 },
      ];

      for (const input of testCases) {
        const schedule = generateRewardSchedule(input);
        const totalRewards = schedule.rewards.reduce((sum, r) => sum + r.amount, 0);

        // Round both to 2 decimal places for comparison
        expect(Math.round(totalRewards * 100) / 100).toBe(
          Math.round(input.depositAmount * 100) / 100
        );
      }
    });
  });

  describe("edge cases", () => {
    it("handles minimum duration (7 days)", () => {
      const schedule = generateRewardSchedule({
        seed: "min-duration-test",
        duration: 7,
        depositAmount: 500,
      });

      expect(schedule.duration).toBe(7);
      expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(1);
      expect(schedule.rewardDayCount).toBeLessThanOrEqual(5); // 85% of 7 = 5.95

      // All reward days should be within duration
      for (const reward of schedule.rewards) {
        expect(reward.day).toBeGreaterThanOrEqual(1);
        expect(reward.day).toBeLessThanOrEqual(7);
      }
    });

    it("handles maximum duration (30 days)", () => {
      const schedule = generateRewardSchedule({
        seed: "max-duration-test",
        duration: 30,
        depositAmount: 500,
      });

      expect(schedule.duration).toBe(30);
      expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(6); // 20% of 30 = 6
      expect(schedule.rewardDayCount).toBeLessThanOrEqual(25); // 85% of 30 = 25.5

      // All reward days should be within duration
      for (const reward of schedule.rewards) {
        expect(reward.day).toBeGreaterThanOrEqual(1);
        expect(reward.day).toBeLessThanOrEqual(30);
      }
    });
  });
});
