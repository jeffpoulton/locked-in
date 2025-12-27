/**
 * Tests for Next.js authentication middleware.
 *
 * These tests verify route protection behavior:
 * - Public routes allow unauthenticated access
 * - Protected routes redirect to /login when unauthenticated
 * - Authenticated users on /login or /signup are redirected
 * - Session is refreshed on each request
 */

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
};

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, ...mockEnv };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

// Mock user state - can be changed per test
let mockUser: { id: string; email: string } | null = null;
let getUserCallCount = 0;

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => {
        getUserCallCount++;
        return Promise.resolve({
          data: { user: mockUser },
          error: null,
        });
      }),
    },
  })),
}));

// Mock NextResponse
const mockRedirect = jest.fn((url) => ({
  type: "redirect",
  url: url.toString(),
}));

const mockNext = jest.fn(() => ({
  type: "next",
  cookies: {
    set: jest.fn(),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => mockRedirect(url),
    next: (opts: unknown) => mockNext(opts),
  },
}));

// Helper to create mock request
function createMockRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    nextUrl: {
      pathname,
      clone: () => new URL(url),
      searchParams: url.searchParams,
    },
    cookies: {
      getAll: jest.fn(() => []),
      set: jest.fn(),
    },
  };
}

describe("Middleware Route Protection", () => {
  beforeEach(() => {
    mockUser = null;
    getUserCallCount = 0;
    mockRedirect.mockClear();
    mockNext.mockClear();
  });

  describe("Public Routes", () => {
    it("allows unauthenticated access to public routes", async () => {
      const { middleware } = require("../../middleware");
      const publicRoutes = ["/", "/login", "/signup", "/auth/callback"];

      for (const route of publicRoutes) {
        mockNext.mockClear();
        const request = createMockRequest(route);
        await middleware(request);

        // Should not redirect
        expect(mockRedirect).not.toHaveBeenCalled();
      }
    });
  });

  describe("Protected Routes", () => {
    it("redirects unauthenticated users from protected routes to /login", async () => {
      const { middleware } = require("../../middleware");
      const protectedRoutes = [
        "/dashboard",
        "/check-in",
        "/contract/new",
        "/contract/123",
        "/profile",
      ];

      for (const route of protectedRoutes) {
        mockRedirect.mockClear();
        const request = createMockRequest(route);
        const result = await middleware(request);

        expect(result.type).toBe("redirect");
        expect(result.url).toContain("/login");
        expect(result.url).toContain(`returnTo=${encodeURIComponent(route)}`);
      }
    });
  });

  describe("Authenticated User Redirects", () => {
    it("redirects authenticated users from /login to /dashboard", async () => {
      mockUser = { id: "test-user-id", email: "test@example.com" };
      const { middleware } = require("../../middleware");

      const request = createMockRequest("/login");
      const result = await middleware(request);

      expect(result.type).toBe("redirect");
      expect(result.url).toContain("/dashboard");
    });

    it("redirects authenticated users from /signup to /dashboard", async () => {
      mockUser = { id: "test-user-id", email: "test@example.com" };
      const { middleware } = require("../../middleware");

      const request = createMockRequest("/signup");
      const result = await middleware(request);

      expect(result.type).toBe("redirect");
      expect(result.url).toContain("/dashboard");
    });
  });

  describe("Session Refresh", () => {
    it("calls getUser to refresh session on each request", async () => {
      const { middleware } = require("../../middleware");

      getUserCallCount = 0;
      const request = createMockRequest("/");
      await middleware(request);

      expect(getUserCallCount).toBeGreaterThan(0);
    });
  });
});
