"use client";

import { useContractWizardStore, WIZARD_STEPS, type WizardStep } from "@/stores/contract-wizard-store";

interface WizardLayoutProps {
  children: React.ReactNode;
}

/**
 * Base layout component for the contract creation wizard.
 *
 * Features:
 * - Step indicator showing progress (1 of 5, 2 of 5, etc.)
 * - Back button (hidden on step 1)
 * - Content area for step components
 * - Mobile-first design with centered content
 * - Minimum 44x44px tap targets for navigation
 */
export function WizardLayout({ children }: WizardLayoutProps) {
  const currentStep = useContractWizardStore((state) => state.currentStep);
  const prevStep = useContractWizardStore((state) => state.prevStep);

  const showBackButton = currentStep > 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with step indicator and back button */}
      <header className="w-full px-4 py-4 sm:py-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {/* Back button - min 44x44px tap target */}
          <div className="w-11 h-11 flex items-center justify-center">
            {showBackButton && (
              <button
                type="button"
                onClick={prevStep}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Go back to previous step"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Step indicator */}
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Step {currentStep} of {WIZARD_STEPS}
          </div>

          {/* Spacer for symmetry */}
          <div className="w-11 h-11" aria-hidden="true" />
        </div>

        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-4">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / WIZARD_STEPS) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={WIZARD_STEPS}
              aria-label={`Step ${currentStep} of ${WIZARD_STEPS}`}
            />
          </div>
        </div>
      </header>

      {/* Main content area - centered vertically */}
      <main className="flex-1 flex flex-col px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
