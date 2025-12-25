"use client";

import { useEffect } from "react";
import { loadContract, saveContract } from "@/lib/contract-storage";
import { adjustCheckInTimestamps } from "@/lib/check-in-storage";
import { useCheckInStore } from "@/stores/check-in-store";

/**
 * Flag to indicate dev mode is currently manipulating time.
 * Used to suppress auto-verification during time travel operations.
 */
let isDevModeTimeTravel = false;

export function isDevModeTimeTraveling(): boolean {
  return isDevModeTimeTravel;
}

/**
 * Development mode keyboard shortcuts for testing cycle progression.
 *
 * Only active in development mode.
 *
 * Keyboard shortcuts:
 * - Ctrl+Shift+ArrowRight: Advance 1 day forward (move contract start back 1 day)
 * - Ctrl+Shift+ArrowLeft: Go back 1 day (move contract start forward 1 day)
 * - Ctrl+Shift+C: Auto-complete current day
 * - Ctrl+Shift+M: Auto-miss current day
 * - Ctrl+Shift+R: Reset contract time to today
 * - Ctrl+Shift+H: Show help (console log of shortcuts)
 *
 * Window functions (use in browser console):
 * - window.devAdvanceDay(days?: number): Advance by N days (default 1)
 * - window.devGoBackDay(days?: number): Go back N days (default 1)
 * - window.devCompleteDay(): Mark current day as completed
 * - window.devMissDay(): Mark current day as missed
 * - window.devResetTime(): Reset contract to today
 * - window.devSkipToDay(dayNumber: number): Skip to specific day
 * - window.devHelp(): Show available dev commands
 */
