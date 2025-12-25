"use client";

import { useState, useEffect } from "react";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { depositAmountSchema } from "@/schemas/contract";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

/**
 * Step 4: Deposit Amount Input
 *
 * Allows user to select or enter a deposit amount.
 * Features:
 * - Prompt: "How much are you putting on the line?"
 * - Preset amount buttons: $100, $250, $500, $1000
 * - Custom input option with dollar prefix
 * - Validation: $100 min, $1000 max
 * - Clear error state for out-of-range amounts
 * - Next button disabled until valid amount entered
 */
export function DepositStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const updateFormData = useContractWizardStore((state) => state.updateFormData);
  const nextStep = useContractWizardStore((state) => state.nextStep);
  const stepStatus = useContractWizardStore((state) => state.stepStatus);

  const [customAmount, setCustomAmount] = useState<string>(
    formData.depositAmount && !PRESET_AMOUNTS.includes(formData.depositAmount)
      ? formData.depositAmount.toString()
      : ""
  );
  const [showCustomInput, setShowCustomInput] = useState(
    formData.depositAmount !== undefined && !PRESET_AMOUNTS.includes(formData.depositAmount)
  );

  const selectedAmount = formData.depositAmount;
  const isValid = stepStatus[4];

  // Handle preset amount selection
  const handlePresetSelect = (amount: number) => {
    setShowCustomInput(false);
    setCustomAmount("");
    updateFormData({ depositAmount: amount });
  };

  // Handle custom input toggle
  const handleCustomToggle = () => {
    setShowCustomInput(true);
    updateFormData({ depositAmount: undefined });
  };

  // Handle custom amount change
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);

    if (value) {
      const numValue = parseInt(value, 10);
      updateFormData({ depositAmount: numValue });
    } else {
      updateFormData({ depositAmount: undefined });
    }
  };

  // Get validation message for custom input
  const getValidationMessage = (): string | null => {
    if (!showCustomInput || !customAmount) return null;

    const numValue = parseInt(customAmount, 10);
    if (isNaN(numValue)) return null;

    if (numValue < 100) {
      return `Minimum amount is $100`;
    }
    if (numValue > 1000) {
      return `Maximum amount is $1,000`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();
  const showError = showCustomInput && validationMessage !== null;
  const isCustomAmountValid =
    showCustomInput &&
    customAmount &&
    depositAmountSchema.safeParse(parseInt(customAmount, 10)).success;

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
        How much are you putting on the line?
      </h1>

      {/* Preset amount buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = selectedAmount === amount && !showCustomInput;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetSelect(amount)}
              className={`
                relative flex items-center justify-center
                px-4 py-5 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                min-h-[64px]
                ${isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Checkmark for selected */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="white"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              <span
                className={`text-xl font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}
              >
                ${amount.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom amount section */}
      <div className="mb-8">
        {!showCustomInput ? (
          <button
            type="button"
            onClick={handleCustomToggle}
            className="w-full py-4 text-center text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg min-h-[44px]"
          >
            Enter custom amount
          </button>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="text-lg font-semibold text-gray-500">$</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customAmount}
              onChange={handleCustomChange}
              placeholder="Enter amount"
              className={`
                w-full pl-10 pr-4 py-4 text-lg rounded-xl border-2 transition-colors
                bg-white dark:bg-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${showError
                  ? "border-red-500 dark:border-red-400"
                  : isCustomAmountValid
                    ? "border-green-500 dark:border-green-400"
                    : "border-gray-200 dark:border-gray-700"
                }
              `}
              aria-describedby="deposit-feedback"
              aria-invalid={showError}
              autoFocus
            />

            {/* Validation feedback */}
            {validationMessage && (
              <p id="deposit-feedback" className="mt-2 text-sm text-red-500">
                {validationMessage}
              </p>
            )}

            {/* Back to presets button */}
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomAmount("");
                updateFormData({ depositAmount: undefined });
              }}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none min-h-[44px] flex items-center"
            >
              Back to preset amounts
            </button>
          </div>
        )}
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
