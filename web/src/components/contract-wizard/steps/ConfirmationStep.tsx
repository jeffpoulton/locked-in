"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { createContract, isFormDataComplete } from "@/lib/contract-actions";
import type { StartDate, ContractFormData } from "@/schemas/contract";

/**
 * Step 5: Confirmation Screen
 *
 * Displays a summary of all selections and allows the user to confirm.
 * Features:
 * - Display summary: habit title, duration, deposit amount, start date
 * - Primary action button: "Lock it in"
 * - Back navigation to modify selections
 * - On confirm: trigger contract creation and navigate to success/dashboard
 * - Loading state during contract creation
 */
export function ConfirmationStep() {
  const router = useRouter();
  const formData = useContractWizardStore((state) => state.formData);
  const prevStep = useContractWizardStore((state) => state.prevStep);
  const setCreatedContract = useContractWizardStore((state) => state.setCreatedContract);
  const setIsSubmitting = useContractWizardStore((state) => state.setIsSubmitting);
  const isSubmitting = useContractWizardStore((state) => state.isSubmitting);
  const resetWizard = useContractWizardStore((state) => state.resetWizard);

  const [error, setError] = useState<string | null>(null);

  // Format helpers
  const formatDuration = (days: number): string => {
    if (days === 7) return "1 week";
    if (days === 14) return "2 weeks";
    if (days === 21) return "3 weeks";
    if (days === 30) return "1 month";
    return `${days} days`;
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const formatStartDate = (startDate: StartDate): string => {
    const today = new Date();
    const date = startDate === "today" ? today : new Date(today.getTime() + 86400000);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${startDate === "today" ? "Today" : "Tomorrow"} - ${month} ${day}`;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormDataComplete(formData)) {
      setError("Please complete all steps before confirming.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the contract (generates ID, reward schedule, saves to localStorage)
      const contract = createContract(formData as ContractFormData);
      setCreatedContract(contract);

      // Reset the wizard and navigate directly to dashboard
      resetWizard();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Summary items
  const summaryItems = [
    {
      label: "Daily Habit",
      value: formData.habitTitle || "Not set",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      label: "Duration",
      value: formData.duration ? formatDuration(formData.duration) : "Not set",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: "Deposit Amount",
      value: formData.depositAmount ? formatAmount(formData.depositAmount) : "Not set",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Start Date",
      value: formData.startDate ? formatStartDate(formData.startDate) : "Not set",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const isComplete = isFormDataComplete(formData);

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Prompt */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Ready to lock it in?
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Review your commitment before confirming
      </p>

      {/* Summary card */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 mb-8">
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-start gap-4 ${
                index < summaryItems.length - 1 ? "pb-4 border-b border-gray-200 dark:border-gray-700" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-lg font-semibold text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="space-y-3">
        {/* Primary action button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            min-h-[44px]
            flex items-center justify-center gap-2
            ${isComplete && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            "Lock it in"
          )}
        </button>

        {/* Edit button */}
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
        >
          Go back and edit
        </button>
      </div>
    </div>
  );
}
