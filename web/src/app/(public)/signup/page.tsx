"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AuthMethodSelector,
  EmailAuthForm,
  PhoneAuthForm,
  OTPVerification,
} from "@/components/auth";
import type { AuthMethod } from "@/schemas/auth";

type AuthState =
  | { step: "input" }
  | { step: "verify"; identifier: string };

/**
 * Signup content component.
 * Separated to allow Suspense boundary around useSearchParams().
 */
function SignupContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || undefined;

  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [authState, setAuthState] = useState<AuthState>({ step: "input" });

  function handleOTPSent(identifier: string) {
    setAuthState({ step: "verify", identifier });
  }

  function handleBack() {
    setAuthState({ step: "input" });
  }

  return (
    <>
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {authState.step === "input" ? "Create your account" : "Enter your code"}
        </h2>
        {authState.step === "input" && (
          <p className="mt-2 text-center text-sm text-gray-600">
            No password needed - we&apos;ll send you a code
          </p>
        )}
      </div>

      {authState.step === "input" ? (
        <div className="space-y-6">
          <AuthMethodSelector
            selectedMethod={authMethod}
            onMethodChange={setAuthMethod}
          />

          {authMethod === "email" ? (
            <EmailAuthForm onOTPSent={handleOTPSent} redirectTo={returnTo} />
          ) : (
            <PhoneAuthForm onOTPSent={handleOTPSent} />
          )}
        </div>
      ) : (
        <OTPVerification
          identifier={authState.identifier}
          method={authMethod}
          onBack={handleBack}
          redirectTo={returnTo}
        />
      )}

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </>
  );
}

/**
 * Signup page uses the same passwordless flow as login.
 * With passwordless authentication, sign-in and sign-up are unified.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SignupContent />
        </Suspense>
      </div>
    </div>
  );
}
