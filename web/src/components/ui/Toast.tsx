"use client";

import { useEffect } from "react";
import { useToastStore } from "@/stores/toast-store";

/** Default duration before auto-dismiss (milliseconds) */
const AUTO_DISMISS_DURATION = 5000;

/**
 * Toast notification component.
 *
 * Displays toast messages at the bottom of the screen.
 * Features:
 * - Auto-dismiss after 5 seconds
 * - Manual dismiss via button
 * - Success and error variants with appropriate styling
 * - Accessible with proper ARIA attributes
 */
export function Toast() {
  const toast = useToastStore((state) => state.toast);
  const dismissToast = useToastStore((state) => state.dismissToast);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      dismissToast();
    }, AUTO_DISMISS_DURATION);

    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) {
    return null;
  }

  const isError = toast.variant === "error";

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <div
        className={`
          flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg
          ${isError
            ? "bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800"
            : "bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-800"
          }
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {isError ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-red-600 dark:text-red-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Message */}
        <p
          className={`flex-1 text-sm font-medium ${
            isError
              ? "text-red-800 dark:text-red-200"
              : "text-green-800 dark:text-green-200"
          }`}
        >
          {toast.message}
        </p>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={dismissToast}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            ${isError
              ? "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50"
              : "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50"
            }
          `}
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
