"use client";

import { useState, useEffect } from "react";

interface RewardRevealProps {
  /** The reward amount to reveal (0 for days with no reward) */
  rewardAmount: number;
  /** Called when the reveal animation completes */
  onComplete: () => void;
}

type RevealPhase = "anticipation" | "reveal";

/**
 * Reward reveal animation component.
 *
 * Shows an anticipation phase followed by the reward reveal.
 * Features:
 * - Anticipation phase (1.5 seconds): Pulsing animation, "Calculating..." text
 * - Reveal phase: Scale up animation with reward amount or completion message
 * - Celebratory glow effect for rewards
 */
export function RewardReveal({ rewardAmount, onComplete }: RewardRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("anticipation");
  const hasReward = rewardAmount > 0;

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
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-blue-600 flex items-center justify-center">
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
          Calculating your reward...
        </p>
      </div>
    );
  }

  // Reveal phase
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
      {hasReward ? (
        <>
          {/* Glowing reward display */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-green-500/20 animate-pulse-glow" />
            <div className="relative w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-lg shadow-green-500/25 animate-scale-reveal">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                ${rewardAmount}
              </span>
            </div>
          </div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400 animate-fade-in-up">
            Reward unlocked!
          </p>
        </>
      ) : (
        <>
          {/* Completion without reward */}
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
            Day completed!
          </p>
        </>
      )}
    </div>
  );
}
