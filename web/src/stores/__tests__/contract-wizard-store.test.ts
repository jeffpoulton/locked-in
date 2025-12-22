import { useContractWizardStore } from "../contract-wizard-store";
import { createContract } from "@/lib/contract-actions";

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
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },
});

describe("Contract Wizard Store", () => {
  beforeEach(() => {
    // Reset the store state before each test
    useContractWizardStore.getState().resetWizard();
    localStorageMock.clear();
  });

  describe("Step Navigation", () => {
    it("navigates forward and backward through steps correctly", () => {
      const store = useContractWizardStore.getState();

      // Start at step 1
      expect(store.currentStep).toBe(1);

      // Update form data to make step 1 valid
      store.updateFormData({ habitTitle: "Meditate for 10 minutes" });

      // Navigate to step 2
      store.nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(2);

      // Go back to step 1
      useContractWizardStore.getState().prevStep();
      expect(useContractWizardStore.getState().currentStep).toBe(1);

      // Navigate forward again
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(2);

      // Use goToStep to jump to step 1
      useContractWizardStore.getState().goToStep(1);
      expect(useContractWizardStore.getState().currentStep).toBe(1);
    });

    it("prevents forward navigation when step is invalid", () => {
      const store = useContractWizardStore.getState();

      // Start at step 1 with no data (invalid)
      expect(store.currentStep).toBe(1);
      expect(store.stepStatus[1]).toBe(false);

      // Try to navigate forward - should stay at step 1
      store.nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(1);

      // Add invalid data (too short)
      store.updateFormData({ habitTitle: "ab" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(false);

      // Still can't navigate
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(1);

      // Add valid data
      useContractWizardStore.getState().updateFormData({ habitTitle: "Valid habit title" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);

      // Now can navigate
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(2);
    });
  });

  describe("Form Data Persistence", () => {
    it("persists form data updates in store across step navigation", () => {
      const store = useContractWizardStore.getState();

      // Add habit title (step 1)
      store.updateFormData({ habitTitle: "Exercise for 30 minutes" });
      expect(useContractWizardStore.getState().formData.habitTitle).toBe(
        "Exercise for 30 minutes"
      );

      // Navigate to step 2
      useContractWizardStore.getState().nextStep();

      // Add duration (step 2)
      useContractWizardStore.getState().updateFormData({ duration: 21 });
      expect(useContractWizardStore.getState().formData.duration).toBe(21);

      // Navigate back to step 1
      useContractWizardStore.getState().prevStep();

      // Verify all data is still present
      const currentFormData = useContractWizardStore.getState().formData;
      expect(currentFormData.habitTitle).toBe("Exercise for 30 minutes");
      expect(currentFormData.duration).toBe(21);

      // Navigate forward and add more data
      useContractWizardStore.getState().nextStep();
      useContractWizardStore.getState().nextStep();
      useContractWizardStore.getState().updateFormData({ depositAmount: 500 });

      // All data still persists
      const finalFormData = useContractWizardStore.getState().formData;
      expect(finalFormData.habitTitle).toBe("Exercise for 30 minutes");
      expect(finalFormData.duration).toBe(21);
      expect(finalFormData.depositAmount).toBe(500);
    });
  });

  describe("Reset Wizard", () => {
    it("clears all wizard state on reset", () => {
      const store = useContractWizardStore.getState();

      // Add data and navigate through wizard
      store.updateFormData({
        habitTitle: "Read for 20 minutes",
        duration: 14,
        depositAmount: 250,
        startDate: "today",
      });

      // Navigate to step 3
      store.nextStep(); // step 2
      useContractWizardStore.getState().nextStep(); // step 3
      useContractWizardStore.getState().nextStep(); // step 4

      // Verify state exists
      expect(useContractWizardStore.getState().currentStep).toBe(4);
      expect(useContractWizardStore.getState().formData.habitTitle).toBe("Read for 20 minutes");

      // Reset the wizard
      useContractWizardStore.getState().resetWizard();

      // Verify all state is cleared
      const resetState = useContractWizardStore.getState();
      expect(resetState.currentStep).toBe(1);
      expect(resetState.formData).toEqual({});
      expect(resetState.stepStatus).toEqual({
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
      });
      expect(resetState.isSubmitting).toBe(false);
      expect(resetState.createdContract).toBeNull();
    });
  });

  describe("Contract Submission", () => {
    it("creates a valid contract with reward schedule", () => {
      // Prepare complete form data
      const formData = {
        habitTitle: "Meditate for 15 minutes",
        duration: 21 as const,
        depositAmount: 500,
        startDate: "today" as const,
      };

      // Create the contract
      const contract = createContract(formData);

      // Verify contract structure
      expect(contract.id).toBeDefined();
      expect(contract.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(contract.habitTitle).toBe("Meditate for 15 minutes");
      expect(contract.duration).toBe(21);
      expect(contract.depositAmount).toBe(500);
      expect(contract.startDate).toBe("today");
      expect(contract.createdAt).toBeDefined();

      // Verify reward schedule is generated
      expect(contract.rewardSchedule).toBeDefined();
      expect(contract.rewardSchedule.seed).toBe(contract.id);
      expect(contract.rewardSchedule.duration).toBe(21);
      expect(contract.rewardSchedule.depositAmount).toBe(500);
      expect(contract.rewardSchedule.rewards.length).toBeGreaterThan(0);

      // Verify rewards sum to deposit amount
      const totalRewards = contract.rewardSchedule.rewards.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      expect(totalRewards).toBe(500);
    });
  });
});
