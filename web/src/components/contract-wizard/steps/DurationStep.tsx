"use client";

import { useContractWizardStore } from "@/stores/contract-wizard-store";
import type { ContractDuration } from "@/types/contract";

interface DurationOption {
  value: ContractDuration;
  label: string;
  description: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { value: 7, label: "7 days", description: "1 week" },
  { value: 14, label: "14 days", description: "2 weeks" },
  { value: 21, label: "21 days", description: "3 weeks" },
  { value: 30, label: "30 days", description: "1 month" },
];

/**
 * Step 2: Duration Selection
 *
 * Allows user to select the commitment duration.
 * Features:
 * - Prompt: "How long is your commitment?"
 * - Four tappable cards: 7, 14, 21, 30 days
 * - Clear visual distinction for selected option
 * - Full-width cards on mobile, 2x2 grid on larger screens
 * - Next button disabled until selection made
 */
export function DurationStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const updateFormData = useContractWizardStore((state) => state.updateFormData);
  const nextStep = useContractWizardStore((state) => state.nextStep);
  const stepStatus = useContractWizardStore((state) => state.stepStatus);

  const selectedDuration = formData.duration;
  const isValid = stepStatus[2];

  const handleSelect = (duration: ContractDuration) => {
    updateFormData({ duration });
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
        How long is your commitment?
      </h1>

      {/* Duration options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = selectedDuration === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                relative flex flex-col items-center justify-center
                px-4 py-6 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                min-h-[88px]
                ${isSelected
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              {/* Duration value */}
              <span
                className={`text-2xl font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}
              >
                {option.label}
              </span>

              {/* Duration description */}
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

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
          ${isValid
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
