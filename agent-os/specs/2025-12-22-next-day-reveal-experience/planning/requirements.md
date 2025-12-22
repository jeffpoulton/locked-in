# Spec Requirements: Next-Day Reveal Experience

## Initial Description

**Next-Day Reveal Experience** — Build the reveal moment where users discover yesterday's reward status. This is the core engagement hook. Design for emotional impact: the anticipation, the reveal animation, the joy of recovery or sting of forfeiture.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the next-day reveal is triggered automatically when the user opens the app the next day and there's an unrevealed day in their history - is that correct, or should it require explicit user action (like tapping a "Reveal Yesterday" button)?
**Answer:** Explicit action required, BUT if user opens app with an unrevealed prior day, put them into reveal state automatically. User must still be able to choose to reveal OR log current day's action if they haven't already.

**Q2:** I'm thinking about the emotional journey for different scenarios. For a successful day (user completed yesterday), should we have anticipation + triumphant reveal? For a missed day (user didn't check in yesterday), should the reveal be a somber "reveal" showing forfeiture with animation, or a direct non-animated message?
**Answer:** Even if prior day was missed, user still gets the reveal experience to see if they got lucky (no reward allocated) or actually lost money. Full reveal experience for all scenarios.

**Q3:** For the next-day reveal, should we modify the messaging to reflect the retrospective nature (e.g., "Yesterday's result..." -> "Day 3: $12 earned!") or keep it similar to the current flow?
**Answer:** IMPORTANT: Current check-in flow accidentally conflated checking-in with revealing. These need to be COMPLETELY INDEPENDENT actions. Check-in should ALWAYS result in telling user to check back tomorrow to see reward status. Reveal flow should reveal yesterday's reward (if not already revealed) and indicate: lost reward, earned reward, or no reward was allocated.

**Q4:** What should happen if there are multiple unrevealed days (e.g., user was away for 3 days)?
**Answer:** Reveal one at a time - it's fun to reveal. If they missed revealing for multiple days, they always have the chance to reveal. Missing REPORTING for a day = considered they didn't do the activity (auto-missed).

**Q5:** After the reveal completes, I assume we transition to the current day's check-in flow (showing "Did you do it today?" for today's check-in). Is that correct?
**Answer:** Transition to today's check-in only if they haven't checked in yet. If they have already checked in, need to decide the right UX.

**Q6:** Should the reveal have any audio/haptic feedback to enhance the emotional moment?
**Answer:** Yes, but mobile-first web only for now - can do this later. Out of scope for initial implementation.

**Q7:** Is there anything that should explicitly be OUT of scope for this feature?
**Answer:** Push notifications - OUT. Shareable social content - OUT. Confetti animations - OUT.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: RewardReveal component - Path: `/Users/jeffpoulton/dev/projects/locked-in-2025-12-17-claude/web/src/components/check-in/RewardReveal.tsx`
- Feature: DoneState component - Path: `/Users/jeffpoulton/dev/projects/locked-in-2025-12-17-claude/web/src/components/check-in/DoneState.tsx`
- Feature: Check-in page flow - Path: `/Users/jeffpoulton/dev/projects/locked-in-2025-12-17-claude/web/src/app/check-in/page.tsx`
- Feature: Check-in store - Path: `/Users/jeffpoulton/dev/projects/locked-in-2025-12-17-claude/web/src/stores/check-in-store.ts`
- Components to potentially reuse: Animation patterns from RewardReveal.tsx (anticipation phase, scale-reveal, pulse-glow effects)
- Backend logic to reference: Check-in store state management patterns, reward schedule lookup logic

### Follow-up Questions

**Follow-up 1:** To confirm the refactored separation - Check-In = User reports habit completion ("Come back tomorrow to see reward status"), Reveal = Discover yesterday's reward outcome. Typical Day 3 session: Open app -> Reveal Day 2 -> Check-in Day 3 -> Done state. Is this correct?
**Answer:** Confirmed. This is the correct mental model.

