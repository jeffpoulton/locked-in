"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { phoneAuthSchema } from "@/schemas/auth";

interface PhoneAuthFormProps {
  onOTPSent: (phone: string) => void;
}

/**
 * Common country codes for phone authentication.
 */
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+81", country: "JP" },
  { code: "+86", country: "CN" },
  { code: "+91", country: "IN" },
] as const;

/**
 * Phone authentication form.
 * Sends an OTP to the user's phone number via SMS.
 */
export function PhoneAuthForm({ onOTPSent }: PhoneAuthFormProps) {
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Combine country code and phone number
      const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;

      // Validate input
      const result = phoneAuthSchema.safeParse({ phone: fullPhone });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // OTP sent successfully
      onOTPSent(fullPhone);
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
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone number
        </label>
        <div className="mt-1 flex">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 border-r-0 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
          >
            {COUNTRY_CODES.map(({ code, country }) => (
              <option key={code} value={code}>
                {code} ({country})
              </option>
            ))}
          </select>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="555 123 4567"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          We&apos;ll send you a code via SMS
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Continue with Phone"}
      </button>
    </form>
  );
}
