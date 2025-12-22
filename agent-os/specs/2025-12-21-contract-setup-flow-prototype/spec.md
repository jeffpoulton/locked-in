# Specification: Contract Setup Flow (Prototype)

## Goal

Build a 5-step mobile-first wizard for users to create a habit contract by entering a daily habit title, selecting duration and deposit amount, choosing a start date, and confirming to generate a hidden reward schedule stored in localStorage.

## User Stories

- As a user, I want to quickly set up a habit commitment with clear, focused steps so that I can lock in my contract without friction or confusion
- As a user, I want to understand that my habit is a daily action so that I frame my commitment correctly without needing to add "daily" to my title

## Specific Requirements

**Multi-Step Wizard Architecture**
- Create a 5-step wizard flow with one question per screen
- Use forward/back navigation between steps
- Manage wizard state locally within the component tree (Zustand or React state)
- No partial save/draft functionality - user completes flow or abandons entirely
- Route structure: `/contract/new` with step state managed client-side (not separate routes per step)

**Step 1: Habit Title Input**
- Prompt: "What daily habit are you committing to?"
- Single-line text input for short, action-oriented titles
- Include contextual helper text indicating this is a DAILY action (e.g., "You'll do this every day")
- Placeholder examples: "Meditate for 10 minutes", "Run for 60 minutes", "Create 2 TikToks"
- Validation: minimum 3 characters, maximum 60 characters
- Disable "Next" button until valid input is provided

**Step 2: Duration Selection**
- Prompt: "How long is your commitment?"
- Four pre-defined selectable options displayed as tappable cards/buttons: 7 days, 14 days, 21 days, 30 days
- NOT a slider - discrete option selection only
- Selected option should have clear visual distinction (highlight, border, checkmark)
- Must select exactly one option to proceed

**Step 3: Deposit Amount Input**
- Prompt: "How much are you putting on the line?"
- Amount range: $100 - $1000
- Use a numeric input with dollar sign prefix OR preset amount buttons ($100, $250, $500, $1000) with custom input option
- Validate against depositAmountSchema constraints ($100 min, $1000 max)
- No outcome visualization or recovery predictions - keep simple

**Step 4: Start Date Selection**
- Prompt: "When do you want to start?"
- Two options only: "Today" and "Tomorrow"
- Display as two large, tappable cards/buttons
- Calculate and display actual date for each option (e.g., "Today - Dec 21" / "Tomorrow - Dec 22")
- Default selection: none (user must explicitly choose)

**Step 5: Confirmation Screen**
- Display summary of all selections: habit title, duration, deposit amount, start date
- Primary action button: "Lock it in"
- Optionally show secondary action to go back and edit
- On confirmation: generate contract ID, call reward algorithm, persist to localStorage, navigate to success/dashboard

**Contract Data Persistence**
- Generate unique contract ID (UUID or similar) to serve as seed for reward algorithm
- Store contract object in localStorage under a dedicated key (e.g., `locked-in-contract`)
- Contract data structure: id, habitTitle, duration, depositAmount, startDate, createdAt, rewardSchedule
- Overwrite any existing contract (only one contract supported in prototype)

**Integration with Reward Algorithm**
- Import and call `generateRewardSchedule()` from `/web/src/lib/reward-algorithm.ts`
- Pass contract ID as seed, user-selected duration, and deposit amount
- Store the returned `RewardSchedule` object with the contract (schedule is hidden from user but stored for later use)

**Mobile-First Responsive Design**
- Design for mobile viewport first (max-width container, large touch targets)
- Minimum 44x44px tap targets per accessibility guidelines
- Full-width buttons and inputs on mobile
- Center content vertically on each step for focused experience
- Use Tailwind CSS with mobile-first breakpoints

## Visual Design

No visual assets provided. Design should follow mobile-first principles with a clean, focused one-question-per-screen wizard pattern. Each step should have minimal distractions, prominent prompts, and clear primary actions.

## Existing Code to Leverage

**Reward Algorithm (`/web/src/lib/reward-algorithm.ts`)**
- Export `generateRewardSchedule(input: GenerateScheduleInput)` function
- Accepts seed (string), duration (7-30), and depositAmount (100-1000)
- Returns complete `RewardSchedule` object with generated reward days and amounts
- Integrate directly - no modifications needed to this file

**Zod Validation Schemas (`/web/src/schemas/reward-simulator.ts`)**
- `durationSchema`: validates number between 7-30 (prototype uses fixed values 7, 14, 21, 30)
- `depositAmountSchema`: validates number between 100-1000
- `seedSchema`: validates non-empty string
- `rewardScheduleSchema`: type definition for stored schedule
- Extend or reference these for contract input validation

**PRNG Utilities (`/web/src/lib/prng.ts`)**
- Used internally by reward algorithm
- No direct integration needed - algorithm handles this

**Project Layout Conventions**
- Next.js App Router with file-based routing
- Tailwind CSS for styling
- Zustand for state management (as per tech stack)
- TypeScript strict mode throughout

## Out of Scope

- Editing existing contracts after creation
- Multiple simultaneous contracts (one contract only)
- Outcome/recovery visualization or predictions
- Real payment processing (Stripe integration)
- User authentication or login flows
- Database persistence (Supabase/Prisma)
- Admin-style UI patterns (explicitly excluded - do NOT reference admin simulator)
- Draft saving or partial completion resumption
- Custom start dates beyond today/tomorrow
- Contract cancellation or deletion flows
