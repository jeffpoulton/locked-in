"use client";

import { useEffect, useRef, useCallback } from "react";
import { NextDayReveal } from "@/components/check-in";

interface RevealModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Day number being revealed */
  dayNumber: number;
  /** Whether day was completed */
  completed: boolean;
  /** Reward amount */
  rewardAmount: number;
  /** Handler called when reveal animation completes */
  onRevealComplete: () => void;
}

/**
 * Reveal modal for dashboard.
 *
 * Modal overlay with reveal animation.
 * Reuses existing NextDayReveal component.
 */
export function RevealModal({
  isOpen,
  onClose,
  dayNumber,
  completed,
  rewardAmount,
  onRevealComplete,
}: RevealModalProps) {
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

  const handleComplete = useCallback(() => {
    onRevealComplete();
    onClose();
  }, [onRevealComplete, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
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

        {/* Reveal animation */}
        <NextDayReveal
          dayNumber={dayNumber}
          completed={completed}
          rewardAmount={rewardAmount}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
