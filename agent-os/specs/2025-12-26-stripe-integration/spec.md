# Specification: Stripe Checkout Integration

## Goal
Integrate Stripe Checkout to collect deposit payments when users click "Lock it in" on the contract creation wizard, enabling real payment processing while maintaining prototype mode (localStorage persistence).

## User Stories
- As a user creating a habit contract, I want to securely pay my deposit amount so that my commitment has real financial stakes
- As a user, I want to see the full cost (deposit + processing fee) upfront so that I understand exactly what I am paying

## Specific Requirements

**Stripe Checkout Session Creation**
- Create new API route `POST /api/stripe/create-checkout-session` to generate Stripe Checkout Sessions
- Accept contract ID and deposit amount in request body, validate with Zod schema
- Calculate total charge using fee formula: `chargeAmount = (depositAmount + 0.30) / (1 - 0.029)` to cover Stripe fees
- Return Checkout Session URL for client-side redirect
- Use Stripe SDK server-side only (`stripe` package), keep secret key server-side

**Contract Payment Status Model**
- Add `paymentStatus` field to contract schema: `"pending"` | `"completed"` | `"failed"`
- Add optional `stripeSessionId` field to track the Checkout Session ID for future webhook integration
- Create contract with `paymentStatus: "pending"` before redirecting to Stripe
- Update status to `"completed"` on success callback, `"failed"` on cancel/failure

**Modified Lock It In Flow**
- Modify `ConfirmationStep` to create contract with pending status, then redirect to Stripe Checkout
- Use `window.location.href` for redirect to Stripe's hosted payment page (not Next.js router)
- Pass contract ID as metadata to Stripe session for tracking
- Disable "Lock it in" button and show loading state during redirect preparation

**Success Flow Handling**
- Create success callback route `/contract/new/success` that receives `session_id` query param
- Verify session status with Stripe API, update contract `paymentStatus` to `"completed"`
- Clear wizard state and redirect to `/dashboard`
- Only contracts with `paymentStatus: "completed"` appear on dashboard (add filter to `loadContract`)

**Failure/Cancel Flow Handling**
- Create cancel callback route `/contract/new/cancel` that receives `session_id` query param
- Update contract `paymentStatus` to `"failed"` in localStorage
- Redirect back to `/contract/new` at step 6 (ConfirmationStep) with error state
- Display toast notification indicating payment was unsuccessful with retry option

**Toast Notification System**
- Implement simple toast component for error/success feedback (no external library in package.json currently)
- Create reusable `Toast` component with auto-dismiss functionality
- Support error variant for payment failure message
- Position at bottom of screen, dismissible

**Environment Configuration**
- Add `STRIPE_SECRET_KEY` (server-only) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variables
- Configure for Stripe Sandbox mode during development
- Add `stripe` and `@stripe/stripe-js` packages to dependencies
- Create Stripe client utility module for server-side SDK initialization

**Fee Display in UI**
- Show breakdown on ConfirmationStep: deposit amount, processing fee, and total charge
- Calculate and display fee amount: `fee = chargeAmount - depositAmount`
- Make it clear that the user is paying the processing fee on top of their deposit

## Visual Design
No visual assets provided. Follow existing app patterns and Stripe Checkout's default hosted experience.

## Existing Code to Leverage

**ConfirmationStep Component (`/web/src/components/contract-wizard/steps/ConfirmationStep.tsx`)**
- Modify `handleSubmit` function to integrate Stripe flow instead of direct contract creation
- Reuse existing loading state (`isSubmitting`) for redirect preparation
- Extend error handling pattern for payment failures

**Contract Actions (`/web/src/lib/contract-actions.ts`)**
- Extend `createContract` function to accept optional `paymentStatus` parameter
- Reuse validation logic from `isFormDataComplete` function
- Follow existing pattern of generating contract ID before save

**Contract Schema (`/web/src/schemas/contract.ts`)**
- Add `paymentStatus` field with Zod enum: `z.enum(["pending", "completed", "failed"])`
- Add optional `stripeSessionId` field: `z.string().optional()`
- Update `Contract` type inference to include new fields

**Strava OAuth Callback Pattern (`/web/src/app/api/integrations/strava/callback/route.ts`)**
- Follow same API route structure for Stripe callback handling
- Reuse error response patterns and environment variable checking
- Apply similar try-catch error handling approach

**Contract Storage (`/web/src/lib/contract-storage.ts`)**
- Extend `loadContract` to optionally filter by `paymentStatus`
- Add helper function to update contract payment status in localStorage
- Reuse existing JSON serialization patterns

## Out of Scope
- Refund handling and refund API endpoints
- Webhook processing for asynchronous payment status updates
- Wallet system integration for managing user balances
- Mobile payments (Apple Pay/Google Pay) in Stripe Checkout
- Surfacing pending or failed contracts on the dashboard UI
- Database persistence (continuing to use localStorage prototype mode)
- User authentication integration
- Receipt or email confirmation handling
- Multiple payment methods beyond card
- Subscription or recurring payments
