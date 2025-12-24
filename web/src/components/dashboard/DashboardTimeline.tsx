"use client";

import { useEffect, useRef } from "react";
import { DayTile } from "./DayTile";
import type { DayStatus } from "@/schemas/check-in";

interface DayInfo {
  dayNumber: number;
  status: DayStatus;
  rewardAmount?: number;
  revealed?: boolean;
}

interface DashboardTimelineProps {
  /** All days in the contract */
  days: DayInfo[];
  /** Current day number */
  currentDayNumber: number;
  /** Unrevealed day numbers */
  unrevealedDays: number[];
  /** Handler for tapping on a day */
  onDayTap: (dayNumber: number) => void;
}

/**
 * Dashboard timeline component with auto-scroll.
 *
 * Features:
 * - Auto-scrolls to first unrevealed day, else current day
 * - Horizontally scrollable
 * - Supports nine distinct day statuses
 */
export function DashboardTimeline({
  days,
  currentDayNumber,
  unrevealedDays,
  onDayTap,
}: DashboardTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  // Determine scroll target: first unrevealed day, else current day
  const scrollTargetDay = unrevealedDays.length > 0 ? unrevealedDays[0] : currentDayNumber;
  const hasUnrevealedDays = unrevealedDays.length > 0;
  const hasScrolledRef = useRef(false);

  // Auto-scroll on mount once data is loaded
  useEffect(() => {
    // Only scroll once and only when we have valid data
    if (hasScrolledRef.current || currentDayNumber === 0) return;

    if (scrollTargetRef.current) {
      // Always scroll to the target (either first unrevealed or current day)
      // Unrevealed days go to start, current day goes to start (since day 1 can't be centered)
      scrollTargetRef.current.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "start"
      });

      hasScrolledRef.current = true;
    }
  }, [currentDayNumber, hasUnrevealedDays]); // Re-run when data changes

  return (
    <div className="w-full mb-6">
      {/* Timeline */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {days.map((day) => {
          const isToday = day.dayNumber === currentDayNumber;
          const isFuture = day.dayNumber > currentDayNumber;
          const isScrollTarget = day.dayNumber === scrollTargetDay;

          return (
            <div
              key={day.dayNumber}
              ref={isScrollTarget ? scrollTargetRef : undefined}
            >
              <DayTile
                dayNumber={day.dayNumber}
                status={day.status}
                rewardAmount={day.rewardAmount}
                revealed={day.revealed}
                isToday={isToday}
                isFuture={isFuture}
                onTap={() => onDayTap(day.dayNumber)}
              />
            </div>
          );
        })}
      </div>

      {/* Hide scrollbar style */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
