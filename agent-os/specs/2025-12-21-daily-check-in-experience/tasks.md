# Task Breakdown: Daily Check-In Experience

## Overview
Total Tasks: 36 sub-tasks across 5 task groups

This implementation creates the primary daily interface for an active habit cycle, including check-in actions, reward reveal animations, journey timeline, and day detail views. The feature uses localStorage for persistence (no backend) and follows existing patterns from the contract wizard.

## Task List

### Data Layer

#### Task Group 1: Check-In State Management
**Dependencies:** None

- [x] 1.0 Complete check-in data layer
  - [x] 1.1 Write 4-6 focused tests for check-in storage and state
    - Test saving a check-in completion to localStorage
    - Test loading check-in history from localStorage
    - Test marking a day as missed
    - Test calculating current day number from contract start date
    - Test computing cumulative earnings from completed days
    - Skip edge cases and error states
  - [x] 1.2 Create check-in types (`/web/src/types/check-in.ts`)
    - `DayStatus`: "pending" | "completed" | "missed"
    - `CheckInRecord`: { dayNumber, status, timestamp, rewardAmount? }
    - `CheckInHistory`: Record<number, CheckInRecord>
    - Follow Contract types pattern from `/web/src/types/contract.ts`
  - [x] 1.3 Create check-in storage utilities (`/web/src/lib/check-in-storage.ts`)
    - `saveCheckIn(contractId, dayNumber, status)`: Save daily status
    - `loadCheckInHistory(contractId)`: Load all check-ins for contract
    - `getCheckInForDay(contractId, dayNumber)`: Get specific day status
    - `clearCheckInHistory(contractId)`: Clear history (for testing)
    - Use localStorage key pattern: `locked-in-checkins-{contractId}`
    - Follow patterns from `/web/src/lib/contract-storage.ts`
  - [x] 1.4 Create date/time utility functions (`/web/src/lib/date-utils.ts`)
    - `getCurrentDayNumber(startDate)`: Calculate day number (1-indexed) from contract start
    - `isEvening()`: Return true if after 6 PM in user's timezone
    - `getDateForDay(startDate, dayNumber)`: Get calendar date for a day number
    - `isToday(date)`: Check if date matches today
    - Handle "today"/"tomorrow" StartDate type conversion
  - [x] 1.5 Create Zustand store for check-in state (`/web/src/stores/check-in-store.ts`)
    - State: currentDayNumber, checkInHistory, isRevealing, revealedReward
    - Actions: completeCheckIn, markDayMissed, loadHistory, setRevealing
    - Computed: getTotalEarned, getDayStatus, hasCheckedInToday
    - Follow patterns from `/web/src/stores/contract-wizard-store.ts`
  - [x] 1.6 Ensure data layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify localStorage operations work correctly
    - Verify day number calculations are accurate
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Check-in records persist correctly to localStorage
- Day number calculation matches contract start date
- Cumulative earnings compute correctly from reward schedule
- Store actions properly update state and localStorage

---

### UI Components

#### Task Group 2: Core Check-In Components
**Dependencies:** Task Group 1

