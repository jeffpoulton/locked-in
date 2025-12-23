# Spec Requirements: Cycle Progress View

## Initial Description
**Cycle Progress View** — Show where the user is in their journey: days remaining, current streak, running totals of recovered/forfeited amounts. Hide future reward information. Focus on progress visualization that motivates continued engagement.

## Requirements Discussion

### First Round Questions

**Q1:** I assume this progress view should be a **summary card** that appears at the top of the existing check-in page (above the journey timeline), providing an at-a-glance overview without requiring navigation to a separate page. Is that correct, or would you prefer it as a dedicated /progress route or integrated differently?

**Answer:** The dashboard should be a dedicated route that becomes the MAIN page during a cycle. Routing logic:
- If user has NO cycle: Show CTA to create new cycle
- If user has planned or current cycle: Show dashboard view
- Dashboard should have clear CTAs for relevant actions (check-in on current day, reveal current or prior unrevealed days)
- Dashboard should show important cycle information at the top

**Q2:** For metrics display, I'm thinking we should show: **days remaining**, **current streak** (consecutive completed days), **total recovered so far** (revealed rewards only), and **total forfeited**. Should we also include completion percentage (e.g., "12/21 days completed") or keep it focused on these four core metrics?

**Answer:** Dashboard should show at the top:
- Habit (the title of their habit)
- Total days in cycle (e.g., "2 of 21 days")
- Total amount (original amount locked in; user wishes this was called "Locked In amount")
- Locked amount (amount still locked up in the cycle)
- Earned amount (amount they have earned back)
- Forfeited amount (amount they lost for not doing their action on a day with a reward)
- Streak (longest streak during cycle)
- Timeline/Journey (horizontally scrollable list of days)

**IMPORTANT:** No duplication of data points (currently UI shows "amount earned so far" in multiple places)

**Q3:** I assume the progress visualization should use a **horizontal progress bar** showing completion percentage (e.g., "Day 12 of 21") combined with a large prominent display of **total recovered amount** as the primary motivator. Is that correct, or would you prefer a circular progress indicator, or a different visual approach?

**Answer:** Mobile-first, simple, large dashboard style with horizontal progress bar.

**Q4:** For handling unrevealed rewards in the display: I'm assuming the **total recovered** metric should only include **revealed rewards** (to maintain the suspense), and we should NOT show any "pending reveal" amounts or hint at what might be coming. Is that correct?

**Answer:** User asked for clarification: Should we show "amount still locked in future reward days"? Response: We should show aggregate "Locked amount" (Total - Earned - Forfeited) because it's motivating, but NOT show individual unrevealed reward amounts for specific days (would spoil suspense). User confirmed this reasoning makes sense.

**Q5:** Should the current streak counter **reset to zero** when the user misses or marks a day as missed, or should it track the **longest streak** within the current cycle regardless of breaks?

**Answer:** Could show longest streak AND current streak, maybe in a 2x2 dashboard matrix card:
- Top row: Earned Amount | Forfeited Amount
- Bottom row: Longest Streak | Current Streak
For now, show one streak metric or both side-by-side if room allows. Don't want to overemphasize streaks at this stage.

**Q6:** I'm thinking this view should **update in real-time** as reveals happen (when users tap through the reveal prompts on the check-in page), so the totals reflect newly revealed rewards immediately. Is that the intended behavior?

**Answer:** Yes, should update in real-time as reveals happen.

**Q7:** For visual design, I assume we should follow the existing check-in page styling (same dark/light theme support, similar card components from Shadcn) to maintain consistency. Should this progress summary be dismissible/collapsible, or always visible?

**Answer:** The progress summary should be the MAIN PAGE during a cycle (per Q1).

**Q8:** What should be **out of scope** for this initial implementation? For example: historical comparison to past cycles, progress charts/graphs over time, detailed analytics breakdowns, social sharing of progress, or predictions about potential total recovery?

**Answer:** Out of scope:
- No history of past cycles
- No social sharing
- No deeper metrics
- Focus on: no cycle (CTA to start) and current cycle only

### Existing Code to Reference

**Similar Features Identified:**
- Reuse as much as possible from existing check-in page implementation to keep prototype lean
- Existing check-in flow at `/web/src/app/check-in/page.tsx` contains:
  - Journey timeline component
  - Day status tracking logic
  - Check-in state management (useCheckInStore)
  - Reveal flow components
  - Modal components for day details
