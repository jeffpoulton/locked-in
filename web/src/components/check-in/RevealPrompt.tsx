"use client";

interface RevealPromptProps {
  /** The day number to reveal */
  dayNumber: number;
  /** Called when user taps reveal button */
  onReveal: () => void;
  /** Called when user taps skip button */
  onSkip: () => void;
}

/**
 * Prompt component for initiating a next-day reveal.
 *
 * Shows the day number awaiting reveal with options to reveal or skip.
 * Features a subtle pulsing animation to draw attention.
 */
export function RevealPrompt({ dayNumber, onReveal, onSkip }: RevealPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Pulsing indicator circle */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{dayNumber}</span>
        </div>
      </div>

      {/* Prompt text */}
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Day {dayNumber} awaits...
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
        Discover how you did and what you earned
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onReveal}
          className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-purple-500/25"
        >
          Reveal Day {dayNumber}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-3 px-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors duration-200"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
