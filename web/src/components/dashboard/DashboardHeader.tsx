"use client";

interface DashboardHeaderProps {
  /** Habit title */
  habitTitle: string;
  /** Current day number */
  currentDayNumber: number;
  /** Total days in contract */
  totalDays: number;
  /** Total amount (original deposit) */
  totalAmount: number;
}

/**
 * Dashboard header component.
 *
 * Displays:
 * - Habit title (large, prominent)
 * - Day progress (e.g., "Day 5 of 21")
 * - Locked In Amount (original total deposit)
 */
export function DashboardHeader({
  habitTitle,
  currentDayNumber,
  totalDays,
  totalAmount,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      {/* Habit title */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {habitTitle}
      </h1>

      {/* Day progress */}
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Day {currentDayNumber} of {totalDays}
      </p>

      {/* Locked In Amount */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-6 py-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
          Locked In Amount
        </p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          ${totalAmount}
        </p>
      </div>
    </div>
  );
}
