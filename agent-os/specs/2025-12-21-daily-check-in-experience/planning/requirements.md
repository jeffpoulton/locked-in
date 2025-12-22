# Spec Requirements: Daily Check-In Experience

## Initial Description

Create the daily interface where users mark their habit as complete. Focus on the emotional design: the friction of commitment, the satisfaction of checking off, the anticipation of what tomorrow's reveal might show. Self-report only for now.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the check-in is a simple binary action - "I did it" vs not checking in (no "I failed today" option). The absence of a check-in by end of day = missed. Is that correct?
**Answer:** Yes, that's correct. Simple binary - either they check in or they don't.

**Q2:** I'm thinking the daily check-in should have a "reveal moment" showing today's reward amount AFTER they confirm completion. Should the reveal happen immediately on tap, or build anticipation with a brief animation/delay?
**Answer:** Yes, brief animation to build anticipation. Nothing too long - maybe 1-2 seconds of suspense before the reveal.

**Q3:** Should users be able to see their "journey so far" on this screen (mini calendar/timeline of the cycle showing completed days, today, and locked future days)? Or keep it minimal with just today's action?
**Answer:** Yes, show the journey. Users should see their progress through the cycle - it helps with motivation and commitment.

**Q4:** For the check-in confirmation, I assume a single tap/button press is sufficient (no "are you sure?" modal since this is a positive action). Correct?
**Answer:** Correct - single tap to confirm. No friction for the positive action.

**Q5:** The check-in window is the full calendar day (midnight to midnight in user's timezone). Should there be any visual indicator when they're "running late" (e.g., evening and haven't checked in)?
**Answer:** Good idea - yes, show a gentle reminder indicator in the evening. Nothing aggressive, just a subtle visual cue.

**Q6:** I'm assuming the check-in screen is the app's primary/home screen during an active cycle. Is that correct, or should it be accessed through navigation?
**Answer:** Yes, it should be the primary screen. When you open the app during an active cycle, you land on the check-in experience.

**Q7:** After check-in is complete for the day, should the screen show a "done" state with today's reward revealed, or transition to show tomorrow's preview (locked)?
**Answer:** Show the "done" state with today's reward revealed and visible. Tomorrow stays locked/mysterious - that's part of the anticipation.

**Q8:** Is there anything that should explicitly NOT be part of this check-in experience? Any features to defer to later phases?
**Answer:** No editing past days, no "undo" for check-ins, no verification/proof requirements (keep it self-report), no social/sharing features yet. Keep it focused on the personal ritual.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Goal Creation Wizard - Path: `/web/src/features/goals/`
  - Multi-step wizard pattern for creating cycles
  - Can reference for the "no active cycle" state wizard flow
- Feature: Reward Algorithm - Path: `/web/src/lib/reward-algorithm.ts`
  - Core reward calculation logic to display revealed rewards
- Feature: Existing UI Components - Path: `/web/src/components/ui/`
  - Reusable button, card, and animation components

### Follow-up Questions

**Follow-up 1:** For the "journey so far" view, I'm envisioning a horizontal timeline or calendar grid showing: Past days with completion status (checkmarks/X marks), Today highlighted as active, Future days locked/grayed out. Is that the right mental model, or were you thinking of a different visualization?
**Answer:** Yes, horizontal timeline/calendar grid is correct:
- Past days: Completed (checkmark) or missed (X), with revealed reward info visible
- Today: Highlighted as active check-in day
- Future days: Locked/grayed out, no reward info visible

**Follow-up 2:** For the journey view placement, should it be: (A) Part of the main check-in screen (journey view + today's check-in integrated), or (B) A separate "My Progress" screen accessible from the check-in screen? Also, what should show if the user has NO active cycle?
**Answer:** Option A - The main check-in screen with journey view and today's check-in integrated. If user is NOT in a cycle, show the wizard to create a new cycle instead.

**Follow-up 3:** When showing past days in the journey, should revealed rewards show: (A) Just completion status (checkmark/X), (B) The actual reward amount earned that day, or (C) Both status AND cumulative total so far?
**Answer:** Both - completion status AND running total so far.

**Follow-up 4:** Should past days in the journey be tappable to see details, or is the timeline view-only?
**Answer:** Tappable to see details about the day.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual mockups were provided. Design should follow existing application styling conventions.

## Requirements Summary

### Functional Requirements
- Binary check-in action: user confirms completion with single tap (no confirmation modal)
- Reward reveal animation after check-in (1-2 seconds of anticipation before showing amount)
- Journey timeline showing full cycle progress:
  - Past days: Completion status (checkmark/X) + revealed reward + running total
  - Today: Highlighted as active check-in day
  - Future days: Locked/grayed out with no reward info
- Past days are tappable to view day details
- "Done" state after check-in showing today's revealed reward
- Evening reminder indicator for users who haven't checked in (subtle, non-aggressive)
- Primary/home screen during active cycle
- Goal creation wizard displays when no active cycle exists

### Reusability Opportunities
- Goal Creation Wizard (`/web/src/features/goals/`) - reference for no-cycle wizard flow
- Reward Algorithm (`/web/src/lib/reward-algorithm.ts`) - for displaying revealed rewards
- Existing UI Components (`/web/src/components/ui/`) - buttons, cards, animations

### Scope Boundaries

**In Scope:**
- Daily check-in interface with single-tap confirmation
- Reward reveal animation (1-2 second anticipation)
- Horizontal journey timeline/calendar grid
- Past day detail view (tappable)
- "Done" state after check-in
- Evening reminder indicator
- No-cycle state showing goal creation wizard
- Integration with existing reward algorithm

**Out of Scope:**
- Editing past days
- Undo functionality for check-ins
- Verification or proof requirements (self-report only)
- Social or sharing features
- Push notifications (separate feature)
- Multiple habits/goals on same screen

### Technical Considerations
- Check-in window is full calendar day (midnight to midnight in user's timezone)
- Must integrate with existing reward algorithm for reveal amounts
- Must check for active cycle to determine screen state
- Running total calculation needed for past day display
- Evening time detection for reminder indicator (timezone-aware)
- Animation performance considerations for reveal moment
