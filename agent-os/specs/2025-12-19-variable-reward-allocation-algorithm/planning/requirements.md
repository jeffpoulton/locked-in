# Spec Requirements: Variable Reward Allocation Algorithm & Test Harness

## Initial Description

**Feature:** Variable Reward Allocation Algorithm & Test Harness

**Source:** Product Roadmap - Phase 1, Item #1

**Description:**

Implement the core VIDC algorithm that randomly distributes the deposited amount across 20-85% of contract days with varying reward amounts (2-80% of principal per day). Build an admin-facing test harness UI to visualize generated reward distributions across sample contracts and simulate user scenarios (completing/missing days) to observe reward/forfeiture outcomes.

**Effort Estimate:** L (2 weeks)

**Phase:** MVP - Core Contract Mechanism

**Priority:** First feature in roadmap - foundational to the entire product

## Requirements Discussion

### First Round Questions

**Q1:** I assume the algorithm parameters from the psychological framework document are definitive: reward frequency of 20-85% of days, individual reward amounts of 2-80% of principal per day, with all rewards summing to exactly 100% of principal. Is that correct, or should any of these ranges be adjusted?

**Answer:** The ranges (20-85% of days, 2-80% per reward, sum to 100%) are correct to start with.

**Q2:** I'm thinking the algorithm should be deterministic given a seed (so the same contract ID or seed produces the same distribution every time for consistency). Should we use a seeded pseudo-random number generator, or is true randomness acceptable even if it means the same contract could theoretically produce different distributions on regeneration?

**Answer:** User was initially unsure and requested clarification. After explanation (see Follow-up section), user agreed to proceed with seeded/deterministic approach as recommended.

**Q3:** I assume minimum contract duration is 7 days (to ensure the algorithm has enough days to distribute rewards meaningfully) and maximum is 90 days. Is that correct, or do you have specific duration bounds in mind?

**Answer:** Duration is 7-30 days. Deposit range is $100-$1,000. User updated mission.md to be consistent with roadmap.md.

**Q4:** For the admin test harness, I'm assuming this is a developer/admin-only page (not user-facing) that lets you: (a) generate sample distributions for various contract configurations, (b) visualize the reward allocation across days as a chart/table, and (c) run simulations where you mark days as complete/missed to see outcomes. Is this scope correct, or should it include additional capabilities?

**Answer:** Confirmed correct (generate, visualize, simulate).

**Q5:** I assume the test harness should support bulk generation (e.g., "generate 100 sample contracts and show distribution statistics") to validate the algorithm produces expected patterns. Is statistical validation a priority, or is single-contract visualization sufficient for MVP?

**Answer:** Start with single contract for MVP. Bulk generation/statistical validation is not needed initially.

**Q6:** For the simulation feature, should it support preset scenarios (e.g., "user completes all days", "user misses days 5, 10, 15", "user misses first week") in addition to manual day-by-day clicking?

**Answer:** Yes, include both presets AND manual day-by-day simulation.

**Q7:** I assume this will be a pure TypeScript algorithm module with no database persistence initially - the algorithm generates a reward schedule on demand, and future specs (Contract Creation, Reward Processing) will handle storing and using these schedules. Is that correct, or should this spec also include the database schema for RewardSchedule storage?

**Answer:** Correct - pure TypeScript module, no DB schema in this spec.

**Q8:** Is there anything that should explicitly be OUT of scope for this spec that you want to clarify upfront (e.g., no user-facing UI, no API endpoints, no integration with other contract flows)?

**Answer:** No admin auth needed. Just implement the algo, write unit tests, and create a basic route to interact with the simulator.

### Existing Code to Reference

No similar existing features identified for reference. This is 100% greenfield - the first real work beyond initial tech stack setup.

### Follow-up Questions

**Follow-up 1:** Seeding Explanation

User requested clarification on how seeding works. Explanation provided:

A "seed" is a starting value for a random number generator that makes the "random" output reproducible. Given the same seed, you get the same sequence of random numbers every time.

**Example - Without Seeding (True Random):**
```
Contract #ABC created for 21 days, $100 deposit

First generation:  Day 3: $15, Day 7: $8, Day 12: $42, Day 18: $35
Second generation: Day 1: $22, Day 5: $5, Day 9: $18, Day 14: $31, Day 20: $24
```
Each time you call the algorithm, you get a completely different distribution.

**Example - With Seeding (Deterministic Random):**
```
Contract #ABC created for 21 days, $100 deposit
Seed: "contract-ABC-v1"

First generation:  Day 3: $15, Day 7: $8, Day 12: $42, Day 18: $35
Second generation: Day 3: $15, Day 7: $8, Day 12: $42, Day 18: $35  (identical!)
```

