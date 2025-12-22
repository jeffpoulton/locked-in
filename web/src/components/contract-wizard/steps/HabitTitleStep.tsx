"use client";

import { useState, useEffect } from "react";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { habitTitleSchema } from "@/schemas/contract";

const PLACEHOLDER_EXAMPLES = [
  "Meditate for 10 minutes",
  "Run for 30 minutes",
  "Create 2 TikToks",
  "Read for 20 minutes",
  "Write 500 words",
  "Practice guitar for 15 minutes",
];

/**
 * Step 1: Habit Title Input
 *
 * Collects the user's daily habit title with real-time validation.
 * Features:
 * - Prompt: "What daily habit are you committing to?"
 * - Helper text: "You'll do this every day"
 * - Single-line text input, full-width on mobile
 * - Rotating placeholder examples
 * - Real-time validation feedback (min 3, max 60 chars)
 * - Next button disabled until valid
 */
export function HabitTitleStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const updateFormData = useContractWizardStore((state) => state.updateFormData);
  const nextStep = useContractWizardStore((state) => state.nextStep);
  const stepStatus = useContractWizardStore((state) => state.stepStatus);

  const [habitTitle, setHabitTitle] = useState(formData.habitTitle || "");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const isValid = stepStatus[1];

  // Rotate placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Validate and update store on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHabitTitle(value);
    setHasInteracted(true);
    updateFormData({ habitTitle: value });
  };

  // Get validation message
  const getValidationMessage = (): string | null => {
    if (!hasInteracted || habitTitle.length === 0) return null;

    const result = habitTitleSchema.safeParse(habitTitle);
    if (result.success) return null;

    if (habitTitle.length < 3) {
      return `${3 - habitTitle.length} more character${3 - habitTitle.length === 1 ? "" : "s"} needed`;
    }
    if (habitTitle.length > 60) {
      return `${habitTitle.length - 60} character${habitTitle.length - 60 === 1 ? "" : "s"} over limit`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();
  const showError = hasInteracted && validationMessage !== null;
  const showSuccess = hasInteracted && habitTitle.length >= 3 && habitTitle.length <= 60;

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What daily habit are you committing to?
      </h1>

      {/* Helper text */}
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        You&apos;ll do this every day
      </p>

      {/* Input field */}
      <div className="mb-8">
        <input
          type="text"
          value={habitTitle}
          onChange={handleChange}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          className={`
            w-full px-4 py-4 text-lg rounded-xl border-2 transition-colors
            bg-white dark:bg-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${showError
              ? "border-red-500 dark:border-red-400"
              : showSuccess
                ? "border-green-500 dark:border-green-400"
                : "border-gray-200 dark:border-gray-700"
            }
          `}
          aria-describedby="habit-title-feedback"
          aria-invalid={showError}
          maxLength={65}
        />

        {/* Validation feedback */}
        <div
          id="habit-title-feedback"
          className={`mt-2 text-sm flex justify-between ${showError ? "text-red-500" : "text-gray-400"}`}
        >
          <span>
            {validationMessage || (showSuccess ? "Looking good!" : "")}
          </span>
          <span>
            {habitTitle.length}/60
          </span>
        </div>
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
