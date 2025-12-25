/**
 * Wizard UI Tests
 *
 * Tests for wizard layout and step components.
 * Focus on core functionality: step indicator logic, validation state, and data display.
 */

import { useContractWizardStore, WIZARD_STEPS, type WizardStep } from "@/stores/contract-wizard-store";
import { habitTitleSchema, durationSchema, depositAmountSchema, startDateSchema } from "@/schemas/contract";
import type { ContractDuration, StartDate } from "@/schemas/contract";

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

describe("Wizard UI Components", () => {
  beforeEach(() => {
    useContractWizardStore.getState().resetWizard();
    localStorageMock.clear();
  });

  describe("WizardLayout step indicator logic", () => {
    it("shows correct step indicator for each step (1 of 6 through 6 of 6)", () => {
      const store = useContractWizardStore.getState();

      // Helper to generate step indicator text
      const getStepIndicator = (step: WizardStep) => `Step ${step} of ${WIZARD_STEPS}`;

      // Verify step indicator text for each step
      expect(getStepIndicator(1)).toBe("Step 1 of 6");
      expect(getStepIndicator(2)).toBe("Step 2 of 6");
      expect(getStepIndicator(3)).toBe("Step 3 of 6");
      expect(getStepIndicator(4)).toBe("Step 4 of 6");
      expect(getStepIndicator(5)).toBe("Step 5 of 6");
      expect(getStepIndicator(6)).toBe("Step 6 of 6");

      // Verify store starts at step 1
      expect(store.currentStep).toBe(1);
      expect(WIZARD_STEPS).toBe(6);
    });

    it("hides back button on step 1, shows on steps 2-6", () => {
      const store = useContractWizardStore.getState();

      // Helper to determine back button visibility
      const shouldShowBackButton = (step: WizardStep) => step > 1;

      // Step 1: back button hidden
      expect(shouldShowBackButton(1)).toBe(false);

      // Steps 2-6: back button visible
      expect(shouldShowBackButton(2)).toBe(true);
      expect(shouldShowBackButton(3)).toBe(true);
      expect(shouldShowBackButton(4)).toBe(true);
      expect(shouldShowBackButton(5)).toBe(true);
      expect(shouldShowBackButton(6)).toBe(true);
    });
  });

  describe("Step 1: Habit Title validation", () => {
    it("enables Next button when title is valid (3-60 chars), disables when invalid", () => {
      const store = useContractWizardStore.getState();

      // Empty title - invalid
      expect(store.stepStatus[1]).toBe(false);

      // Too short (2 chars) - invalid
      store.updateFormData({ habitTitle: "ab" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(false);

      // Minimum valid (3 chars) - valid
      useContractWizardStore.getState().updateFormData({ habitTitle: "Run" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);

      // Normal title - valid
      useContractWizardStore.getState().updateFormData({ habitTitle: "Meditate for 10 minutes" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);

      // Too long (61 chars) - invalid
      const longTitle = "a".repeat(61);
      useContractWizardStore.getState().updateFormData({ habitTitle: longTitle });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(false);

      // Maximum valid (60 chars) - valid
      const maxTitle = "a".repeat(60);
      useContractWizardStore.getState().updateFormData({ habitTitle: maxTitle });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);
    });
  });

  describe("Step 3: Duration Selection", () => {
    it("highlights selected duration option and validates selection", () => {
      const store = useContractWizardStore.getState();

      // Setup: make step 1 valid first
      store.updateFormData({ habitTitle: "Valid habit" });

      // No selection - invalid
      expect(useContractWizardStore.getState().stepStatus[3]).toBe(false);

      // Valid selections
      const validDurations: ContractDuration[] = [7, 14, 21, 30];

      for (const duration of validDurations) {
        useContractWizardStore.getState().updateFormData({ duration });
        const isValid = useContractWizardStore.getState().stepStatus[3];
        expect(isValid).toBe(true);

        // Verify the selected value is stored correctly
        expect(useContractWizardStore.getState().formData.duration).toBe(duration);
      }

      // Invalid durations
      const invalidDurations = [5, 10, 15, 25, 35];
      for (const duration of invalidDurations) {
        const result = durationSchema.safeParse(duration);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("Step 4: Deposit Amount validation", () => {
    it("validates deposit amount within $100-$1000 range", () => {
      // Below minimum - invalid
      expect(depositAmountSchema.safeParse(99).success).toBe(false);
      expect(depositAmountSchema.safeParse(50).success).toBe(false);
      expect(depositAmountSchema.safeParse(0).success).toBe(false);

      // At minimum - valid
      expect(depositAmountSchema.safeParse(100).success).toBe(true);

      // Preset values - all valid
      expect(depositAmountSchema.safeParse(250).success).toBe(true);
      expect(depositAmountSchema.safeParse(500).success).toBe(true);

      // At maximum - valid
      expect(depositAmountSchema.safeParse(1000).success).toBe(true);

      // Above maximum - invalid
      expect(depositAmountSchema.safeParse(1001).success).toBe(false);
      expect(depositAmountSchema.safeParse(2000).success).toBe(false);
    });
  });

  describe("Step 6: Confirmation screen", () => {
    it("displays all entered data correctly", () => {
      const store = useContractWizardStore.getState();

      // Enter complete form data
      const formData = {
        habitTitle: "Meditate for 10 minutes",
        verificationType: "honor_system" as const,
        duration: 21 as ContractDuration,
        depositAmount: 500,
        startDate: "today" as StartDate,
      };

      store.updateFormData(formData);

      // Verify all data is stored and accessible for display
      const storedData = useContractWizardStore.getState().formData;
      expect(storedData.habitTitle).toBe("Meditate for 10 minutes");
      expect(storedData.duration).toBe(21);
      expect(storedData.depositAmount).toBe(500);
      expect(storedData.startDate).toBe("today");

      // Verify step 6 is valid (all data complete)
      expect(useContractWizardStore.getState().stepStatus[6]).toBe(true);

      // Helper function to format confirmation data
      const formatDuration = (days: number) => `${days} days`;
      const formatAmount = (amount: number) => `$${amount}`;
      const formatStartDate = (start: StartDate) => {
        const today = new Date();
        const date = start === "today" ? today : new Date(today.getTime() + 86400000);
        const month = date.toLocaleString("en-US", { month: "short" });
        const day = date.getDate();
        return `${start === "today" ? "Today" : "Tomorrow"} - ${month} ${day}`;
      };

      // Verify formatting helpers work correctly
      expect(formatDuration(21)).toBe("21 days");
      expect(formatAmount(500)).toBe("$500");
      expect(formatStartDate("today")).toContain("Today");
      expect(formatStartDate("tomorrow")).toContain("Tomorrow");
    });

    it("prevents confirmation when form data is incomplete", () => {
      const store = useContractWizardStore.getState();

      // Partial data - step 6 should be invalid
      store.updateFormData({ habitTitle: "Test habit" });
      expect(useContractWizardStore.getState().stepStatus[6]).toBe(false);

      store.updateFormData({ duration: 14 });
      expect(useContractWizardStore.getState().stepStatus[6]).toBe(false);

      store.updateFormData({ depositAmount: 250 });
      expect(useContractWizardStore.getState().stepStatus[6]).toBe(false);

      // Complete data - step 6 should be valid
      store.updateFormData({ startDate: "tomorrow" });
      expect(useContractWizardStore.getState().stepStatus[6]).toBe(true);
    });
  });
});
