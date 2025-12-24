"use client";

import { useEffect, useRef } from "react";

interface PendingRevealModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Day number */
  dayNumber: number;
}

/**
 * Modal shown when user taps on today's tile after checking in.
 * Tells them to come back tomorrow for the reveal.
 */
export function PendingRevealModal({
  isOpen,
  onClose,
  dayNumber,
}: PendingRevealModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-reveal-modal-title"
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

        {/* Content */}
        <div className="text-center py-8">
          {/* Clock icon */}
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2
            id="pending-reveal-modal-title"
            className="text-2xl font-bold text-foreground mb-2"
          >
            Day {dayNumber} Complete!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your reward for today will be revealed tomorrow.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
