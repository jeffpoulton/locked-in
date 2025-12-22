import type { Contract, ContractFormData } from "@/types/contract";
import { generateContractId, saveContract } from "./contract-storage";
import { generateRewardSchedule } from "./reward-algorithm";

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
 * @returns The created contract
 * @throws Error if form data is incomplete
 */
export function createContract(formData: ContractFormData): Contract {
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
  return (
    typeof formData.habitTitle === "string" &&
    formData.habitTitle.length >= 3 &&
    formData.habitTitle.length <= 60 &&
    typeof formData.duration === "number" &&
    [7, 14, 21, 30].includes(formData.duration) &&
    typeof formData.depositAmount === "number" &&
    formData.depositAmount >= 100 &&
    formData.depositAmount <= 1000 &&
    (formData.startDate === "today" || formData.startDate === "tomorrow")
  );
}
