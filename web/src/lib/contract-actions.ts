import type { Contract, ContractFormData, PaymentStatus } from "@/schemas/contract";
import { generateContractId, saveContract } from "./contract-storage";
import { generateRewardSchedule } from "./reward-algorithm";

/**
 * Options for creating a contract.
 */
interface CreateContractOptions {
  /** Initial payment status (defaults to "pending" for Stripe flow) */
  paymentStatus?: PaymentStatus;
  /** Stripe Checkout Session ID for tracking */
  stripeSessionId?: string;
}

/**
 * Creates a complete contract from form data.
 *
 * This function:
 * 1. Generates a unique contract ID (UUID)
 * 2. Calls the reward algorithm to generate the hidden schedule
 * 3. Assembles the complete Contract object with createdAt timestamp
 * 4. Saves the contract to localStorage
 * 5. Returns the created contract for navigation purposes
 *
 * @param formData - The validated form data from the wizard
 * @param options - Optional settings for payment status
 * @returns The created contract
 * @throws Error if form data is incomplete
 */
export function createContract(
  formData: ContractFormData,
  options: CreateContractOptions = {}
): Contract {
  // Validate that all required fields are present
  if (!formData.habitTitle) {
    throw new Error("Habit title is required");
  }
  if (formData.duration === undefined) {
    throw new Error("Duration is required");
  }
  if (formData.depositAmount === undefined) {
    throw new Error("Deposit amount is required");
  }
  if (!formData.startDate) {
    throw new Error("Start date is required");
  }

  // Generate contract ID (also used as seed for reward algorithm)
  const id = generateContractId();

  // Generate reward schedule using the contract ID as seed
  const rewardSchedule = generateRewardSchedule({
    seed: id,
    duration: formData.duration,
    depositAmount: formData.depositAmount,
  });

  // Assemble the complete contract
  const contract: Contract = {
    id,
    habitTitle: formData.habitTitle,
    duration: formData.duration,
    depositAmount: formData.depositAmount,
    startDate: formData.startDate,
    createdAt: new Date().toISOString(),
    rewardSchedule,
    // Verification fields (default to honor_system if not set)
    verificationType: formData.verificationType || "honor_system",
    stravaActivityTypes: formData.stravaActivityTypes,
    // Payment status fields (default to pending for Stripe flow)
    paymentStatus: options.paymentStatus ?? "pending",
    stripeSessionId: options.stripeSessionId,
  };

  // Save to localStorage
  saveContract(contract);

  return contract;
}

/**
 * Type guard to check if form data is complete.
 * Useful for TypeScript type narrowing before submission.
 */
export function isFormDataComplete(
  formData: Partial<ContractFormData>
): formData is ContractFormData {
  // Basic required fields
  const hasBasicFields =
    typeof formData.habitTitle === "string" &&
    formData.habitTitle.length >= 3 &&
    formData.habitTitle.length <= 60 &&
    typeof formData.duration === "number" &&
    [7, 14, 21, 30].includes(formData.duration) &&
    typeof formData.depositAmount === "number" &&
    formData.depositAmount >= 100 &&
    formData.depositAmount <= 1000 &&
    (formData.startDate === "today" || formData.startDate === "tomorrow");

  if (!hasBasicFields) {
    return false;
  }

  // Verification method validation
  const verificationType = formData.verificationType || "honor_system";

  if (verificationType === "strava") {
    // Strava requires at least one activity type
    const hasActivityTypes =
      Array.isArray(formData.stravaActivityTypes) &&
      formData.stravaActivityTypes.length > 0;
    return hasActivityTypes;
  }

  // Honor system is always valid if basic fields are complete
  return true;
}
