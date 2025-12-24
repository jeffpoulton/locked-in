"use client";

import type { DayStatus } from "@/schemas/check-in";

/**
 * Enhanced day status types for dashboard visualization.
 *
 * Nine distinct statuses:
 * 1. locked: Future day
 * 2. unlocked-unreported: Current day, no check-in
 * 3. unlocked-reported: Current day after check-in (no same-day reveal)
 * 4. missed-available-reveal: Past missed day, unrevealed
 * 5. missed-no-reward: Past missed day, revealed, no reward
 * 6. missed-had-reward: Past missed day, revealed, had reward (forfeited)
 * 7. completed-available-reveal: Past completed day, unrevealed
 * 8. completed-no-reward: Past completed day, revealed, no reward
 * 9. completed-had-reward: Past completed day, revealed, had reward (earned)
 */
export type EnhancedDayStatus =
  | "locked"
  | "unlocked-unreported"
  | "unlocked-reported"
  | "missed-available-reveal"
  | "missed-no-reward"
  | "missed-had-reward"
  | "completed-available-reveal"
  | "completed-no-reward"
  | "completed-had-reward";

interface DayTileProps {
  /** Day number in the contract (1-indexed) */
  dayNumber: number;
  /** Status of the day */
  status: DayStatus;
  /** Reward amount */
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
 * Determine enhanced day status from base props.
 */
function getEnhancedStatus(
  status: DayStatus,
  revealed: boolean | undefined,
  rewardAmount: number | undefined,
  isToday: boolean,
  isFuture: boolean
): EnhancedDayStatus {
  // Status 1: Locked (future day)
  if (isFuture) {
    return "locked";
  }

  // Status 2 & 3: Current day
  if (isToday) {
    if (status === "pending") {
      return "unlocked-unreported";
    }
    return "unlocked-reported";
  }

  // Past days (status 4-9)
  if (status === "missed") {
    if (!revealed) {
      return "missed-available-reveal"; // Status 4
    }
    if (rewardAmount === undefined || rewardAmount === 0) {
      return "missed-no-reward"; // Status 5
    }
    return "missed-had-reward"; // Status 6
  }

  if (status === "completed") {
    if (!revealed) {
      return "completed-available-reveal"; // Status 7
    }
    if (rewardAmount === undefined || rewardAmount === 0) {
      return "completed-no-reward"; // Status 8
    }
    return "completed-had-reward"; // Status 9
  }

  // Fallback
  return "locked";
}

/**
 * Enhanced day tile for dashboard timeline.
 *
 * Supports nine distinct visual states with unique colors and icons.
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
  const enhancedStatus = getEnhancedStatus(status, revealed, rewardAmount, isToday, isFuture);

  // Base classes
  const baseClasses = `
    relative flex flex-col items-center justify-center
    min-w-[56px] min-h-[64px] rounded-xl
    transition-all duration-200
  `;

  // Status 1: Locked (future day)
  if (enhancedStatus === "locked") {
    return (
      <div className={`${baseClasses} bg-gray-100 dark:bg-gray-800 opacity-50`}>
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

  // Status 2: Unlocked Unreported (current day, no check-in)
  if (enhancedStatus === "unlocked-unreported") {
    return (
      <div className={`${baseClasses} border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20`}>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
          Today
        </span>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {dayNumber}
        </span>
      </div>
    );
  }

  // Status 3: Unlocked Reported (current day after check-in, waiting for tomorrow's reveal)
  if (enhancedStatus === "unlocked-reported") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label={`Day ${dayNumber}: checked in, reveal available tomorrow`}
      >
        {/* Clock icon to indicate waiting for reveal */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {dayNumber}
        </span>
      </button>
    );
  }

  // Status 4: Missed Available Reveal (pulsing purple)
  if (enhancedStatus === "missed-available-reveal") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
        aria-label={`Day ${dayNumber}: missed, unrevealed`}
      >
        {/* Question mark icon for unrevealed */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {dayNumber}
        </span>
      </button>
    );
  }

  // Status 5: Missed No Reward (gray with X)
  if (enhancedStatus === "missed-no-reward") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label={`Day ${dayNumber}: missed, no reward`}
      >
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
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {dayNumber}
        </span>
      </button>
    );
  }

  // Status 6: Missed Had Reward (red accent, strikethrough)
  if (enhancedStatus === "missed-had-reward") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-gray-100 dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label={`Day ${dayNumber}: missed, forfeited $${rewardAmount}`}
      >
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
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {dayNumber}
        </span>
        <span className="text-xs font-semibold text-red-600 dark:text-red-400 line-through">
          ${rewardAmount}
        </span>
      </button>
    );
  }

  // Status 7: Completed Available Reveal (pulsing purple)
  if (enhancedStatus === "completed-available-reveal") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
        aria-label={`Day ${dayNumber}: completed, unrevealed`}
      >
        {/* Question mark icon for unrevealed */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {dayNumber}
        </span>
      </button>
    );
  }

  // Status 8: Completed No Reward (blue accent, checkmark)
  if (enhancedStatus === "completed-no-reward") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label={`Day ${dayNumber}: completed, no reward`}
      >
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
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {dayNumber}
        </span>
      </button>
    );
  }

  // Status 9: Completed Had Reward (green, checkmark, reward amount)
  if (enhancedStatus === "completed-had-reward") {
    return (
      <button
        type="button"
        onClick={onTap}
        className={`${baseClasses} min-h-[44px] bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label={`Day ${dayNumber}: completed, earned $${rewardAmount}`}
      >
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
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          {dayNumber}
        </span>
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          ${rewardAmount}
        </span>
      </button>
    );
  }

  return null;
}
