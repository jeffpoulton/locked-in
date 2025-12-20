"use client";

import { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateScheduleInputSchema } from "@/schemas/reward-simulator";
import type {
  RewardSchedule,
  DayBreakdown,
  GenerateScheduleInput,
} from "@/schemas/reward-simulator";

/**
 * Admin page for testing and visualizing the VIDC reward allocation algorithm.
 *
 * Features:
 * - Configure contract parameters (duration, deposit, seed)
 * - Generate and view reward schedules
 * - Simulate completion scenarios (manual + presets)
 * - Real-time outcome calculations
 */
export default function RewardSimulatorPage() {
  // Form state
  const [duration, setDuration] = useState(14);
  const [depositAmount, setDepositAmount] = useState(500);
  const [seed, setSeed] = useState(() => `contract-${Date.now()}`);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Schedule state
  const [schedule, setSchedule] = useState<RewardSchedule | null>(null);

  // Simulation state - track which days are completed
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // Generate schedule mutation
  const generateMutation = useMutation({
    mutationFn: async (input: GenerateScheduleInput) => {
      const response = await fetch("/api/admin/reward-simulator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate schedule");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSchedule({
        seed: data.seed,
        duration: data.totalDays,
        depositAmount: data.depositAmount,
        rewardDayCount: data.rewardDayCount,
        rewards: data.rewards,
      });
      // Reset simulation when new schedule is generated
      setCompletedDays(new Set());
    },
  });

  // Handle form submission
  const handleGenerate = useCallback(() => {
    setFormErrors({});

    const validation = generateScheduleInputSchema.safeParse({
      seed,
      duration,
      depositAmount,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      const flattened = validation.error.flatten();
      if (flattened.fieldErrors.seed?.[0]) {
        errors.seed = flattened.fieldErrors.seed[0];
      }
      if (flattened.fieldErrors.duration?.[0]) {
        errors.duration = flattened.fieldErrors.duration[0];
      }
      if (flattened.fieldErrors.depositAmount?.[0]) {
        errors.depositAmount = flattened.fieldErrors.depositAmount[0];
      }
      setFormErrors(errors);
      return;
    }

    generateMutation.mutate(validation.data);
  }, [seed, duration, depositAmount, generateMutation]);

  // Generate new random seed
  const handleNewSeed = useCallback(() => {
    setSeed(`contract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  }, []);

  // Toggle a day's completion status
  const toggleDay = useCallback((day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }, []);

  // Apply preset scenario
  const applyPreset = useCallback(
    (preset: "perfect" | "miss-all" | "weekend-skipper" | "random-80") => {
      if (!schedule) return;

      const allDays = Array.from({ length: schedule.duration }, (_, i) => i + 1);

      switch (preset) {
        case "perfect":
          setCompletedDays(new Set(allDays));
          break;

        case "miss-all":
          setCompletedDays(new Set());
          break;

        case "weekend-skipper":
          // Assuming day 1 is Monday, skip Saturdays (6) and Sundays (7)
          setCompletedDays(
            new Set(
              allDays.filter((day) => {
                const dayOfWeek = ((day - 1) % 7) + 1;
                return dayOfWeek !== 6 && dayOfWeek !== 7;
              })
            )
          );
          break;

        case "random-80":
          // Use seeded random for consistency
          const shuffled = [...allDays];
          let seedHash = 0;
          for (let i = 0; i < schedule.seed.length; i++) {
            seedHash = (seedHash * 33) ^ schedule.seed.charCodeAt(i);
          }
          for (let i = shuffled.length - 1; i > 0; i--) {
            seedHash = (seedHash * 1103515245 + 12345) & 0x7fffffff;
            const j = seedHash % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const targetCount = Math.round(schedule.duration * 0.8);
          setCompletedDays(new Set(shuffled.slice(0, targetCount)));
          break;
      }
    },
    [schedule]
  );

  // Calculate simulation outcomes in real-time
  const simulationResults = useMemo(() => {
    if (!schedule) return null;

    const rewardsByDay = new Map(schedule.rewards.map((r) => [r.day, r.amount]));
    let totalRecovered = 0;
    let totalForfeited = 0;
    const dayBreakdown: DayBreakdown[] = [];

    for (let day = 1; day <= schedule.duration; day++) {
      const hasReward = rewardsByDay.has(day);
      const rewardAmount = rewardsByDay.get(day) ?? 0;
      const completed = completedDays.has(day);
      const recovered = completed && hasReward ? rewardAmount : 0;
      const forfeited = !completed && hasReward ? rewardAmount : 0;

      totalRecovered += recovered;
      totalForfeited += forfeited;

      dayBreakdown.push({
        day,
        hasReward,
        rewardAmount,
        completed,
        recovered,
        forfeited,
      });
    }

    return {
      totalRecovered: Math.round(totalRecovered * 100) / 100,
      totalForfeited: Math.round(totalForfeited * 100) / 100,
      dayBreakdown,
    };
  }, [schedule, completedDays]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-foreground">
            Reward Simulator
          </h1>
          <p className="text-gray-500 mt-2">
            Test and visualize VIDC reward allocation algorithm
          </p>
        </header>

        {/* Configuration Panel */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Duration Input */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium mb-2"
              >
                Duration (days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="duration"
                  min={7}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min={7}
                  max={30}
                  value={duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setDuration(val);
                  }}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
              </div>
              {formErrors.duration && (
                <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>
              )}
            </div>

            {/* Deposit Amount Input */}
            <div>
              <label
                htmlFor="depositAmount"
                className="block text-sm font-medium mb-2"
              >
                Deposit Amount ($)
              </label>
              <input
                type="number"
                id="depositAmount"
                min={100}
                max={1000}
                step={50}
                value={depositAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setDepositAmount(val);
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="100 - 1000"
              />
              {formErrors.depositAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.depositAmount}
                </p>
              )}
            </div>

            {/* Seed Input */}
            <div>
              <label htmlFor="seed" className="block text-sm font-medium mb-2">
                Seed
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="contract-id"
                />
                <button
                  type="button"
                  onClick={handleNewSeed}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                  title="Generate new seed"
                >
                  New
                </button>
              </div>
              {formErrors.seed && (
                <p className="text-red-500 text-sm mt-1">{formErrors.seed}</p>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generateMutation.isPending ? "Generating..." : "Generate Schedule"}
            </button>
            {generateMutation.isError && (
              <p className="text-red-500 text-sm mt-2">
                {generateMutation.error.message}
              </p>
            )}
          </div>
        </section>

        {/* Schedule Display */}
        {schedule && (
          <>
            {/* Summary Statistics */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Days
                  </p>
                  <p className="text-2xl font-bold">{schedule.duration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reward Days
                  </p>
                  <p className="text-2xl font-bold">{schedule.rewardDayCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reward Percentage
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.round((schedule.rewardDayCount / schedule.duration) * 100)}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deposit
                  </p>
                  <p className="text-2xl font-bold">
                    ${schedule.depositAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </section>

            {/* Simulation Controls */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold">Simulation Controls</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset("perfect")}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    Perfect Completion
                  </button>
                  <button
                    onClick={() => applyPreset("miss-all")}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    Complete Miss
                  </button>
                  <button
                    onClick={() => applyPreset("weekend-skipper")}
                    className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  >
                    Weekend Skipper
                  </button>
                  <button
                    onClick={() => applyPreset("random-80")}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Random 80%
                  </button>
                </div>
              </div>

              {/* Running Totals */}
              {simulationResults && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Recovered Amount
                    </p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      ${simulationResults.totalRecovered.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-500 dark:text-green-400 mt-1">
                      {Math.round(
                        (simulationResults.totalRecovered / schedule.depositAmount) *
                          100
                      )}
                      % of deposit
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Forfeited Amount
                    </p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                      ${simulationResults.totalForfeited.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      {Math.round(
                        (simulationResults.totalForfeited / schedule.depositAmount) *
                          100
                      )}
                      % of deposit
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Reward Table */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">
                  Day-by-Day Schedule
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Click on a day to toggle completion status
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Has Reward
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Outcome
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {simulationResults?.dayBreakdown.map((day) => (
                      <tr
                        key={day.day}
                        onClick={() => toggleDay(day.day)}
                        className={`cursor-pointer transition-colors ${
                          day.hasReward
                            ? day.completed
                              ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                              : "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Day {day.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {day.hasReward ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Reward
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {day.hasReward ? (
                            <span className="font-medium">
                              ${day.rewardAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.completed}
                              onChange={() => toggleDay(day.day)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              {day.completed ? "Complete" : "Missed"}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {day.hasReward ? (
                            day.completed ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                +${day.recovered.toFixed(2)} recovered
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                -${day.forfeited.toFixed(2)} forfeited
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400">No financial impact</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Empty State */}
        {!schedule && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">No Schedule Generated</h3>
              <p className="text-sm">
                Configure contract parameters above and click "Generate Schedule" to
                see reward distribution
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
