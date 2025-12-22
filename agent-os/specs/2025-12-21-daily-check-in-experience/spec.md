# Specification: Daily Check-In Experience

## Goal
Create the primary daily interface where users mark their habit as complete, experience the reward reveal moment, and track their journey through an active cycle.

## User Stories
- As a user with an active cycle, I want to check in with a single tap so that I can quickly confirm my daily habit completion without friction.
- As a user who just completed today's check-in, I want to see a brief anticipation animation followed by my reward reveal so that I feel the satisfaction and excitement of my progress.
- As a user in an active cycle, I want to see my full journey timeline showing past days (with status and rewards), today, and locked future days so that I stay motivated by visualizing my progress.

## Specific Requirements

**Primary Screen Routing**
- This becomes the home/primary screen when a user has an active cycle
- Check for active contract in localStorage on mount using existing `loadContract()` function
- If no active cycle exists, redirect to or display the contract creation wizard
- Determine "current day" by comparing today's date with contract start date

**Single-Tap Check-In Action**
- Large, prominent button for "I did it" confirmation
- Single tap completes the action (no confirmation modal required)
- Button disabled/hidden after successful check-in for the day
- Persist check-in completion to localStorage with day number and timestamp
- Check-in window is full calendar day (midnight to midnight in user's timezone)

**Mark Day as Missed Action**
- Secondary action for user to explicitly indicate "I didn't do it"
- Positioned below or alongside the primary check-in button, visually subordinate
- Styled as a text link or ghost button (not competing with primary action)
- Still easily discoverable - not hidden or requiring extra navigation
- Single tap with brief confirmation (e.g., "Mark as missed?" with Yes/No) to prevent accidental taps
- Persist missed status to localStorage with day number and timestamp
- After marking missed, show "done" state for the day (same as completed, but with missed status)
- Provides closure/finality for the day without requiring the user to wait until midnight
- No reward revealed for missed days

**Reward Reveal Animation**
- Trigger 1-2 second anticipation animation immediately after check-in tap
- Use CSS transitions/animations for the reveal moment (scale, fade, or similar)
- Display the revealed reward amount from the reward schedule after animation
- Show celebratory visual feedback (subtle glow, checkmark, or similar)
- Retrieve reward amount using day number from contract's `rewardSchedule.rewards` array

**Journey Timeline View**
- Horizontal timeline or calendar grid showing all days in the cycle
- Past days: Display completion status (checkmark for completed, X for missed)
- Past days: Missed status applies to both explicitly marked missed and days that passed without action
- Past days: Show revealed reward amount for completed days only
- Past days: Display running cumulative total earned so far
- Today: Highlight as the active check-in day with distinct styling
- Future days: Locked/grayed out with no reward information visible
- Past days are tappable to view day details in a modal or expanded view

**Day Detail View**
- Tappable past days open a detail view (modal or slide-up sheet)
- Show: day number, date, completion status, reward amount (if applicable)
- Show cumulative total earned up to that day
- Simple close action to return to main timeline

**Done State After Check-In**
- After successful check-in, main screen shows "done" state for today
- Display today's revealed reward prominently
- Show updated running total
- Tomorrow's reward remains locked/hidden
- Clear visual distinction between "needs check-in" and "completed" states

**Done State After Marking Missed**
- After marking day as missed, main screen shows "done" state with missed styling
- No reward amount displayed (day was not completed)
- Running total remains unchanged
- Visual indication that the day is closed/resolved (e.g., grayed out, X mark)
- Tomorrow's reward remains locked/hidden
- Both check-in buttons (complete and missed) hidden for the day

**Evening Reminder Indicator**
- Detect if current time is evening (e.g., after 6 PM) in user's timezone
- If user hasn't checked in and it's evening, show subtle visual indicator
- Non-aggressive styling (gentle color change, small badge, or text reminder)
- Disappears once user completes check-in

**No Active Cycle State**
- When no contract exists in localStorage, show goal creation wizard
- Reuse existing redirect pattern to `/contract/new` or embed wizard components

## Visual Design

No visual mockups were provided. Design should follow existing application styling conventions:
- Mobile-first responsive design with Tailwind CSS
- Minimum 44x44px tap targets for all interactive elements
- Blue-600 primary color for actions, gray scale for secondary elements
- Rounded corners (rounded-xl, rounded-2xl) for cards and buttons
- Dark mode support using Tailwind dark: variants

## Existing Code to Leverage

**Contract Storage (`/web/src/lib/contract-storage.ts`)**
- `loadContract()` function to retrieve active contract from localStorage
- Storage key pattern `locked-in-contract` for consistency
- Same approach should be used for storing daily check-in completions

**Reward Algorithm (`/web/src/lib/reward-algorithm.ts`)**
- Contract already contains generated `rewardSchedule` with `rewards` array
- Each reward has `day` and `amount` properties
- Use this to look up reward amount when revealing for completed days

**Contract Types (`/web/src/types/contract.ts`)**
- `Contract` interface defines structure including `rewardSchedule`
- `StartDate` type for calculating actual start date from "today"/"tomorrow"
- Duration and deposit amount types for display formatting

**Contract Wizard Store Pattern (`/web/src/stores/contract-wizard-store.ts`)**
- Zustand store pattern for state management
- Step validation pattern could be adapted for day state management
- Action/reducer pattern for updating check-in state

**Wizard Component Patterns (`/web/src/components/contract-wizard/`)**
- Layout patterns with header, main content, and action buttons
- Button styling with disabled states and loading indicators
- Validation feedback patterns and error display

## Out of Scope
- Editing or modifying past day check-in status (no undo functionality)
- Verification or proof requirements for check-ins (self-report only)
- Social features or sharing functionality
- Push notifications for reminders (separate feature)
- Multiple simultaneous habits/goals on the same screen
- Backend API integration (prototype uses localStorage only)
- Syncing check-in data across devices
- Analytics or detailed statistics beyond running total
- Streak counting or streak-based rewards
- Custom timezone configuration (use browser/device timezone)