**Recommendation accepted:** Use seeding with the contract ID for reproducibility without storing the full schedule, ability to verify/audit schedules, simpler data model, and easy testing.

**Follow-up 2:** You mentioned wanting a "basic route to interact with the simulator" - I assume this means a Next.js page route (e.g., `/admin/reward-simulator`) rather than an API endpoint. Is that correct, or do you want both a page AND API routes that the page calls?

**Answer:** Both a page AND API routes that the page calls. The reward schedule algorithm should be defined server-side and be highly unit testable.

**Follow-up 3:** For the preset simulation scenarios, I'm thinking these defaults: "Perfect completion" (all days), "Complete miss" (no days), "Weekend skipper" (miss Saturdays and Sundays), "Random 80% completion" (randomly complete ~80% of days). Are these reasonable presets?

**Answer:** The suggested presets are perfectly reasonable.

**Follow-up 4:** Regarding seeding - based on my explanation above, should we implement the seeded/deterministic approach?

**Answer:** "I still don't know how to answer the seed question, but let's start with it since you recommend it and see where it goes." Proceeding with seeded/deterministic approach.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes at this point. UI design will be developer-driven based on functional requirements.

## Requirements Summary

### Functional Requirements

**Core Algorithm:**
- Generate reward schedules for contracts with configurable parameters:
  - Contract duration: 7-30 days
  - Deposit amount: $100-$1,000
  - Reward frequency: 20-85% of contract days receive rewards
  - Individual reward amounts: 2-80% of principal per reward day
  - Total rewards: Must sum to exactly 100% of principal
- Use seeded pseudo-random number generation for deterministic, reproducible schedules
- Accept a seed value (e.g., contract ID) and always produce identical output for the same seed
- Pure TypeScript implementation with no database dependencies

**Test Harness Page:**
- Admin-facing page at a route like `/admin/reward-simulator`
- No authentication required for this admin page
- Generate and display reward schedules for sample contract configurations
- Visualize reward allocation across days (table and/or chart format)
- Show which days have rewards and the amount for each reward day

**Simulation Feature:**
- Allow manual day-by-day simulation (click to mark each day as complete/missed)
- Support preset simulation scenarios:
  - "Perfect completion" - all days completed
  - "Complete miss" - no days completed
  - "Weekend skipper" - miss all Saturdays and Sundays
  - "Random 80% completion" - randomly complete approximately 80% of days
- Display simulation outcomes:
  - Total recovered amount
  - Total forfeited amount
  - Day-by-day breakdown of results

**API Routes:**
- Server-side API routes that the test harness page calls
- Algorithm logic lives server-side for testability and future reuse
- RESTful design following project API standards

**Unit Tests:**
- Comprehensive unit tests for the reward allocation algorithm
- Test determinism (same seed = same output)
- Test constraint satisfaction (reward frequency within bounds, amounts within bounds, sum to 100%)
- Test edge cases (minimum/maximum duration, minimum/maximum deposit)

### Reusability Opportunities

This is greenfield development with no existing code to reference. However, the algorithm module should be designed for reuse by future specs:
- Contract Creation Flow will call this algorithm when creating new contracts
- Reward Processing Engine will use the same algorithm to verify reward schedules
- The seeded approach allows regeneration on demand without database storage

### Scope Boundaries

**In Scope:**
- Core VIDC reward allocation algorithm (TypeScript module)
- Seeded pseudo-random number generation for determinism
- Test harness page with visualization
- Day-by-day simulation with manual and preset modes
- API routes for the test harness
- Unit tests for the algorithm

**Out of Scope:**
- User-facing UI (this is admin/developer only)
- Admin authentication/authorization
- Database schema or persistence
- Integration with Contract Creation or other flows
- Bulk generation or statistical analysis
- Mobile implementation

### Technical Considerations

**Architecture:**
- Algorithm implemented as a pure TypeScript module in the web project
- API routes in Next.js App Router (`/app/api/...`)
- Test harness page in Next.js App Router (`/app/admin/...` or similar)
- Unit tests using Jest

**Algorithm Design:**
- Input: seed (string), duration (number), depositAmount (number)
- Output: Array of reward day objects with day number and amount
- Must be stateless and side-effect free for testability
- Consider using a well-known seeded PRNG library or implementing one

**Tech Stack Alignment:**
- TypeScript strict mode
- Zod for input validation
- Tailwind CSS for test harness styling
- Shadcn for design sytem and components
- Follow project conventions for API routes and error handling

**Constraints:**
- Reward frequency: Math.floor(duration * 0.20) to Math.floor(duration * 0.85) reward days
- Individual reward: 2% to 80% of deposit per reward day
- Sum constraint: All reward amounts must sum to exactly the deposit amount (100%)
- The algorithm must handle the mathematical challenge of generating random amounts that satisfy all constraints simultaneously
