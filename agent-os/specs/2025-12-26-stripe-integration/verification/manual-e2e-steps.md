# Manual E2E Verification Steps for Stripe Checkout Integration

This document outlines the steps for manual end-to-end testing of the Stripe Checkout integration with Stripe Sandbox.

## Prerequisites

1. Stripe Sandbox account configured
2. Environment variables set in `.env.local`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Development server running (`npm run dev`)

## Test Cards

- **Successful payment:** `4242 4242 4242 4242`
- **Declined payment:** `4000 0000 0000 0002`
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)

---

## Success Flow Test

### Steps

1. **Navigate to contract wizard**
   - Open `http://localhost:3000/contract/new`
   - Verify wizard loads at Step 1 (Habit Title)

2. **Complete wizard steps 1-5**
   - Step 1: Enter a habit title (e.g., "Exercise for 30 minutes")
   - Step 2: Select verification method (Honor System or Strava)
   - Step 3: Select duration (7, 14, 21, or 30 days)
   - Step 4: Select deposit amount ($100-$1000)
   - Step 5: Select start date (Today or Tomorrow)

3. **Verify ConfirmationStep (Step 6)**
   - Confirm fee breakdown displays correctly:
     - Deposit amount matches selection
     - Processing fee is calculated (~2.9% + $0.30)
     - Total charge equals deposit + fee
   - Example: $100 deposit should show ~$103.20 total

4. **Click "Lock it in"**
   - Button should show loading state ("Preparing payment...")
   - Should redirect to Stripe Checkout page

5. **Complete Stripe payment**
   - Enter test card: `4242 4242 4242 4242`
   - Enter any future expiry date
   - Enter any 3-digit CVC
   - Enter any name and postal code
   - Click "Pay"

6. **Verify success redirect**
   - Should redirect to `/contract/new/success`
   - Should briefly show "Payment successful!" message
   - Should auto-redirect to `/dashboard`

7. **Verify dashboard**
   - Contract should appear on dashboard
   - Verify habit title, duration, and deposit amount are correct

---

## Cancel Flow Test

### Steps

1. **Navigate to contract wizard**
   - Open `http://localhost:3000/contract/new`

2. **Complete wizard steps 1-5**
   - Same as success flow steps 1-5

3. **Click "Lock it in"**
   - Should redirect to Stripe Checkout page

4. **Cancel at Stripe Checkout**
   - Click the back arrow or "Cancel" link on Stripe page

5. **Verify cancel redirect**
   - Should redirect to `/contract/new/cancel`
   - Should briefly show "Payment cancelled" message
   - Should auto-redirect to `/contract/new`

6. **Verify error toast**
   - Toast notification should appear at bottom of screen
   - Message: "Payment was not completed. You can try again."
   - Toast should auto-dismiss after 5 seconds

7. **Verify retry capability**
   - Should return to Step 6 (ConfirmationStep)
   - All previous selections should be preserved
   - User can click "Lock it in" again to retry

---

## Edge Cases to Test

1. **Invalid deposit amount**
   - Try to submit with amount below $100 or above $1000
   - API should reject with validation error

2. **Network error**
   - Disable network during API call
   - Error message should display in ConfirmationStep

3. **Session expiration**
   - Wait long time on Stripe Checkout
   - Verify proper error handling

4. **Direct navigation to callback pages**
   - Visit `/contract/new/success` directly (no session_id)
   - Should show error and "Start over" button
   - Visit `/contract/new/cancel` directly
   - Should handle gracefully

---

## Verification Checklist

- [ ] Fee calculation displays correctly ($100 deposit = ~$103.20 total)
- [ ] "Lock it in" shows loading state during redirect
- [ ] Stripe Checkout opens correctly
- [ ] Successful payment redirects to dashboard
- [ ] Cancelled payment shows error toast
- [ ] Dashboard only shows completed contracts
- [ ] Pending/failed contracts do not appear on dashboard
- [ ] All Stripe-related tests pass (259 tests)
