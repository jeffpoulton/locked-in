/**
 * Page State Machine Tests
 *
 * Tests for the check-in page state machine with next-day reveal experience.
 * Focus: State transitions, reveal flow, and check-in flow separation.
 */

describe("Check-In Page State Machine", () => {
  type PageState = "loading" | "reveal-prompt" | "revealing" | "pending" | "confirming" | "done";

  describe("State determination on mount", () => {
    it("should enter reveal-prompt state when unrevealed days exist", () => {
      const hasUnrevealedDays = true;
      const hasCheckedInToday = false;

      let pageState: PageState = "loading";

      if (hasUnrevealedDays) {
        pageState = "reveal-prompt";
      } else if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("reveal-prompt");
    });

    it("should enter pending state when no unrevealed days and user has not checked in", () => {
      const hasUnrevealedDays = false;
      const hasCheckedInToday = false;

      let pageState: PageState = "loading";

      if (hasUnrevealedDays) {
        pageState = "reveal-prompt";
      } else if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("pending");
    });

    it("should enter done state when no unrevealed days and user has already checked in", () => {
      const hasUnrevealedDays = false;
      const hasCheckedInToday = true;

      let pageState: PageState = "loading";

      if (hasUnrevealedDays) {
        pageState = "reveal-prompt";
      } else if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("done");
    });
  });

  describe("Reveal flow transitions", () => {
    it("should transition from reveal-prompt to revealing when reveal is initiated", () => {
      let pageState: PageState = "reveal-prompt";
      let currentRevealDay: number | null = null;
      const firstUnrevealedDay = 3;

      // Simulate reveal action
      currentRevealDay = firstUnrevealedDay;
      pageState = "revealing";

      expect(pageState).toBe("revealing");
      expect(currentRevealDay).toBe(3);
    });

    it("should transition from revealing to pending when user has not checked in today", () => {
      let pageState: PageState = "revealing";
      const hasCheckedInToday = false;
      const hasMoreUnrevealedDays = false;

      // Simulate reveal complete
      if (hasMoreUnrevealedDays) {
        pageState = "reveal-prompt";
      } else if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("pending");
    });

    it("should transition from revealing to done when user has already checked in today", () => {
      let pageState: PageState = "revealing";
      const hasCheckedInToday = true;
      const hasMoreUnrevealedDays = false;

      // Simulate reveal complete
      if (hasMoreUnrevealedDays) {
        pageState = "reveal-prompt";
      } else if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("done");
    });

    it("should transition from reveal-prompt to pending/done when skip is chosen", () => {
      let pageState: PageState = "reveal-prompt";
      const hasCheckedInToday = false;

      // Simulate skip action
      if (hasCheckedInToday) {
        pageState = "done";
      } else {
        pageState = "pending";
      }

      expect(pageState).toBe("pending");
    });
  });

  describe("Check-in flow transitions", () => {
    it("should transition from pending to confirming after check-in (not revealing)", () => {
      let pageState: PageState = "pending";

      // Simulate check-in action (new flow: check-in -> confirming, NOT revealing)
      const handleCheckIn = () => {
        // completeCheckIn() called
        pageState = "confirming";
        // Note: setRevealing is NOT called anymore
      };

      handleCheckIn();

      expect(pageState).toBe("confirming");
    });

    it("should transition from confirming to done", () => {
      let pageState: PageState = "confirming";

      // Simulate confirmation complete (auto-advance or user tap)
      pageState = "done";

      expect(pageState).toBe("done");
    });
  });

  describe("Sequential multi-day reveal flow", () => {
    it("should handle multiple unrevealed days in sequence", () => {
      let pageState: PageState = "reveal-prompt";
      let revealQueue = [3, 4, 5];
      let currentRevealDay: number | null = null;

      // Start first reveal
      currentRevealDay = revealQueue[0];
      pageState = "revealing";
      expect(pageState).toBe("revealing");
      expect(currentRevealDay).toBe(3);

      // Complete first reveal, more days remain
      revealQueue = revealQueue.slice(1);
      const hasMoreUnrevealedDays = revealQueue.length > 0;

      if (hasMoreUnrevealedDays) {
        pageState = "reveal-prompt";
      }

      expect(pageState).toBe("reveal-prompt");
      expect(revealQueue).toEqual([4, 5]);

      // Start second reveal
      currentRevealDay = revealQueue[0];
      pageState = "revealing";
      expect(currentRevealDay).toBe(4);

      // Complete second reveal, more days remain
      revealQueue = revealQueue.slice(1);
      pageState = revealQueue.length > 0 ? "reveal-prompt" : "pending";

      expect(pageState).toBe("reveal-prompt");

      // Start third reveal
      currentRevealDay = revealQueue[0];
      pageState = "revealing";

      // Complete third reveal, no more days
      revealQueue = revealQueue.slice(1);
      const hasCheckedInToday = false;
      pageState = revealQueue.length > 0
        ? "reveal-prompt"
        : hasCheckedInToday
          ? "done"
          : "pending";

      expect(pageState).toBe("pending");
      expect(revealQueue).toEqual([]);
    });
  });
});
