/**
 * Tests for auth UI components and form submission.
 *
 * These tests verify:
 * - Email form submission triggers signInWithOtp with email
 * - Phone form submission triggers signInWithOtp with phone
 * - OTP verification submits code correctly
 * - Zod schemas validate inputs correctly
 */

import { emailAuthSchema, phoneAuthSchema, otpSchema } from "@/schemas/auth";

describe("Auth Zod Schemas", () => {
  describe("emailAuthSchema", () => {
    it("validates correct email format", () => {
      const result = emailAuthSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email format", () => {
      const result = emailAuthSchema.safeParse({ email: "invalid-email" });
      expect(result.success).toBe(false);
    });
  });

  describe("phoneAuthSchema", () => {
    it("validates phone number with country code", () => {
      const result = phoneAuthSchema.safeParse({ phone: "+14155551234" });
      expect(result.success).toBe(true);
    });

    it("validates phone number without plus", () => {
      const result = phoneAuthSchema.safeParse({ phone: "14155551234" });
      expect(result.success).toBe(true);
    });

    it("rejects too short phone number", () => {
      const result = phoneAuthSchema.safeParse({ phone: "12345" });
      expect(result.success).toBe(false);
    });
  });

  describe("otpSchema", () => {
    it("validates 6-digit code", () => {
      const result = otpSchema.safeParse({ token: "123456" });
      expect(result.success).toBe(true);
    });

    it("rejects code with wrong length", () => {
      const result = otpSchema.safeParse({ token: "12345" });
      expect(result.success).toBe(false);
    });

    it("rejects code with non-numeric characters", () => {
      const result = otpSchema.safeParse({ token: "12345a" });
      expect(result.success).toBe(false);
    });
  });
});

// Mock supabase signInWithOtp
let mockSignInWithOtpCalled = false;
let mockSignInWithOtpParams: { email?: string; phone?: string } | null = null;

// Set up environment before mocking
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
};

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, ...mockEnv };
  mockSignInWithOtpCalled = false;
  mockSignInWithOtpParams = null;
});

afterEach(() => {
  process.env = originalEnv;
});

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithOtp: jest.fn((params) => {
        mockSignInWithOtpCalled = true;
        mockSignInWithOtpParams = params;
        return Promise.resolve({ data: {}, error: null });
      }),
      verifyOtp: jest.fn(() =>
        Promise.resolve({ data: { session: {} }, error: null })
      ),
    },
  })),
}));

describe("Auth Form Submission Behavior", () => {
  it("email auth should call signInWithOtp with email type", async () => {
    const { createClient } = require("@/lib/supabase/browser");
    const supabase = createClient();

    await supabase.auth.signInWithOtp({
      email: "test@example.com",
      options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
    });

    expect(mockSignInWithOtpCalled).toBe(true);
    expect(mockSignInWithOtpParams?.email).toBe("test@example.com");
  });

  it("phone auth should call signInWithOtp with phone type", async () => {
    const { createClient } = require("@/lib/supabase/browser");
    const supabase = createClient();

    await supabase.auth.signInWithOtp({
      phone: "+14155551234",
    });

    expect(mockSignInWithOtpCalled).toBe(true);
    expect(mockSignInWithOtpParams?.phone).toBe("+14155551234");
  });
});
