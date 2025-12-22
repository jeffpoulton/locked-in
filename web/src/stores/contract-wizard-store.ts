import { create } from "zustand";
import type { ContractFormData, Contract } from "@/types/contract";
import {
  habitTitleSchema,
  durationSchema,
  depositAmountSchema,
  startDateSchema,
} from "@/schemas/contract";

/** Total number of steps in the wizard */
export const WIZARD_STEPS = 5;

/** Wizard step numbers for type safety */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Tracks completion/validity status for each wizard step.
 */
export interface StepStatus {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
}

/**
 * Contract wizard store state and actions.
 */
export interface ContractWizardState {
  /** Current step in the wizard (1-5) */
  currentStep: WizardStep;
  /** Partial form data collected during wizard flow */
  formData: Partial<ContractFormData>;
  /** Validity status for each step */
  stepStatus: StepStatus;
  /** Whether contract is being submitted */
  isSubmitting: boolean;
  /** The created contract after submission */
  createdContract: Contract | null;

  // Navigation actions
  /** Move to the next step if current step is valid */
  nextStep: () => void;
  /** Move to the previous step */
  prevStep: () => void;
  /** Go to a specific step (only allowed if step is accessible) */
  goToStep: (step: WizardStep) => void;

  // Data actions
  /** Update form data and recalculate step validity */
  updateFormData: (data: Partial<ContractFormData>) => void;
  /** Reset wizard to initial state */
  resetWizard: () => void;
  /** Set the created contract after submission */
  setCreatedContract: (contract: Contract) => void;
  /** Set submitting state */
  setIsSubmitting: (isSubmitting: boolean) => void;

  // Validation helpers
  /** Check if a specific step is valid */
  isStepValid: (step: WizardStep) => boolean;
  /** Check if user can navigate to a specific step */
  canNavigateToStep: (step: WizardStep) => boolean;
}

/**
 * Validates step 1: habit title must be 3-60 characters.
 */
function validateStep1(formData: Partial<ContractFormData>): boolean {
  if (!formData.habitTitle) return false;
  const result = habitTitleSchema.safeParse(formData.habitTitle);
  return result.success;
}

/**
 * Validates step 2: duration must be one of 7, 14, 21, or 30.
 */
function validateStep2(formData: Partial<ContractFormData>): boolean {
  if (formData.duration === undefined) return false;
  const result = durationSchema.safeParse(formData.duration);
  return result.success;
}

/**
 * Validates step 3: deposit amount must be 100-1000.
 */
function validateStep3(formData: Partial<ContractFormData>): boolean {
  if (formData.depositAmount === undefined) return false;
  const result = depositAmountSchema.safeParse(formData.depositAmount);
  return result.success;
}

/**
 * Validates step 4: start date must be "today" or "tomorrow".
 */
function validateStep4(formData: Partial<ContractFormData>): boolean {
  if (!formData.startDate) return false;
  const result = startDateSchema.safeParse(formData.startDate);
  return result.success;
}

/**
 * Validates step 5: all previous steps must be complete.
 * Step 5 is the confirmation screen, valid when all form data is complete.
 */
function validateStep5(formData: Partial<ContractFormData>): boolean {
  return (
    validateStep1(formData) &&
    validateStep2(formData) &&
    validateStep3(formData) &&
    validateStep4(formData)
  );
}

/**
 * Calculate validity status for all steps based on current form data.
 */
function calculateStepStatus(formData: Partial<ContractFormData>): StepStatus {
  return {
    1: validateStep1(formData),
    2: validateStep2(formData),
    3: validateStep3(formData),
    4: validateStep4(formData),
    5: validateStep5(formData),
  };
}

/** Initial state for the wizard */
const initialState = {
  currentStep: 1 as WizardStep,
  formData: {},
  stepStatus: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  },
  isSubmitting: false,
  createdContract: null,
};

/**
 * Zustand store for managing contract wizard state.
 *
 * Handles:
 * - Step navigation (forward, backward, go to step)
 * - Form data persistence across steps
 * - Step validation using Zod schemas
 * - Contract creation flow
 */
export const useContractWizardStore = create<ContractWizardState>((set, get) => ({
  ...initialState,

  nextStep: () => {
    const { currentStep, stepStatus } = get();
    // Only allow navigation if current step is valid and not at last step
    if (currentStep < WIZARD_STEPS && stepStatus[currentStep]) {
      set({ currentStep: (currentStep + 1) as WizardStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as WizardStep });
    }
  },

  goToStep: (step: WizardStep) => {
    const { canNavigateToStep } = get();
    if (canNavigateToStep(step)) {
      set({ currentStep: step });
    }
  },

  updateFormData: (data: Partial<ContractFormData>) => {
    const { formData } = get();
    const newFormData = { ...formData, ...data };
    const newStepStatus = calculateStepStatus(newFormData);
    set({
      formData: newFormData,
      stepStatus: newStepStatus,
    });
  },

  resetWizard: () => {
    set({
      currentStep: 1,
      formData: {},
      stepStatus: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
      },
      isSubmitting: false,
      createdContract: null,
    });
  },

  setCreatedContract: (contract: Contract) => {
    set({ createdContract: contract });
  },

  setIsSubmitting: (isSubmitting: boolean) => {
    set({ isSubmitting });
  },

  isStepValid: (step: WizardStep) => {
    const { stepStatus } = get();
    return stepStatus[step];
  },

  canNavigateToStep: (step: WizardStep) => {
    const { currentStep, stepStatus } = get();

    // Can always go back to previous steps
    if (step < currentStep) return true;

    // Can go to current step
    if (step === currentStep) return true;

    // Can only go forward if all previous steps are valid
    for (let i = 1; i < step; i++) {
      if (!stepStatus[i as WizardStep]) return false;
    }
    return true;
  },
}));
