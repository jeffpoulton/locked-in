"use client";

interface EveningReminderProps {
  /** Whether to show the reminder (should be false if already checked in) */
  visible: boolean;
}

/**
 * Subtle evening reminder indicator.
 *
 * Shows when it's evening (after 6 PM) and the user hasn't checked in yet.
 * Features:
 * - Gentle amber/yellow tint
 * - Non-aggressive styling
 * - Doesn't compete with primary action
 */
export function EveningReminder({ visible }: EveningReminderProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      {/* Clock icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Don&apos;t forget to check in today
      </p>
    </div>
  );
}
