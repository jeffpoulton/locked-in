# Task Breakdown: Next-Day Reveal Experience

## Overview
Total Tasks: 27
Total Task Groups: 4

This spec requires a critical refactor to separate check-in from reveal - two actions that are currently incorrectly conflated. The implementation will extend existing components (RewardReveal.tsx, DoneState.tsx) and refactor the check-in page state machine.

## Task List

### Data Layer

#### Task Group 1: Schema and Storage Updates
**Dependencies:** None

- [x] 1.0 Complete data layer updates for reveal tracking
  - [x] 1.1 Write 3-5 focused tests for reveal state persistence
    - Test that `revealed` field persists correctly in check-in record
    - Test that `revealTimestamp` saves separately from check-in timestamp
    - Test loading unrevealed days correctly identifies days needing reveal
    - Test reveal state updates correctly in storage
  - [x] 1.2 Extend check-in schema with reveal tracking fields
    - Add `revealed: z.boolean().optional()` to `checkInRecordSchema` in `/web/src/schemas/check-in.ts`
    - Add `revealTimestamp: z.string().datetime().optional()` for when reveal occurred
    - Existing records without these fields treated as `revealed: false` for backward compatibility
  - [x] 1.3 Update check-in-storage.ts with reveal functions
    - Add `markDayRevealed(contractId, dayNumber)` function
    - Update `saveCheckIn` to initialize `revealed: false` for new check-ins
    - Add `getUnrevealedDays(contractId, history, currentDayNumber)` helper function
    - Follow existing storage patterns from `saveCheckIn` and `loadCheckInHistory`
  - [x] 1.4 Extend check-in-store.ts with reveal actions and selectors
    - Add `revealQueue: number[]` to state (array of day numbers pending reveal)
    - Add `revealDay(dayNumber: number)` action to mark a day as revealed
    - Add `getUnrevealedDays(): number[]` selector
    - Add `hasUnrevealedDays(): boolean` selector
    - Add `currentRevealDay: number | null` to track which day is being revealed
    - Follow existing Zustand patterns from the store
  - [x] 1.5 Ensure data layer tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify schema changes work with existing data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 1.1 pass
- Check-in records can store reveal status independently from check-in status
- Unrevealed days can be queried efficiently
- Existing check-in data remains compatible (treated as unrevealed)

---

### Component Layer

#### Task Group 2: Reveal Components
**Dependencies:** Task Group 1

- [x] 2.0 Complete reveal components with four outcome states
  - [x] 2.1 Write 4-6 focused tests for reveal components
    - Test NextDayReveal renders anticipation phase for 1.5 seconds
    - Test NextDayReveal transitions to correct outcome state (earned/forfeited/no-reward/lucky-break)
    - Test RevealPrompt displays correct day number and skip option
    - Test CheckInConfirmation shows "Come back tomorrow" messaging
    - Test onComplete callback fires after reveal animation
  - [x] 2.2 Create NextDayReveal.tsx component (extend RewardReveal pattern)
    - Props: `dayNumber`, `completed`, `rewardAmount`, `onComplete`
    - Reuse anticipation phase pattern from RewardReveal.tsx (1.5s pulsing animation)
    - Implement four outcome states with distinct styling:
      - **Earned** (completed + reward > 0): Green glow, "You earned $X!", celebration styling
      - **No Reward** (completed + reward = 0): Blue styling, "No reward was scheduled", neutral positive
      - **Forfeited** (missed + reward > 0): Red/gray styling, "You forfeited $X", somber X icon
      - **Lucky Break** (missed + reward = 0): Amber/gold styling, "Lucky break!", relief messaging
    - Use existing animation classes: `animate-scale-reveal`, `animate-pulse-glow`, `animate-fade-in-up`
    - Location: `/web/src/components/check-in/NextDayReveal.tsx`
  - [x] 2.3 Create RevealPrompt.tsx component for reveal entry point
    - Props: `dayNumber`, `onReveal`, `onSkip`
    - Display: "Day X awaits..." with reveal button and skip option
    - Styling: Match existing check-in prompt visual patterns
    - Include subtle pulsing animation to draw attention to reveal action
    - Location: `/web/src/components/check-in/RevealPrompt.tsx`
  - [x] 2.4 Create CheckInConfirmation.tsx component for post-check-in state
    - Props: `dayNumber`, `onContinue`
    - Display: Checkmark icon with "Thanks! Come back tomorrow to see your reward status"
    - Replaces current same-day reward reveal behavior
    - Match DoneState.tsx visual patterns
    - Location: `/web/src/components/check-in/CheckInConfirmation.tsx`
  - [x] 2.5 Update DoneState.tsx for reveal-aware messaging
    - Update "Come back tomorrow" message to "Come back tomorrow to reveal today's reward"
    - Add visual indicator for pending reveal if applicable
    - Keep existing completed/missed variants functional
  - [x] 2.6 Update component barrel exports
    - Add NextDayReveal, RevealPrompt, CheckInConfirmation to `/web/src/components/check-in/index.ts`
  - [x] 2.7 Ensure component tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify all four outcome states render correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- NextDayReveal correctly displays all four emotional outcome states
