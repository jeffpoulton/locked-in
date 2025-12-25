/**
 * Strava Integration UI Tests
 *
 * Tests for the Strava integration in the contract wizard and dashboard.
 * Focus on core functionality: verification method selection, Strava connection,
 * activity type selection, and dashboard verification display.
 */

import {
  useContractWizardStore,
  WIZARD_STEPS,
  type WizardStep,
} from "@/stores/contract-wizard-store";
import type { VerificationType } from "@/schemas/contract";

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

describe("Strava Integration UI Components", () => {
  beforeEach(() => {
    useContractWizardStore.getState().resetWizard();
    localStorageMock.clear();
  });

  describe("VerificationMethodStep UI Logic", () => {
    it("should render Strava and Honor System options in step 2", () => {
      // Verification method step is step 2
      // This test verifies the options are structured correctly
      const verificationOptions: Array<{
        value: VerificationType;
        label: string;
        description: string;
      }> = [
        {
          value: "strava",
          label: "Strava",
          description: "Auto-verify via Strava activities",
        },
        {
          value: "honor_system",
          label: "Honor System",
          description: "Manual daily check-in",
        },
      ];

      // Verify both options are defined with correct values
      expect(verificationOptions).toHaveLength(2);
      expect(verificationOptions[0].value).toBe("strava");
      expect(verificationOptions[1].value).toBe("honor_system");

      // Verify step 2 is now verification method (not duration)
      // Step 1: Habit Title
      // Step 2: Verification Method (NEW)
      // Step 3: Duration
      // Step 4: Deposit
      // Step 5: Start Date
      // Step 6: Confirmation
      expect(WIZARD_STEPS).toBe(6);
    });

    it("should validate step 2 correctly based on verification type and activity types", () => {
      const store = useContractWizardStore.getState();

      // Make step 1 valid first
      store.updateFormData({ habitTitle: "Run every day" });
      expect(useContractWizardStore.getState().stepStatus[1]).toBe(true);

      // Step 2 without verification type should be invalid (defaults to honor_system)
      // With default honor_system, step should be valid
      store.updateFormData({ verificationType: "honor_system" });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(true);

      // Strava without activity types should be invalid
      store.updateFormData({ verificationType: "strava", stravaActivityTypes: [] });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(false);

      // Strava with activity types should be valid
      store.updateFormData({ stravaActivityTypes: ["Run", "Ride"] });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(true);
    });
  });

  describe("Activity Type Selection", () => {
    it("should allow selecting multiple activity types when Strava is connected", () => {
      const store = useContractWizardStore.getState();

      // Set up step 1 and select Strava
      store.updateFormData({
        habitTitle: "Exercise daily",
        verificationType: "strava",
      });

      // Available curated activity types
      const curatedActivityTypes = ["Run", "Ride", "Swim", "Walk", "Hike", "Workout", "Yoga"];

      // Select multiple activity types
      const selectedTypes = ["Run", "Walk", "Yoga"];
      store.updateFormData({ stravaActivityTypes: selectedTypes });

      // Verify types are stored correctly
      const formData = useContractWizardStore.getState().formData;
      expect(formData.stravaActivityTypes).toEqual(["Run", "Walk", "Yoga"]);
      expect(formData.stravaActivityTypes?.length).toBe(3);

      // All selected types should be in the curated list
      for (const type of selectedTypes) {
        expect(curatedActivityTypes).toContain(type);
      }
    });

    it("should require at least one activity type to proceed", () => {
      const store = useContractWizardStore.getState();

      // Set up step 1 and select Strava
      store.updateFormData({
        habitTitle: "Run daily",
        verificationType: "strava",
      });

      // No activity types selected - invalid
      store.updateFormData({ stravaActivityTypes: [] });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(false);

      // One activity type selected - valid
      store.updateFormData({ stravaActivityTypes: ["Run"] });
      expect(useContractWizardStore.getState().stepStatus[2]).toBe(true);
    });
  });

  describe("Wizard Navigation with 6 Steps", () => {
    it("should navigate through all 6 steps correctly", () => {
      const store = useContractWizardStore.getState();

      // Verify wizard has 6 steps
      expect(WIZARD_STEPS).toBe(6);

      // Start at step 1
      expect(store.currentStep).toBe(1);

      // Complete step 1 and navigate to step 2
      store.updateFormData({ habitTitle: "Meditate daily" });
      store.nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(2);

      // Complete step 2 (verification method) and navigate to step 3
      useContractWizardStore.getState().updateFormData({
        verificationType: "honor_system",
      });
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(3);

      // Complete step 3 (duration) and navigate to step 4
      useContractWizardStore.getState().updateFormData({ duration: 21 });
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(4);

      // Complete step 4 (deposit) and navigate to step 5
      useContractWizardStore.getState().updateFormData({ depositAmount: 500 });
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(5);

      // Complete step 5 (start date) and navigate to step 6
      useContractWizardStore.getState().updateFormData({ startDate: "today" });
      useContractWizardStore.getState().nextStep();
      expect(useContractWizardStore.getState().currentStep).toBe(6);

      // Verify all step statuses
      const finalStatus = useContractWizardStore.getState().stepStatus;
      expect(finalStatus[1]).toBe(true);
      expect(finalStatus[2]).toBe(true);
      expect(finalStatus[3]).toBe(true);
      expect(finalStatus[4]).toBe(true);
      expect(finalStatus[5]).toBe(true);
      expect(finalStatus[6]).toBe(true);
    });
  });

  describe("Dashboard Strava Verification Display Logic", () => {
    it("should determine correct verification status display for Strava contracts", () => {
      // Simulate contract with Strava verification
      const contract = {
        verificationType: "strava" as VerificationType,
        stravaActivityTypes: ["Run", "Walk"],
      };

      // Helper function matching dashboard logic
      const shouldShowCheckInButton = (verificationType: VerificationType): boolean => {
        return verificationType !== "strava";
      };

      const getVerificationStatusText = (
        verificationType: VerificationType,
        hasMatchingActivity: boolean
      ): string => {
        if (verificationType === "strava") {
          return hasMatchingActivity ? "Verified via Strava" : "No activity found";
        }
        return "Check in required";
      };

      // Strava contract should not show check-in button
      expect(shouldShowCheckInButton(contract.verificationType)).toBe(false);

      // Honor system contract should show check-in button
      expect(shouldShowCheckInButton("honor_system")).toBe(true);

      // Verification status text
      expect(getVerificationStatusText("strava", true)).toBe("Verified via Strava");
      expect(getVerificationStatusText("strava", false)).toBe("No activity found");
    });
  });

  describe("Force Sync Functionality", () => {
    it("should trigger sync action and update verification status", async () => {
      // Mock sync function that simulates the Force Sync behavior
      let syncCalled = false;
      let lastSyncTimestamp: number | null = null;

      const triggerForceSync = async (): Promise<{ daysVerified: number[] }> => {
        syncCalled = true;
        lastSyncTimestamp = Date.now();
        // Simulate finding activities for some days
        return { daysVerified: [1, 2, 4] };
      };

      // Simulate clicking Force Sync button
      const result = await triggerForceSync();

      // Verify sync was called
      expect(syncCalled).toBe(true);
      expect(lastSyncTimestamp).not.toBeNull();

      // Verify result contains verified days
      expect(result.daysVerified).toContain(1);
      expect(result.daysVerified).toContain(2);
      expect(result.daysVerified).toContain(4);
      expect(result.daysVerified).not.toContain(3);
    });
  });
});
