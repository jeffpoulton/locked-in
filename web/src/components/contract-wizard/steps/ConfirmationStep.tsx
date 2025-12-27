"use client";

import { useState } from "react";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { createContract, isFormDataComplete } from "@/lib/contract-actions";
import { calculateStripeCharge, calculateStripeFee } from "@/lib/stripe-fee";
import type { StartDate, ContractFormData, VerificationType } from "@/schemas/contract";

/**
 * Step 6: Confirmation Screen
 *
 * Displays a summary of all selections and allows the user to confirm.
 * Features:
 * - Display summary: habit title, verification method, duration, deposit amount, start date
 * - If Strava: show selected activity types
 * - Fee breakdown showing deposit, processing fee, and total charge
 * - Primary action button: "Lock it in"
 * - Back navigation to modify selections
 * - On confirm: create contract with pending status, redirect to Stripe Checkout
 * - Loading state during redirect preparation
 */
export function ConfirmationStep() {
  const formData = useContractWizardStore((state) => state.formData);
  const prevStep = useContractWizardStore((state) => state.prevStep);
  const setCreatedContract = useContractWizardStore((state) => state.setCreatedContract);
  const setIsSubmitting = useContractWizardStore((state) => state.setIsSubmitting);
  const isSubmitting = useContractWizardStore((state) => state.isSubmitting);

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

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatStartDate = (startDate: StartDate): string => {
    const today = new Date();
    const date = startDate === "today" ? today : new Date(today.getTime() + 86400000);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${startDate === "today" ? "Today" : "Tomorrow"} - ${month} ${day}`;
  };

  const formatVerificationMethod = (verificationType: VerificationType | undefined): string => {
    if (verificationType === "strava") {
      return "Strava";
    }
    return "Honor System";
  };

  const formatActivityTypes = (types: string[] | undefined): string => {
    if (!types || types.length === 0) return "";
    return types.join(", ");
  };

  // Calculate fee breakdown
  const depositAmount = formData.depositAmount || 0;
  const processingFee = calculateStripeFee(depositAmount);
  const totalCharge = calculateStripeCharge(depositAmount);

  // Handle form submission - redirect to Stripe Checkout
  const handleSubmit = async () => {
    if (!isFormDataComplete(formData)) {
      setError("Please complete all steps before confirming.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the contract with pending payment status
      const contract = createContract(formData as ContractFormData, {
        paymentStatus: "pending",
      });
      setCreatedContract(contract);

      // Call API to create Stripe Checkout Session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: contract.id,
          depositAmount: contract.depositAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout (use window.location for external redirect)
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start payment. Please try again.");
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
      label: "Verification Method",
      value: formatVerificationMethod(formData.verificationType),
      subValue: formData.verificationType === "strava" && formData.stravaActivityTypes
        ? formatActivityTypes(formData.stravaActivityTypes)
        : null,
      icon: formData.verificationType === "strava" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 mb-4">
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
                {item.subValue && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.subValue}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment breakdown */}
      {depositAmount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 sm:p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Details</p>
              <p className="text-lg font-semibold text-foreground">Your charge today</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Deposit amount</span>
              <span className="font-medium text-foreground">{formatAmount(depositAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Processing fee</span>
              <span className="font-medium text-foreground">{formatCurrency(processingFee)}</span>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total charge</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalCharge)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            The processing fee covers card transaction costs. Your full deposit of {formatAmount(depositAmount)} goes toward your commitment.
          </p>
        </div>
      )}

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
              Preparing payment...
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