- [x] 2.0 Complete core check-in UI components
  - [x] 2.1 Write 4-6 focused tests for core check-in components
    - Test CheckInButton renders and handles tap
    - Test CheckInButton shows disabled state after completion
    - Test MissedDayButton shows confirmation dialog on tap
    - Test DoneState displays revealed reward amount
    - Test EveningReminder appears when conditions are met
    - Skip exhaustive interaction testing
  - [x] 2.2 Create CheckInButton component (`/web/src/components/check-in/CheckInButton.tsx`)
    - Large, prominent "I did it" button (min 64px height, full width)
    - Single tap triggers check-in (no confirmation modal)
    - Disabled/hidden state after successful check-in
    - Use blue-600 primary color, rounded-2xl styling
    - Follow button patterns from HabitTitleStep.tsx
  - [x] 2.3 Create MissedDayButton component (`/web/src/components/check-in/MissedDayButton.tsx`)
    - Secondary "I didn't do it" action
    - Styled as text link or ghost button (gray-500 text)
    - Positioned below primary button, visually subordinate
    - Single tap shows brief "Mark as missed?" confirmation
    - Confirmation uses simple Yes/No inline buttons
  - [x] 2.4 Create DoneState component (`/web/src/components/check-in/DoneState.tsx`)
    - Display for completed day: checkmark icon, revealed reward, "Come back tomorrow"
    - Display for missed day: X icon, "Day closed" message, grayed styling
    - Show updated running total prominently
    - Tomorrow's reward remains locked/hidden
    - Clear visual distinction between completed and missed variants
  - [x] 2.5 Create EveningReminder component (`/web/src/components/check-in/EveningReminder.tsx`)
    - Subtle visual indicator (gentle yellow/amber tint or small badge)
    - Text: "Don't forget to check in today"
    - Only visible when: evening (after 6 PM) AND not yet checked in
    - Non-aggressive styling that doesn't compete with primary action
  - [x] 2.6 Create component barrel export (`/web/src/components/check-in/index.ts`)
    - Export all check-in components
  - [x] 2.7 Ensure core check-in component tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify components render correctly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- CheckInButton triggers state update on tap
- MissedDayButton shows confirmation before marking missed
- DoneState displays correct variant based on completion status
- EveningReminder only appears during evening hours for pending days
- All interactive elements have minimum 44x44px tap targets

---

#### Task Group 3: Reward Reveal Animation
**Dependencies:** Task Group 2

- [x] 3.0 Complete reward reveal animation
  - [x] 3.1 Write 2-4 focused tests for reward reveal
    - Test RewardReveal component shows anticipation state
    - Test RewardReveal transitions to reveal state after delay
    - Test reward amount displays correctly after reveal
    - Skip animation timing precision tests
  - [x] 3.2 Create RewardReveal component (`/web/src/components/check-in/RewardReveal.tsx`)
    - Anticipation phase (1-2 seconds): Pulsing/spinning animation, "Calculating..." text
    - Reveal phase: Scale up animation with reward amount display
    - Celebratory feedback: Subtle glow effect, checkmark animation
    - Use CSS transitions/animations (Tailwind animate utilities)
    - Props: rewardAmount, onComplete callback
  - [x] 3.3 Add animation keyframes to globals.css or Tailwind config
    - `pulse-glow`: Subtle pulsing glow effect
    - `scale-reveal`: Scale from 0.8 to 1.0 with ease-out
    - `fade-in-up`: Fade in with upward movement
    - Keep animations performant (transform/opacity only)
  - [x] 3.4 Integrate RewardReveal with check-in flow
    - Trigger animation immediately after CheckInButton tap
    - Retrieve reward amount from contract.rewardSchedule.rewards[dayNumber-1]
    - After animation completes, transition to DoneState
    - Handle days with no reward (show completion without amount)
  - [x] 3.5 Ensure reward reveal tests pass
    - Run ONLY the 2-4 tests written in 3.1
    - Verify animation states transition correctly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-4 tests written in 3.1 pass
- Anticipation animation plays for 1-2 seconds
- Reward amount reveals with celebratory visual feedback
- Animation is smooth and performant (no jank)
- Non-reward days show completion without amount display

---

#### Task Group 4: Journey Timeline and Day Detail
**Dependencies:** Task Group 2

