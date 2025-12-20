# Task Breakdown: Variable Reward Allocation Algorithm & Test Harness

## Overview
Total Tasks: 24

This spec implements the core VIDC reward allocation algorithm and an admin-facing test harness. The algorithm is pure TypeScript with no database dependencies, using a seeded PRNG for deterministic, reproducible reward schedules.

## Task List

### Algorithm Layer

#### Task Group 1: Core Algorithm Module
**Dependencies:** None

- [x] 1.0 Complete core algorithm module
  - [x] 1.1 Write 2-6 focused tests for algorithm functionality
    - Test determinism: same seed produces identical output
    - Test reward day count is within 20-85% of duration
    - Test individual reward amounts are within 2-80% of principal
    - Test all rewards sum to exactly 100% of deposit (no rounding errors)
    - Test edge cases: minimum duration (7 days), maximum duration (30 days)
  - [x] 1.2 Implement seeded pseudo-random number generator (PRNG)
    - Use mulberry32 or similar well-established algorithm
    - Accept string seed input (e.g., contract ID)
    - Pure function with no side effects
    - Location: `/web/src/lib/prng.ts`
  - [x] 1.3 Create Zod schemas for algorithm inputs
    - Schema for seed (non-empty string)
    - Schema for duration (integer 7-30)
    - Schema for depositAmount (number 100-1000)
    - Export both schemas and inferred TypeScript types
    - Location: `/web/src/schemas/reward-simulator.ts`
  - [x] 1.4 Implement reward schedule generation algorithm
    - Accept inputs: seed, duration, depositAmount
    - Calculate reward day count: random 20-85% of total days
    - Select which days receive rewards
    - Distribute amounts ensuring each is 2-80% of principal
    - Ensure exact 100% sum (handle rounding in final amount)
    - Return array of { day: number, amount: number }
    - Location: `/web/src/lib/reward-algorithm.ts`
  - [x] 1.5 Ensure algorithm tests pass
    - Run ONLY the 2-6 tests written in 1.1
    - Verify determinism and constraint satisfaction
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 1.1 pass
- Same seed always produces identical reward schedule
- Reward frequency is within 20-85% of total days
- Individual rewards are within 2-80% of deposit
- All rewards sum to exactly 100% of deposit
- Algorithm is pure and stateless

### API Layer

#### Task Group 2: API Endpoints
**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer
  - [x] 2.1 Write 2-4 focused tests for API endpoints
    - Test generate endpoint returns valid schedule for valid input
    - Test generate endpoint returns 400 for invalid input
    - Test simulate endpoint calculates correct recovered/forfeited amounts
    - Test simulate endpoint handles preset scenarios
  - [x] 2.2 Create generate schedule API route
    - POST endpoint at `/api/admin/reward-simulator/generate`
    - Accept JSON body: { seed, duration, depositAmount }
    - Validate input using Zod schemas from 1.3
    - Return schedule with metadata (totalDays, rewardDayCount, rewards array)
    - Follow error handling pattern from `/api/auth/me/route.ts`
    - Return 200 on success, 400 for validation errors
  - [x] 2.3 Create simulate completion API route
    - POST endpoint at `/api/admin/reward-simulator/simulate`
    - Accept JSON body: { schedule, completedDays: number[] }
    - Calculate totalRecovered, totalForfeited, dayBreakdown
    - Support preset scenario identifiers: "perfect", "miss-all", "weekend-skipper", "random-80"
    - Return 200 with simulation results
  - [x] 2.4 Ensure API tests pass
    - Run ONLY the 2-4 tests written in 2.1
    - Verify endpoints return correct status codes and data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 2.1 pass
- Generate endpoint creates valid reward schedules
- Simulate endpoint correctly calculates outcomes
- Validation errors return 400 with descriptive messages
- API follows project patterns for error handling

### Frontend Layer

#### Task Group 3: Test Harness UI
**Dependencies:** Task Group 2