export function useDevMode() {
  const completeCheckIn = useCheckInStore((state) => state.completeCheckIn);
  const markDayMissed = useCheckInStore((state) => state.markDayMissed);
  const initialize = useCheckInStore((state) => state.initialize);

  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== "development") return;

    // Advance time by moving contract createdAt backwards
    const advanceDay = (days: number = 1) => {
      const contract = loadContract();
      if (!contract) {
        console.warn("[DevMode] No contract found");
        return;
      }

      // Set flag to prevent auto-verification during time travel
      isDevModeTimeTravel = true;

      const createdAt = new Date(contract.createdAt);
      createdAt.setDate(createdAt.getDate() - days);
      const updatedContract = { ...contract, createdAt: createdAt.toISOString() };

      saveContract(updatedContract);

      // Also adjust check-in timestamps to match the time shift
      // Moving contract back means check-ins also move back (negative delta)
      adjustCheckInTimestamps(contract.id, -days);

      console.log(`[DevMode] Advanced ${days} day(s) forward. Contract now starts: ${createdAt.toLocaleDateString()}`);

      // Reinitialize store with updated contract (should trigger re-renders)
      initialize(updatedContract);

      // Clear flag after a short delay to allow React to settle
      setTimeout(() => {
        isDevModeTimeTravel = false;
      }, 200);
    };

    // Go back in time by moving contract createdAt forward
    const goBackDay = (days: number = 1) => {
      const contract = loadContract();
      if (!contract) {
        console.warn("[DevMode] No contract found");
        return;
      }

      // Set flag to prevent auto-verification during time travel
      isDevModeTimeTravel = true;

      const createdAt = new Date(contract.createdAt);
      createdAt.setDate(createdAt.getDate() + days);
      const updatedContract = { ...contract, createdAt: createdAt.toISOString() };

      saveContract(updatedContract);

      // Also adjust check-in timestamps to match the time shift
      // Moving contract forward means check-ins also move forward (positive delta)
      adjustCheckInTimestamps(contract.id, days);

      console.log(`[DevMode] Went back ${days} day(s). Contract now starts: ${createdAt.toLocaleDateString()}`);

      // Reinitialize store with updated contract (should trigger re-renders)
      initialize(updatedContract);

      // Clear flag after a short delay to allow React to settle
      setTimeout(() => {
        isDevModeTimeTravel = false;
      }, 200);
    };

    // Auto-complete current day and advance
    const completeDay = () => {
      completeCheckIn();
      console.log("[DevMode] ✅ Current day marked as completed, advancing to next day...");

      // Advance to next day after completing
      setTimeout(() => {
        advanceDay(1);
      }, 100);
    };

    // Auto-miss current day and advance
    const missDay = () => {
      markDayMissed();
      console.log("[DevMode] ❌ Current day marked as missed, advancing to next day...");

      // Advance to next day after missing
      setTimeout(() => {
        advanceDay(1);
      }, 100);
    };

    // Reset contract time to today
    const resetTime = () => {
      const contract = loadContract();
      if (!contract) {
        console.warn("[DevMode] No contract found");
        return;
      }

      // Set flag to prevent auto-verification during time travel
      isDevModeTimeTravel = true;

      // Calculate how many days we're shifting
      const oldCreatedAt = new Date(contract.createdAt);
      const newCreatedAt = new Date();
      const msDelta = newCreatedAt.getTime() - oldCreatedAt.getTime();
      const daysDelta = Math.round(msDelta / (24 * 60 * 60 * 1000));

      const updatedContract = { ...contract, createdAt: newCreatedAt.toISOString() };
      saveContract(updatedContract);

      // Adjust check-in timestamps by the same amount
      adjustCheckInTimestamps(contract.id, daysDelta);

      console.log("[DevMode] Contract time reset to today");

      // Reinitialize store with updated contract (should trigger re-renders)
      initialize(updatedContract);

      // Clear flag after a short delay to allow React to settle
      setTimeout(() => {
        isDevModeTimeTravel = false;
      }, 200);
    };

    // Skip to specific day
    const skipToDay = (dayNumber: number) => {
      const contract = loadContract();
      if (!contract) {
        console.warn("[DevMode] No contract found");
        return;
      }

      if (dayNumber < 1 || dayNumber > contract.duration) {
        console.warn(`[DevMode] Day ${dayNumber} is out of range (1-${contract.duration})`);
        return;
      }

      // Set flag to prevent auto-verification during time travel
      isDevModeTimeTravel = true;

      // Calculate how many days to go back
      const daysToAdvance = dayNumber - 1;
      const oldCreatedAt = new Date(contract.createdAt);
      const newCreatedAt = new Date(contract.createdAt);

      // Adjust based on start date
      if (contract.startDate === "tomorrow") {
        newCreatedAt.setDate(newCreatedAt.getDate() - daysToAdvance + 1);
      } else {
        newCreatedAt.setDate(newCreatedAt.getDate() - daysToAdvance);
      }

      // Calculate the delta in days between old and new createdAt
      const msDelta = newCreatedAt.getTime() - oldCreatedAt.getTime();
      const daysDelta = Math.round(msDelta / (24 * 60 * 60 * 1000));

      const updatedContract = { ...contract, createdAt: newCreatedAt.toISOString() };
      saveContract(updatedContract);

      // Adjust check-in timestamps by the same amount
      adjustCheckInTimestamps(contract.id, daysDelta);

      console.log(`[DevMode] Skipped to Day ${dayNumber}. Contract now starts: ${newCreatedAt.toLocaleDateString()}`);

      // Reinitialize store with updated contract (should trigger re-renders)
      initialize(updatedContract);

      // Clear flag after a short delay to allow React to settle
      setTimeout(() => {
        isDevModeTimeTravel = false;
      }, 200);
    };

    // Show help
    const showHelp = () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║              🛠️  DEV MODE - Cycle Testing Tools            ║
