# Task Breakdown: Cycle Progress View

## Overview
Total Task Groups: 7
Feature: Create a dedicated dashboard route as the main hub during active cycles, displaying progress metrics, timeline visualization, and modal-based interactions for check-in and reveal actions.

## Task List

### Routing & Navigation Layer

#### Task Group 1: Root Route Conditional Logic
**Dependencies:** None

- [x] 1.0 Complete routing setup
  - [x] 1.1 Write 2-8 focused tests for routing logic
    - Limit to 2-8 highly focused tests maximum
    - Test only critical routing behaviors (e.g., redirect with active contract, redirect without contract, deprecated check-in route)
    - Skip exhaustive coverage of all routing edge cases
  - [x] 1.2 Update root route (`/web/src/app/page.tsx`)
    - Add cycle detection on mount (check localStorage for active contract)
    - Implement conditional logic:
      - No cycle → show landing page with "Create New Cycle" CTA
      - Has cycle → redirect to `/dashboard`
    - Reuse existing `loadContract` from `/web/src/lib/contract-storage.ts`
  - [x] 1.3 Create dashboard route structure
    - Create `/web/src/app/dashboard/page.tsx`
    - Set up basic page structure with CheckInLayout
    - Add contract loading and redirect to `/contract/new` if no contract found
  - [x] 1.4 Handle `/check-in` route deprecation
    - Update `/web/src/app/check-in/page.tsx` to redirect to `/dashboard`
    - Add redirect component or server-side redirect
  - [x] 1.5 Ensure routing tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify critical routing flows work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Root route redirects to `/dashboard` when contract exists
- Root route shows landing page when no contract exists
- `/check-in` redirects to `/dashboard`
- Dashboard redirects to `/contract/new` if no contract found

---

### State Management & Data Layer

#### Task Group 2: Store Extensions & Helper Functions
**Dependencies:** Task Group 1

- [x] 2.0 Complete state management enhancements
  - [x] 2.1 Write 2-8 focused tests for store helpers
    - Limit to 2-8 highly focused tests maximum
    - Test only critical helper functions (e.g., locked amount calculation, current streak calculation, longest streak calculation)
    - Skip exhaustive testing of all helper edge cases
  - [x] 2.2 Add locked amount calculation helper to store
    - Extend `/web/src/stores/check-in-store.ts`
    - Add `getLockedAmount()` helper function
    - Formula: Total Deposit - Earned - Forfeited
    - Include both unrevealed rewards and future day rewards
  - [x] 2.3 Add current streak calculation helper
    - Add `getCurrentStreak()` helper to check-in store
    - Calculate consecutive completed days from most recent backwards
    - Return 0 if current/most recent day is missed
  - [x] 2.4 Add longest streak calculation helper
    - Add `getLongestStreak()` helper to check-in store
    - Calculate highest consecutive completed days during current cycle
    - Track across entire cycle history
  - [x] 2.5 Add forfeited amount calculation helper
    - Add `getTotalForfeited()` helper to check-in store
    - Sum all revealed missed day rewards
    - Only count missed days with reward amounts that have been revealed
  - [x] 2.6 Ensure store helper tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify critical calculations work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- `getLockedAmount()` correctly calculates locked amount
- `getCurrentStreak()` tracks consecutive completed days
- `getLongestStreak()` identifies maximum streak in cycle
- `getTotalForfeited()` sums revealed missed day rewards
- All helpers integrate with existing store state

---

### Dashboard UI Components

#### Task Group 3: Dashboard Header & Metrics Display
**Dependencies:** Task Group 2

