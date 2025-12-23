"use client";

import { MetricCard } from "./MetricCard";

interface MetricsMatrixProps {
  /** Earned amount */
  earned: number;
  /** Forfeited amount */
  forfeited: number;
  /** Current streak */
  currentStreak: number;
  /** Longest streak */
  longestStreak: number;
}

/**
 * 2x2 metrics matrix component.
 *
 * Layout:
 * - Top row: Earned Amount | Forfeited Amount
 * - Bottom row: Current Streak | Longest Streak
 *
 * Displays key cycle metrics in a responsive grid.
 */
export function MetricsMatrix({
  earned,
  forfeited,
  currentStreak,
  longestStreak,
}: MetricsMatrixProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Top row */}
        <MetricCard
          label="Earned"
          value={`$${earned}`}
          colorScheme="green"
        />
        <MetricCard
          label="Forfeited"
          value={`$${forfeited}`}
          colorScheme="red"
        />

        {/* Bottom row */}
        <MetricCard
          label="Current Streak"
          value={currentStreak}
          colorScheme="blue"
        />
        <MetricCard
          label="Longest Streak"
          value={longestStreak}
          colorScheme="neutral"
        />
      </div>
    </div>
  );
}