╠════════════════════════════════════════════════════════════╣
║  Keyboard Shortcuts:                                       ║
║  • Ctrl+Shift+→      Advance 1 day forward                 ║
║  • Ctrl+Shift+←      Go back 1 day                         ║
║  • Ctrl+Shift+C      Complete day & advance (unrevealed)   ║
║  • Ctrl+Shift+M      Miss day & advance (unrevealed)       ║
║  • Ctrl+Shift+R      Reset time to today                   ║
║  • Ctrl+Shift+H      Show this help                        ║
╠════════════════════════════════════════════════════════════╣
║  Console Functions:                                        ║
║  • window.devAdvanceDay(n)      Advance N days             ║
║  • window.devGoBackDay(n)       Go back N days             ║
║  • window.devCompleteDay()      Complete & advance         ║
║  • window.devMissDay()          Miss & advance             ║
║  • window.devResetTime()        Reset to today             ║
║  • window.devSkipToDay(n)       Jump to day N              ║
║  • window.devDebugKeys()        Debug keyboard events      ║
║  • window.devHelp()             Show this help             ║
╚════════════════════════════════════════════════════════════╝
      `);
    };

    // Debug keyboard events
    const debugKeyboard = () => {
      console.log("[DevMode] 🔍 Keyboard debug mode enabled. Press any Ctrl+Shift combo to see event details...");
      const debugHandler = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey) {
          console.log({
            key: e.key,
            code: e.code,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
          });
        }
      };
      window.addEventListener("keydown", debugHandler);
      setTimeout(() => {
        window.removeEventListener("keydown", debugHandler);
        console.log("[DevMode] 🔍 Keyboard debug mode disabled");
      }, 10000);
    };

    // Expose to window for console access
    (window as any).devAdvanceDay = advanceDay;
    (window as any).devGoBackDay = goBackDay;
    (window as any).devCompleteDay = completeDay;
    (window as any).devMissDay = missDay;
    (window as any).devResetTime = resetTime;
    (window as any).devSkipToDay = skipToDay;
    (window as any).devHelp = showHelp;
    (window as any).devDebugKeys = debugKeyboard;

    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      // All shortcuts require Ctrl+Shift
      if (!e.ctrlKey || !e.shiftKey) return;

      // Use both e.key and e.code for better compatibility
      const key = e.key;
      const code = e.code;

      let handled = false;

      if (key === "ArrowRight" || code === "ArrowRight") {
        e.preventDefault();
        console.log("[DevMode] ⏩ Advancing 1 day");
        advanceDay(1);
        handled = true;
      } else if (key === "ArrowLeft" || code === "ArrowLeft") {
        e.preventDefault();
        console.log("[DevMode] ⏪ Going back 1 day");
        goBackDay(1);
        handled = true;
      } else if (key === "C" || key === "c" || code === "KeyC") {
        e.preventDefault();
        console.log("[DevMode] ✅ Completing current day");
        completeDay();
        handled = true;
      } else if (key === "M" || key === "m" || code === "KeyM") {
        e.preventDefault();
        console.log("[DevMode] ❌ Missing current day");
        missDay();
        handled = true;
      } else if (key === "R" || key === "r" || code === "KeyR") {
        e.preventDefault();
        console.log("[DevMode] 🔄 Resetting time");
        resetTime();
        handled = true;
      } else if (key === "H" || key === "h" || code === "KeyH") {
        e.preventDefault();
        showHelp();
        handled = true;
      }

      if (handled) {
        console.log(`[DevMode] Handled shortcut: Ctrl+Shift+${key || code}`);
      }
    };

    window.addEventListener("keydown", handleKeyboard, { capture: true });
    console.log("[DevMode] ⌨️  Keyboard shortcuts registered");

    // Show help on mount
    console.log("[DevMode] 🛠️  Dev mode active! Press Ctrl+Shift+H for help or use window.devHelp()");

    return () => {
      window.removeEventListener("keydown", handleKeyboard, { capture: true });

      // Clean up window functions
      delete (window as any).devAdvanceDay;
      delete (window as any).devGoBackDay;
      delete (window as any).devCompleteDay;
      delete (window as any).devMissDay;
      delete (window as any).devResetTime;
      delete (window as any).devSkipToDay;
      delete (window as any).devDebugKeys;
      delete (window as any).devHelp;
    };
  }, [completeCheckIn, markDayMissed, initialize]);
}