- [x] 3.0 Complete dashboard header and metrics
  - [x] 3.1 Write 2-8 focused tests for dashboard metrics components
    - Limit to 2-8 highly focused tests maximum
    - Test only critical component behaviors (e.g., habit title display, progress display, locked amount display)
    - Skip exhaustive testing of all component states
  - [x] 3.2 Create DashboardHeader component
    - Create `/web/src/components/dashboard/DashboardHeader.tsx`
    - Display habit title (text-2xl font-bold)
    - Show "Day X of Y" progress indicator
    - Display "Locked In Amount" (original total deposit)
    - Reuse CheckInLayout pattern for consistent styling
  - [x] 3.3 Create MetricsMatrix component
    - Create `/web/src/components/dashboard/MetricsMatrix.tsx`
    - Build 2x2 grid layout (responsive, equal width columns)
    - Top row: Earned Amount | Forfeited Amount
    - Bottom row: Current Streak | Longest Streak
    - Use Tailwind grid classes (grid grid-cols-2 gap-4)
  - [x] 3.4 Create individual metric card components
    - Create `/web/src/components/dashboard/MetricCard.tsx`
    - Props: label, value, colorScheme (green/red/blue/neutral)
    - Display large value with smaller label below
    - Apply color-coded backgrounds (bg-green-50, bg-red-50, etc.)
  - [x] 3.5 Connect metrics to Zustand store
    - Subscribe to check-in store in MetricsMatrix
    - Use `getTotalEarned()`, `getTotalForfeited()`, `getCurrentStreak()`, `getLongestStreak()`
    - Ensure real-time updates when store changes
  - [x] 3.6 Apply consistent styling
    - Follow existing CheckInLayout padding/spacing
    - Use Tailwind utility classes
    - Support dark mode (dark: variants)
    - Mobile-first responsive design
  - [x] 3.7 Ensure dashboard metrics tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify metrics display correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- DashboardHeader displays habit title and progress
- MetricsMatrix shows 2x2 grid with all four metrics
- Metrics update in real-time from store subscriptions
- Styling matches existing check-in page patterns
- Dark mode works correctly

---

### Timeline & Day Status Visualization

#### Task Group 4: Timeline Integration & Nine Day Statuses
**Dependencies:** Task Group 3

- [x] 4.0 Complete timeline integration
  - [x] 4.1 Write 2-8 focused tests for timeline and day status logic
    - Limit to 2-8 highly focused tests maximum
    - Test only critical timeline behaviors (e.g., day status determination, auto-scroll, unrevealed day detection)
    - Skip exhaustive testing of all nine status combinations
  - [x] 4.2 Extend day status logic for nine distinct states
    - Update getDayStatus logic in check-in store or create new helper
    - Implement nine status types:
      1. **Locked**: Future day (dayNumber > currentDayNumber)
      2. **Unlocked Unreported**: Current day, no check-in record
      3. **Unlocked Reported**: Current day, has check-in, not revealed (no same-day reveal)
      4. **Missed Available Reveal**: Past missed day, revealed = false
      5. **Missed No Reward**: Past missed day, revealed = true, rewardAmount = 0
      6. **Missed Had Reward**: Past missed day, revealed = true, rewardAmount > 0
      7. **Completed Available Reveal**: Past completed day, revealed = false
      8. **Completed No Reward**: Past completed day, revealed = true, rewardAmount = 0
      9. **Completed Had Reward**: Past completed day, revealed = true, rewardAmount > 0
  - [x] 4.3 Update DayTile component for nine status visual styles
    - Modify `/web/src/components/check-in/DayTile.tsx`
    - Status 1 (Locked): gray background (bg-gray-100 dark:bg-gray-800), locked icon, opacity-50
    - Status 2 (Unlocked Unreported): blue border (border-blue-600), blue background (bg-blue-50 dark:bg-blue-900/20), "Today" label
    - Status 3 (Unlocked Reported): status indicator, no reveal available
    - Status 4 (Missed Available Reveal): purple accent, unrevealed flag icon, pulsing animation (animate-pulse)
    - Status 5 (Missed No Reward): gray background, red X icon
    - Status 6 (Missed Had Reward): gray background, red accent, strikethrough amount display
    - Status 7 (Completed Available Reveal): purple accent, unrevealed flag icon, pulsing animation
    - Status 8 (Completed No Reward): blue accent (bg-blue-50), green checkmark icon
    - Status 9 (Completed Had Reward): green background (bg-green-50 dark:bg-green-900/20), green checkmark, reward amount displayed
  - [x] 4.4 Integrate JourneyTimeline on dashboard
    - Reuse `/web/src/components/check-in/JourneyTimeline.tsx` component
    - Place timeline below metrics matrix
    - Horizontal scrollable layout (overflow-x-auto)
    - Pass contract and check-in history data
  - [x] 4.5 Implement auto-scroll behavior
    - Auto-scroll to first unrevealed day if any exist
    - Else auto-scroll to current day
    - Use existing auto-scroll logic from JourneyTimeline
    - Trigger on mount and after reveals
  - [x] 4.6 Ensure timeline tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify day statuses display correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- All nine day statuses render with distinct colors and icons
