"use client";

interface CheckInConfirmationProps {
  /** The day number that was just checked in */
  dayNumber: number;
  /** Called when user taps to continue */
  onContinue: () => void;
}

/**
 * Confirmation component shown after completing a check-in.
 *
 * Replaces the same-day reward reveal with a deferred message.
 * Users will see their reward outcome the next day.
 */
export function CheckInConfirmation({ dayNumber, onContinue }: CheckInConfirmationProps) {
  return (
    <button
      type="button"
      onClick={onContinue}
      className="flex flex-col items-center justify-center py-8 w-full"
    >
      {/* Checkmark icon */}
      <div
        data-testid="check-icon"
        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-scale-reveal"
      >
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

      {/* Confirmation message */}
      <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in-up">
        Day {dayNumber} logged!
      </h2>

      <p className="text-gray-500 dark:text-gray-400 text-center animate-fade-in-up">
        Come back tomorrow to reveal your reward status
      </p>

      {/* Subtle tap indicator */}
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">
        Tap to continue
      </p>
    </button>
  );
}
