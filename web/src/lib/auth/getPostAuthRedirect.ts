import { loadCompletedContract } from "@/lib/contract-storage";

/**
 * Default redirect destinations
 */
const DEFAULT_DESTINATION = "/dashboard";
const NEW_CONTRACT_DESTINATION = "/contract/new";

/**
 * Determines the appropriate redirect destination after successful authentication.
 *
 * Priority order:
 * 1. If `returnTo` parameter is provided (from onboarding flow), redirect there
 * 2. If user has an active contract with completed payment, redirect to dashboard
 * 3. If user has no active contract, redirect to new contract page
 *
 * @param returnTo - Optional redirect path from URL params or session storage
 * @returns The path to redirect the user to
 */
export function getPostAuthRedirect(returnTo?: string | null): string {
  // Priority 1: Explicit returnTo parameter
  if (returnTo) {
    // Validate that returnTo is a relative path (security measure)
    if (returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      return returnTo;
    }
  }

  // Priority 2 & 3: Check for active contract
  // Note: This only works on the client side where localStorage is available
  if (typeof window === "undefined") {
    // Server-side fallback - will be handled by client-side redirect
    return DEFAULT_DESTINATION;
  }

  const contract = loadCompletedContract();

  if (contract) {
    // User has an active contract with completed payment
    return DEFAULT_DESTINATION;
  }

  // User has no active contract
  return NEW_CONTRACT_DESTINATION;
}

/**
 * Stores the intended destination in sessionStorage before redirecting to login.
 * This allows the app to return the user to their original destination after auth.
 *
 * @param destination - The path the user was trying to access
 */
export function storeIntendedDestination(destination: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("auth_intended_destination", destination);
}

/**
 * Retrieves and clears the stored intended destination from sessionStorage.
 *
 * @returns The stored destination path, or null if none exists
 */
export function getStoredIntendedDestination(): string | null {
  if (typeof window === "undefined") return null;
  const destination = sessionStorage.getItem("auth_intended_destination");
  if (destination) {
    sessionStorage.removeItem("auth_intended_destination");
  }
  return destination;
}
