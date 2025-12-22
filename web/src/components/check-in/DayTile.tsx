"use client";

import type { DayStatus } from "@/schemas/check-in";

interface DayTileProps {
  /** Day number in the contract (1-indexed) */
  dayNumber: number;
  /** Status of the day */
  status: DayStatus;
  /** Reward amount (only for completed days) */
  rewardAmount?: number;
  /** Whether this day's reward has been revealed */
  revealed?: boolean;
  /** Whether this is today */
  isToday: boolean;
  /** Whether this is a future day */
  isFuture: boolean;
  /** Handler for tapping on past days */
  onTap?: () => void;
}

/**
 * Individual day tile in the journey timeline.
 *
 * Three variants:
 * - Past completed: Green checkmark, reward amount visible
 * - Past missed: Red X mark, no reward
 * - Today: Highlighted border (blue-600), "Today" label
 * - Future: Grayed out, locked icon, no reward visible
 *
 * Features:
 * - Min 44x44px tap target for past days
 * - Only past days are tappable
 */
export function DayTile({
  dayNumber,
  status,
  rewardAmount,
  revealed,
  isToday,
  isFuture,
  onTap,
}: DayTileProps) {
  const isPast = !isToday && !isFuture;
  const isCompleted = status === "completed";
  const isMissed = status === "missed";

  // Base classes
  const baseClasses = `
    relative flex flex-col items-center justify-center
    min-w-[56px] min-h-[64px] rounded-xl
    transition-all duration-200
  `;

  // Today styling
  if (isToday) {
    return (
      <div
        className={`${baseClasses} border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20`}
      >
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
          Today
        </span>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {dayNumber}
        </span>
      </div>
    );
  }

  // Future styling
  if (isFuture) {
    return (
      <div
        className={`${baseClasses} bg-gray-100 dark:bg-gray-800 opacity-50`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 text-gray-400 dark:text-gray-500 mb-1"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
          {dayNumber}
        </span>
      </div>
    );
  }

  // Past day (completed or missed) - tappable
  return (
    <button
      type="button"
      onClick={onTap}
      className={`${baseClasses} min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isCompleted
          ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      aria-label={`Day ${dayNumber}: ${isCompleted ? "completed" : "missed"}${
        isCompleted && revealed && rewardAmount ? `, earned $${rewardAmount}` : ""
      }`}
    >
      {/* Status icon */}
      {isCompleted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5 text-green-600 dark:text-green-400 mb-1"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5 text-red-500 dark:text-red-400 mb-1"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      {/* Day number */}
      <span
        className={`text-sm font-medium ${
          isCompleted
            ? "text-green-700 dark:text-green-300"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {dayNumber}
      </span>

      {/* Reward amount for completed AND revealed days */}
      {isCompleted && revealed && rewardAmount !== undefined && rewardAmount > 0 && (
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          ${rewardAmount}
        </span>
      )}
    </button>
  );
}
