"use client";

import { useContractWizardStore } from "@/stores/contract-wizard-store";
import type { StartDate } from "@/schemas/contract";

/**
 * Step 5: Start Date Selection
 *
 * Allows user to choose when to start their commitment.
 * Features:
 * - Prompt: "When do you want to start?"
 * - Two large tappable cards: "Today" and "Tomorrow"
 * - Display actual date on each card
 * - Calculate dates dynamically based on current date
 * - Clear visual distinction for selected option
 * - Next button disabled until selection made
 */
export function StartDateStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const updateFormData = useContractWizardStore((state) => state.updateFormData);
  const nextStep = useContractWizardStore((state) => state.nextStep);
  const stepStatus = useContractWizardStore((state) => state.stepStatus);

  const selectedStartDate = formData.startDate;
  const isValid = stepStatus[5];

  // Calculate actual dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleSelect = (startDate: StartDate) => {
    updateFormData({ startDate });
  };

  const options: Array<{ value: StartDate; label: string; date: Date }> = [
    { value: "today", label: "Today", date: today },
    { value: "tomorrow", label: "Tomorrow", date: tomorrow },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
        When do you want to start?
      </h1>

      {/* Start date options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {options.map((option) => {
          const isSelected = selectedStartDate === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                relative flex flex-col items-center justify-center
                px-6 py-8 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                min-h-[120px]
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

              {/* Option label */}
              <span
                className={`text-2xl font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}
              >
                {option.label}
              </span>

              {/* Actual date */}
              <span className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                {formatDate(option.date)}
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
