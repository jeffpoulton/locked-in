"use client";

interface DoneStateProps {
  /** Whether the day was completed (true) or missed (false) */
  completed: boolean;
  /** The reward amount earned (only shown for completed days) */
  rewardAmount?: number;
  /** Running total of all earnings so far */
  totalEarned: number;
  /** Current day number in the contract */
  dayNumber: number;
  /** Total days in the contract */
  totalDays: number;
}

/**
 * Display state shown after a day has been resolved (completed or missed).
 *
 * Features:
 * - Completed variant: Green checkmark, celebratory message
 * - Missed variant: Red X, "Day closed" message, grayed styling
 * - Shows running total prominently
 * - Tomorrow's reward reveal messaging for next-day reveal experience
 */
export function DoneState({
  completed,
  rewardAmount,
  totalEarned,
  dayNumber,
  totalDays,
}: DoneStateProps) {
  const isLastDay = dayNumber >= totalDays;

  if (completed) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        {/* Checkmark icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-10 h-10 text-green-600 dark:text-green-400"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Success message */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Great job!
        </h2>

        {/* Reward amount (if revealed and any) */}
        {rewardAmount !== undefined && rewardAmount > 0 && (
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            +${rewardAmount}
          </p>
        )}

        {/* Running total */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-4 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total earned so far
          </p>
          <p className="text-2xl font-bold text-foreground">
            ${totalEarned}
          </p>
        </div>

        {/* Next step message with reveal-aware messaging */}
        {!isLastDay ? (
          <p className="text-gray-500 dark:text-gray-400">
            Come back tomorrow to reveal today&apos;s reward
          </p>
        ) : (
          <p className="text-green-600 dark:text-green-400 font-medium">
            Congratulations! You completed your goal!
          </p>
        )}
      </div>
    );
  }

  // Missed variant
  return (
    <div className="flex flex-col items-center text-center py-8">
      {/* X icon */}
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-10 h-10 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      {/* Message */}
      <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-2">
        Day closed
      </h2>

      <p className="text-gray-400 dark:text-gray-500 mb-6">
        No reward for this day
      </p>

      {/* Running total */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-4 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Total earned so far
        </p>
        <p className="text-2xl font-bold text-foreground">
          ${totalEarned}
        </p>
      </div>

      {/* Next step message */}
      {!isLastDay ? (
        <p className="text-gray-500 dark:text-gray-400">
          Tomorrow is a new day. Day {dayNumber + 1} awaits.
        </p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          Your goal has ended.
        </p>
      )}
    </div>
  );
}