- [x] 4.0 Complete journey timeline and day detail views
  - [x] 4.1 Write 4-6 focused tests for timeline components
    - Test JourneyTimeline renders correct number of days
    - Test past days show completion status (checkmark/X)
    - Test today is highlighted as active
    - Test future days appear locked/grayed
    - Test tapping past day opens DayDetailModal
    - Skip exhaustive state combination tests
  - [x] 4.2 Create DayTile component (`/web/src/components/check-in/DayTile.tsx`)
    - Three variants: past (completed/missed), today, future
    - Past completed: Green checkmark, reward amount visible
    - Past missed: Red X mark, no reward
    - Today: Highlighted border (blue-600), "Today" label
    - Future: Grayed out, locked icon, no reward visible
    - Props: dayNumber, status, rewardAmount, isToday, onTap
    - Min 44x44px tap target for past days
  - [x] 4.3 Create JourneyTimeline component (`/web/src/components/check-in/JourneyTimeline.tsx`)
    - Horizontal scrollable timeline showing all days in cycle
    - Auto-scroll to center today on mount
    - Display running cumulative total at top/bottom
    - Pass tap handler to DayTile for past days only
    - Responsive: fits full width on mobile, scrolls on overflow
  - [x] 4.4 Create DayDetailModal component (`/web/src/components/check-in/DayDetailModal.tsx`)
    - Modal/slide-up sheet for past day details
    - Display: Day number, calendar date, completion status
    - Display: Reward amount (if completed), cumulative total to that day
    - Close button or tap-outside to dismiss
    - Accessible: focus trap, escape key to close
    - Follow modal patterns with backdrop blur
  - [x] 4.5 Add cumulative total calculation to store
    - `getCumulativeTotalForDay(dayNumber)`: Sum rewards up to day
    - `getTotalEarned()`: Sum all completed day rewards
    - Use contract.rewardSchedule.rewards for amounts
  - [x] 4.6 Ensure timeline component tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify timeline renders all days correctly
    - Verify modal opens/closes properly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Timeline displays all cycle days in correct order
- Past days accurately show completion status and rewards
- Today is visually distinct and highlighted
- Future days are locked with no reward information
- DayDetailModal shows comprehensive day information
- Running total updates correctly as days complete

---

### Page Integration

#### Task Group 5: Main Check-In Page and Routing
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete main check-in page integration
  - [x] 5.1 Write 4-6 focused tests for page routing and integration
    - Test page redirects to /contract/new when no active contract
    - Test page displays check-in interface when contract exists
    - Test check-in flow from button tap through reward reveal to done state
    - Test page correctly determines current day from contract
    - Skip exhaustive routing edge cases
  - [x] 5.2 Create CheckInLayout component (`/web/src/components/check-in/CheckInLayout.tsx`)
    - Header: Habit title from contract, current day indicator
    - Main content area: Check-in action or done state
    - Bottom section: Journey timeline
    - Mobile-first with max-w-lg centered layout
    - Follow layout patterns from WizardLayout.tsx
  - [x] 5.3 Create main CheckInPage component (`/web/src/app/check-in/page.tsx`)
    - Route: /check-in (primary screen during active cycle)
    - On mount: Load contract with loadContract()
    - No contract: Redirect to /contract/new
    - Has contract: Initialize check-in store, render CheckInLayout
    - Determine current day number from contract.startDate
  - [x] 5.4 Wire up complete check-in flow
    - Initial state: Show CheckInButton + MissedDayButton + EveningReminder (if applicable)
    - On check-in tap: Trigger RewardReveal animation
    - After reveal: Transition to DoneState (completed variant)
    - On missed tap + confirm: Transition to DoneState (missed variant)
    - All state changes persist to localStorage
  - [x] 5.5 Handle automatic missed day detection
    - On page load, check for days between last check-in and today
    - Days without check-in that have passed should be marked "missed"
    - Update check-in history for any auto-missed days
    - Show current day status correctly after auto-update
  - [x] 5.6 Update app routing for check-in as primary screen
    - Modify `/web/src/app/page.tsx` to check for active contract
    - If active contract exists: redirect to /check-in
    - If no contract: redirect to /contract/new
    - Keep existing auth redirect logic if applicable
  - [x] 5.7 Ensure page integration tests pass
    - Run ONLY the 4-6 tests written in 5.1
    - Verify complete user flow works end-to-end
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 5.1 pass
- /check-in serves as primary screen during active cycle
- Correct routing based on contract existence
- Complete flow from check-in through reward reveal to done state works
- Missed days are automatically detected and marked
- All state persists correctly to localStorage
- UI is responsive and follows mobile-first design

