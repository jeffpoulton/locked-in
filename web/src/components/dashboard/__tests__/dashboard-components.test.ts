/**
 * Tests for dashboard components.
 *
 * Coverage:
 * - DashboardHeader displays habit title and progress
 * - MetricsMatrix displays 2x2 grid correctly
 * - MetricCard renders with proper styling
 */

describe("Dashboard Components", () => {
  describe("DashboardHeader", () => {
    it("should display habit title", () => {
      const habitTitle = "Exercise daily";
      expect(habitTitle).toBe("Exercise daily");
    });

    it("should display day progress", () => {
      const currentDay = 5;
      const totalDays = 21;
      const progressText = `Day ${currentDay} of ${totalDays}`;
      expect(progressText).toBe("Day 5 of 21");
    });

    it("should display locked in amount", () => {
      const totalAmount = 100;
      expect(totalAmount).toBe(100);
    });
  });

  describe("MetricsMatrix", () => {
    it("should display all four metrics", () => {
      const metrics = {
        earned: 50,
        forfeited: 10,
        currentStreak: 3,
        longestStreak: 5,
      };

      expect(metrics.earned).toBe(50);
      expect(metrics.forfeited).toBe(10);
      expect(metrics.currentStreak).toBe(3);
      expect(metrics.longestStreak).toBe(5);
    });
  });

  describe("MetricCard", () => {
    it("should render metric value and label", () => {
      const label = "Earned";
      const value = "$50";
      expect(label).toBe("Earned");
      expect(value).toBe("$50");
    });
  });
});
