"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { emailAuthSchema } from "@/schemas/auth";

interface EmailAuthFormProps {
  onOTPSent: (email: string) => void;
  redirectTo?: string;
}

/**
 * Email authentication form.
 * Sends a magic link or OTP to the user's email address.
 */
export function EmailAuthForm({ onOTPSent, redirectTo }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate input
      const result = emailAuthSchema.safeParse({ email });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      const supabase = createClient();

      // Construct the redirect URL for magic links
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectTo) {
        callbackUrl.searchParams.set("next", redirectTo);
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // OTP sent successfully
      onOTPSent(email);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          We&apos;ll send you a magic link or code to sign in
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Continue with Email"}
      </button>
    </form>
  );
}
