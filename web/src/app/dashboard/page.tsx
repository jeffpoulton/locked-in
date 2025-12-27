"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadCompletedContract } from "@/lib/contract-storage";
import { useCheckInStore } from "@/stores/check-in-store";
import { useDevMode, isDevModeTimeTraveling } from "@/hooks/useDevMode";
import { DashboardHeader, MetricsMatrix } from "@/components/dashboard";
import { DashboardTimeline } from "@/components/dashboard/DashboardTimeline";
import { CheckInModal } from "@/components/dashboard/CheckInModal";
import { RevealModal } from "@/components/dashboard/RevealModal";
import { PendingRevealModal } from "@/components/dashboard/PendingRevealModal";
import {
  loadSyncState,
  isStravaConnected,
} from "@/lib/strava-storage";
import {
  checkTodayVerification,
  syncStravaActivities,
} from "@/lib/strava-verification";
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
 * - Redirects to /contract/new if no contract found or payment not completed
 * - Only shows contracts with paymentStatus: "completed"
 * - Strava integration: auto-verification and Force Sync
 */
export default function DashboardPage() {
  const router = useRouter();

  // Enable dev mode keyboard shortcuts (development only)
  useDevMode();

  const [isLoading, setIsLoading] = useState(true);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isPendingRevealModalOpen, setIsPendingRevealModalOpen] = useState(false);
  const [currentRevealDay, setCurrentRevealDay] = useState<number | null>(null);

  // Strava verification state
  const [stravaVerified, setStravaVerified] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ daysVerified: number[] } | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);

  // Store subscriptions - contract comes from store so it stays in sync with dev mode
  const contract = useCheckInStore((state) => state.contract);
  const initialize = useCheckInStore((state) => state.initialize);
  const completeCheckIn = useCheckInStore((state) => state.completeCheckIn);
  const markDayMissed = useCheckInStore((state) => state.markDayMissed);
  const revealDay = useCheckInStore((state) => state.revealDay);
  const currentDayNumber = useCheckInStore((state) => state.currentDayNumber);
  const checkInHistory = useCheckInStore((state) => state.checkInHistory);
  const hasCheckedInToday = useCheckInStore((state) => state.hasCheckedInToday());
  const revealQueue = useCheckInStore((state) => state.revealQueue);
  const getRewardForDay = useCheckInStore((state) => state.getRewardForDay);
  const getDayStatus = useCheckInStore((state) => state.getDayStatus);

  // Metrics subscriptions
  const totalEarned = useCheckInStore((state) => state.getTotalEarned());
  const totalForfeited = useCheckInStore((state) => state.getTotalForfeited());
  const currentStreak = useCheckInStore((state) => state.getCurrentStreak());
  const longestStreak = useCheckInStore((state) => state.getLongestStreak());

  // Initialize on mount - only load completed contracts
  useEffect(() => {
    const loadedContract = loadCompletedContract();

    if (!loadedContract) {
      router.push("/contract/new");
      return;
    }

    initialize(loadedContract);
    setIsLoading(false);

    // Load last sync timestamp
    const syncState = loadSyncState();
    if (syncState) {
      setLastSyncTimestamp(syncState.lastSyncTimestamp);
    }
  }, [router, initialize]);

  // Check Strava verification on mount and when currentDayNumber changes
  useEffect(() => {
    // Skip auto-verification during dev mode time travel
    if (isDevModeTimeTraveling()) {
      return;
    }

    if (
      contract &&
      contract.verificationType === "strava" &&
      contract.stravaActivityTypes &&
      currentDayNumber > 0 &&
      !hasCheckedInToday &&
      isStravaConnected()
    ) {
      checkTodayVerification(
        contract.startDate,
        contract.createdAt,
        contract.stravaActivityTypes,
        currentDayNumber
      ).then((result) => {
        setStravaVerified(result.verified);

        // Auto check-in if verified
        if (result.verified && !hasCheckedInToday) {
          completeCheckIn();
        }
      });
    }
  }, [contract, currentDayNumber, hasCheckedInToday, completeCheckIn]);

  // Force Sync handler
  const handleForceSync = useCallback(async () => {
    if (!contract || contract.verificationType !== "strava" || !contract.stravaActivityTypes) {
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    // Always include today in Force Sync - user explicitly wants to sync all days
    // Use Set to avoid duplicates if currentDayNumber is somehow in revealQueue
    const daysToSync = [...new Set([...revealQueue, currentDayNumber])].sort((a, b) => a - b);

    try {
      const result = await syncStravaActivities(
        contract.startDate,
        contract.createdAt,
        contract.stravaActivityTypes,
        daysToSync
      );

      if (result.success) {
        setSyncResult({ daysVerified: result.daysVerified });
        setLastSyncTimestamp(Date.now());

        // Auto verify days that were found
        if (result.daysVerified.length > 0) {
          // The days have activities - mark them as completed if not already
          // Note: We can't retroactively change revealed days
          for (const day of result.daysVerified) {
            if (!checkInHistory[day]) {
              // This day hasn't been checked in yet
              // Since it's in revealQueue, it's a past day that needs verification
            }
          }
        }

        // Check if today was verified
        if (result.daysVerified.includes(currentDayNumber)) {
          setStravaVerified(true);
          if (!hasCheckedInToday) {
            completeCheckIn();
          }
        }
      }
    } catch {
      // Handle error silently for now
    } finally {
      setIsSyncing(false);
    }
  }, [contract, revealQueue, currentDayNumber, hasCheckedInToday, checkInHistory, completeCheckIn]);

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
    if (revealQueue.includes(dayNumber)) {
      // Open reveal modal for this day
      setCurrentRevealDay(dayNumber);
      setIsRevealModalOpen(true);
    } else if (dayNumber === currentDayNumber && hasCheckedInToday) {
      // Today after check-in - show pending reveal modal
      setIsPendingRevealModalOpen(true);
    }
    // For revealed/future days, do nothing (could add day detail modal later)
  }, [revealQueue, currentDayNumber, hasCheckedInToday]);

  // Format last sync timestamp
  const formatLastSync = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Loading state
  if (isLoading || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Determine if this is a Strava contract
  const isStravaContract = contract.verificationType === "strava";

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
            unrevealedDays={revealQueue}
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
  const showCheckInButton = !hasCheckedInToday && !isStravaContract;

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
          unrevealedDays={revealQueue}
          onDayTap={handleDayTap}
        />

        {/* Action buttons (fixed at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-800 p-6">
          <div className="max-w-md mx-auto">
            {isStravaContract ? (
              /* Strava verification status and Force Sync */
              <div className="space-y-4">
                {/* Verification status */}
                <div className="flex items-center justify-center gap-2">
                  {hasCheckedInToday || stravaVerified ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-green-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Verified via Strava
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">
                        No activity found
                      </span>
                    </>
                  )}
                </div>

                {/* Force Sync button */}
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="w-full py-3 px-6 rounded-xl font-medium text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                      Force Sync
                    </>
                  )}
                </button>

                {/* Last sync timestamp */}
                {lastSyncTimestamp && (
                  <p className="text-center text-sm text-gray-400">
                    Last synced: {formatLastSync(lastSyncTimestamp)}
                  </p>
                )}

                {/* Sync result */}
                {syncResult && syncResult.daysVerified.length > 0 && (
                  <p className="text-center text-sm text-green-600 dark:text-green-400">
                    Verified {syncResult.daysVerified.length} day{syncResult.daysVerified.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : showCheckInButton ? (
              <button
                type="button"
                onClick={handleOpenCheckInModal}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Check In for Day {currentDayNumber}
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Check back tomorrow to reveal today&apos;s reward
                </p>
              </div>
            )}
          </div>
        </div>
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

      {/* Pending Reveal Modal (for today after check-in) */}
      <PendingRevealModal
        isOpen={isPendingRevealModalOpen}
        onClose={() => setIsPendingRevealModalOpen(false)}
        dayNumber={currentDayNumber}
      />
    </div>
  );
}