- These components should be refactored/reused for the dashboard implementation

### Follow-up Questions

**Follow-up 1:** When you say this dashboard should be "the MAIN page during a cycle," should this replace the current `/check-in` route, or should we create a new route like `/dashboard` that becomes the primary view, with `/check-in` handling only the check-in/reveal actions? Or should `/check-in` be redesigned to show the dashboard at the top with check-in/reveal CTAs below?

**Answer:** `/dashboard` should be the home route when a cycle is planned or active. Recommended routing:
- `/` checks if user has cycle: no cycle → landing/CTA, has cycle → redirect to `/dashboard`
- `/dashboard` is main page during active cycle (shows metrics, CTAs open modals)
- `/check-in` either deprecated or redirects to `/dashboard`
- All check-in and reveal actions happen via modals on `/dashboard`
- User flow: `/` → `/contract/new` (if needed) → `/dashboard` (ongoing)

**Follow-up 2:** Yes, your "Locked Amount" concept makes perfect sense! It's motivating to see "money still in play" without spoiling the surprise. Just to confirm the calculation: **Locked Amount = Total Deposit - Earned - Forfeited**. This includes rewards in future days PLUS rewards in past days that haven't been revealed yet. Is that correct?

**Answer:** Confirmed: **Locked Amount = Total Deposit - Earned - Forfeited**
- Includes rewards in future days PLUS rewards in past days that haven't been revealed yet

**Follow-up 3:** You've defined 9 different day statuses. For the timeline visualization, should we use different colors for each status, different icons, or both colors and icons for clarity?

**Answer:** Yes to **different colors** for each status. Yes to **icons and colors** (both for clarity).

**Follow-up 4:** When the dashboard shows a CTA like "Check in for Day 5" and the user taps it, should it navigate to a separate check-in page, open a modal/overlay on the same dashboard page, or expand inline on the dashboard to show check-in buttons?

**Answer:** **Option B: Modal overlay**. Rationale: Gives room to add additional content to check-in experience in future.

**Follow-up 5:** Similarly, when there are unrevealed days and the dashboard shows "Reveal Day 4", should it navigate to reveal page/flow, show reveal animation in a modal, or expand inline for the reveal experience?

**Answer:** **Option B: Animated modal**. Rationale: Flexibility, user sees updated dashboard when modal closes.

**Follow-up 6:** You mentioned possibly showing both Current Streak and Longest Streak in a 2x2 matrix. For the initial implementation, would you prefer to show both, only Longest Streak, or only Current Streak?

**Answer:** Show **2x2 matrix** with:
- Earned
- Forfeited
- Current Streak
- Longest Streak
User noted this might put too much emphasis on streaks, but let's go with these four for now and adapt later.

**Follow-up 7:** For the horizontally scrollable timeline, should it automatically scroll to the current day, the first unrevealed day (if any exist), or stay at the beginning (Day 1)?

**Answer:** First unrevealed day (if any exist), else current day.

**Follow-up 8:** When there's no active cycle, you want a CTA to create a new cycle. Should this redirect to `/contract/new`, show an inline summary with a button, or show previous cycle stats plus the CTA?

**Answer:** Redirect to `/contract/new`.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided for analysis.

## Requirements Summary

### Functional Requirements

**Routing & Navigation:**
- Create new `/dashboard` route as the main page during active cycles
- `/` (root) should check cycle state:
  - No cycle → show landing/CTA
  - Has cycle → redirect to `/dashboard`
- `/check-in` either deprecated or redirects to `/dashboard`
- `/contract/new` remains for cycle creation
- User flow: `/` → `/contract/new` (if needed) → `/dashboard` (ongoing)

