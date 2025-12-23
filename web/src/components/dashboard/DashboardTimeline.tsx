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

  // Auto-scroll on mount and when target changes
  useEffect(() => {
    if (scrollTargetRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = scrollTargetRef.current;

      const containerWidth = container.offsetWidth;
      const targetLeft = target.offsetLeft;
      const targetWidth = target.offsetWidth;

      // Scroll to center target
      const scrollPosition = targetLeft - containerWidth / 2 + targetWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, [scrollTargetDay]);

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
