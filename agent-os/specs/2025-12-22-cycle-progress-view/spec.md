# Specification: Cycle Progress View

## Goal
Create a dedicated dashboard route that serves as the main hub during an active cycle, displaying progress metrics, timeline visualization, and clear CTAs for check-in and reveal actions through modal interactions.

## User Stories
- As a user with an active cycle, I want a central dashboard showing my progress so that I can quickly see where I stand and what actions I need to take
- As a user returning to the app, I want to be automatically directed to my active dashboard so that I don't have to navigate to find my current cycle

## Specific Requirements

**Root Route Conditional Logic**
- Root route (`/`) checks for active cycle on mount
- If no cycle exists: show landing page with CTA to create new cycle
- If cycle exists (planned or active): redirect to `/dashboard`
- Existing `/check-in` route should redirect to `/dashboard`
- User flow: `/` → `/contract/new` (if needed) → `/dashboard` (ongoing)

**Dashboard Route Structure**
- Create new `/dashboard` route at `/web/src/app/dashboard/page.tsx`
- Main page during active cycle, not a modal or overlay
- Mobile-first design using existing CheckInLayout pattern
- Should load contract from localStorage and initialize check-in store on mount
- If no contract found, redirect to `/contract/new`

**Dashboard Header Metrics**
- Display habit title prominently at top
- Show current progress: "Day X of Y" format (e.g., "Day 2 of 21")
- Display Total Amount (labeled as "Locked In Amount" - original deposit)
- All metrics update in real-time after check-ins and reveals

**2x2 Metrics Matrix Card**
- Grid layout with four key metrics
- Top row: Earned Amount | Forfeited Amount
- Bottom row: Current Streak | Longest Streak
- Earned: sum of all revealed completed day rewards
- Forfeited: sum of all revealed missed day rewards
- Current Streak: consecutive completed days from most recent backwards
- Longest Streak: highest consecutive completed days during current cycle
- Locked Amount: calculated as Total - Earned - Forfeited (includes unrevealed rewards)

**Timeline Component Integration**
- Reuse existing JourneyTimeline component from `/web/src/components/check-in/JourneyTimeline.tsx`
- Horizontally scrollable list of all days in cycle
- Auto-scroll behavior: first unrevealed day if exists, else current day
- Each day rendered using existing DayTile component
- Display nine distinct day statuses with unique colors and icons

**Nine Day Status Types**
- Status 1 (Locked): Future day, locked icon, gray background, opacity 50%
- Status 2 (Unlocked Unreported): Current day, "Today" label, blue border, blue background
- Status 3 (Unlocked Reported): Current day after check-in, no same-day reveal, status indicator
- Status 4 (Missed Available Reveal): Past missed day, unrevealed flag, purple accent, pulsing
- Status 5 (Missed No Reward): Past missed day, revealed, no reward, red X, gray background
- Status 6 (Missed Had Reward): Past missed day, revealed, had reward, strikethrough amount, red accent
- Status 7 (Completed Available Reveal): Past completed day, unrevealed flag, purple accent, pulsing
- Status 8 (Completed No Reward): Past completed day, revealed, no reward, green checkmark, blue accent
- Status 9 (Completed Had Reward): Past completed day, revealed, green checkmark, reward amount displayed

**Check-In CTA and Modal**
- Show prominent "Check In for Day X" button when current day is unreported
- Button opens modal overlay (not navigation to separate page)
- Reuse existing check-in UI components in modal (CheckInButton, MissedDayButton)
- Modal contains question "Did you do it today?" with habit title
- Two action buttons: primary "Yes, I did it" and secondary "No, I missed it"
- On action completion, close modal and update dashboard metrics in real-time
- Modal pattern similar to existing DayDetailModal component

**Reveal CTA and Modal**
- Show "Reveal Day X" button when unrevealed past days exist
- Button opens animated reveal modal (not navigation)
- Reuse existing RevealPrompt and NextDayReveal components in modal
- Display anticipation animation followed by outcome reveal
- Four reveal outcomes: earned (green glow), no-reward (blue neutral), forfeited (red somber), lucky-break (amber relief)
- After reveal animation completes, close modal and update metrics
- If multiple unrevealed days exist, show next reveal prompt automatically

