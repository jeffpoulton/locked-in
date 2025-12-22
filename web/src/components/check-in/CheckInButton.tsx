"use client";

interface CheckInButtonProps {
  /** Handler called when the button is tapped */
  onCheckIn: () => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
}

/**
 * Primary check-in action button.
 *
 * Large, prominent button for confirming daily habit completion.
 * Single tap triggers check-in (no confirmation modal).
 * Features:
 * - Min 64px height, full width
 * - Blue-600 primary color with rounded-2xl styling
 * - Disabled state with grayed styling
 * - Minimum 44x44px tap target
 */
export function CheckInButton({ onCheckIn, disabled = false }: CheckInButtonProps) {
  return (
    <button
      type="button"
      onClick={onCheckIn}
      disabled={disabled}
      className={`
        w-full py-5 px-6 rounded-2xl font-bold text-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        min-h-[64px]
        ${disabled
          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl"
        }
      `}
      aria-label="Mark habit as completed for today"
    >
      I did it!
    </button>
  );
}
