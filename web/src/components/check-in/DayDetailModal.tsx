"use client";

import { useEffect, useRef } from "react";
import type { DayStatus } from "@/schemas/check-in";
import { formatDate, getDateForDay } from "@/lib/date-utils";
import type { StartDate } from "@/schemas/contract";

interface DayDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Day number being displayed */
  dayNumber: number;
  /** Status of the day */
  status: DayStatus;
  /** Reward amount (if completed) */
  rewardAmount?: number;
  /** Cumulative total earned up to this day */
  cumulativeTotal: number;
  /** Contract start date type */
  startDate: StartDate;
  /** Contract created timestamp */
  createdAt: string;
}

/**
 * Modal/slide-up sheet for past day details.
 *
 * Features:
 * - Shows day number, calendar date, completion status
 * - Shows reward amount (if completed), cumulative total to that day
 * - Close button or tap-outside to dismiss
 * - Accessible: focus trap, escape key to close
 * - Backdrop blur
 */
export function DayDetailModal({
  isOpen,
  onClose,
  dayNumber,
  status,
  rewardAmount,
  cumulativeTotal,
  startDate,
  createdAt,
}: DayDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isCompleted = status === "completed";

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

  // Focus trap - focus modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const dayDate = getDateForDay(startDate, createdAt, dayNumber);
  const formattedDate = formatDate(dayDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
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
        <div className="text-center">
          {/* Day number and date */}
          <h2
            id="day-detail-title"
            className="text-2xl font-bold text-foreground mb-1"
          >
            Day {dayNumber}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {formattedDate}
          </p>

          {/* Status indicator */}
          <div className="flex justify-center mb-6">
            {isCompleted ? (
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status text */}
          <p className={`text-lg font-semibold mb-4 ${
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : "text-gray-500 dark:text-gray-400"
          }`}>
            {isCompleted ? "Completed" : "Missed"}
          </p>

          {/* Reward (if completed) */}
          {isCompleted && rewardAmount !== undefined && rewardAmount > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Reward earned
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${rewardAmount}
              </p>
            </div>
          )}

          {/* Cumulative total */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total earned by Day {dayNumber}
            </p>
            <p className="text-xl font-bold text-foreground">
              ${cumulativeTotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
