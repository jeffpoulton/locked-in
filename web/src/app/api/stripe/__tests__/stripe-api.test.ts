import { NextRequest } from "next/server";
import { POST } from "../create-checkout-session/route";

// Mock the Stripe module
jest.mock("@/lib/stripe", () => ({
  isStripeConfigured: jest.fn(),
  getStripe: jest.fn(),
}));

// Import mocked functions
import { isStripeConfigured, getStripe } from "@/lib/stripe";

const mockIsStripeConfigured = isStripeConfigured as jest.MockedFunction<typeof isStripeConfigured>;
const mockGetStripe = getStripe as jest.MockedFunction<typeof getStripe>;

describe("Stripe API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/stripe/create-checkout-session", () => {
    it("returns valid Stripe checkout URL when session is created successfully", async () => {
      // Mock Stripe configuration
      mockIsStripeConfigured.mockReturnValue(true);

      // Mock Stripe SDK
      const mockSession = {
        id: "cs_test_session_123",
        url: "https://checkout.stripe.com/pay/cs_test_session_123",
      };

      mockGetStripe.mockReturnValue({
        checkout: {
          sessions: {
            create: jest.fn().mockResolvedValue(mockSession),
          },
        },
      } as unknown as ReturnType<typeof getStripe>);

      // Create request
      const request = new NextRequest("http://localhost:3000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          contractId: "123e4567-e89b-12d3-a456-426614174000",
          depositAmount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe("https://checkout.stripe.com/pay/cs_test_session_123");
      expect(data.sessionId).toBe("cs_test_session_123");
    });

    it("rejects invalid deposit amounts with 400 error", async () => {
      mockIsStripeConfigured.mockReturnValue(true);

      // Test deposit amount below minimum
      const request = new NextRequest("http://localhost:3000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: "123e4567-e89b-12d3-a456-426614174000",
          depositAmount: 50, // Below $100 minimum
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request");
      expect(data.details).toBeDefined();
    });

    it("returns 500 error when Stripe environment variables are missing", async () => {
      // Mock Stripe as not configured
      mockIsStripeConfigured.mockReturnValue(false);

      const request = new NextRequest("http://localhost:3000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: "123e4567-e89b-12d3-a456-426614174000",
          depositAmount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Payment service not configured");
    });

    it("validates contract ID as UUID and rejects invalid format", async () => {
      mockIsStripeConfigured.mockReturnValue(true);

      const request = new NextRequest("http://localhost:3000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: "not-a-valid-uuid",
          depositAmount: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request");
    });
  });
});