**Dashboard Metrics Display:**
- Habit title (user's habit description)
- Total days progress (e.g., "Day 2 of 21")
- Total amount (original deposit - user prefers terminology "Locked In amount")
- Locked amount (calculated: Total - Earned - Forfeited)
- Earned amount (revealed recovered rewards only)
- Forfeited amount (revealed forfeited rewards only)
- 2x2 metrics matrix card:
  - Top row: Earned Amount | Forfeited Amount
  - Bottom row: Current Streak | Longest Streak

**Timeline/Journey Component:**
- Horizontally scrollable list of days
- Nine distinct day statuses with colors AND icons:
  1. **Locked:** Future day where action hasn't yet been recorded
  2. **Unlocked but unreported:** Current day when action hasn't yet been recorded
  3. **Unlocked and reported:** Current day when action is reported (completed or missed) but reveal is tomorrow
  4. **Missed and available to reveal:** Past day missed but user hasn't revealed reward status
  5. **Missed but no reward:** Past day missed, no reward allocated
  6. **Missed and had reward:** Past day missed, reward allocated = forfeited money
  7. **Completed and available to reveal:** Past day completed but user hasn't revealed reward status
  8. **Completed but no reward:** Past day completed, no reward allocated
  9. **Completed and had reward:** Past day completed, reward allocated = recovered money
- Auto-scroll behavior: First unrevealed day (if exists), else current day

**Check-in Action:**
- CTA button on dashboard for current day's check-in
- Opens modal overlay when tapped (not separate page)
- Modal contains check-in action buttons (complete/missed)
- Dashboard updates in real-time when modal closes

**Reveal Action:**
- CTA button on dashboard when unrevealed days exist
- Opens animated modal for reveal experience
- Shows reveal animation within modal
- Dashboard metrics update in real-time when modal closes

**Real-time Updates:**
- All metrics recalculate immediately after reveals
- Timeline day statuses update after check-ins and reveals
- No page refresh required

**No Cycle State:**
- When user has no active cycle, redirect to `/contract/new`

### Reusability Opportunities

**Components to Reuse/Refactor:**
- Journey timeline component from `/web/src/app/check-in/page.tsx`
- Day status tracking logic
- Check-in state management (useCheckInStore from Zustand)
- Reveal flow components (NextDayReveal, RevealPrompt)
- Modal components (DayDetailModal pattern)
- Day status calculations and helper functions

**Backend Logic:**
- Existing contract storage and loading
- Check-in history tracking
- Reward schedule logic
- Cumulative earnings calculations

**Styling Patterns:**
- Shadcn UI components
- Tailwind CSS utility classes
- Dark/light theme support
- Mobile-first responsive design

### Scope Boundaries

**In Scope:**
- New `/dashboard` route as main cycle page
- Routing logic from `/` to appropriate destination
- Dashboard metrics display (habit, days, amounts, streaks)
- 2x2 metrics matrix card
- Timeline with 9 status types (colors + icons)
- Horizontal scrolling timeline with auto-scroll
- Check-in modal overlay
- Reveal modal overlay
- Real-time metric updates
- Locked amount calculation and display
- Current streak AND longest streak tracking
- Mobile-first dashboard design
- Reuse of existing check-in components where possible

**Out of Scope:**
- Historical view of past completed cycles
- Cycle comparison analytics
- Detailed progress charts/graphs over time
- Social sharing features
- Predictions about potential total recovery
- Deep behavioral analytics
- Desktop-optimized layouts (mobile-first only)
- Multiple simultaneous cycles view
- Cycle templates or presets

### Technical Considerations

**Integration Points:**
- Existing Zustand store (useCheckInStore) for state management
- Existing contract storage (localStorage for prototype)
- Existing reward schedule and check-in history logic
- Existing modal patterns from current check-in page

**Data Requirements:**
- Current day number
- Check-in history (completed/missed status per day)
- Reveal status per day (revealed vs unrevealed)
- Reward amounts per day (when revealed)
- Contract details (habit title, duration, total deposit)
- Streak calculations (current and longest)

**UI/UX Patterns:**
- Modal overlays for check-in and reveal actions
- Horizontal scrollable timeline
- Auto-scroll to relevant day
- Real-time updates without page refresh
- Clear CTAs for primary actions
- No data duplication across UI

**Design System:**
- Shadcn UI component library
- Tailwind CSS for styling
- Dark/light theme support
- Mobile-first responsive approach
- Consistent with existing check-in page styling

**State Management:**
- Extend existing Zustand store if needed
- Real-time metric recalculation on state changes
- Streak tracking (current and longest)
- Locked amount calculation

**Routing Architecture:**
- Root `/` with conditional redirect logic
- `/dashboard` as primary cycle view
- Deprecate or redirect `/check-in`
- Maintain `/contract/new` for cycle creation

**No Data Duplication:**
- Single source of truth for each metric
- Display each data point only once on dashboard
- Avoid showing "amount earned" in multiple places
