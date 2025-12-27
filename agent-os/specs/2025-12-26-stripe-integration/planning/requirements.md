# Spec Requirements: Stripe Integration

## Initial Description

Roadmap Item #11: Stripe Integration for deposit collection in the Locked In habit accountability app.

The user wants to integrate Stripe payments into the existing web app flow, specifically:
- Automatically open Stripe payment when user clicks "Lock it in" button on the final step of creating a new cycle (contract)
- This is exploratory work - the user has never done a Stripe integration before
- Items 8-10 (auth, profile, database) are NOT done yet - the app currently uses localStorage (prototype phase)
- Focus is on deposit collection specifically

## Requirements Discussion

### First Round Questions

**Q1:** Payment Integration Approach - Stripe Checkout (hosted page) vs Stripe Elements (embedded form)?
**Answer:** Confirmed - Use Stripe Checkout (the hosted payment page that Stripe manages). This is faster to implement, handles PCI compliance, and requires less UI work.

**Q2:** Payment Flow Timing - Should the contract be created before or after payment?
**Answer:** Create the contract BEFORE payment, but with a status field indicating payment success/failure. The flow is: User clicks "Lock it in" -> Contract created with pending status -> Stripe Checkout opens -> Payment completes -> Status updated based on result.

**Q3:** Backend/Prototype Mode - Should this work without full auth/database?
**Answer:** Yes, prototype mode is acceptable. Create Checkout Sessions from Next.js API routes, but skip persisting payment data to a database for now. This validates the Stripe flow works before full backend integration.

**Q4:** Deposit Amount & Fees - How to handle Stripe's processing fee?
**Answer:** The user pays the Stripe processing fee on top of their deposit amount. Example: $100 deposit becomes ~$103.20 total (covering Stripe's ~2.9% + $0.30 fee). This ensures the full deposit amount goes to their accountability stake without awkward deductions from their balance or cost to Locked In.

**Q5:** Success/Failure States - What happens after payment?
**Answer:**
- Success: Navigate directly to dashboard (no intermediate confirmation screen)
- Failure/Cancellation: Navigate back to the cycle confirmation step (Step 6) with an option to retry Stripe payment. Show a toast message indicating payment was unsuccessful.

**Q6:** Stripe Account Setup - Does the user have a Stripe account?
**Answer:** Yes, the user has a Stripe account. They plan to use Stripe's new Sandbox feature for testing. Their live account is not yet verified and they don't want to transact real funds yet.

**Q7:** What should be explicitly OUT of scope?
**Answer:** Confirmed out of scope:
- Refund handling
- Webhook processing for payment status updates
- Wallet system integration
- Mobile payments (Apple Pay/Google Pay)

### Existing Code to Reference

**Similar Features Identified:**
- Contract creation wizard: `/Users/jeffpoulton/dev/projects/locked-in-stripe-integration/web/src/app/contract/new/page.tsx`
- ConfirmationStep (where "Lock it in" button lives): `/Users/jeffpoulton/dev/projects/locked-in-stripe-integration/web/src/components/contract-wizard/steps/ConfirmationStep.tsx`
- Contract actions/creation logic: `/Users/jeffpoulton/dev/projects/locked-in-stripe-integration/web/src/lib/contract-actions.ts`
- Contract wizard store (Zustand): `/Users/jeffpoulton/dev/projects/locked-in-stripe-integration/web/src/stores/contract-wizard-store.ts`
- Strava OAuth flow may have applicable patterns for external service integration

**Existing Patterns to Follow:**
- Next.js App Router API routes in `/app/api/`
- Zustand for state management
- Zod for validation schemas
- localStorage for prototype persistence
- TypeScript throughout

### Follow-up Questions

**Follow-up 1:** Status Options - What values should the paymentStatus field have?
**Answer:** Use `paymentStatus` field with three values: `"pending"` (created, awaiting payment), `"completed"` (payment successful), `"failed"` (payment declined/cancelled).

**Follow-up 2:** Contract Visibility - Should pending/failed contracts appear on dashboard?
**Answer:** No - only contracts with `paymentStatus: "completed"` should appear on the dashboard. Pending state is temporary during Stripe redirect. Failed contracts are essentially abandoned drafts. Surfacing pending/failed contracts is out of scope for this spec (future enhancement).

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes. UI should follow existing app patterns and Stripe Checkout's default hosted experience.

## Requirements Summary

### Functional Requirements

**Core Payment Flow:**
- When user clicks "Lock it in" on ConfirmationStep, create contract with `paymentStatus: "pending"`
- Redirect user to Stripe Checkout hosted payment page
- Pass deposit amount + calculated Stripe fee as the total charge amount
- On successful payment: update contract to `paymentStatus: "completed"`, redirect to dashboard
- On failed/cancelled payment: update contract to `paymentStatus: "failed"`, redirect to ConfirmationStep with retry option and error toast

**Contract Model Changes:**
- Add `paymentStatus` field to Contract type: `"pending"` | `"completed"` | `"failed"`
- Add `stripeSessionId` field to track the Checkout Session (for potential future webhook integration)
- Filter dashboard to only show contracts where `paymentStatus: "completed"`

**API Requirements:**
- New API route to create Stripe Checkout Session (e.g., `POST /api/stripe/create-checkout-session`)
- Accept contract details (deposit amount, contract ID)
- Calculate and add Stripe fee to total
- Return Checkout Session URL for redirect

**Fee Calculation:**
- Stripe fee formula: (amount * 0.029) + 0.30
- To ensure user pays exact deposit + fee: charge = (deposit + 0.30) / (1 - 0.029)
- Example: $100 deposit -> charge ~$103.20

**Environment Setup:**
- Stripe Sandbox mode for development/testing
- Environment variables: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Stripe SDK dependencies: `stripe` (server), `@stripe/stripe-js` (client)

### Reusability Opportunities

- Existing ConfirmationStep component needs modification (not replacement)
- Existing contract-actions.ts can be extended for payment status
- Existing contract-wizard-store.ts may need payment state additions
- Follow existing toast/notification patterns if they exist in the codebase

### Scope Boundaries

**In Scope:**
- Stripe Checkout integration for deposit collection
- Contract paymentStatus field and filtering
- Stripe fee calculation (user pays fee)
- Success redirect to dashboard
- Failure redirect to confirmation with retry and toast
- Stripe Sandbox configuration for testing
- Basic API route for creating Checkout Sessions

**Out of Scope:**
- Refund handling
- Webhook processing for payment status updates
- Wallet system integration
- Mobile payments (Apple Pay/Google Pay)
- Surfacing pending/failed contracts on dashboard
- Database persistence (using localStorage prototype mode)
- User authentication integration
- Receipt/email confirmation handling

### Technical Considerations

**Integration Points:**
- Modify ConfirmationStep to trigger Stripe flow instead of direct contract creation
- Add payment status to Contract schema/type
- Create new API route for Stripe Checkout Session creation
- Handle Stripe redirect URLs (success_url, cancel_url)

**Existing System Constraints:**
- Currently using localStorage (no database yet)
- No user authentication yet
- Next.js App Router architecture
- Zustand for state management
- TypeScript strict mode

**Technology Preferences:**
- Stripe Checkout (hosted) over Stripe Elements (embedded)
- Stripe Sandbox for testing
- Follow existing tech stack: Next.js 14+, TypeScript, Tailwind CSS

**Security Notes:**
- Stripe secret key must be server-side only (API routes)
- Publishable key can be client-side
- All Stripe operations happen server-side per project security model
