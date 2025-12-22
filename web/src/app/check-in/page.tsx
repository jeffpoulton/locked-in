"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadContract } from "@/lib/contract-storage";
import { useCheckInStore } from "@/stores/check-in-store";
import { isEvening } from "@/lib/date-utils";
import { calculateCumulativeEarnings } from "@/lib/check-in-storage";
import {
  CheckInLayout,
  CheckInButton,
  MissedDayButton,
  DoneState,
  EveningReminder,
  RewardReveal,
  JourneyTimeline,
  DayDetailModal,
} from "@/components/check-in";
import type { Contract } from "@/types/contract";
import type { DayStatus } from "@/types/check-in";

type PageState = "loading" | "pending" | "revealing" | "done";

interface DayInfo {
  dayNumber: number;
  status: DayStatus;
  rewardAmount?: number;
}

/**
 * Main check-in page component.
 *
 * Route: /check-in
 * Primary screen during active cycle.
 *
 * Features:
 * - Loads contract on mount
 * - Redirects to /contract/new if no contract
 * - Full check-in flow: pending -> revealing -> done
 * - Journey timeline with day detail modal
 * - Automatic missed day detection
 */
export default function CheckInPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [contract, setContract] = useState<Contract | null>(null);
  const [showEvening, setShowEvening] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Store state
  const initialize = useCheckInStore((state) => state.initialize);
  const completeCheckIn = useCheckInStore((state) => state.completeCheckIn);
  const markDayMissed = useCheckInStore((state) => state.markDayMissed);
  const setRevealing = useCheckInStore((state) => state.setRevealing);
  const currentDayNumber = useCheckInStore((state) => state.currentDayNumber);
  const checkInHistory = useCheckInStore((state) => state.checkInHistory);
  const revealedReward = useCheckInStore((state) => state.revealedReward);
  const getCumulativeTotalForDay = useCheckInStore((state) => state.getCumulativeTotalForDay);
  const getDayStatus = useCheckInStore((state) => state.getDayStatus);
  const hasCheckedInToday = useCheckInStore((state) => state.hasCheckedInToday);
  const getRewardForDay = useCheckInStore((state) => state.getRewardForDay);

  // Compute total earned directly from subscribed checkInHistory to ensure reactivity
  const totalEarned = useMemo(() => {
    if (!contract) return 0;
    return calculateCumulativeEarnings(checkInHistory, contract.duration);
  }, [checkInHistory, contract]);

  // Initialize on mount
  useEffect(() => {
    const loadedContract = loadContract();

    if (!loadedContract) {
      router.push("/contract/new");
      return;
    }

    setContract(loadedContract);
    initialize(loadedContract);
  }, [router, initialize]);

  // Determine page state after initialization
  useEffect(() => {
    if (!contract) return;

    const checkedIn = hasCheckedInToday();
    if (checkedIn) {
      setPageState("done");
    } else {
      setPageState("pending");
      setShowEvening(isEvening());
    }
  }, [contract, currentDayNumber, checkInHistory, hasCheckedInToday]);

  // Handle check-in button tap
  const handleCheckIn = () => {
    const reward = getRewardForDay(currentDayNumber);
    setRevealing(true, reward);
    completeCheckIn();
    setPageState("revealing");
  };

  // Handle reward reveal completion
  const handleRevealComplete = () => {
    setRevealing(false, null);
    setPageState("done");
  };

  // Handle missed button tap
  const handleMarkMissed = () => {
    markDayMissed();
    setPageState("done");
  };

  // Handle day tap in timeline
  const handleDayTap = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  // Close day detail modal
  const handleCloseModal = () => {
    setSelectedDay(null);
  };

  // Loading state
  if (pageState === "loading" || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Contract hasn't started yet
  if (currentDayNumber === 0) {
    return (
      <CheckInLayout contract={contract} currentDayNumber={0}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
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
      </CheckInLayout>
    );
  }

  // Contract is complete
  if (currentDayNumber > contract.duration) {
    return (
      <CheckInLayout
        contract={contract}
        currentDayNumber={currentDayNumber}
        timeline={
          <JourneyTimeline
            days={buildDays(contract.duration, currentDayNumber, checkInHistory, contract)}
            currentDayNumber={currentDayNumber}
            totalEarned={totalEarned}
            onDayTap={handleDayTap}
          />
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
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
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You&apos;ve completed your {contract.duration}-day goal
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-8 py-6">
            <p className="text-sm text-green-700 dark:text-green-300 mb-1">
              Total earned
            </p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              ${totalEarned}
            </p>
          </div>
        </div>

        {/* Day detail modal */}
        {selectedDay !== null && (
          <DayDetailModal
            isOpen={true}
            onClose={handleCloseModal}
            dayNumber={selectedDay}
            status={getDayStatus(selectedDay)}
            rewardAmount={checkInHistory[selectedDay]?.rewardAmount}
            cumulativeTotal={getCumulativeTotalForDay(selectedDay)}
            startDate={contract.startDate}
            createdAt={contract.createdAt}
          />
        )}
      </CheckInLayout>
    );
  }

  // Build day info for timeline
  const days = buildDays(contract.duration, currentDayNumber, checkInHistory, contract);
  const todayRecord = checkInHistory[currentDayNumber];
  const todayReward = todayRecord?.rewardAmount ?? 0;
  const todayCompleted = todayRecord?.status === "completed";

  return (
    <CheckInLayout
      contract={contract}
      currentDayNumber={currentDayNumber}
      timeline={
        <JourneyTimeline
          days={days}
          currentDayNumber={currentDayNumber}
          totalEarned={totalEarned}
          onDayTap={handleDayTap}
        />
      }
    >
      {/* Main content based on page state */}
      {pageState === "pending" && (
        <div className="flex-1 flex flex-col justify-center">
          {/* Evening reminder */}
          {showEvening && (
            <div className="mb-6">
              <EveningReminder visible={true} />
            </div>
          )}

          {/* Check-in prompt */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Did you do it today?
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {contract.habitTitle}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <CheckInButton onCheckIn={handleCheckIn} />
            <div className="flex justify-center">
              <MissedDayButton onMarkMissed={handleMarkMissed} />
            </div>
          </div>
        </div>
      )}

      {pageState === "revealing" && (
        <div className="flex-1 flex flex-col justify-center">
          <RewardReveal
            rewardAmount={revealedReward ?? 0}
            onComplete={handleRevealComplete}
          />
        </div>
      )}

      {pageState === "done" && (
        <div className="flex-1 flex flex-col justify-center">
          <DoneState
            completed={todayCompleted}
            rewardAmount={todayReward}
            totalEarned={totalEarned}
            dayNumber={currentDayNumber}
            totalDays={contract.duration}
          />
        </div>
      )}

      {/* Day detail modal */}
      {selectedDay !== null && (
        <DayDetailModal
          isOpen={true}
          onClose={handleCloseModal}
          dayNumber={selectedDay}
          status={getDayStatus(selectedDay)}
          rewardAmount={checkInHistory[selectedDay]?.rewardAmount}
          cumulativeTotal={getCumulativeTotalForDay(selectedDay)}
          startDate={contract.startDate}
          createdAt={contract.createdAt}
        />
      )}
    </CheckInLayout>
  );
}

/**
 * Build day info array for the timeline.
 */
function buildDays(
  duration: number,
  currentDayNumber: number,
  checkInHistory: Record<number, { status: DayStatus; rewardAmount?: number }>,
  contract: Contract
): DayInfo[] {
  const days: DayInfo[] = [];

  for (let day = 1; day <= duration; day++) {
    const record = checkInHistory[day];
    let status: DayStatus = "pending";
    let rewardAmount: number | undefined;

    if (record) {
      status = record.status;
      rewardAmount = record.rewardAmount;
    } else if (day < currentDayNumber) {
      // Past day with no record should be missed
      status = "missed";
    }

    // For completed days without a stored reward, get from schedule
    if (status === "completed" && rewardAmount === undefined) {
      const reward = contract.rewardSchedule.rewards.find((r) => r.day === day);
      rewardAmount = reward?.amount;
    }

    days.push({
      dayNumber: day,
      status,
      rewardAmount,
    });
  }

  return days;
}