- Timeline scrolls horizontally and displays all cycle days
- Auto-scroll works (first unrevealed day, or current day)
- Visual styling matches spec requirements
- Pulsing animation appears on unrevealed days

---

### Modal Interactions

#### Task Group 5: Check-In & Reveal Modals
**Dependencies:** Task Group 4

- [x] 5.0 Complete modal implementations
  - [x] 5.1 Write 2-8 focused tests for modal interactions
    - Limit to 2-8 highly focused tests maximum
    - Test only critical modal behaviors (e.g., check-in modal open/close, reveal modal open/close, state updates after modal actions)
    - Skip exhaustive testing of all modal edge cases
  - [x] 5.2 Create CheckInModal component
    - Create `/web/src/components/dashboard/CheckInModal.tsx`
    - Reuse DayDetailModal pattern from `/web/src/components/check-in/DayDetailModal.tsx`
    - Full-screen backdrop with blur (bg-black/50 backdrop-blur-sm)
    - Modal slides up from bottom on mobile
    - Display question: "Did you do it today?" with habit title
    - Include CheckInButton ("Yes, I did it") and MissedDayButton ("No, I missed it")
    - Close button in top-right corner
    - Focus trap and escape key to close
  - [x] 5.3 Add check-in CTA button on dashboard
    - Create "Check In for Day X" button in `/web/src/app/dashboard/page.tsx`
    - Show button only when `currentDay` is unreported (`!hasCheckedInToday()`)
    - Button opens CheckInModal on click
    - Primary button styling (prominent, blue accent)
  - [x] 5.4 Wire check-in modal actions
    - On "Yes, I did it": call `completeCheckIn()` from store
    - On "No, I missed it": call `markDayMissed()` from store
    - Close modal after action completes
    - Dashboard metrics update automatically (via store subscriptions)
  - [x] 5.5 Create RevealModal component
    - Create `/web/src/components/dashboard/RevealModal.tsx`
    - Reuse NextDayReveal and RevealPrompt components
    - Modal structure similar to CheckInModal
    - Display animated reveal sequence (anticipation → outcome)
    - Four reveal outcomes: earned (green glow), no-reward (blue neutral), forfeited (red somber), lucky-break (amber relief)
  - [x] 5.6 Add reveal CTA button on dashboard
    - Create "Reveal Day X" button in dashboard
    - Show button only when `hasUnrevealedDays()` returns true
    - Button opens RevealModal with first unrevealed day
    - Secondary button styling (less prominent than check-in)
  - [x] 5.7 Wire reveal modal actions
    - On reveal animation complete: call `revealDay(dayNumber)` from store
    - Close modal after reveal completes
    - If multiple unrevealed days exist, show next reveal prompt automatically (queue pattern)
    - Dashboard metrics update automatically
  - [x] 5.8 Ensure modal tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify modals open/close correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- CheckInModal opens when "Check In" button clicked
- Check-in actions (complete/missed) work correctly
- RevealModal opens when "Reveal Day X" button clicked
- Reveal animation plays and completes
- Modals close after actions complete
- Dashboard updates in real-time after modal actions
- Multiple reveals queue correctly

