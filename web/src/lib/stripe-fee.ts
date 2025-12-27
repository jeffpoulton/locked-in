/**
 * Stripe fee calculation utilities.
 *
 * Stripe charges 2.9% + $0.30 per transaction.
 * To ensure the user pays the exact deposit amount plus the fee,
 * we use the inverse formula to calculate the charge amount.
 *
 * Formula: chargeAmount = (depositAmount + 0.30) / (1 - 0.029)
 */

/** Stripe's percentage fee (2.9%) as a decimal */
const STRIPE_PERCENTAGE_FEE = 0.029;

/** Stripe's fixed fee per transaction in dollars */
const STRIPE_FIXED_FEE = 0.30;

/**
 * Calculate the total charge amount that covers the deposit plus Stripe's fees.
 *
 * This uses the inverse formula to ensure that after Stripe takes its cut,
 * the exact deposit amount is collected.
 *
 * @param depositAmount - The deposit amount in dollars (e.g., 100)
 * @returns The total charge amount in dollars (e.g., 103.20 for $100 deposit)
 */
export function calculateStripeCharge(depositAmount: number): number {
  // Formula: chargeAmount = (depositAmount + 0.30) / (1 - 0.029)
  const chargeAmount = (depositAmount + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);

  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(chargeAmount * 100) / 100;
}

/**
 * Calculate just the fee amount for a given deposit.
 *
 * @param depositAmount - The deposit amount in dollars
 * @returns The fee amount in dollars
 */
export function calculateStripeFee(depositAmount: number): number {
  const chargeAmount = calculateStripeCharge(depositAmount);
  const fee = chargeAmount - depositAmount;

  // Round to 2 decimal places
  return Math.round(fee * 100) / 100;
}

/**
 * Convert a dollar amount to cents for Stripe API.
 * Stripe API requires amounts in the smallest currency unit (cents for USD).
 *
 * @param dollars - The amount in dollars
 * @returns The amount in cents (integer)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
