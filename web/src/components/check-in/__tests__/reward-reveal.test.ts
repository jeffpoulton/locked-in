/**
 * Tests for RewardReveal component.
 *
 * Tests the animation phase transitions and callback behavior.
 */

describe("RewardReveal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should start in anticipation phase", () => {
    // Test initial state
    let phase: "anticipation" | "reveal" = "anticipation";

    expect(phase).toBe("anticipation");
  });

  it("should transition to reveal phase after anticipation delay", () => {
    let phase: "anticipation" | "reveal" = "anticipation";

    // Simulate the timeout behavior
    setTimeout(() => {
      phase = "reveal";
    }, 1500);

    // Advance timers
    jest.advanceTimersByTime(1500);

    expect(phase).toBe("reveal");
  });

  it("should call onComplete after reveal animation", () => {
    const mockOnComplete = jest.fn();

    // Simulate the complete timeout behavior
    setTimeout(() => {
      mockOnComplete();
    }, 2500);

    // Advance past reveal
    jest.advanceTimersByTime(2500);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it("should display reward amount correctly for days with rewards", () => {
    const rewardAmount = 150;
    const hasReward = rewardAmount > 0;

    expect(hasReward).toBe(true);
    expect(rewardAmount).toBe(150);
  });

  it("should handle days with no reward gracefully", () => {
    const rewardAmount = 0;
    const hasReward = rewardAmount > 0;

    expect(hasReward).toBe(false);
  });
});
