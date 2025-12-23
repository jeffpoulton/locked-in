"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadContract } from "@/lib/contract-storage";
import { useCheckInStore } from "@/stores/check-in-store";
import { useDevMode } from "@/hooks/useDevMode";
import { DashboardHeader, MetricsMatrix } from "@/components/dashboard";
import { DashboardTimeline } from "@/components/dashboard/DashboardTimeline";
import { CheckInModal } from "@/components/dashboard/CheckInModal";
import { RevealModal } from "@/components/dashboard/RevealModal";
import type { Contract } from "@/schemas/contract";
import type { DayStatus } from "@/schemas/check-in";

interface DayInfo {
  dayNumber: number;
  status: DayStatus;
  rewardAmount?: number;
  revealed?: boolean;
}

/**
 * Dashboard page - main hub during an active cycle.
 *
 * Route: /dashboard
 * Primary screen during active cycle.
 *
 * Features:
 * - Displays progress metrics and timeline
 * - Check-in and reveal actions via modals
 * - Real-time updates from store subscriptions
 * - Redirects to /contract/new if no contract found
 */
export default function DashboardPage() {
  const router = useRouter();

  // Enable dev mode keyboard shortcuts (development only)
  useDevMode();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [currentRevealDay, setCurrentRevealDay] = useState<number | null>(null);

  // Store subscriptions
  const initialize = useCheckInStore((state) => state.initialize);
  const completeCheckIn = useCheckInStore((state) => state.completeCheckIn);
  const markDayMissed = useCheckInStore((state) => state.markDayMissed);
  const revealDay = useCheckInStore((state) => state.revealDay);
  const currentDayNumber = useCheckInStore((state) => state.currentDayNumber);
  const checkInHistory = useCheckInStore((state) => state.checkInHistory);
  const hasCheckedInToday = useCheckInStore((state) => state.hasCheckedInToday);
  const unrevealedDays = useCheckInStore((state) => state.getUnrevealedDays());
  const getRewardForDay = useCheckInStore((state) => state.getRewardForDay);
  const getDayStatus = useCheckInStore((state) => state.getDayStatus);

  // Metrics subscriptions
  const totalEarned = useCheckInStore((state) => state.getTotalEarned());
  const totalForfeited = useCheckInStore((state) => state.getTotalForfeited());
  const currentStreak = useCheckInStore((state) => state.getCurrentStreak());
  const longestStreak = useCheckInStore((state) => state.getLongestStreak());

  // Initialize on mount
  useEffect(() => {
    const loadedContract = loadContract();

    if (!loadedContract) {
      router.push("/contract/new");
      return;
    }

    setContract(loadedContract);
    initialize(loadedContract);
    setIsLoading(false);
  }, [router, initialize]);

  // Build days array
  const days = useMemo((): DayInfo[] => {
    if (!contract) return [];

    const result: DayInfo[] = [];
    for (let day = 1; day <= contract.duration; day++) {
      const record = checkInHistory[day];
      const status = getDayStatus(day);
      const rewardAmount = record?.rewardAmount ?? getRewardForDay(day);
      const revealed = record?.revealed ?? false;

      result.push({
        dayNumber: day,
        status,
        rewardAmount,
        revealed,
      });
    }
    return result;
  }, [contract, checkInHistory, getDayStatus, getRewardForDay]);

  // Check-in modal handlers
  const handleOpenCheckInModal = useCallback(() => {
    setIsCheckInModalOpen(true);
  }, []);

  const handleCloseCheckInModal = useCallback(() => {
    setIsCheckInModalOpen(false);
  }, []);

  const handleCheckInComplete = useCallback(() => {
    completeCheckIn();
  }, [completeCheckIn]);

  const handleCheckInMissed = useCallback(() => {
    markDayMissed();
  }, [markDayMissed]);

  // Reveal modal handlers (opened via tile taps)

  const handleCloseRevealModal = useCallback(() => {
    setIsRevealModalOpen(false);
    setCurrentRevealDay(null);
  }, []);

  const handleRevealComplete = useCallback(() => {
    if (currentRevealDay !== null) {
      revealDay(currentRevealDay);
      // Keep modal open for user to dismiss
      // User can click next pulsing tile to reveal another day
    }
  }, [currentRevealDay, revealDay]);

  // Day tap handler (for timeline)
  const handleDayTap = useCallback((dayNumber: number) => {
    // Check if this is an unrevealed day
    if (unrevealedDays.includes(dayNumber)) {
      // Open reveal modal for this day
      setCurrentRevealDay(dayNumber);
      setIsRevealModalOpen(true);
    }
    // For revealed/future days, do nothing (could add day detail modal later)
  }, [unrevealedDays]);

  // Loading state
  if (isLoading || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Contract hasn't started yet
  if (currentDayNumber === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-6">
          <DashboardHeader
            habitTitle={contract.habitTitle}
            currentDayNumber={0}
            totalDays={contract.duration}
            totalAmount={contract.depositAmount}
          />
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-12">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your goal starts tomorrow
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Come back tomorrow to check in for Day 1
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Contract is complete
  if (currentDayNumber > contract.duration) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-6">
          <DashboardHeader
            habitTitle={contract.habitTitle}
            currentDayNumber={currentDayNumber}
            totalDays={contract.duration}
            totalAmount={contract.depositAmount}
          />
          <MetricsMatrix
            earned={totalEarned}
            forfeited={totalForfeited}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
          <DashboardTimeline
            days={days}
            currentDayNumber={currentDayNumber}
            unrevealedDays={unrevealedDays}
            onDayTap={handleDayTap}
          />
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-12 h-12 text-green-600 dark:text-green-400"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              You&apos;ve completed your {contract.duration}-day goal
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active cycle - main dashboard view (reactive to store changes)
  const showCheckInButton = useMemo(() => {
    return !hasCheckedInToday();
  }, [checkInHistory, hasCheckedInToday]);

  // Get current reveal day data
  const revealDayData = currentRevealDay !== null ? {
    dayNumber: currentRevealDay,
    completed: checkInHistory[currentRevealDay]?.status === "completed",
    rewardAmount: getRewardForDay(currentRevealDay),
  } : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <DashboardHeader
          habitTitle={contract.habitTitle}
          currentDayNumber={currentDayNumber}
          totalDays={contract.duration}
          totalAmount={contract.depositAmount}
        />

        {/* Metrics Matrix */}
        <MetricsMatrix
          earned={totalEarned}
          forfeited={totalForfeited}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />

        {/* Timeline */}
        <DashboardTimeline
          days={days}
          currentDayNumber={currentDayNumber}
          unrevealedDays={unrevealedDays}
          onDayTap={handleDayTap}
        />

        {/* Action buttons (fixed at bottom) */}
        {showCheckInButton && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-800 p-6">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleOpenCheckInModal}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Check In for Day {currentDayNumber}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={handleCloseCheckInModal}
        habitTitle={contract.habitTitle}
        dayNumber={currentDayNumber}
        onComplete={handleCheckInComplete}
        onMissed={handleCheckInMissed}
      />

      {/* Reveal Modal */}
      {revealDayData && (
        <RevealModal
          isOpen={isRevealModalOpen}
          onClose={handleCloseRevealModal}
          dayNumber={revealDayData.dayNumber}
          completed={revealDayData.completed}
          rewardAmount={revealDayData.rewardAmount}
          onRevealComplete={handleRevealComplete}
        />
      )}
    </div>
  );
}
