"use client";

import { useEffect, useRef } from "react";
import { DayTile } from "./DayTile";
import type { DayStatus } from "@/schemas/check-in";

interface DayInfo {
  dayNumber: number;
  status: DayStatus;
  rewardAmount?: number;
}

interface JourneyTimelineProps {
  /** All days in the contract */
  days: DayInfo[];
  /** Current day number */
  currentDayNumber: number;
  /** Total earned so far */
  totalEarned: number;
  /** Handler for tapping on a past day */
  onDayTap: (dayNumber: number) => void;
}

/**
 * Horizontal scrollable timeline showing all days in the contract cycle.
 *
 * Features:
 * - Auto-scrolls to center today on mount
 * - Shows running cumulative total
 * - Past days are tappable
 * - Responsive: fits full width on mobile, scrolls on overflow
 */
export function JourneyTimeline({
  days,
  currentDayNumber,
  totalEarned,
  onDayTap,
}: JourneyTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center today on mount
  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const today = todayRef.current;

      const containerWidth = container.offsetWidth;
      const todayLeft = today.offsetLeft;
      const todayWidth = today.offsetWidth;

      // Scroll to center today
      const scrollPosition = todayLeft - containerWidth / 2 + todayWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, [currentDayNumber]);

  return (
    <div className="w-full">
      {/* Running total */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Your journey
        </span>
        <span className="text-sm font-semibold text-foreground">
          ${totalEarned} earned
        </span>
      </div>

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

          return (
            <div
              key={day.dayNumber}
              ref={isToday ? todayRef : undefined}
            >
              <DayTile
                dayNumber={day.dayNumber}
                status={day.status}
                rewardAmount={day.rewardAmount}
                isToday={isToday}
                isFuture={isFuture}
                onTap={!isToday && !isFuture ? () => onDayTap(day.dayNumber) : undefined}
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