---

### Dashboard Integration & Page Assembly

#### Task Group 6: Dashboard Page Assembly & Real-Time Updates
**Dependencies:** Task Group 5

- [x] 6.0 Complete dashboard page integration
  - [x] 6.1 Write 2-8 focused tests for full dashboard integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical integration behaviors (e.g., full dashboard renders with all components, real-time updates after check-in, real-time updates after reveal)
    - Skip exhaustive testing of all integration scenarios
  - [x] 6.2 Assemble dashboard page with all components
    - Update `/web/src/app/dashboard/page.tsx`
    - Import and render: DashboardHeader, MetricsMatrix, JourneyTimeline
    - Add CheckInModal and RevealModal with state management
    - Add check-in CTA button (conditional rendering)
    - Add reveal CTA button (conditional rendering)
    - Use CheckInLayout for consistent page structure
  - [x] 6.3 Initialize store on dashboard mount
    - Call `useCheckInStore.initialize(contract)` on mount
    - Load contract from localStorage using `loadContract()`
    - Handle case where contract is null (redirect to `/contract/new`)
  - [x] 6.4 Implement real-time state subscriptions
    - Subscribe to check-in store updates for all metrics
    - Use Zustand selectors for optimized re-renders
    - Ensure metrics recalculate immediately after check-ins
    - Ensure metrics recalculate immediately after reveals
  - [x] 6.5 Add modal state management
    - Create state for `isCheckInModalOpen` and `isRevealModalOpen`
    - Handle modal open/close actions
    - Handle reveal queue progression (show next reveal if exists)
  - [x] 6.6 Style dashboard layout
    - Apply consistent spacing and padding (match CheckInLayout)
    - Responsive grid for metrics matrix
    - Timeline scrollable area styling
    - Button positioning at bottom (fixed or inline)
    - Mobile-first design with proper breakpoints
  - [x] 6.7 Ensure dashboard integration tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify full dashboard renders and updates correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Dashboard page renders all components correctly
- Store initializes on mount with contract data
- All metrics display correct values
- Real-time updates work after check-ins and reveals
- Modals open/close correctly
- CTAs show conditionally based on state
- Layout is mobile-first and responsive

---

### Testing & Edge Cases

#### Task Group 7: Test Coverage Review & Edge Case Handling
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review feature tests and handle edge cases
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 2-8 tests written by routing-engineer (Task 1.1)
    - Review the 2-8 tests written by state-engineer (Task 2.1)
    - Review the 2-8 tests written by ui-engineer (Task 3.1)
    - Review the 2-8 tests written by timeline-engineer (Task 4.1)
    - Review the 2-8 tests written by modal-engineer (Task 5.1)
    - Review the 2-8 tests written by integration-engineer (Task 6.1)
    - Total existing tests: approximately 12-48 tests
  - [x] 7.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to cycle progress view requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Key workflows to verify:
      - Root route → dashboard redirect flow
      - Dashboard → check-in modal → dashboard update flow
      - Dashboard → reveal modal → dashboard update flow
      - Multiple reveal queue progression
      - No contract edge case handling
      - Contract complete state handling
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Edge cases to test if critical:
      - No active contract (redirect to `/contract/new`)
      - Contract complete state (all days revealed)
      - First day of cycle (Day 1 behaviors)
      - Last day of cycle (Day N behaviors)
      - Multiple consecutive missed days
      - Streak calculations with gaps
      - Locked amount recalculation after reveals
    - Do NOT write comprehensive coverage for all scenarios
    - Skip accessibility tests, performance tests unless business-critical
  - [x] 7.4 Handle no-cycle edge case
    - Verify redirect to `/contract/new` when no contract exists
    - Test from root route and from dashboard route
  - [x] 7.5 Handle contract-complete edge case
    - Test dashboard behavior when all days are revealed
    - Verify no check-in CTA when cycle complete
    - Verify no reveal CTA when all days revealed
  - [x] 7.6 Verify real-time update flows
    - Test metrics update immediately after check-in modal closes
    - Test metrics update immediately after reveal modal closes
    - Test timeline day status updates after actions
  - [x] 7.7 Run feature-specific tests only
    - Run ONLY tests related to cycle progress view feature
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-58 tests total)
- Critical user workflows for cycle progress view are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this feature's requirements
- Edge cases (no contract, contract complete) handled gracefully
- Real-time updates verified working correctly

