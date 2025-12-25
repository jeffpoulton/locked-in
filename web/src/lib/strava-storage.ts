/**
 * Strava storage utilities for managing OAuth tokens and sync state.
 *
 * Handles localStorage operations for:
 * - Strava OAuth tokens (access_token, refresh_token, expires_at)
 * - Sync state (lastSyncTimestamp)
 *
 * All operations include SSR safety checks.
 */

/** Storage key for Strava OAuth tokens */
const STRAVA_TOKENS_KEY = "locked-in-strava-tokens";

/** Storage key for Strava sync state */
const STRAVA_SYNC_KEY = "locked-in-strava-sync";

/**
 * Strava OAuth tokens stored in localStorage
 */
export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in seconds
}

/**
 * Strava sync state stored in localStorage
 */
export interface StravaSyncState {
  lastSyncTimestamp: number; // Unix timestamp in milliseconds
}

/**
 * Saves Strava OAuth tokens to localStorage.
 *
 * @param tokens - The OAuth tokens to save
 */
export function saveStravaTokens(tokens: StravaTokens): void {
  if (typeof window === "undefined") {
    return;
  }
  const serialized = JSON.stringify(tokens);
  localStorage.setItem(STRAVA_TOKENS_KEY, serialized);
}

/**
 * Loads Strava OAuth tokens from localStorage.
 *
 * @returns The stored tokens or null if none exist
 */
export function loadStravaTokens(): StravaTokens | null {
  if (typeof window === "undefined") {
    return null;
  }
  const serialized = localStorage.getItem(STRAVA_TOKENS_KEY);
  if (!serialized) {
    return null;
  }
  try {
    return JSON.parse(serialized) as StravaTokens;
  } catch {
    return null;
  }
}

/**
 * Clears Strava OAuth tokens from localStorage.
 * Useful when disconnecting Strava or handling auth errors.
 */
export function clearStravaTokens(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STRAVA_TOKENS_KEY);
}

/**
 * Saves Strava sync state to localStorage.
 *
 * @param state - The sync state to save
 */
export function saveSyncState(state: StravaSyncState): void {
  if (typeof window === "undefined") {
    return;
  }
  const serialized = JSON.stringify(state);
  localStorage.setItem(STRAVA_SYNC_KEY, serialized);
}

/**
 * Loads Strava sync state from localStorage.
 *
 * @returns The stored sync state or null if none exists
 */
export function loadSyncState(): StravaSyncState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const serialized = localStorage.getItem(STRAVA_SYNC_KEY);
  if (!serialized) {
    return null;
  }
  try {
    return JSON.parse(serialized) as StravaSyncState;
  } catch {
    return null;
  }
}

/**
 * Clears Strava sync state from localStorage.
 */
export function clearSyncState(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STRAVA_SYNC_KEY);
}

/**
 * Checks if Strava is connected by verifying tokens exist.
 *
 * @returns true if valid tokens exist, false otherwise
 */
export function isStravaConnected(): boolean {
  const tokens = loadStravaTokens();
  return tokens !== null && !!tokens.access_token && !!tokens.refresh_token;
}

/**
 * Checks if the current access token is expired.
 * Strava access tokens expire after 6 hours.
 *
 * @returns true if token is expired or doesn't exist, false if still valid
 */
export function isTokenExpired(): boolean {
  const tokens = loadStravaTokens();
  if (!tokens) {
    return true;
  }
  // Compare expires_at (in seconds) with current time (in seconds)
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return tokens.expires_at <= nowInSeconds;
}
