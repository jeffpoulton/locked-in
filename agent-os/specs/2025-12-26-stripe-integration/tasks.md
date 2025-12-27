# Task Breakdown: Stripe Checkout Integration

## Overview
Total Tasks: 24 (across 5 task groups)

This tasks list implements Stripe Checkout for deposit collection in the Locked In habit commitment app. The integration enables users to pay their deposit + processing fee when clicking "Lock it in" on the contract creation wizard.

## Task List

### Environment & Infrastructure

#### Task Group 1: Stripe SDK Setup and Configuration
**Dependencies:** None

- [x] 1.0 Complete Stripe infrastructure setup
  - [x] 1.1 Install Stripe dependencies
    - Add `stripe` package (server-side SDK)
    - Add `@stripe/stripe-js` package (client-side)
    - Run install and verify packages in `package.json`
  - [x] 1.2 Create environment configuration
    - Add `STRIPE_SECRET_KEY` to `.env.local` (server-only)
    - Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
    - Configure for Stripe Sandbox mode
    - Add example entries to `.env.example` if it exists
  - [x] 1.3 Create Stripe server utility module
    - Create `/web/src/lib/stripe.ts`
    - Initialize Stripe SDK with secret key
    - Export configured Stripe instance for API routes
    - Follow pattern from existing environment variable checks in Strava callback
  - [x] 1.4 Verify Stripe configuration
    - Ensure secret key is not exposed to client bundle
    - Confirm SDK initializes without errors in development

**Acceptance Criteria:**
- Stripe packages installed and listed in `package.json`
- Environment variables configured for Sandbox mode
- Stripe server utility exports configured instance
- Secret key remains server-side only

---

### Schema & Storage Layer

#### Task Group 2: Contract Schema Extensions
**Dependencies:** Task Group 1

- [x] 2.0 Complete contract schema and storage updates
  - [x] 2.1 Write 3 focused tests for contract schema changes
    - Test that `paymentStatus` field accepts valid enum values ("pending", "completed", "failed")
    - Test that `stripeSessionId` field is optional and accepts string
    - Test that existing contract validation still works with new fields
  - [x] 2.2 Extend contract schema with payment fields
    - Add `paymentStatus` field to `/web/src/schemas/contract.ts`
    - Define as Zod enum: `z.enum(["pending", "completed", "failed"])`
    - Add `stripeSessionId` field as `z.string().optional()`
    - Update `Contract` type inference to include new fields
  - [x] 2.3 Create fee calculation utility
    - Create `/web/src/lib/stripe-fee.ts`
    - Implement formula: `chargeAmount = (depositAmount + 0.30) / (1 - 0.029)`
    - Export `calculateStripeCharge(depositAmount: number)` function
    - Export `calculateStripeFee(depositAmount: number)` function
    - Ensure calculations use proper decimal handling (avoid floating point issues)
  - [x] 2.4 Update contract storage utilities
    - Add `updateContractPaymentStatus(id: string, status: PaymentStatus, sessionId?: string)` function to `/web/src/lib/contract-storage.ts`
    - Add `loadCompletedContract()` function that filters by `paymentStatus: "completed"`
    - Follow existing JSON serialization patterns
  - [x] 2.5 Update createContract function
    - Modify `/web/src/lib/contract-actions.ts` to accept optional `paymentStatus` parameter
    - Default to `"pending"` when creating contract before Stripe redirect
    - Accept optional `stripeSessionId` parameter
  - [x] 2.6 Ensure schema and storage tests pass
    - Run the 3 tests written in 2.1
    - Verify new contract fields work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3 tests written in 2.1 pass
- Contract schema includes `paymentStatus` and `stripeSessionId` fields
- Fee calculation produces correct amounts (e.g., $100 -> ~$103.20)
- Storage utilities can update payment status
- `loadCompletedContract()` filters correctly

---

### API Layer

#### Task Group 3: Stripe API Routes
**Dependencies:** Task Group 2

