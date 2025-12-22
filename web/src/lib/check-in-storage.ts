import type { CheckInHistory, CheckInRecord, DayStatus } from "@/types/check-in";

/**
 * Gets the localStorage key for a contract's check-in history.
 *
 * @param contractId - The contract ID
 * @returns The localStorage key
 */
function getStorageKey(contractId: string): string {
  return `locked-in-checkins-${contractId}`;
}

/**
 * Saves a check-in record for a specific day.
 *
 * @param contractId - The contract ID
 * @param dayNumber - The day number (1-indexed)
 * @param status - The status to save
 * @param rewardAmount - Optional reward amount (for completed days)
 */
export function saveCheckIn(
  contractId: string,
  dayNumber: number,
  status: DayStatus,
  rewardAmount?: number
): void {
  if (typeof window === "undefined") {
    return;
  }

  const history = loadCheckInHistory(contractId);

  const record: CheckInRecord = {
    dayNumber,
    status,
    timestamp: new Date().toISOString(),
    ...(rewardAmount !== undefined && { rewardAmount }),
  };

  history[dayNumber] = record;

  localStorage.setItem(getStorageKey(contractId), JSON.stringify(history));
}

/**
 * Loads the complete check-in history for a contract.
 *
 * @param contractId - The contract ID
 * @returns The check-in history (empty object if none exists)
 */
export function loadCheckInHistory(contractId: string): CheckInHistory {
  if (typeof window === "undefined") {
    return {};
  }

  const serialized = localStorage.getItem(getStorageKey(contractId));
  if (!serialized) {
    return {};
  }

  try {
    return JSON.parse(serialized) as CheckInHistory;
  } catch {
    return {};
  }
}

/**
 * Gets the check-in record for a specific day.
 *
 * @param contractId - The contract ID
 * @param dayNumber - The day number (1-indexed)
 * @returns The check-in record or null if not found
 */
export function getCheckInForDay(contractId: string, dayNumber: number): CheckInRecord | null {
  const history = loadCheckInHistory(contractId);
  return history[dayNumber] || null;
}

/**
 * Clears all check-in history for a contract.
 * Useful for testing or resetting state.
 *
 * @param contractId - The contract ID
 */
export function clearCheckInHistory(contractId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(getStorageKey(contractId));
}

/**
 * Calculates cumulative earnings from completed days up to and including a specific day.
 *
 * @param history - The check-in history
 * @param upToDayNumber - Calculate earnings up to this day (inclusive)
 * @returns Total earnings from completed days
 */
export function calculateCumulativeEarnings(
  history: CheckInHistory,
  upToDayNumber: number
): number {
  let total = 0;

  for (let day = 1; day <= upToDayNumber; day++) {
    const record = history[day];
    if (record?.status === "completed" && record.rewardAmount !== undefined) {
      total += record.rewardAmount;
    }
  }

  return total;
}
