/**
 * Strategic Tests for Strava Verification Utilities (Gap Analysis)
 *
 * These 8 tests fill critical gaps in test coverage for the Strava integration:
 * 1-2. Activity type matching logic
 * 3-4. Date grouping for activities
 * 5-6. Finding matching days with activity types
 * 7-8. Retroactive verification boundary (unrevealed days only)
 *
 * Note: Date-sensitive tests use relative dates to avoid timezone issues.
 */

import {
  getLocalDateString,
  hasMatchingActivity,
  groupActivitiesByDate,
  findMatchingDays,
  getContractDayDate,
  type StravaActivity,
} from "../strava-verification";

describe("Strava Verification - Gap Analysis Tests", () => {
  describe("Activity Type Matching", () => {
    const mockActivities: StravaActivity[] = [
      { id: 1, type: "Run", start_date: "2024-01-15T08:00:00Z" },
      { id: 2, type: "Ride", start_date: "2024-01-15T10:00:00Z" },
      { id: 3, type: "Yoga", start_date: "2024-01-15T18:00:00Z" },
    ];

    it("returns true when any activity matches one of selected types", () => {
      const result = hasMatchingActivity(mockActivities, ["Swim", "Yoga", "Hike"]);
      expect(result).toBe(true);
    });

    it("handles case-insensitive matching", () => {
      const result = hasMatchingActivity(mockActivities, ["run", "RIDE"]);
      expect(result).toBe(true);
    });
  });

  describe("Activity Grouping by Date", () => {
    it("groups activities by their local date correctly", () => {
      // Use activities at noon UTC to minimize timezone edge cases
      const activities: StravaActivity[] = [
        { id: 1, type: "Run", start_date: "2024-01-15T12:00:00Z" },
        { id: 2, type: "Ride", start_date: "2024-01-15T13:00:00Z" },
        { id: 3, type: "Swim", start_date: "2024-01-16T12:00:00Z" },
      ];

      const grouped = groupActivitiesByDate(activities);

      // Should have 2 date groups
      expect(grouped.size).toBe(2);

      // First date should have 2 activities
      const firstDateKey = getLocalDateString("2024-01-15T12:00:00Z");
      const firstDateActivities = grouped.get(firstDateKey);
      expect(firstDateActivities?.length).toBe(2);
    });

    it("contract day dates differ for today vs tomorrow start", () => {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      const createdAt = now.toISOString();

      const day1Today = getContractDayDate("today", createdAt, 1);
      const day1Tomorrow = getContractDayDate("tomorrow", createdAt, 1);

      // The dates should be different (one day apart)
      expect(day1Today).not.toBe(day1Tomorrow);
    });
  });

  describe("Finding Matching Days", () => {
    it("finds days with matching activities correctly", () => {
      // Create contract start date at local midnight today
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const createdAt = now.toISOString();

      // Create activities for day 1 and day 3
      const day1Date = new Date(now);
      const day3Date = new Date(now);
      day3Date.setDate(day3Date.getDate() + 2);

      const activities: StravaActivity[] = [
        { id: 1, type: "Run", start_date: day1Date.toISOString() },
        { id: 2, type: "Ride", start_date: day3Date.toISOString() },
      ];

      const matchingDays = findMatchingDays(
        activities,
        ["Run", "Ride"],
        "today",
        createdAt,
        [1, 2, 3, 4, 5]
      );

      // Day 1 has Run, Day 3 has Ride
      expect(matchingDays).toContain(1);
      expect(matchingDays).toContain(3);
      expect(matchingDays).not.toContain(2);
    });

    it("only checks specified days in daysToCheck array", () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const createdAt = now.toISOString();

      // Create activities for days 1, 2, and 3
      const activities: StravaActivity[] = [];
      for (let i = 0; i < 3; i++) {
        const dayDate = new Date(now);
        dayDate.setDate(dayDate.getDate() + i);
        activities.push({
          id: i + 1,
          type: "Run",
          start_date: dayDate.toISOString(),
        });
      }

      // Only check days 3, 4, 5 (simulating days 1, 2 are revealed)
      const matchingDays = findMatchingDays(
        activities,
        ["Run"],
        "today",
        createdAt,
        [3, 4, 5]
      );

      // Days 1 and 2 have activities but are not in daysToCheck
      expect(matchingDays).not.toContain(1);
      expect(matchingDays).not.toContain(2);
      // Day 3 has activity and is in daysToCheck
      expect(matchingDays).toContain(3);
    });
  });

  describe("Retroactive Verification Boundary", () => {
    /**
     * These tests verify the critical business rule:
     * Only unrevealed days can be retroactively verified.
     * Once a day is revealed, it's locked and cannot be changed.
     */
    it("only verifies unrevealed days, not revealed ones", () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const createdAt = now.toISOString();

      // Create activities for days 1, 2, 3, 4
      const activities: StravaActivity[] = [];
      for (let i = 0; i < 4; i++) {
        const dayDate = new Date(now);
        dayDate.setDate(dayDate.getDate() + i);
        activities.push({
          id: i + 1,
          type: "Run",
          start_date: dayDate.toISOString(),
        });
      }

      // Simulate: Days 1 and 2 are revealed, Days 3, 4, 5 are unrevealed
      const unrevealedDays = [3, 4, 5];

      const verifiedDays = findMatchingDays(
        activities,
        ["Run"],
        "today",
        createdAt,
        unrevealedDays
      );

      // Days 1 and 2 have activities but are revealed - should NOT be in result
      expect(verifiedDays).not.toContain(1);
      expect(verifiedDays).not.toContain(2);

      // Days 3 and 4 have activities and are unrevealed - should be verified
      expect(verifiedDays).toContain(3);
      expect(verifiedDays).toContain(4);

      // Day 5 has no activity - should not be verified
      expect(verifiedDays).not.toContain(5);
    });

    it("returns empty when all days with activities are already revealed", () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const createdAt = now.toISOString();

      // Create activities for days 1 and 2 only
      const activities: StravaActivity[] = [];
      for (let i = 0; i < 2; i++) {
        const dayDate = new Date(now);
        dayDate.setDate(dayDate.getDate() + i);
        activities.push({
          id: i + 1,
          type: "Run",
          start_date: dayDate.toISOString(),
        });
      }

      // Days 1 and 2 are revealed, only checking days 3, 4, 5
      const unrevealedDays = [3, 4, 5];

      const verifiedDays = findMatchingDays(
        activities,
        ["Run"],
        "today",
        createdAt,
        unrevealedDays
      );

      // No unrevealed days have matching activities
      expect(verifiedDays).toEqual([]);
    });
  });
});
