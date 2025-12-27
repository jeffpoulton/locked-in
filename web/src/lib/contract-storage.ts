import type { Contract, PaymentStatus } from "@/schemas/contract";

/** The localStorage key for storing the active contract */
const STORAGE_KEY = "locked-in-contract";

/**
 * Saves a contract to localStorage.
 * Overwrites any existing contract (only one contract supported in prototype).
 *
 * @param contract - The complete contract object to save
 */
export function saveContract(contract: Contract): void {
  if (typeof window === "undefined") {
    return;
  }
  const serialized = JSON.stringify(contract);
  localStorage.setItem(STORAGE_KEY, serialized);
}

/**
 * Loads the current contract from localStorage.
 *
 * @returns The stored contract or null if none exists
 */
export function loadContract(): Contract | null {
  if (typeof window === "undefined") {
    return null;
  }
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) {
    return null;
  }
  try {
    return JSON.parse(serialized) as Contract;
  } catch {
    return null;
  }
}

/**
 * Loads a contract only if it has completed payment status.
 * Used by the dashboard to ensure only paid contracts are displayed.
 *
 * @returns The stored contract if paymentStatus is "completed", otherwise null
 */
export function loadCompletedContract(): Contract | null {
  const contract = loadContract();
  if (!contract) {
    return null;
  }
  // Only return contracts with completed payment status
  if (contract.paymentStatus !== "completed") {
    return null;
  }
  return contract;
}

/**
 * Updates the payment status of the stored contract.
 *
 * @param id - The contract ID to verify (must match stored contract)
 * @param status - The new payment status
 * @param sessionId - Optional Stripe session ID to store
 * @returns true if update was successful, false if contract not found or ID mismatch
 */
export function updateContractPaymentStatus(
  id: string,
  status: PaymentStatus,
  sessionId?: string
): boolean {
  const contract = loadContract();
  if (!contract || contract.id !== id) {
    return false;
  }

  const updatedContract: Contract = {
    ...contract,
    paymentStatus: status,
    stripeSessionId: sessionId ?? contract.stripeSessionId,
  };

  saveContract(updatedContract);
  return true;
}

/**
 * Generates a unique contract ID (UUID v4).
 * This ID is also used as the seed for the reward algorithm.
 *
 * @returns A valid UUID string
 */
export function generateContractId(): string {
  return crypto.randomUUID();
}

/**
 * Clears the stored contract from localStorage.
 * Useful for testing or resetting the app state.
 */
export function clearContract(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
