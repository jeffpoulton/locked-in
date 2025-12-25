"use client";

import { useEffect, useState } from "react";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import {
  isStravaConnected,
  loadStravaTokens,
  saveStravaTokens,
} from "@/lib/strava-storage";
import type { VerificationType } from "@/schemas/contract";

/** Curated list of common Strava activity types */
const CURATED_ACTIVITY_TYPES = [
  "Run",
  "Ride",
  "Swim",
  "Walk",
  "Hike",
  "Workout",
  "Yoga",
];

interface VerificationOption {
  value: VerificationType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const VERIFICATION_OPTIONS: VerificationOption[] = [
  {
    value: "strava",
    label: "Strava",
    description: "Auto-verify via Strava activities",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    ),
  },
  {
    value: "honor_system",
    label: "Honor System",
    description: "Manual daily check-in",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

/**
 * Step 2: Verification Method Selection
 *
 * Allows user to choose how daily check-ins will be verified.
 * Features:
 * - Prompt: "How will you verify your check-ins?"
 * - Two tappable cards: "Strava" and "Honor System"
 * - When Strava selected and not connected: show "Connect Strava" button
 * - When Strava connected: show activity type multi-select checkboxes
 * - Honor System card indicates manual daily check-in
 * - Strava card indicates automatic verification via activities
 */
export function VerificationMethodStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const updateFormData = useContractWizardStore((state) => state.updateFormData);
  const nextStep = useContractWizardStore((state) => state.nextStep);
  const stepStatus = useContractWizardStore((state) => state.stepStatus);

  const [stravaConnected, setStravaConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const selectedMethod = formData.verificationType || "honor_system";
  const selectedActivityTypes = formData.stravaActivityTypes || [];
  const isValid = stepStatus[2];

  // Check Strava connection status on mount
  useEffect(() => {
    setStravaConnected(isStravaConnected());
  }, []);

  const handleMethodSelect = (method: VerificationType) => {
    if (method === "honor_system") {
      // Clear Strava-related data when switching to honor system
      updateFormData({
        verificationType: method,
        stravaActivityTypes: undefined,
      });
    } else {
      updateFormData({ verificationType: method });
    }
  };

  const handleActivityTypeToggle = (activityType: string) => {
    const currentTypes = [...selectedActivityTypes];
    const index = currentTypes.indexOf(activityType);

    if (index === -1) {
      // Add the activity type
      currentTypes.push(activityType);
    } else {
      // Remove the activity type
      currentTypes.splice(index, 1);
    }

    updateFormData({ stravaActivityTypes: currentTypes });
  };

  const handleConnectStrava = () => {
    setIsConnecting(true);

    // Build Strava OAuth authorization URL
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/strava/callback`;
    const scope = "activity:read_all";
    const state = "wizard"; // Used to redirect back to wizard after auth

    const authUrl = new URL("https://www.strava.com/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId || "");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);

    // Redirect to Strava authorization page
    window.location.href = authUrl.toString();
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
        How will you verify your check-ins?
      </h1>

      {/* Verification method options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        {VERIFICATION_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMethodSelect(option.value)}
              className={`
                relative flex flex-col items-center justify-center
                px-4 py-6 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                min-h-[120px]
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Checkmark indicator for selected option */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="white"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div
                className={`mb-3 ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {option.icon}
              </div>

              {/* Label */}
              <span
                className={`text-xl font-bold ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </span>

              {/* Description */}
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Strava-specific UI */}
      {selectedMethod === "strava" && (
        <div className="mb-8">
          {!stravaConnected ? (
            /* Connect Strava button */
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect your Strava account to automatically verify check-ins
                based on your activities.
              </p>
              <button
                type="button"
                onClick={handleConnectStrava}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connect Strava
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Activity type selection */
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-green-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Strava Connected
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Select which activity types count toward your goal:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {CURATED_ACTIVITY_TYPES.map((activityType) => {
                  const isChecked = selectedActivityTypes.includes(activityType);
                  return (
                    <label
                      key={activityType}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
                        transition-all duration-200
                        ${
                          isChecked
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleActivityTypeToggle(activityType)}
                        className="sr-only"
                      />
                      <div
                        className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                          ${
                            isChecked
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300 dark:border-gray-600"
                          }
                        `}
                      >
                        {isChecked && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="white"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`font-medium ${
                          isChecked
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-foreground"
                        }`}
                      >
                        {activityType}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedActivityTypes.length === 0 && (
                <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                  Select at least one activity type to continue
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Next button - min 44px height for tap target */}
      <button
        type="button"
        onClick={nextStep}
        disabled={!isValid}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          min-h-[44px]
          ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }
        `}
      >
        Next
      </button>
    </div>
  );
}
