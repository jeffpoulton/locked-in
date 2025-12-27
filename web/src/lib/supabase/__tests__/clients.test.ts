/**
 * Tests for Supabase SSR client utilities.
 *
 * These tests verify that the client factories can be imported and
 * return the expected interface when provided with proper configuration.
 */

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
};

// Store original env
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, ...mockEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
    },
  })),
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
  })),
}));

// Mock next/headers for server client
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      getAll: jest.fn(() => []),
      set: jest.fn(),
    })
  ),
}));

describe("Browser Client", () => {
  it("can be created without errors", () => {
    const { createClient } = require("../browser");
    const client = createClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("throws error when environment variables are missing", () => {
    process.env = { ...originalEnv };
    jest.resetModules();

    const { createClient } = require("../browser");
    expect(() => createClient()).toThrow("Missing Supabase environment variables");
  });
});

describe("Server Client", () => {
  it("can be created with mock cookies", async () => {
    const { createClient } = require("../server");
    const client = await createClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});

describe("Middleware Client", () => {
  it("can be created and returns expected interface", () => {
    const { NextRequest } = require("next/server");
    const { createClient } = require("../middleware");

    // Create a mock request
    const mockRequest = {
      cookies: {
        getAll: jest.fn(() => []),
        set: jest.fn(),
      },
      nextUrl: new URL("http://localhost:3000"),
    };

    const result = createClient(mockRequest);

    expect(result).toBeDefined();
    expect(result.supabase).toBeDefined();
    expect(result.response).toBeDefined();
    expect(result.supabase.auth).toBeDefined();
  });
});