- [x] 3.0 Complete Stripe API endpoints
  - [x] 3.1 Write 4 focused tests for API endpoints
    - Test checkout session creation returns valid URL
    - Test validation rejects invalid deposit amounts
    - Test missing environment variables returns 500 error
    - Test session verification returns correct payment status
  - [x] 3.2 Create checkout session API route
    - Create `/web/src/app/api/stripe/create-checkout-session/route.ts`
    - Accept POST with `{ contractId: string, depositAmount: number }` body
    - Validate request body with Zod schema
    - Calculate charge amount using fee utility
    - Create Stripe Checkout Session with:
      - `mode: "payment"`
      - `success_url` pointing to `/contract/new/success?session_id={CHECKOUT_SESSION_ID}`
      - `cancel_url` pointing to `/contract/new/cancel?session_id={CHECKOUT_SESSION_ID}`
      - `metadata.contractId` for tracking
    - Return `{ url: session.url }` for client redirect
    - Follow error handling patterns from Strava callback
  - [x] 3.3 Create session verification utility
    - Add `verifyCheckoutSession(sessionId: string)` function to `/web/src/lib/stripe.ts`
    - Retrieve session from Stripe API
    - Return payment status and metadata
    - Handle session not found and API errors
  - [x] 3.4 Ensure API tests pass
    - Run the 4 tests written in 3.1 with mocked Stripe SDK
    - Verify request validation works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4 tests written in 3.1 pass
- Checkout session API returns valid Stripe URL
- Request validation rejects malformed requests
- Environment variable validation works correctly
- Session verification retrieves correct status

---

### Frontend Components

#### Task Group 4: UI Updates and Callback Flows
**Dependencies:** Task Group 3

- [x] 4.0 Complete UI components and callback handling
  - [x] 4.1 Write 4 focused tests for UI components
    - Test ConfirmationStep displays fee breakdown correctly
    - Test "Lock it in" button shows loading state during redirect
    - Test success page updates contract status
    - Test cancel page shows retry option
  - [x] 4.2 Create Toast notification component
    - Create `/web/src/components/ui/Toast.tsx`
    - Support `error` and `success` variants
    - Include auto-dismiss functionality (5 second default)
    - Position at bottom of screen
    - Include dismiss button
    - Create Zustand store for toast state in `/web/src/stores/toast-store.ts`
    - Follow existing component patterns in codebase
  - [x] 4.3 Update ConfirmationStep with fee display
    - Modify `/web/src/components/contract-wizard/steps/ConfirmationStep.tsx`
    - Add fee breakdown section showing:
      - Deposit amount (from formData)
      - Processing fee (calculated)
      - Total charge (deposit + fee)
    - Format amounts as currency
    - Add explanatory text that user pays processing fee on top of deposit
  - [x] 4.4 Modify ConfirmationStep submit flow
    - Update `handleSubmit` to:
      1. Create contract with `paymentStatus: "pending"` (save to localStorage)
      2. Call `/api/stripe/create-checkout-session` with contractId and depositAmount
      3. Use `window.location.href` to redirect to Stripe URL (not Next.js router)
    - Maintain existing loading state (`isSubmitting`) during redirect preparation
    - Handle API errors with error message display
    - Disable button during redirect
  - [x] 4.5 Create success callback page
    - Create `/web/src/app/contract/new/success/page.tsx`
    - Read `session_id` from URL query params
    - Verify session with Stripe API (via internal API call)
    - Update contract `paymentStatus` to `"completed"` in localStorage
    - Clear wizard state
    - Show brief success indicator (optional, as redirect is immediate)
    - Redirect to `/dashboard`
    - Handle verification failures gracefully
  - [x] 4.6 Create cancel callback page
    - Create `/web/src/app/contract/new/cancel/page.tsx`
    - Read `session_id` from URL query params
    - Update contract `paymentStatus` to `"failed"` in localStorage
    - Display toast notification indicating payment was unsuccessful
    - Redirect to `/contract/new` at step 6 (ConfirmationStep)
    - Include retry message and clear path to try again
  - [x] 4.7 Update dashboard contract loading
    - Modify dashboard or contract loading logic to filter by `paymentStatus: "completed"`
    - Use new `loadCompletedContract()` function
    - Ensure pending/failed contracts do not appear on dashboard
  - [x] 4.8 Ensure UI component tests pass
    - Run the 4 tests written in 4.1
    - Verify fee display renders correctly
    - Verify callback flows work end-to-end
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4 tests written in 4.1 pass
- ConfirmationStep shows accurate fee breakdown
- Toast component displays error messages correctly
- Success flow updates status and redirects to dashboard
- Cancel flow shows error and allows retry
- Dashboard only shows completed contracts

