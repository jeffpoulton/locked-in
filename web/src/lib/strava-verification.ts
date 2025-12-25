/**
 * Strava activity verification utilities.
 *
 * Provides functions for:
 * - Checking if activities match selected types
 * - Using user's browser locale/timezone for day matching
 * - Fetching and verifying activities from Strava API
 * - Handling retroactive verification for unrevealed days
 */

import {
  loadStravaTokens,
  saveStravaTokens,
  saveSyncState,
  isTokenExpired,
} from "./strava-storage";
import { getDateForDay } from "./date-utils";

/**
 * Strava activity as returned from the API.
 */
export interface StravaActivity {
  id: number;
  type: string;
  start_date: string;
  name?: string;
  distance?: number;
  moving_time?: number;
}

/**
 * Result of a sync operation.
 */
export interface SyncResult {
  success: boolean;
  daysVerified: number[];
  error?: string;
  newTokens?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

/**
 * Gets the local date string (YYYY-MM-DD) for a given activity's start date.
 * Uses the user's browser locale/timezone.
 */
export function getLocalDateString(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the contract date for a given day number.
 * Uses the same date calculation logic as the rest of the app (date-utils).
 *
 * @param startDate - "today" or "tomorrow" from contract
 * @param createdAt - ISO string of when contract was created
 * @param dayNumber - Day number in the contract (1-based)
 * @returns ISO date string for that day (YYYY-MM-DD)
 */
export function getContractDayDate(
  startDate: "today" | "tomorrow",
  createdAt: string,
  dayNumber: number
): string {
  // Use the shared date utility for consistent date calculation
  const targetDate = getDateForDay(startDate, createdAt, dayNumber);
  return getLocalDateString(targetDate.toISOString());
}

/**
 * Checks if any activities match the selected activity types.
 *
 * @param activities - Array of Strava activities
 * @param selectedTypes - Array of activity type strings to match
 * @returns true if at least one activity matches a selected type
 */
export function hasMatchingActivity(
  activities: StravaActivity[],
  selectedTypes: string[]
): boolean {
  if (!selectedTypes || selectedTypes.length === 0) {
    return false;
  }

  // Normalize types for comparison (case-insensitive)
  const normalizedSelectedTypes = selectedTypes.map((t) => t.toLowerCase());

  return activities.some((activity) =>
    normalizedSelectedTypes.includes(activity.type.toLowerCase())
  );
}

/**
 * Groups activities by their local date (YYYY-MM-DD).
 *
 * @param activities - Array of Strava activities
 * @returns Map of date strings to arrays of activities
 */
export function groupActivitiesByDate(
  activities: StravaActivity[]
): Map<string, StravaActivity[]> {
  const grouped = new Map<string, StravaActivity[]>();

  for (const activity of activities) {
    const dateString = getLocalDateString(activity.start_date);
    const existing = grouped.get(dateString) || [];
    existing.push(activity);
    grouped.set(dateString, existing);
  }

  return grouped;
}

/**
 * Finds which days have matching activities.
 *
 * @param activities - Array of Strava activities
 * @param selectedTypes - Array of activity type strings to match
 * @param startDate - Contract start date ("today" or "tomorrow")
 * @param createdAt - Contract created at ISO string
 * @param daysToCheck - Array of day numbers to check
 * @returns Array of day numbers that have matching activities
 */
export function findMatchingDays(
  activities: StravaActivity[],
  selectedTypes: string[],
  startDate: "today" | "tomorrow",
  createdAt: string,
  daysToCheck: number[]
): number[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  const groupedByDate = groupActivitiesByDate(activities);
  const matchingDays: number[] = [];

  for (const dayNumber of daysToCheck) {
    const dayDateString = getContractDayDate(startDate, createdAt, dayNumber);
    const dayActivities = groupedByDate.get(dayDateString) || [];

    if (hasMatchingActivity(dayActivities, selectedTypes)) {
      matchingDays.push(dayNumber);
    }
  }

  return matchingDays;
}

/**
 * Fetches activities from Strava API for a date range.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Promise resolving to activities array or error
 */
export async function fetchStravaActivities(
  startDate: string,
  endDate: string
): Promise<{ activities: StravaActivity[]; newTokens?: SyncResult["newTokens"] } | { error: string }> {
  const tokens = loadStravaTokens();

  if (!tokens) {
    return { error: "Not connected to Strava" };
  }

  // Build query params
  const params = new URLSearchParams({
    access_token: tokens.access_token,
    startDate,
    endDate,
  });

  // Include refresh token if current token is expired
  if (isTokenExpired()) {
    params.set("refresh_token", tokens.refresh_token);
  }

  try {
    const response = await fetch(
      `/api/integrations/strava/activities?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || "Failed to fetch activities" };
    }

    const data = await response.json();

    // If new tokens were returned, save them
    let newTokens: SyncResult["newTokens"] | undefined;
    if (data.new_tokens) {
      saveStravaTokens({
        access_token: data.new_tokens.access_token,
        refresh_token: data.new_tokens.refresh_token,
        expires_at: data.new_tokens.expires_at,
      });
      newTokens = data.new_tokens;
    }

    return { activities: data.activities || [], newTokens };
  } catch {
    return { error: "Network error fetching activities" };
  }
}

/**
 * Performs a sync with Strava to verify activities for unrevealed days.
 *
 * @param startDateOption - "today" or "tomorrow" from contract
 * @param createdAt - Contract created at ISO string
 * @param selectedTypes - Activity types to match
 * @param unrevealedDays - Day numbers that haven't been revealed yet
 * @returns Promise resolving to sync result
 */
export async function syncStravaActivities(
  startDateOption: "today" | "tomorrow",
  createdAt: string,
  selectedTypes: string[],
  unrevealedDays: number[]
): Promise<SyncResult> {
  if (unrevealedDays.length === 0) {
    return { success: true, daysVerified: [] };
  }

  // Calculate date range for unrevealed days
  const sortedDays = [...unrevealedDays].sort((a, b) => a - b);
  const firstDay = sortedDays[0];
  const lastDay = sortedDays[sortedDays.length - 1];

  const startDate = getContractDayDate(startDateOption, createdAt, firstDay);
  const endDate = getContractDayDate(startDateOption, createdAt, lastDay);

  // Fetch activities
  const result = await fetchStravaActivities(startDate, endDate);

  if ("error" in result) {
    return { success: false, daysVerified: [], error: result.error };
  }

  // Find matching days
  const daysVerified = findMatchingDays(
    result.activities,
    selectedTypes,
    startDateOption,
    createdAt,
    unrevealedDays
  );

  // Update last sync timestamp
  saveSyncState({ lastSyncTimestamp: Date.now() });

  return {
    success: true,
    daysVerified,
    newTokens: result.newTokens,
  };
}

/**
 * Checks if today has a matching Strava activity.
 *
 * @param startDateOption - "today" or "tomorrow" from contract
 * @param createdAt - Contract created at ISO string
 * @param selectedTypes - Activity types to match
 * @param currentDayNumber - Current day number in the contract
 * @returns Promise resolving to whether today is verified
 */
export async function checkTodayVerification(
  startDateOption: "today" | "tomorrow",
  createdAt: string,
  selectedTypes: string[],
  currentDayNumber: number
): Promise<{ verified: boolean; error?: string }> {
  const today = getContractDayDate(startDateOption, createdAt, currentDayNumber);

  const result = await fetchStravaActivities(today, today);

  if ("error" in result) {
    return { verified: false, error: result.error };
  }

  const verified = hasMatchingActivity(result.activities, selectedTypes);
  return { verified };
}
