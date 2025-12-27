import Stripe from "stripe";

/**
 * Server-side Stripe client instance.
 *
 * IMPORTANT: This module should only be imported in server-side code (API routes).
 * The STRIPE_SECRET_KEY must never be exposed to the client.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

/**
 * Check if Stripe is properly configured.
 * Returns false if the secret key is missing.
 */
export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey);
}

/**
 * Get the configured Stripe instance.
 * Throws an error if STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

/**
 * Verify a Stripe Checkout Session and return its status.
 *
 * @param sessionId - The Stripe Checkout Session ID
 * @returns Session data including payment status and metadata
 * @throws Error if session not found or API error
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  contractId: string | null;
}> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    paymentStatus: session.payment_status,
    contractId: session.metadata?.contractId ?? null,
  };
}
