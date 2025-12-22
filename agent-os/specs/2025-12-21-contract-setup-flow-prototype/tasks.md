# Task Breakdown: Contract Setup Flow (Prototype)

## Overview
Total Tasks: 25 (across 4 task groups)

This is a frontend-focused prototype feature with no database or API layer. All data persistence is via localStorage. The feature consists of a 5-step mobile-first wizard for creating a habit contract.

## Task List

### Foundation Layer

#### Task Group 1: Types, Schemas, and Storage Utilities
**Dependencies:** None

- [x] 1.0 Complete foundation layer (types, validation, storage)
  - [x] 1.1 Write 3-4 focused tests for contract schemas and storage utilities
    - Test contract schema validation (valid contract passes, invalid fails)
    - Test localStorage save/load functionality
    - Test contract ID generation produces valid UUIDs
    - Skip exhaustive edge case testing
  - [x] 1.2 Create contract TypeScript types
    - Location: `/web/src/types/contract.ts`
    - Define `Contract` interface: id, habitTitle, duration, depositAmount, startDate, createdAt, rewardSchedule
    - Define `ContractFormData` type for wizard state (without id, createdAt, rewardSchedule)
    - Import and reference `RewardSchedule` type from reward algorithm
  - [x] 1.3 Create contract validation schemas with Zod
    - Location: `/web/src/schemas/contract.ts`
    - `habitTitleSchema`: string, min 3 chars, max 60 chars
    - `durationSchema`: enum of 7, 14, 21, 30 (or reuse/extend existing)
    - `depositAmountSchema`: number, min 100, max 1000 (or reuse existing)
    - `startDateSchema`: enum of "today" | "tomorrow"
    - `contractFormSchema`: combined schema for all wizard inputs
  - [x] 1.4 Create localStorage utility for contracts
    - Location: `/web/src/lib/contract-storage.ts`
    - `saveContract(contract: Contract): void` - saves to `locked-in-contract` key
    - `loadContract(): Contract | null` - loads from localStorage
    - `generateContractId(): string` - generates UUID for contract/seed
    - Handle JSON serialization/deserialization
  - [x] 1.5 Ensure foundation layer tests pass
    - Run ONLY the 3-4 tests written in 1.1
    - Verify schemas validate correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 1.1 pass
- TypeScript types compile without errors
- Zod schemas correctly validate contract data
- localStorage utilities save and retrieve contracts

---

### Wizard State Management

#### Task Group 2: Zustand Store and Navigation Logic
**Dependencies:** Task Group 1

- [x] 2.0 Complete wizard state management
  - [x] 2.1 Write 3-4 focused tests for wizard store
    - Test step navigation (next, back, go to step)
    - Test form data updates persist in store
    - Test reset clears all wizard state
    - Skip testing all field combinations
  - [x] 2.2 Create Zustand store for wizard state
    - Location: `/web/src/stores/contract-wizard-store.ts`
    - State: currentStep (1-5), formData (ContractFormData partial)
    - Actions: nextStep, prevStep, goToStep, updateFormData, resetWizard
    - Track completion status for each step
  - [x] 2.3 Implement step validation logic
    - Step 1 valid when: habitTitle is 3-60 chars
    - Step 2 valid when: duration is selected (7, 14, 21, or 30)
    - Step 3 valid when: depositAmount is 100-1000
    - Step 4 valid when: startDate is "today" or "tomorrow"
    - Use Zod schemas for validation checks
  - [x] 2.4 Create contract submission handler
    - Location: within store or separate `/web/src/lib/contract-actions.ts`
    - Generate contract ID using UUID
    - Call `generateRewardSchedule()` from `/web/src/lib/reward-algorithm.ts`
    - Assemble complete Contract object with createdAt timestamp
    - Save to localStorage using storage utility
    - Return created contract for navigation purposes
  - [x] 2.5 Ensure wizard store tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Verify navigation and state updates work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 2.1 pass
- Wizard can navigate forward and backward through steps
- Form data persists across step navigation
- Contract submission creates valid contract with reward schedule

---

### UI Components