---

## Execution Order

Recommended implementation sequence:

1. **Routing & Navigation Layer** (Task Group 1)
   - Set up routing structure first
   - Enables navigation to new dashboard route
   - Minimal dependencies

2. **State Management & Data Layer** (Task Group 2)
   - Extend store with calculation helpers
   - Required for metrics display
   - Foundation for all data operations

3. **Dashboard UI Components** (Task Group 3)
   - Build header and metrics display
   - Visual structure of dashboard
   - Connects to store helpers from Task Group 2

4. **Timeline & Day Status Visualization** (Task Group 4)
   - Integrate timeline with nine status types
   - Visual complexity layer
   - Depends on metrics being in place

5. **Modal Interactions** (Task Group 5)
   - Implement check-in and reveal modals
   - User interaction layer
   - Depends on timeline and dashboard structure

6. **Dashboard Integration & Page Assembly** (Task Group 6)
   - Assemble all components into dashboard page
   - Wire up real-time updates
   - Integration of all previous task groups

7. **Testing & Edge Cases** (Task Group 7)
   - Review test coverage and fill gaps
   - Handle edge cases
   - Final validation layer

---

## Key Implementation Notes

### Code Reuse Opportunities
- **Zustand Store**: Extend existing `/web/src/stores/check-in-store.ts`
- **Timeline Components**: Reuse `/web/src/components/check-in/JourneyTimeline.tsx` and `DayTile.tsx`
- **Modal Pattern**: Reuse `/web/src/components/check-in/DayDetailModal.tsx` structure
- **Reveal Components**: Reuse `NextDayReveal.tsx` and `RevealPrompt.tsx`
- **Check-In Components**: Reuse `CheckInButton.tsx` and `MissedDayButton.tsx`
- **Layout**: Reuse `CheckInLayout.tsx` pattern

### Testing Strategy
- Each task group (1-6) writes 2-8 focused tests maximum
- Tests cover only critical behaviors, not exhaustive coverage
- Test verification runs ONLY newly written tests, not entire suite
- Task Group 7 adds maximum of 10 additional tests to fill critical gaps
- Total expected tests: approximately 22-58 tests maximum for this feature

### Real-Time Updates
- All metrics use Zustand store subscriptions
- No manual refresh required
- Automatic recalculation on check-in and reveal actions
- Timeline updates based on check-in history changes

### Nine Day Status Types
Each status has unique visual treatment (color + icon):
1. Locked (gray, locked icon, opacity 50%)
2. Unlocked Unreported (blue border, "Today" label)
3. Unlocked Reported (status indicator, no reveal)
4. Missed Available Reveal (purple, pulsing)
5. Missed No Reward (gray, red X)
6. Missed Had Reward (red accent, strikethrough)
7. Completed Available Reveal (purple, pulsing)
8. Completed No Reward (blue accent, checkmark)
9. Completed Had Reward (green, checkmark, amount)

### Tech Stack Alignment
- Next.js 15+ App Router for routing
- TypeScript for all code
- Zustand for state management
- Tailwind CSS for styling
- Mobile-first responsive design
- No Prisma/database changes needed (localStorage prototype)

### Out of Scope Reminders
- No historical view of past cycles
- No comparison analytics between cycles
- No progress charts/graphs over time
- No social sharing features
- No predictions about potential recovery
- No deep behavioral analytics
- Desktop-optimized layouts (mobile-first only)
- Multiple simultaneous cycles
- Editing or canceling active cycles from dashboard
