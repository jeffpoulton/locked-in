"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadContract, updateContractPaymentStatus } from "@/lib/contract-storage";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { useToastStore } from "@/stores/toast-store";

/**
 * Cancel callback page for Stripe Checkout.
 *
 * Route: /contract/new/cancel?session_id={CHECKOUT_SESSION_ID}
 *
 * This page:
 * 1. Receives the session_id from Stripe redirect
 * 2. Updates the contract paymentStatus to "failed" in localStorage
 * 3. Shows an error toast
 * 4. Redirects back to the confirmation step for retry
 */
export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goToStep = useContractWizardStore((state) => state.goToStep);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const processCancellation = async () => {
      const sessionId = searchParams.get("session_id");

      // Load the contract from localStorage
      const contract = loadContract();

      if (contract && sessionId) {
        // Update the payment status to failed
        updateContractPaymentStatus(contract.id, "failed", sessionId);
      }

      // Show error toast
      showToast("Payment was not completed. You can try again.", "error");

      // Navigate to confirmation step (step 6) for retry
      goToStep(6);

      // Redirect to wizard
      router.push("/contract/new");
    };

    processCancellation();
  }, [searchParams, router, goToStep, showToast]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
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
          Payment cancelled
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Returning to your commitment...
        </p>
      </div>
    </div>
  );
}