**Real-Time Dashboard Updates**
- All metrics recalculate immediately after modal actions
- Use Zustand store subscriptions for reactive updates
- No page refresh required
- Timeline day statuses update based on check-in history changes
- Locked Amount recalculates when earned or forfeited changes

**State Management Integration**
- Extend existing useCheckInStore from `/web/src/stores/check-in-store.ts`
- Add helper functions for streak calculations (current and longest)
- Add helper function for locked amount calculation
- Leverage existing functions: getTotalEarned, getCumulativeTotalForDay, getDayStatus
- Store tracks reveal queue and current reveal day for modal flow

**No Cycle State Handling**
- When user has no contract in localStorage, redirect to `/contract/new`
- No inline CTA or landing page content on dashboard route itself
- Root route handles displaying landing/CTA for users without cycles

## Visual Design

No visual mockups provided. Follow existing design patterns from check-in page.

**Layout Structure**
- Habit title at top (text-2xl font-bold)
- Progress indicator "Day X of Y" below title
- Locked In Amount prominently displayed
- 2x2 metrics grid (equal width columns, responsive spacing)
- Horizontally scrollable timeline below metrics
- Primary action buttons at bottom (check-in or reveal CTAs)
- Consistent spacing and padding with existing CheckInLayout

**Color Palette and Icons**
- Future days: gray (bg-gray-100 dark:bg-gray-800), locked icon, opacity 50%
- Current day: blue (border-blue-600, bg-blue-50 dark:bg-blue-900/20), "Today" label
- Completed revealed with reward: green (bg-green-50 dark:bg-green-900/20), checkmark icon
- Missed revealed: gray/red (bg-gray-100 dark:bg-gray-800), X icon
- Unrevealed days: purple accent (pulsing animation to draw attention)
- Earned metric: green text/background
- Forfeited metric: red text/background
- Streak metrics: blue or neutral colors

**Modal Styling**
- Full-screen backdrop with blur (bg-black/50 backdrop-blur-sm)
- Modal slides up from bottom on mobile
- Rounded corners on modal (rounded-t-2xl on mobile, rounded-2xl on desktop)
- Shadow and elevation (shadow-xl)
- Close button in top-right corner
- Focus trap and escape key to close

## Existing Code to Leverage

**Zustand Store (useCheckInStore)**
- State management for contract, check-in history, current day number
- Actions: initialize, completeCheckIn, markDayMissed, revealDay
- Helpers: getTotalEarned, getDayStatus, hasCheckedInToday, getUnrevealedDays
- Extend with streak calculation helpers and locked amount helper

**Timeline Components**
- JourneyTimeline component handles scrolling, day rendering, auto-scroll logic
- DayTile component renders individual day states with icons and colors
- DayInfo interface defines day data structure
- Reuse auto-scroll logic to first unrevealed or current day

**Modal Components**
- DayDetailModal pattern for modal structure, backdrop, focus trap
- NextDayReveal for animated reveal experience with four outcome states
- RevealPrompt for prompting user before reveal animation
- CheckInConfirmation for post-check-in confirmation (no same-day reveal)

**Storage and Calculations**
- loadContract from contract-storage for loading active contract
- calculateCumulativeEarnings from check-in-storage for earned totals
- getUnrevealedDays from check-in-storage for reveal queue management
- markDayRevealed for persisting reveal state to localStorage

**Layout and Styling**
- CheckInLayout component for consistent page structure
- Tailwind CSS utility classes for responsive design
- Dark/light theme support via dark: variants
- Shadcn UI components (if needed for buttons, cards)

## Out of Scope

- Historical view or list of past completed cycles
- Comparison analytics between multiple cycles
- Progress charts, graphs, or trend visualizations over time
- Social sharing features or public progress profiles
- Predictions about potential total recovery amounts
- Deep behavioral analytics or habit insights
- Desktop-optimized layouts (focus is mobile-first)
- Multiple simultaneous active cycles view
- Cycle templates, presets, or recommendations
- Editing or canceling active cycles from dashboard
- Push notifications or reminders from dashboard
- Export or download of cycle data
- Integration with external habit tracking apps
