"use client";

import type { Contract } from "@/types/contract";

interface CheckInLayoutProps {
  /** The active contract */
  contract: Contract;
  /** Current day number in the contract */
  currentDayNumber: number;
  /** Content to display in the main area */
  children: React.ReactNode;
  /** Content for the bottom timeline section */
  timeline?: React.ReactNode;
}

/**
 * Layout wrapper for the check-in page.
 *
 * Features:
 * - Header: Habit title from contract, current day indicator
 * - Main content area: Check-in action or done state
 * - Bottom section: Journey timeline
 * - Mobile-first with max-w-lg centered layout
 */
export function CheckInLayout({
  contract,
  currentDayNumber,
  children,
  timeline,
}: CheckInLayoutProps) {
  const hasStarted = currentDayNumber > 0;
  const isComplete = currentDayNumber > contract.duration;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto">
          {/* Day indicator */}
          {hasStarted && !isComplete ? (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Day {currentDayNumber} of {contract.duration}
            </p>
          ) : !hasStarted ? (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Starting tomorrow
            </p>
          ) : (
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              Goal complete!
            </p>
          )}

          {/* Habit title */}
          <h1 className="text-xl font-bold text-foreground">
            {contract.habitTitle}
          </h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col px-4 py-6">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Timeline section */}
      {timeline && (
        <footer className="w-full px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-lg mx-auto">
            {timeline}
          </div>
        </footer>
      )}
    </div>
  );
}
