"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveStravaTokens } from "@/lib/strava-storage";

/**
 * Strava OAuth Callback Content Component
 *
 * This component handles the actual OAuth callback logic.
 * It's wrapped in Suspense because it uses useSearchParams().
 */
function StravaCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error from Strava (user denied authorization)
      const error = searchParams.get("error");
      if (error) {
        setStatus("error");
        setErrorMessage(
          error === "access_denied"
            ? "You declined to connect your Strava account."
            : "Authorization failed. Please try again."
        );
        return;
      }

      // Get authorization code
      const code = searchParams.get("code");
      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from Strava.");
        return;
      }

      try {
        // Exchange code for tokens via our API
        const response = await fetch(
          `/api/integrations/strava/callback?code=${encodeURIComponent(code)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to exchange authorization code");
        }

        const tokenData = await response.json();

        // Save tokens to localStorage
        saveStravaTokens({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
        });

        setStatus("success");

        // Redirect back to contract wizard after short delay
        setTimeout(() => {
          router.push("/contract/new");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to connect Strava account."
        );
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Connecting Strava
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we complete the connection...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-green-600 dark:text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Strava Connected!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Redirecting you back to the wizard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-red-600 dark:text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Connection Failed
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/contract/new")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Wizard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Loading...
        </h1>
      </div>
    </div>
  );
}

/**
 * Strava OAuth Callback Page
 *
 * Route: /strava/callback
 *
 * This page handles the OAuth callback from Strava after user authorization.
 * It extracts the authorization code from URL params, exchanges it for tokens
 * via our API route, and redirects back to the contract wizard.
 *
 * Query params expected from Strava:
 * - code: Authorization code to exchange for tokens
 * - state: Our state parameter (e.g., "wizard") to know where to redirect
 * - error: Present if user denied authorization
 */
export default function StravaCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StravaCallbackContent />
    </Suspense>
  );
}