- Anticipation animation runs for 1.5 seconds before reveal
- RevealPrompt allows users to initiate or skip reveal
- CheckInConfirmation replaces same-day reward reveal with deferred message

---

### Page Layer

#### Task Group 3: Check-In Page Refactor
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete check-in page state machine refactor
  - [x] 3.1 Write 4-6 focused tests for page state machine
    - Test page enters "reveal-prompt" state when unrevealed days exist
    - Test page transitions from "revealing" to "pending" when user hasn't checked in today
    - Test page transitions from "revealing" to "done" when user has already checked in
    - Test "confirming" state shows CheckInConfirmation after check-in (not reward)
    - Test sequential multi-day reveal flows correctly through each day
  - [x] 3.2 Refactor PageState type and state machine
    - Update PageState: `"loading" | "reveal-prompt" | "revealing" | "pending" | "confirming" | "done"`
    - Remove same-day "revealing" transition from check-in button
    - Add "reveal-prompt" as new entry state when unrevealed days exist
    - Add "confirming" state for post-check-in (replaces same-day reveal)
  - [x] 3.3 Implement reveal-prompt state in page
    - On mount, check for unrevealed prior days using `hasUnrevealedDays()`
    - If unrevealed days exist, set pageState to "reveal-prompt"
    - Render RevealPrompt component with first unrevealed day
    - Handle "reveal" action: transition to "revealing" state
    - Handle "skip" action: transition to "pending" or "done" based on today's check-in status
  - [x] 3.4 Implement revealing state for next-day reveal
    - Render NextDayReveal component with current reveal day's data
    - Get `completed` status and `rewardAmount` for the day being revealed
    - On reveal complete: mark day as revealed in store
    - After reveal: check for more unrevealed days
      - If more unrevealed: prompt for next reveal or allow skip
      - If no more: transition to "pending" or "done" based on today's status
  - [x] 3.5 Implement confirming state for post-check-in
    - Render CheckInConfirmation component
    - Auto-transition to "done" after brief delay (1.5s) or on user tap
    - Replace current handleCheckIn -> revealing -> done flow with handleCheckIn -> confirming -> done
  - [x] 3.6 Update check-in button handler
    - Remove `setRevealing(true, reward)` call from handleCheckIn
    - Keep `completeCheckIn()` call
    - Transition to "confirming" state instead of "revealing"
  - [x] 3.7 Ensure page integration tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify complete user flows work end-to-end
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Check-in and reveal are completely independent actions
- Same-day check-in shows confirmation, not reward reveal
- Sequential multi-day reveals work correctly
- Post-reveal routing correctly sends users to check-in or done state

---

### Testing

