"use client";

import type { AuthMethod } from "@/schemas/auth";

interface AuthMethodSelectorProps {
  selectedMethod: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
}

/**
 * Toggle between Email and SMS authentication methods.
 * Uses a segmented control design pattern.
 */
export function AuthMethodSelector({
  selectedMethod,
  onMethodChange,
}: AuthMethodSelectorProps) {
  return (
    <div className="flex rounded-lg border border-gray-300 p-1">
      <button
        type="button"
        onClick={() => onMethodChange("email")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
          selectedMethod === "email"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Email
      </button>
      <button
        type="button"
        onClick={() => onMethodChange("phone")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
          selectedMethod === "phone"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Phone
      </button>
    </div>
  );
}
