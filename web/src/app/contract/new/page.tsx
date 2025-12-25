"use client";

import { useEffect } from "react";
import { useContractWizardStore } from "@/stores/contract-wizard-store";
import { WizardLayout } from "@/components/contract-wizard/WizardLayout";
import { HabitTitleStep } from "@/components/contract-wizard/steps/HabitTitleStep";
import { VerificationMethodStep } from "@/components/contract-wizard/steps/VerificationMethodStep";
import { DurationStep } from "@/components/contract-wizard/steps/DurationStep";
import { DepositStep } from "@/components/contract-wizard/steps/DepositStep";
import { StartDateStep } from "@/components/contract-wizard/steps/StartDateStep";
import { ConfirmationStep } from "@/components/contract-wizard/steps/ConfirmationStep";

/**
 * Contract Creation Wizard Page
 *
 * Route: /contract/new
 *
 * This page renders a 6-step wizard for creating a new habit contract.
 * The wizard is mobile-first with responsive design using Tailwind CSS.
 *
 * Steps:
 * 1. Habit Title - What daily habit are you committing to?
 * 2. Verification Method - How will you verify your check-ins? (Strava or Honor System)
 * 3. Duration - How long is your commitment? (7/14/21/30 days)
 * 4. Deposit - How much are you putting on the line? ($100-$1000)
 * 5. Start Date - When do you want to start? (Today/Tomorrow)
 * 6. Confirmation - Review and lock it in
 */
export default function NewContractPage() {
  const currentStep = useContractWizardStore((state) => state.currentStep);
  const resetWizard = useContractWizardStore((state) => state.resetWizard);

  // Reset wizard when component unmounts
  useEffect(() => {
    return () => {
      // Don't reset if we're navigating away after successful creation
      // The resetWizard is called in ConfirmationStep after success
    };
  }, []);

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <HabitTitleStep />;
      case 2:
        return <VerificationMethodStep />;
      case 3:
        return <DurationStep />;
      case 4:
        return <DepositStep />;
      case 5:
        return <StartDateStep />;
      case 6:
        return <ConfirmationStep />;
      default:
        return <HabitTitleStep />;
    }
  };

  return (
    <WizardLayout>
      {renderStep()}
    </WizardLayout>
  );
}
