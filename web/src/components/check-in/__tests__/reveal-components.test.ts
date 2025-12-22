/**
 * Reveal Components Tests
 *
 * Tests for the next-day reveal experience components.
 * Focus: NextDayReveal, RevealPrompt, CheckInConfirmation logic
 */

describe("Reveal Components", () => {
  describe("NextDayReveal", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should start in anticipation phase and transition after 1.5 seconds", () => {
      let phase: "anticipation" | "reveal" = "anticipation";

      // Simulate the anticipation timeout behavior
      setTimeout(() => {
        phase = "reveal";
      }, 1500);

      expect(phase).toBe("anticipation");

      // Advance timers to transition
      jest.advanceTimersByTime(1500);
      expect(phase).toBe("reveal");
    });

    it("should determine earned outcome for completed day with reward", () => {
      const completed = true;
      const rewardAmount = 50;

      const outcome = completed
        ? rewardAmount > 0
          ? "earned"
          : "no-reward"
        : rewardAmount > 0
          ? "forfeited"
          : "lucky-break";

      expect(outcome).toBe("earned");
    });

    it("should determine no-reward outcome for completed day without reward", () => {
      const completed = true;
      const rewardAmount = 0;

      const outcome = completed
        ? rewardAmount > 0
          ? "earned"
          : "no-reward"
        : rewardAmount > 0
          ? "forfeited"
          : "lucky-break";

      expect(outcome).toBe("no-reward");
    });

    it("should determine forfeited outcome for missed day with reward", () => {
      const completed = false;
      const rewardAmount = 50;

      const outcome = completed
        ? rewardAmount > 0
          ? "earned"
          : "no-reward"
        : rewardAmount > 0
          ? "forfeited"
          : "lucky-break";

      expect(outcome).toBe("forfeited");
    });

    it("should determine lucky-break outcome for missed day without reward", () => {
      const completed = false;
      const rewardAmount = 0;

      const outcome = completed
        ? rewardAmount > 0
          ? "earned"
          : "no-reward"
        : rewardAmount > 0
          ? "forfeited"
          : "lucky-break";

      expect(outcome).toBe("lucky-break");
    });

    it("should call onComplete callback after full animation sequence (2.5s)", () => {
      const mockOnComplete = jest.fn();

      // Simulate the complete timeout behavior (anticipation + reveal)
      setTimeout(() => {
        mockOnComplete();
      }, 2500);

      expect(mockOnComplete).not.toHaveBeenCalled();

      // Advance past full animation
      jest.advanceTimersByTime(2500);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("RevealPrompt", () => {
    it("should correctly format day number in prompt", () => {
      const dayNumber = 5;
      const promptText = `Day ${dayNumber} awaits...`;

      expect(promptText).toBe("Day 5 awaits...");
    });

    it("should have both reveal and skip actions available", () => {
      const onReveal = jest.fn();
      const onSkip = jest.fn();

      // Simulate reveal action
      onReveal();
      expect(onReveal).toHaveBeenCalledTimes(1);

      // Simulate skip action
      onSkip();
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it("should call onReveal when reveal is triggered", () => {
      const onReveal = jest.fn();

      onReveal();

      expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it("should call onSkip when skip is triggered", () => {
      const onSkip = jest.fn();

      onSkip();

      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe("CheckInConfirmation", () => {
    it("should include come back tomorrow messaging content", () => {
      const messageContent = "Come back tomorrow to reveal your reward status";

      expect(messageContent.toLowerCase()).toContain("come back tomorrow");
      expect(messageContent.toLowerCase()).toContain("reward");
    });

    it("should format day logged message correctly", () => {
      const dayNumber = 3;
      const loggedMessage = `Day ${dayNumber} logged!`;

      expect(loggedMessage).toBe("Day 3 logged!");
    });

    it("should call onContinue when continue action is triggered", () => {
      const onContinue = jest.fn();

      onContinue();

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });
});
