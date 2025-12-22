import type { StartDate } from "@/schemas/contract";

/**
 * Converts a StartDate type ("today" or "tomorrow") to an actual Date object.
 * Uses the creation date as the reference point.
 *
 * @param startDate - The start date type
 * @param createdAt - ISO timestamp of when the contract was created
 * @returns Date object representing the actual start date
 */
export function getActualStartDate(startDate: StartDate, createdAt: string): Date {
  const creationDate = new Date(createdAt);
  // Reset to midnight in local timezone for consistent day calculations
  const result = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate());

  if (startDate === "tomorrow") {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Calculates the current day number (1-indexed) based on the contract start date.
 * Day 1 is the first day of the contract.
 *
 * @param startDate - The start date type ("today" or "tomorrow")
 * @param createdAt - ISO timestamp of when the contract was created
 * @returns The current day number in the contract cycle, or 0 if contract hasn't started
 */
export function getCurrentDayNumber(startDate: StartDate, createdAt: string): number {
  const actualStart = getActualStartDate(startDate, createdAt);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = todayMidnight.getTime() - actualStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Day 1 is when diffDays === 0
  // If contract hasn't started yet (tomorrow), return 0
  if (diffDays < 0) {
    return 0;
  }

  return diffDays + 1;
}

/**
 * Checks if the current time is evening (after 6 PM) in the user's timezone.
 *
 * @returns True if current time is 6 PM or later
 */
export function isEvening(): boolean {
  const now = new Date();
  return now.getHours() >= 18;
}

/**
 * Gets the calendar date for a specific day number in the contract.
 *
 * @param startDate - The start date type
 * @param createdAt - ISO timestamp of when the contract was created
 * @param dayNumber - The day number (1-indexed)
 * @returns Date object for that day
 */
export function getDateForDay(startDate: StartDate, createdAt: string, dayNumber: number): Date {
  const actualStart = getActualStartDate(startDate, createdAt);
  const result = new Date(actualStart);
  result.setDate(result.getDate() + (dayNumber - 1));
  return result;
}

/**
 * Checks if a given date is today in the user's timezone.
 *
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Formats a date for display in the day detail view.
 *
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Dec 21, 2024")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
