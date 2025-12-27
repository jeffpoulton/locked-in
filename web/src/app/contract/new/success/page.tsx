"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadContract, updateContractPaymentStatus } from "@/lib/contract-storage";
import { useContractWizardStore } from "@/stores/contract-wizard-store";

/**
 * Success callback page for Stripe Checkout.
 *
 * Route: /contract/new/success?session_id={CHECKOUT_SESSION_ID}
 *
 * This page:
 * 1. Receives the session_id from Stripe redirect
 * 2. Updates the contract paymentStatus to "completed" in localStorage
 * 3. Clears the wizard state
 * 4. Redirects to the dashboard
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetWizard = useContractWizardStore((state) => state.resetWizard);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processSuccess = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setError("Missing session information. Please try again.");
        return;
      }

      // Load the contract from localStorage
      const contract = loadContract();

      if (!contract) {
        setError("Contract not found. Please try again.");
        return;
      }

      // Update the payment status to completed
      const updated = updateContractPaymentStatus(contract.id, "completed", sessionId);

      if (!updated) {
        setError("Failed to update payment status. Please contact support.");
        return;
      }

      // Reset the wizard state
      resetWizard();

      // Redirect to dashboard
      router.push("/dashboard");
    };

    processSuccess();
  }, [searchParams, router, resetWizard]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-red-600 dark:text-red-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.push("/contract/new")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // Loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-green-600 dark:text-green-400"
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
          Payment successful!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Setting up your commitment...
        </p>
      </div>
    </div>
  );
}