---

### Testing

#### Task Group 6: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps only
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review the 4-6 tests from data layer (Task 1.1)
    - Review the 4-6 tests from core check-in components (Task 2.1)
    - Review the 2-4 tests from reward reveal (Task 3.1)
    - Review the 4-6 tests from timeline components (Task 4.1)
    - Review the 4-6 tests from page integration (Task 5.1)
    - Total existing tests: approximately 18-28 tests
  - [x] 6.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows lacking coverage
    - Focus ONLY on daily check-in feature requirements
    - Prioritize end-to-end workflows over unit test gaps
    - Do NOT assess entire application test coverage
  - [x] 6.3 Write up to 8 additional strategic tests maximum
    - Focus on integration points between components
    - Test complete user journeys (check-in -> reveal -> done)
    - Test edge cases only if business-critical:
      - First day of contract
      - Last day of contract
      - Day with no scheduled reward
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to daily check-in feature
    - Expected total: approximately 26-36 tests maximum
    - Verify critical workflows pass
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 26-36 tests total)
- Critical user workflows for check-in feature are covered
- No more than 8 additional tests added when filling gaps
- Testing focused exclusively on this spec's feature requirements

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Check-In State Management** (Data Layer)
   - Foundation for all other work
   - Types, storage, utilities, Zustand store

2. **Task Group 2: Core Check-In Components** (UI)
   - Primary user interaction components
   - Can be developed independently with mock data

3. **Task Group 3: Reward Reveal Animation** (UI)
   - Depends on core components
   - Enhances the check-in experience

4. **Task Group 4: Journey Timeline and Day Detail** (UI)
   - Depends on data layer for history
   - Can parallel develop with Group 3

5. **Task Group 5: Main Check-In Page and Routing** (Integration)
   - Brings all components together
   - Final integration and routing setup

6. **Task Group 6: Test Review and Gap Analysis** (Testing)
   - Review all tests written during development
   - Fill critical gaps only

---

## Technical Notes

### File Structure
```
/web/src/
  types/
    check-in.ts           # New: Check-in type definitions
  lib/
    check-in-storage.ts   # New: localStorage utilities
    date-utils.ts         # New: Date/time utilities
  stores/
    check-in-store.ts     # New: Zustand state management
  components/
    check-in/
      index.ts            # Barrel export
      CheckInButton.tsx   # Primary action button
      MissedDayButton.tsx # Secondary missed action
      DoneState.tsx       # Completed/missed day display
      EveningReminder.tsx # Evening notification
      RewardReveal.tsx    # Anticipation + reveal animation
      DayTile.tsx         # Individual day in timeline
      JourneyTimeline.tsx # Full cycle timeline
      DayDetailModal.tsx  # Past day detail view
      CheckInLayout.tsx   # Page layout wrapper
  app/
    check-in/
      page.tsx            # Main check-in page (new route)
    page.tsx              # Modified: routing logic update
```

### Existing Code Dependencies
- `/web/src/lib/contract-storage.ts` - loadContract() for active contract
- `/web/src/lib/reward-algorithm.ts` - Reward amount lookup
- `/web/src/types/contract.ts` - Contract interface with rewardSchedule
- `/web/src/stores/contract-wizard-store.ts` - Zustand patterns

### Design System Reference
- Primary color: blue-600
- Secondary text: gray-500 / dark:gray-400
- Success: green-500
- Error/missed: red-500
- Borders: rounded-xl, rounded-2xl
- Tap targets: minimum 44x44px
- Dark mode: Use Tailwind dark: variants

### localStorage Keys
- `locked-in-contract` - Active contract (existing)
- `locked-in-checkins-{contractId}` - Check-in history (new)
