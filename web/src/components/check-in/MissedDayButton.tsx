"use client";

import { useState } from "react";

interface MissedDayButtonProps {
  /** Handler called when the user confirms marking the day as missed */
  onMarkMissed: () => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
}

/**
 * Secondary action button for marking a day as missed.
 *
 * Styled as a text link/ghost button to be visually subordinate to the primary check-in button.
 * Shows a brief inline confirmation before actually marking the day as missed.
 * Features:
 * - Gray-500 text styling
 * - Yes/No inline confirmation
 * - Minimum 44x44px tap target
 */
export function MissedDayButton({ onMarkMissed, disabled = false }: MissedDayButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onMarkMissed();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Mark this day as missed?
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleConfirm}
            className="min-w-[80px] min-h-[44px] px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="min-w-[80px] min-h-[44px] px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        min-h-[44px] py-3 px-4
        text-gray-500 dark:text-gray-400
        hover:text-gray-700 dark:hover:text-gray-300
        font-medium text-sm
        transition-colors
        focus:outline-none focus:underline
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      aria-label="Mark day as missed"
    >
      I didn&apos;t do it today
    </button>
  );
}
