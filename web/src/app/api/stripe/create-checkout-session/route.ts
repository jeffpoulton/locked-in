import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { calculateStripeCharge, dollarsToCents } from "@/lib/stripe-fee";

/**
 * Request body schema for creating a Stripe Checkout Session.
 */
const createCheckoutSessionSchema = z.object({
  contractId: z.string().uuid("Contract ID must be a valid UUID"),
  depositAmount: z
    .number()
    .min(100, "Deposit must be at least $100")
    .max(1000, "Deposit must be at most $1000"),
});

/**
 * POST /api/stripe/create-checkout-session
 *
 * Creates a Stripe Checkout Session for deposit payment.
 * Returns the checkout URL for client-side redirect.
 *
 * Request body:
 * - contractId: string (UUID) - The ID of the contract being paid for
 * - depositAmount: number - The deposit amount in dollars (100-1000)
 *
 * Response:
 * - url: string - The Stripe Checkout URL to redirect the user to
 * - sessionId: string - The Stripe Checkout Session ID for tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!isStripeConfigured()) {
      console.error("Stripe: STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCheckoutSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { contractId, depositAmount } = validationResult.data;

    // Calculate total charge amount (deposit + Stripe fee)
    const chargeAmount = calculateStripeCharge(depositAmount);
    const chargeAmountCents = dollarsToCents(chargeAmount);

    // Get the base URL for callbacks
    const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Habit Contract Deposit",
              description: `Deposit of $${depositAmount.toFixed(2)} + processing fee`,
            },
            unit_amount: chargeAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        contractId,
        depositAmount: depositAmount.toString(),
      },
      success_url: `${baseUrl}/contract/new/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/contract/new/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.url) {
      console.error("Stripe: Session created but URL is missing");
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
