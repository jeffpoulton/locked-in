"use client";

import { useEffect, useRef } from "react";
import { CheckInButton, MissedDayButton } from "@/components/check-in";

interface CheckInModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Habit title */
  habitTitle: string;
  /** Day number */
  dayNumber: number;
  /** Handler for completing check-in */
  onComplete: () => void;
  /** Handler for marking day as missed */
  onMissed: () => void;
}

/**
 * Check-in modal for dashboard.
 *
 * Modal overlay with check-in actions.
 * Reuses existing CheckInButton and MissedDayButton components.
 */
export function CheckInModal({
  isOpen,
  onClose,
  habitTitle,
  dayNumber,
  onComplete,
  onMissed,
}: CheckInModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleMissed = () => {
    onMissed();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-fade-in-up focus:outline-none"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-8">
          <h2
            id="check-in-modal-title"
            className="text-2xl font-bold text-foreground mb-2"
          >
            Did you do it today?
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {habitTitle}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Day {dayNumber}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <CheckInButton onCheckIn={handleComplete} />
          <div className="flex justify-center">
            <MissedDayButton onMarkMissed={handleMissed} />
          </div>
        </div>
      </div>
    </div>
  );
}
