# Spec Requirements: Contract Setup Flow (Prototype)

## Initial Description

Build the UI for users to start a new habit cycle: simple text input for habit description, duration slider (7-30 days), and deposit amount input ($100-$1000). No actual payment - just capture the intent and generate the hidden reward schedule. Store in localStorage.

This is a Phase 1A prototype feature focused on validating the core experience. Key context:
- No auth, no database, no real payments - just localStorage
- Goal is to validate the UX before building infrastructure
- Must integrate with the existing Variable Reward Allocation Algorithm already implemented at `/web/src/lib/reward-algorithm.ts`

## Requirements Discussion

### First Round Questions

**Q1:** I assume the contract setup will be a dedicated multi-step or single-page form (not a modal), since it's the primary entry point for users committing money. Is that correct, or would you prefer a modal-based flow?
**Answer:** Multi-step wizard flow - one question per page. React Native + mobile-first web. Simple page-forward wizard for dialing in the habit contract.

**Q2:** For the habit description input, I'm thinking a simple single-line text field with validation (e.g., minimum 3 characters, maximum 200) would suffice for the prototype. Should we include any example placeholders or suggestion text like "e.g., 30 minutes at the gym, Ship one feature daily"?
**Answer:** Think of it as the habit's "title" not description. Should be just a quick few words like "Meditate for 10 minutes", "Run for 60 minutes", "Create 2 TikToks". The prompt/UI needs to reinforce this is a DAILY action - so users don't feel they need to include "every day" or "daily" in the title.

**Q3:** The roadmap mentions a duration slider (7-30 days). I assume we should show the selected value prominently and perhaps include suggested presets (e.g., "1 week", "2 weeks", "21 days", "30 days") for quick selection. Would you like these presets, or just the slider alone?
**Answer:** NOT a slider. Pre-defined options they select: 7 days, 14 days, 21 days, 30 days. Easier for the prototype.

**Q4:** For the deposit amount ($100-$1000), I'm thinking we should show the user what's at stake clearly - perhaps with a brief explanation like "This is the amount you could recover by completing your habit daily." Should we include any visualization of potential outcomes (e.g., "If you complete 80% of days, you'd likely recover ~$X")?
**Answer:** Keep it simple - no outcome visualization for this version.

**Q5:** The existing reward algorithm generates a schedule immediately when given parameters. I assume the setup flow should generate and store this schedule in localStorage upon contract creation, along with the contract metadata (habit, start date, duration, deposit). Is there anything else you'd want stored with the contract?
**Answer:** localStorage is good for now.

**Q6:** Should the contract start immediately upon creation (Day 1 = today), or should users be able to pick a start date (e.g., "Start tomorrow" or a specific date up to 7 days out)?
**Answer:** Give the user the option of starting today OR tomorrow.

**Q7:** Is there anything specific you want to exclude from this prototype that might seem like an obvious inclusion? For example: editing an existing contract, multiple simultaneous contracts, or specific validation beyond what's in the existing schemas?
**Answer:** Keep the prototype as straightforward as possible. No editing contracts, no multiple contracts.

### Existing Code to Reference

**Similar Features Identified:**
- User explicitly stated: DO NOT reference the admin reward simulator - it should not inspire the end-user UX
- Reward algorithm implementation: `/web/src/lib/reward-algorithm.ts` - must integrate with this
- Zod schemas for validation: `/web/src/schemas/reward-simulator.ts` - contains existing validation for duration (7-30), deposit ($100-$1000), and seed

No UI patterns from existing code should be referenced for this consumer-facing experience.

### Follow-up Questions

**Follow-up 1:** For the multi-step wizard flow, I want to confirm the step sequence. Based on your answers, I'm envisioning:
1. Habit Title - "What daily habit are you committing to?"
2. Duration - "How long is your commitment?" (7/14/21/30 day options)
3. Deposit - "How much are you putting on the line?" ($100-$1000)
4. Start Date - "When do you want to start?" (Today/Tomorrow)
5. Confirmation - Summary + "Lock it in" button