- [x] 3.0 Complete test harness UI
  - [x] 3.1 Write 2-4 focused tests for UI components
    - Test form validation displays errors for invalid input
    - Test generate button calls API and displays results
    - Test simulation toggles update outcome calculations
    - Test preset buttons apply correct day selections
  - [x] 3.2 Create admin page structure
    - Create page at `/web/src/app/admin/reward-simulator/page.tsx`
    - Use client component with "use client" directive
    - Set up TanStack Query for API calls
    - Basic page layout with Tailwind CSS
  - [x] 3.3 Build contract configuration panel
    - Duration input (slider or number input, 7-30)
    - Deposit amount input ($100-$1,000)
    - Seed field with auto-generation and custom input option
    - "Generate Schedule" button
    - Inline validation error display using Zod schemas
    - Use Shadcn form components
  - [x] 3.4 Build reward visualization display
    - Table showing all days: Day, Has Reward, Amount, Status columns
    - Color coding for reward vs non-reward days
    - Summary statistics panel: total days, reward days, reward percentage, deposit
  - [x] 3.5 Build simulation controls
    - Day-by-day checkboxes/toggles to mark complete/missed
    - Preset scenario buttons:
      - "Perfect completion" (all days)
      - "Complete miss" (no days)
      - "Weekend skipper" (miss Sat/Sun)
      - "Random 80%" (randomly ~80% of days)
    - Running totals display: recovered amount, forfeited amount
    - Real-time updates as days are toggled
  - [x] 3.6 Ensure UI component tests pass
    - Run ONLY the 2-4 tests written in 3.1
    - Verify form validation and API integration
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 3.1 pass
- Configuration form validates input and displays errors
- Schedule generates and displays correctly in table
- Simulation controls update outcomes in real-time
- Preset scenarios apply correct day selections
- UI uses Tailwind CSS (Shadcn components if available, otherwise basic HTML)

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-6 tests written by algorithm developer (Task 1.1)
    - Review the 2-4 tests written by API developer (Task 2.1)
    - Review the 2-4 tests written by UI developer (Task 3.1)
    - Total existing tests: approximately 6-14 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Identify critical workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's requirements
    - Do NOT assess entire application test coverage
    - Prioritize algorithm constraint edge cases and integration points
  - [x] 4.3 Write up to 6 additional strategic tests maximum
    - Focus on algorithm edge cases if not covered:
      - Minimum deposit ($100) with maximum duration (30 days)
      - Maximum deposit ($1,000) with minimum duration (7 days)
      - Verify rounding never causes sum deviation from deposit
    - Focus on integration if not covered:
      - End-to-end flow: generate schedule, simulate completion, verify amounts
    - Do NOT write exhaustive coverage for all scenarios
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature
    - Expected total: approximately 12-20 tests maximum
    - Do NOT run the entire application test suite
    - Verify all feature tests pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 12-20 tests total)
- Critical algorithm constraints are verified
- End-to-end workflow from generation to simulation is covered
- No more than 6 additional tests added when filling gaps
- Testing focused exclusively on this spec's requirements

## Execution Order

Recommended implementation sequence:

1. **Algorithm Layer (Task Group 1)** - Core algorithm with PRNG and schedule generation
2. **API Layer (Task Group 2)** - Endpoints that expose algorithm functionality
3. **Frontend Layer (Task Group 3)** - Test harness UI that calls the API
4. **Test Review (Task Group 4)** - Final test gap analysis and verification

## File Structure

```
/web/src/
  lib/
    prng.ts                    # Seeded PRNG implementation
    reward-algorithm.ts        # Core reward schedule generation
    __tests__/
      reward-algorithm.test.ts           # Algorithm unit tests (7 tests)
      reward-algorithm-integration.test.ts # Integration tests (5 tests)
  schemas/
    reward-simulator.ts        # Zod schemas for inputs/outputs
  app/
    admin/
      reward-simulator/
        page.tsx               # Test harness page
        __tests__/
          reward-simulator-ui.test.ts    # UI logic tests (9 tests)
    api/
      admin/
        reward-simulator/
          generate/
            route.ts           # Generate schedule endpoint
          simulate/
            route.ts           # Simulate completion endpoint
          __tests__/
            reward-simulator-api.test.ts # API tests (4 tests)
```

## Technical Notes

- **PRNG**: Use mulberry32 algorithm - simple, well-tested, sufficient for this use case
- **Rounding Strategy**: Distribute rounding error to the last reward to ensure exact 100% sum
- **Schema Sharing**: Zod schemas in `/schemas/` are imported by both API routes and client components
- **No Auth**: Admin pages are protected by convention only for MVP (no authentication checks)
- **TanStack Query**: Use mutations for generate and simulate API calls
