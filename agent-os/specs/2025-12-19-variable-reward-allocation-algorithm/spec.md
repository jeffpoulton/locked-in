# Specification: Variable Reward Allocation Algorithm & Test Harness

## Goal

Implement the core VIDC reward allocation algorithm that randomly distributes deposited amounts across contract days with variable reward amounts, and build an admin-facing test harness to visualize and simulate reward distributions.

## User Stories

- As a developer, I want to generate reproducible reward schedules for any contract configuration so that I can verify the algorithm produces valid distributions
- As an admin, I want to visualize how rewards are distributed across contract days so that I can understand and validate the VIDC mechanism

## Specific Requirements

**Seeded Pseudo-Random Number Generator**
- Implement a deterministic PRNG that accepts a string seed (e.g., contract ID)
- Same seed must always produce identical output for reproducibility
- Use a well-established algorithm (e.g., mulberry32 or similar) rather than Math.random()
- The PRNG should be a pure function with no side effects for testability

**Reward Schedule Generation Algorithm**
- Accept three inputs: seed (string), duration (7-30 days), depositAmount ($100-$1,000)
- Calculate reward day count: random value between 20-85% of total duration days
- Distribute rewards across selected days with individual amounts between 2-80% of principal
- Ensure all reward amounts sum to exactly 100% of the deposit (no rounding errors)
- Return an array of objects containing day number and reward amount
- Algorithm must be stateless and side-effect free

**Input Validation with Zod**
- Create Zod schemas for algorithm inputs (seed, duration, depositAmount)
- Validate duration is an integer between 7 and 30
- Validate depositAmount is a number between 100 and 1000
- Validate seed is a non-empty string
- Share schemas between API routes and client-side validation

**API Route: Generate Schedule**
- POST endpoint at `/api/admin/reward-simulator/generate`
- Accept JSON body with seed, duration, and depositAmount
- Return generated reward schedule with metadata (total days, reward day count, etc.)
- Follow existing API patterns from `/api/auth/me/route.ts`
- Return appropriate HTTP status codes (200, 400 for validation errors)

**API Route: Simulate Completion**
- POST endpoint at `/api/admin/reward-simulator/simulate`
- Accept reward schedule and array of completed day numbers
- Calculate and return: total recovered, total forfeited, day-by-day breakdown
- Support both manual day selection and preset scenario identifiers

**Test Harness Page**
- Create admin page at `/admin/reward-simulator`
- No authentication required (admin-only by convention for MVP)
- Use Tailwind CSS and Shadcn components for styling
- Build as client components that call API routes via TanStack Query

**Contract Configuration Panel**
- Form inputs for: duration (7-30 slider or input), deposit amount ($100-$1,000)
- Auto-generated seed field with option to customize
- "Generate Schedule" button to create new distribution
- Display validation errors inline using Zod schema

**Reward Visualization Display**
- Table showing all contract days with columns: Day, Has Reward, Amount, Status
- Visual indicator (color coding) for reward vs non-reward days
- Summary statistics: total days, reward days, reward percentage, deposit amount
- Consider optional bar chart visualization for reward distribution

**Simulation Controls**
- Day-by-day checkboxes or toggles to mark each day as complete/missed
- Preset scenario buttons: "Perfect completion", "Complete miss", "Weekend skipper", "Random 80%"
- Real-time calculation of outcomes as days are toggled
- Clear visual display of running totals for recovered and forfeited amounts

## Visual Design

No visual assets provided. UI design is developer-driven based on functional requirements. Use Shadcn component library for consistent styling with existing project patterns.

## Existing Code to Leverage

**API Route Pattern (`/web/src/app/api/auth/me/route.ts`)**
- Follow the existing try-catch error handling structure
- Use NextRequest/NextResponse patterns consistently
- Return JSON with appropriate HTTP status codes
- Log errors to console with descriptive context

**Zod Schema Pattern (`/web/src/schemas/user.ts`)**
- Define schemas in `/web/src/schemas/` directory
- Export both schema and inferred TypeScript type
- Use z.infer for type derivation

**API Client Pattern (`/web/src/lib/api.ts`)**
- Use apiFetch helper for client-side API calls (though auth not required here)
- Follow ApiError pattern for error handling on client

**Project Structure**
- Algorithm module should go in `/web/src/server/services/` or `/web/src/lib/`
- Schemas in `/web/src/schemas/`
- Admin page in `/web/src/app/admin/reward-simulator/`

## Out of Scope

- User-facing UI (this is admin/developer only)
- Admin authentication or authorization checks
- Database schema or persistence of reward schedules
- Integration with Contract Creation or other application flows
- Bulk generation or statistical analysis across multiple contracts
- Mobile implementation
- Real-time updates or WebSocket functionality
- Export functionality (CSV, PDF)
- Historical data or schedule versioning
- Internationalization or currency formatting beyond USD
