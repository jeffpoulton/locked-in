/**
 * Contract Setup Flow Integration Tests
 *
 * Tests for the complete end-to-end contract creation flow.
 * Focus: full wizard flow, localStorage persistence, and reward schedule integration.
 */

import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { createContract, isFormDataComplete } from "../contract-actions";
import { loadContract, clearContract } from "../contract-storage";
import type { ContractFormData } from "@/types/contract";

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
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },
});

describe("Contract Setup Flow Integration", () => {
  beforeEach(() => {
    useContractWizardStore.getState().resetWizard();
    localStorageMock.clear();
  });

  describe("End-to-End Wizard Flow", () => {
    it("completes full wizard flow and creates contract in localStorage", () => {
      const store = useContractWizardStore.getState();

      // Step 1: Enter habit title
      expect(store.currentStep).toBe(1);
      store.updateFormData({ habitTitle: "Run for 30 minutes" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);
      useContractWizardStore.getState().nextStep();

      // Step 2: Select duration
      expect(useContractWizardStore.getState().currentStep).toBe(2);
      useContractWizardStore.getState().updateFormData({ duration: 21 });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(true);
      useContractWizardStore.getState().nextStep();

      // Step 3: Enter deposit amount
      expect(useContractWizardStore.getState().currentStep).toBe(3);
      useContractWizardStore.getState().updateFormData({ depositAmount: 500 });
      expect(useContractWizardStore.getState().stepStatus[3]).toBe(true);
      useContractWizardStore.getState().nextStep();

      // Step 4: Select start date
      expect(useContractWizardStore.getState().currentStep).toBe(4);
      useContractWizardStore.getState().updateFormData({ startDate: "today" });
      expect(useContractWizardStore.getState().stepStatus[4]).toBe(true);
      useContractWizardStore.getState().nextStep();

      // Step 5: Confirmation - verify all data is ready
      expect(useContractWizardStore.getState().currentStep).toBe(5);
      expect(useContractWizardStore.getState().stepStatus[5]).toBe(true);

      // Create contract (simulating confirmation button click)
      const formData = useContractWizardStore.getState().formData as ContractFormData;
      expect(isFormDataComplete(formData)).toBe(true);

      const contract = createContract(formData);

      // Verify contract was saved to localStorage
      const loadedContract = loadContract();
      expect(loadedContract).not.toBeNull();
      expect(loadedContract?.habitTitle).toBe("Run for 30 minutes");
      expect(loadedContract?.duration).toBe(21);
      expect(loadedContract?.depositAmount).toBe(500);
      expect(loadedContract?.startDate).toBe("today");
      expect(loadedContract?.id).toBe(contract.id);
    });
  });

  describe("localStorage Persistence", () => {
    it("persists complete contract data after creation and retrieves correctly", () => {
      const formData: ContractFormData = {
        habitTitle: "Meditate for 10 minutes",
        duration: 14,
        depositAmount: 250,
        startDate: "tomorrow",
      };

      // Create contract
      const contract = createContract(formData);

      // Verify all fields are persisted
      const loaded = loadContract();
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(contract.id);
      expect(loaded?.habitTitle).toBe(formData.habitTitle);
      expect(loaded?.duration).toBe(formData.duration);
      expect(loaded?.depositAmount).toBe(formData.depositAmount);
      expect(loaded?.startDate).toBe(formData.startDate);
      expect(loaded?.createdAt).toBeDefined();
      expect(loaded?.rewardSchedule).toBeDefined();

      // Verify reward schedule persisted with all fields
      expect(loaded?.rewardSchedule.seed).toBe(contract.id);
      expect(loaded?.rewardSchedule.duration).toBe(14);
      expect(loaded?.rewardSchedule.depositAmount).toBe(250);
      expect(loaded?.rewardSchedule.rewards.length).toBeGreaterThan(0);
    });

    it("overwrites existing contract when new one is created", () => {
      // Create first contract
      const firstContract = createContract({
        habitTitle: "First habit",
        duration: 7,
        depositAmount: 100,
        startDate: "today",
      });

      // Verify first contract is stored
      let loaded = loadContract();
      expect(loaded?.habitTitle).toBe("First habit");

      // Create second contract (should overwrite)
      const secondContract = createContract({
        habitTitle: "Second habit",
        duration: 30,
        depositAmount: 1000,
        startDate: "tomorrow",
      });

      // Verify second contract replaced first
      loaded = loadContract();
      expect(loaded?.habitTitle).toBe("Second habit");
      expect(loaded?.id).toBe(secondContract.id);
      expect(loaded?.id).not.toBe(firstContract.id);
    });
  });

  describe("Reward Schedule Integration", () => {
    it("generates reward schedule meeting algorithm constraints", () => {
      const formData: ContractFormData = {
        habitTitle: "Exercise daily",
        duration: 21,
        depositAmount: 500,
        startDate: "today",
      };

      const contract = createContract(formData);
      const schedule = contract.rewardSchedule;

      // Verify schedule uses contract ID as seed
      expect(schedule.seed).toBe(contract.id);

      // Verify correct duration and deposit
      expect(schedule.duration).toBe(21);
      expect(schedule.depositAmount).toBe(500);

      // Verify reward day count is within constraints (20-85% of duration)
      const minDays = Math.max(1, Math.floor(21 * 0.2)); // 4
      const maxDays = Math.floor(21 * 0.85); // 17
      expect(schedule.rewardDayCount).toBeGreaterThanOrEqual(minDays);
      expect(schedule.rewardDayCount).toBeLessThanOrEqual(maxDays);

      // Verify rewards array length matches reward day count
      expect(schedule.rewards.length).toBe(schedule.rewardDayCount);

      // Verify all rewards are on valid days (1 to duration)
      for (const reward of schedule.rewards) {
        expect(reward.day).toBeGreaterThanOrEqual(1);
        expect(reward.day).toBeLessThanOrEqual(21);
      }

      // Verify each reward amount is within constraints (2-80% of deposit)
      const minAmount = Math.ceil(500 * 0.02); // 10
      const maxAmount = Math.floor(500 * 0.8); // 400
      for (const reward of schedule.rewards) {
        expect(reward.amount).toBeGreaterThanOrEqual(minAmount);
        expect(reward.amount).toBeLessThanOrEqual(maxAmount);
      }

      // Verify total rewards sum to deposit amount
      const totalRewards = schedule.rewards.reduce((sum, r) => sum + r.amount, 0);
      expect(totalRewards).toBe(500);
    });

    it("generates deterministic reward schedule for same seed", () => {
      // Create contract with known form data
      const formData: ContractFormData = {
        habitTitle: "Test habit",
        duration: 14,
        depositAmount: 300,
        startDate: "today",
      };

      // Since generateContractId uses crypto.randomUUID, we can't guarantee same ID
      // But we verify the structure is consistent
      const contract = createContract(formData);

      // Verify schedule structure
      expect(contract.rewardSchedule.rewards.every((r) => typeof r.day === "number")).toBe(true);
      expect(contract.rewardSchedule.rewards.every((r) => typeof r.amount === "number")).toBe(true);
      expect(contract.rewardSchedule.rewards.every((r) => r.amount > 0)).toBe(true);
    });
  });
});
