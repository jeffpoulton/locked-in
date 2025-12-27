"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { getPostAuthRedirect } from "@/lib/auth/getPostAuthRedirect";
import { otpSchema, type AuthMethod } from "@/schemas/auth";

interface OTPVerificationProps {
  /** The email or phone number the OTP was sent to */
  identifier: string;
  /** Whether this is email or phone verification */
  method: AuthMethod;
  /** Called when user wants to go back and change their email/phone */
  onBack: () => void;
  /** Optional redirect path after successful verification */
  redirectTo?: string;
}

/**
 * OTP verification component.
 * Handles 6-digit code verification for both email and phone auth.
 */
export function OTPVerification({
  identifier,
  method,
  onBack,
  redirectTo,
}: OTPVerificationProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate input
      const result = otpSchema.safeParse({ token: code });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      const supabase = createClient();

      // Verify OTP based on method
      const verifyParams =
        method === "email"
          ? { email: identifier, token: code, type: "email" as const }
          : { phone: identifier, token: code, type: "sms" as const };

      const { error: verifyError } = await supabase.auth.verifyOtp(verifyParams);

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      // Success - determine redirect destination
      const destination = getPostAuthRedirect(redirectTo);
      router.push(destination);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (method === "email") {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        if (redirectTo) {
          callbackUrl.searchParams.set("next", redirectTo);
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: callbackUrl.toString(),
          },
        });

        if (error) {
          setError(error.message);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
        });

        if (error) {
          setError(error.message);
          return;
        }
      }

      // Start cooldown
      setResendCooldown(60);
    } catch {
      setError("Failed to resend code");
    } finally {
      setLoading(false);
    }
  }

  // Format identifier for display
  const displayIdentifier =
    method === "email"
      ? identifier
      : identifier.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          We sent a 6-digit code to
        </p>
        <p className="font-medium text-gray-900">{displayIdentifier}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 text-center"
          >
            Enter your code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="mt-1 block w-full px-3 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
          className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Use a different {method === "email" ? "email" : "phone number"}
        </button>
      </div>
    </div>
  );
}