#### Task Group 3: Wizard UI Components and Pages
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete wizard UI components
  - [x] 3.1 Write 4-6 focused tests for wizard UI
    - Test wizard layout renders with correct step indicator
    - Test Step 1 input validates and enables/disables Next button
    - Test Step 2 duration selection highlights selected option
    - Test confirmation screen displays all entered data
    - Skip exhaustive interaction testing for all fields
  - [x] 3.2 Create base wizard layout component
    - Location: `/web/src/components/contract-wizard/WizardLayout.tsx`
    - Step indicator showing progress (1 of 5, 2 of 5, etc.)
    - Back button (hidden on step 1)
    - Content area for step components
    - Mobile-first: centered content, max-width container
    - Minimum 44x44px tap targets for navigation
  - [x] 3.3 Create Step 1: Habit Title component
    - Location: `/web/src/components/contract-wizard/steps/HabitTitleStep.tsx`
    - Prompt: "What daily habit are you committing to?"
    - Helper text: "You'll do this every day"
    - Single-line text input, full-width on mobile
    - Placeholder examples rotating or static
    - Real-time validation feedback (min 3, max 60 chars)
    - Next button disabled until valid
  - [x] 3.4 Create Step 2: Duration Selection component
    - Location: `/web/src/components/contract-wizard/steps/DurationStep.tsx`
    - Prompt: "How long is your commitment?"
    - Four tappable cards/buttons: 7 days, 14 days, 21 days, 30 days
    - Clear visual distinction for selected option (border, background, checkmark)
    - Full-width cards on mobile, 2x2 grid on larger screens
    - Next button disabled until selection made
  - [x] 3.5 Create Step 3: Deposit Amount component
    - Location: `/web/src/components/contract-wizard/steps/DepositStep.tsx`
    - Prompt: "How much are you putting on the line?"
    - Preset amount buttons: $100, $250, $500, $1000
    - Custom input option with dollar prefix
    - Validation: $100 min, $1000 max
    - Clear error state for out-of-range amounts
    - Next button disabled until valid amount entered
  - [x] 3.6 Create Step 4: Start Date component
    - Location: `/web/src/components/contract-wizard/steps/StartDateStep.tsx`
    - Prompt: "When do you want to start?"
    - Two large tappable cards: "Today" and "Tomorrow"
    - Display actual date on each card (e.g., "Today - Dec 21")
    - Calculate dates dynamically based on current date
    - Clear visual distinction for selected option
    - Next button disabled until selection made
  - [x] 3.7 Create Step 5: Confirmation component
    - Location: `/web/src/components/contract-wizard/steps/ConfirmationStep.tsx`
    - Display summary: habit title, duration, deposit amount, start date
    - Primary action button: "Lock it in"
    - Optional: "Edit" or back navigation to modify selections
    - On confirm: trigger contract creation and navigate to success/dashboard
    - Loading state during contract creation
  - [x] 3.8 Create wizard page and routing
    - Location: `/web/src/app/contract/new/page.tsx`
    - Route: `/contract/new`
    - Render WizardLayout with step components based on current step
    - Handle navigation after successful contract creation
    - Mobile-first responsive layout with Tailwind
  - [x] 3.9 Apply consistent styling across all steps
    - Use Tailwind CSS mobile-first breakpoints
    - Consistent spacing, typography, and button styles
    - Large touch targets (min 44x44px) for all interactive elements
    - Centered content vertically for focused experience
    - Full-width inputs and buttons on mobile
  - [x] 3.10 Ensure wizard UI tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify components render and basic interactions work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- All 5 wizard steps render correctly
- Navigation works forward and backward
- Form validation prevents invalid progression
- Mobile-first design with 44x44px minimum tap targets
- Contract creation integrates with reward algorithm

---

### Testing

#### Task Group 4: Test Review and Integration Verification
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and verify end-to-end flow
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 3-4 tests written for foundation layer (Task 1.1)
    - Review the 3-4 tests written for wizard store (Task 2.1)
    - Review the 4-6 tests written for UI components (Task 3.1)
    - Total existing tests: approximately 10-14 tests
  - [x] 4.2 Analyze test coverage gaps for contract setup flow
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Prioritize end-to-end contract creation flow
    - Do NOT assess entire application test coverage
  - [x] 4.3 Write up to 6 additional strategic tests if needed
    - Add maximum of 6 new tests to fill identified critical gaps
    - Focus on: complete wizard flow from start to contract creation
    - Test: localStorage persistence after contract creation
    - Test: reward schedule generation integration
    - Skip edge cases and error scenarios unless business-critical
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to contract setup flow (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-20 tests maximum
    - Do NOT run the entire application test suite
    - Verify complete contract creation workflow passes
  - [x] 4.5 Manual verification of wizard flow
    - Walk through complete wizard flow manually
    - Verify localStorage contains correct contract data after submission
    - Verify reward schedule is generated and stored
    - Test on mobile viewport (320px width minimum)
    - Test basic keyboard navigation

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-20 tests total)
- Complete wizard flow works end-to-end
- Contract data persists correctly in localStorage
- Reward schedule is generated using existing algorithm
- No more than 6 additional tests added when filling in gaps

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer (Task Group 1)** - Types, schemas, and storage utilities
   - No dependencies, establishes data structures and validation
   - Enables all subsequent work

2. **Wizard State Management (Task Group 2)** - Zustand store and business logic
   - Depends on types and schemas from Group 1
   - Provides state management for UI components

3. **UI Components (Task Group 3)** - All wizard step components and page
   - Depends on state management from Group 2
   - Largest task group, builds the user-facing interface

4. **Test Review (Task Group 4)** - Integration verification and gap filling
   - Depends on all previous groups being complete
   - Final validation of complete feature

---

## Technical Notes

**Key Files to Create:**
- `/web/src/types/contract.ts` - TypeScript interfaces
- `/web/src/schemas/contract.ts` - Zod validation schemas
- `/web/src/lib/contract-storage.ts` - localStorage utilities
- `/web/src/stores/contract-wizard-store.ts` - Zustand state management
- `/web/src/components/contract-wizard/WizardLayout.tsx` - Base layout
- `/web/src/components/contract-wizard/steps/*.tsx` - Step components (5 files)
- `/web/src/app/contract/new/page.tsx` - Route page

**Existing Code to Integrate:**
- `/web/src/lib/reward-algorithm.ts` - Call `generateRewardSchedule()` on contract creation
- `/web/src/schemas/reward-simulator.ts` - Reference existing Zod schemas for duration and deposit

**localStorage Key:**
- `locked-in-contract` - Single contract storage (overwrites on new contract)

**No Backend Required:**
- This prototype has no API routes, database, or authentication
- All data persistence is client-side via localStorage