---

### Testing & Verification

#### Task Group 5: Integration Testing and Gap Analysis
**Dependencies:** Task Groups 1-4

- [x] 5.0 Review tests and verify complete integration
  - [x] 5.1 Review tests from Task Groups 2-4
    - Review the 3 tests from schema layer (Task 2.1)
    - Review the 4 tests from API layer (Task 3.1)
    - Review the 4 tests from UI layer (Task 4.1)
    - Total existing tests: 11 tests
  - [x] 5.2 Analyze test coverage gaps for Stripe integration
    - Identify any critical user workflows lacking coverage
    - Focus ONLY on gaps related to this spec's features
    - Prioritize end-to-end payment flow testing
  - [x] 5.3 Write up to 5 additional integration tests if needed
    - Add maximum of 5 new tests to fill identified gaps
    - Consider testing:
      - Full payment flow (form submit -> Stripe redirect -> callback)
      - Edge case: user navigates away during redirect
      - Fee calculation edge cases (minimum $100, maximum $1000)
    - Mock Stripe API calls in tests
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 5.4 Manual end-to-end verification with Stripe Sandbox
    - Test complete flow in development environment:
      1. Navigate to contract wizard
      2. Complete all steps to ConfirmationStep
      3. Verify fee breakdown displays correctly
      4. Click "Lock it in"
      5. Verify redirect to Stripe Checkout
      6. Complete test payment (use Stripe test card 4242 4242 4242 4242)
      7. Verify redirect back to success page
      8. Verify contract appears on dashboard with completed status
    - Test cancel flow:
      1. Repeat steps 1-5
      2. Click cancel/back on Stripe Checkout
      3. Verify redirect to cancel page
      4. Verify error toast displays
      5. Verify retry option works
  - [x] 5.5 Run all feature-specific tests
    - Run all tests related to Stripe integration (from 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 11-16 tests
    - Verify all critical workflows pass
    - Do NOT run the entire application test suite unless requested

**Acceptance Criteria:**
- All feature-specific tests pass (11-16 tests total)
- Manual end-to-end flow works in Stripe Sandbox
- Success and cancel flows both function correctly
- Fee calculations are accurate in UI and API
- Dashboard correctly filters by payment status

---

## Execution Order

Recommended implementation sequence:

1. **Environment & Infrastructure (Task Group 1)** - Set up Stripe SDK and configuration first, as all other tasks depend on this foundation
2. **Schema & Storage Layer (Task Group 2)** - Extend contract schema and storage before API or UI can use the new fields
3. **API Layer (Task Group 3)** - Create Stripe API endpoints that the frontend will consume
4. **Frontend Components (Task Group 4)** - Update UI and callback pages last, as they depend on API and schema
5. **Testing & Verification (Task Group 5)** - Final verification after all features are implemented

---

## Technical Notes

### Key Files to Modify
- `/web/src/schemas/contract.ts` - Add payment status fields
- `/web/src/lib/contract-storage.ts` - Add payment status update function
- `/web/src/lib/contract-actions.ts` - Accept payment status in createContract
- `/web/src/components/contract-wizard/steps/ConfirmationStep.tsx` - Add fee display and Stripe redirect

### Key Files to Create
- `/web/src/lib/stripe.ts` - Stripe SDK initialization
- `/web/src/lib/stripe-fee.ts` - Fee calculation utilities
- `/web/src/app/api/stripe/create-checkout-session/route.ts` - Checkout session API
- `/web/src/app/contract/new/success/page.tsx` - Success callback page
- `/web/src/app/contract/new/cancel/page.tsx` - Cancel callback page
- `/web/src/components/ui/Toast.tsx` - Toast notification component
- `/web/src/stores/toast-store.ts` - Toast state management

### Fee Calculation Reference
- Stripe fee: 2.9% + $0.30
- Charge formula: `chargeAmount = (depositAmount + 0.30) / (1 - 0.029)`
- Example: $100 deposit -> $103.20 total charge ($3.20 fee)

### Test Cards for Sandbox
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Any future expiry date and CVC work