**Follow-up 2:** Confirm the four reveal outcome states and their emotional tones:
- Completed + Reward Allocated = "You earned $X!" (celebration)
- Completed + No Reward = "No reward allocated" (neutral positive)
- Missed + Reward Allocated = "You forfeited $X" (sting/loss)
- Missed + No Reward = "No reward allocated - lucky break!" (relief)
**Answer:** Confirmed. These four states and emotional tones are correct.

**Follow-up 3:** Post-reveal when already checked in today - show "Done for today" state with summary of check-in status, "Come back tomorrow to reveal today's reward", and journey timeline. Does this work?
**Answer:** Confirmed. This approach works.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes available. Implementation should follow existing design patterns from RewardReveal.tsx and DoneState.tsx components.

## Requirements Summary

### Critical Refactor Required

**IMPORTANT**: The current check-in flow incorrectly conflates checking-in with revealing rewards. These MUST be separated into completely independent actions:

1. **Check-In Action**: User reports whether they completed their habit today
   - Result: Confirmation message + "Come back tomorrow to see your reward status"
   - Does NOT show any reward information for today

2. **Reveal Action**: User discovers yesterday's reward outcome
   - Shows anticipation animation followed by one of four outcome states
   - Completely separate from the check-in action

### Functional Requirements

**Reveal Flow:**
- When user opens app with unrevealed prior day(s), automatically enter reveal state
- User can choose to reveal OR proceed to check-in for current day
- Reveal uses anticipation phase (similar to existing RewardReveal) followed by outcome reveal
- Four distinct outcome states with appropriate emotional design:
  | Yesterday's Status | Reward Allocated? | Reveal Message | Emotional Tone |
  |---|---|---|---|
  | Completed | Yes ($X) | "You earned $X!" | Celebration |
  | Completed | No ($0) | "No reward allocated" | Neutral positive |
  | Missed | Yes ($X) | "You forfeited $X" | Sting/loss |
  | Missed | No ($0) | "No reward allocated - lucky break!" | Relief |

**Multiple Unrevealed Days:**
- Reveal one day at a time (sequential reveals are fun)
- Users always have the opportunity to reveal past unrevealed days
- Missing reporting for a day = auto-marked as missed (existing behavior)

**Post-Reveal Flow:**
- If user has NOT checked in today: Transition to check-in flow ("Did you do your habit today?")
- If user HAS already checked in today: Show "Done for today" state with:
  - Summary of today's check-in status
  - Message: "Come back tomorrow to reveal today's reward"
  - Journey timeline visible

**Check-In Flow (Refactored):**
- User reports habit completion (or marks as missed)
- Result message: "Thanks! Come back tomorrow to see your reward status"
- NO reward reveal on same-day check-in (this is the key change)

### Reusability Opportunities

- Extend existing `RewardReveal.tsx` animation patterns (anticipation phase, scale-reveal, pulse-glow)
- Extend existing `DoneState.tsx` visual styling for outcome states
- Reuse check-in store patterns for reveal state management
- Leverage existing `JourneyTimeline` component for post-reveal state

### Scope Boundaries

**In Scope:**
- Next-day reveal experience with four outcome states
- Separation of check-in and reveal as independent actions
- Refactor of existing check-in flow to remove same-day reward reveal
- Sequential reveal for multiple unrevealed days
- Post-reveal transition to check-in or done state

**Out of Scope:**
- Push notifications
- Shareable social content
- Confetti animations
- Audio/haptic feedback (deferred to future enhancement)

### Technical Considerations

- Must refactor existing `/check-in` page to separate concerns
- New reveal state management needed in check-in store (or new reveal store)
- Need to track which days have been "revealed" vs just "resolved"
- Existing `RewardReveal.tsx` component should be extended or a new `NextDayReveal.tsx` created
- Mobile-first web implementation
- Follow existing component patterns and animation utilities
