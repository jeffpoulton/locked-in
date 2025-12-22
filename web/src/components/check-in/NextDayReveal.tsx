"use client";

import { useState, useEffect } from "react";

interface NextDayRevealProps {
  /** The day number being revealed */
  dayNumber: number;
  /** Whether the user completed the check-in for this day */
  completed: boolean;
  /** The reward amount for this day (0 if no reward scheduled) */
  rewardAmount: number;
  /** Called when the reveal animation completes */
  onComplete: () => void;
}

type RevealPhase = "anticipation" | "reveal";

/**
 * Outcome types for the reveal:
 * - earned: completed + reward > 0
 * - no-reward: completed + reward = 0
 * - forfeited: missed + reward > 0
 * - lucky-break: missed + reward = 0
 */
type RevealOutcome = "earned" | "no-reward" | "forfeited" | "lucky-break";

/**
 * Next-day reveal animation component.
 *
 * Shows an anticipation phase followed by the outcome reveal with
 * four distinct emotional states based on completion and reward.
 */
export function NextDayReveal({
  dayNumber,
  completed,
  rewardAmount,
  onComplete,
}: NextDayRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("anticipation");

  // Determine the outcome based on completion and reward
  const outcome: RevealOutcome = completed
    ? rewardAmount > 0
      ? "earned"
      : "no-reward"
    : rewardAmount > 0
      ? "forfeited"
      : "lucky-break";

  useEffect(() => {
    // Transition from anticipation to reveal after 1.5 seconds
    const anticipationTimer = setTimeout(() => {
      setPhase("reveal");
    }, 1500);

    // Call onComplete after reveal animation (additional 1 second)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(anticipationTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (phase === "anticipation") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {/* Pulsing circle */}
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-purple-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-white animate-spin"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        </div>
        <p className="text-lg text-gray-500 dark:text-gray-400 animate-pulse">
          Revealing Day {dayNumber}...
        </p>
      </div>
    );
  }

  // Reveal phase - render based on outcome
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
      {outcome === "earned" && (
        <>
          {/* Green glow reward display */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-green-500/20 animate-pulse-glow" />
            <div className="relative w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-lg shadow-green-500/25 animate-scale-reveal">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                ${rewardAmount}
              </span>
            </div>
          </div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400 animate-fade-in-up">
            You earned ${rewardAmount}!
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Day {dayNumber} complete
          </p>
        </>
      )}

      {outcome === "no-reward" && (
        <>
          {/* Blue neutral display */}
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 animate-scale-reveal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-12 h-12 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 animate-fade-in-up">
            No reward scheduled
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Day {dayNumber} complete - keep it up!
          </p>
        </>
      )}

      {outcome === "forfeited" && (
        <>
          {/* Red/gray somber display */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-red-500/10" />
            <div className="relative w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-scale-reveal">
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-8 h-8 text-red-500 dark:text-red-400 mb-1"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 line-through">
                  ${rewardAmount}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400 animate-fade-in-up">
            You forfeited ${rewardAmount}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Day {dayNumber} missed
          </p>
        </>
      )}

      {outcome === "lucky-break" && (
        <>
          {/* Amber/gold relief display */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-amber-500/20 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center animate-scale-reveal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-12 h-12 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold text-amber-600 dark:text-amber-400 animate-fade-in-up">
            Lucky break!
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No reward was scheduled for Day {dayNumber}
          </p>
        </>
      )}
    </div>
  );
}