Is this the right sequence and number of steps, or would you prefer to combine any of these?

**Answer:** The 5-step wizard sequence is perfect as proposed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes available. Design direction should follow mobile-first principles with a clean, focused one-question-per-screen wizard pattern.

## Requirements Summary

### Functional Requirements

**Multi-Step Wizard Flow (5 steps):**

1. **Step 1: Habit Title**
   - Prompt: "What daily habit are you committing to?"
   - Single-line text input for habit title (not description)
   - Short, action-oriented titles (e.g., "Meditate for 10 minutes", "Run for 60 minutes", "Create 2 TikToks")
   - UI must reinforce this is a DAILY action - users should not feel they need to include "every day" or "daily"
   - Validation: minimum characters, reasonable maximum

2. **Step 2: Duration**
   - Prompt: "How long is your commitment?"
   - Pre-defined selectable options (NOT a slider):
     - 7 days
     - 14 days
     - 21 days
     - 30 days
   - Simple button/card selection UI

3. **Step 3: Deposit Amount**
   - Prompt: "How much are you putting on the line?"
   - Amount range: $100 - $1000
   - Simple input or selection (no outcome visualization)
   - No preview of potential recovery amounts

4. **Step 4: Start Date**
   - Prompt: "When do you want to start?"
   - Two options only:
     - Today
     - Tomorrow

5. **Step 5: Confirmation**
   - Summary of all selections (habit, duration, deposit, start date)
   - Primary action: "Lock it in" button
   - Creates contract and generates hidden reward schedule

**Data Storage:**
- Store contract in localStorage upon confirmation
- Contract data includes: habit title, duration, deposit amount, start date, generated reward schedule
- Generate reward schedule using existing algorithm at `/web/src/lib/reward-algorithm.ts`

**Navigation:**
- Forward progression through wizard steps
- Ability to go back and modify previous answers
- No ability to save draft or exit mid-flow (either complete or abandon)

### Reusability Opportunities

- Existing Zod validation schemas in `/web/src/schemas/reward-simulator.ts` can be extended or referenced for:
  - Duration validation (currently 7-30, prototype uses fixed values: 7, 14, 21, 30)
  - Deposit validation ($100-$1000)
- Reward algorithm at `/web/src/lib/reward-algorithm.ts` - direct integration required
- PRNG utilities at `/web/src/lib/prng.ts` - used by reward algorithm

### Scope Boundaries

**In Scope:**
- 5-step wizard flow for contract creation
- Habit title input with daily action framing
- Duration selection (7/14/21/30 days)
- Deposit amount input ($100-$1000)
- Start date selection (today/tomorrow)
- Confirmation screen with summary
- localStorage persistence of contract data
- Integration with existing reward algorithm to generate schedule
- Mobile-first, responsive design (React Native + web)

**Out of Scope:**
- Editing existing contracts
- Multiple simultaneous contracts
- Outcome/recovery visualization or predictions
- Real payment processing (Stripe)
- User authentication
- Database persistence
- Admin-style UI patterns (explicitly excluded)
- Draft saving or partial completion
- Custom start dates beyond today/tomorrow

### Technical Considerations

- **Platform:** React Native + mobile-first web (Next.js)
- **State Management:** Wizard state managed locally, persisted to localStorage on completion
- **Validation:** Use Zod schemas consistent with existing codebase
- **Algorithm Integration:** Call `generateRewardSchedule()` from `/web/src/lib/reward-algorithm.ts` with:
  - seed: Generate unique contract ID
  - duration: User-selected (7/14/21/30)
  - depositAmount: User-selected ($100-$1000)
- **Storage Schema:** localStorage key for contract with all metadata + generated reward schedule
- **Design Direction:** Clean, focused, one-question-per-screen pattern - NOT inspired by admin simulator UI