#### Task Group 4: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 3-5 tests written for data layer (Task 1.1)
    - Review the 4-6 tests written for components (Task 2.1)
    - Review the 4-6 tests written for page integration (Task 3.1)
    - Total existing tests: approximately 11-17 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to the reveal experience
    - Prioritize end-to-end workflows over unit test gaps
    - Key workflows to verify coverage:
      - User opens app with unrevealed day -> reveals -> checks in
      - User with multiple missed days sees sequential reveals
      - User skips reveal and checks in, then reveals later
      - All four reveal outcome states display correctly
  - [x] 4.3 Write up to 8 additional strategic tests maximum
    - Add maximum of 8 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Priority areas:
      - Store action integration (reveal + check-in interaction)
      - Timeline tapping to trigger reveal for unrevealed past days
      - Edge case: Contract complete with unrevealed final day
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to reveal experience (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 19-25 tests maximum
    - Verify critical workflows pass
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 19-25 tests total)
- Critical user workflows for reveal experience are covered
- No more than 8 additional tests added when filling gaps
- Testing focused exclusively on this spec's feature requirements

---

## Execution Order

Recommended implementation sequence:

1. **Data Layer (Task Group 1)** - Schema and storage updates for reveal tracking
   - Must complete first as components and page depend on reveal state

2. **Component Layer (Task Group 2)** - New reveal components
   - Depends on data layer for reveal state types
   - Can be developed independently of page refactor

3. **Page Layer (Task Group 3)** - Check-in page state machine refactor
   - Depends on both data layer and components
   - Critical refactor that separates check-in from reveal

4. **Test Review (Task Group 4)** - Gap analysis and strategic test coverage
   - Final step to ensure feature quality

---

## Technical Notes

### Key Refactor: Separating Check-In from Reveal

The current implementation incorrectly conflates two independent actions:

**Before (Current - Incorrect):**
```
User taps "I did it" -> Reveal today's reward -> Done
```

**After (Required - Correct):**
```
Check-In Flow: User taps "I did it" -> Confirmation -> "Come back tomorrow to see reward"
Reveal Flow: User opens app -> Reveal yesterday's reward -> Proceed to check-in or done
```

### Four Reveal Outcome States

| Condition | Outcome | Emotional Tone | Styling |
|-----------|---------|----------------|---------|
| Completed + Reward Allocated | "You earned $X!" | Celebration | Green glow effect |
| Completed + No Reward | "No reward scheduled" | Neutral positive | Blue styling |
| Missed + Reward Allocated | "You forfeited $X" | Sting/loss | Red/gray, somber |
| Missed + No Reward | "Lucky break!" | Relief | Amber/gold |

### State Machine Changes

```typescript
// Old PageState
type PageState = "loading" | "pending" | "revealing" | "done";

// New PageState
type PageState = "loading" | "reveal-prompt" | "revealing" | "pending" | "confirming" | "done";
```

### Files to Modify

| File | Changes |
|------|---------|
| `/web/src/schemas/check-in.ts` | Add `revealed` and `revealTimestamp` fields |
| `/web/src/lib/check-in-storage.ts` | Add reveal persistence functions |
| `/web/src/stores/check-in-store.ts` | Add reveal state and actions |
| `/web/src/components/check-in/NextDayReveal.tsx` | New component (create) |
| `/web/src/components/check-in/RevealPrompt.tsx` | New component (create) |
| `/web/src/components/check-in/CheckInConfirmation.tsx` | New component (create) |
| `/web/src/components/check-in/DoneState.tsx` | Update messaging |
| `/web/src/components/check-in/index.ts` | Export new components |
| `/web/src/app/check-in/page.tsx` | Refactor state machine |

### Animation Patterns to Reuse

From existing `RewardReveal.tsx`:
- Anticipation phase: `animate-ping`, `animate-pulse`, `animate-spin`
- Reveal phase: `animate-scale-reveal`, `animate-pulse-glow`, `animate-fade-in-up`
- Timer-based phase transitions (1.5s anticipation, 1s reveal display)
