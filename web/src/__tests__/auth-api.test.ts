/**
 * Tests for auth API functionality.
 *
 * These tests verify:
 * - Auth callback exchanges code for session
 * - Auth callback handles errors appropriately
 * - requireUser retrieves user from cookie-based session
 * - requireUser creates Prisma user on first auth
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

// Mock supabase user state
let mockSupabaseUser: { id: string; email: string } | null = null;
let mockExchangeCodeError: Error | null = null;

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: mockSupabaseUser },
          error: mockSupabaseUser ? null : { message: "Not authenticated" },
        })
      ),
      exchangeCodeForSession: jest.fn((code) => {
        if (mockExchangeCodeError) {
          return Promise.resolve({
            data: { session: null },
            error: mockExchangeCodeError,
          });
        }
        if (code === "valid-code") {
          return Promise.resolve({
            data: { session: { access_token: "token" } },
            error: null,
          });
        }
        return Promise.resolve({
          data: { session: null },
          error: { message: "Invalid code" },
        });
      }),
    },
  })),
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      getAll: jest.fn(() => []),
      set: jest.fn(),
    })
  ),
}));

// Mock Prisma
let mockPrismaUser: { id: string; supabaseUserId: string; email: string } | null = null;
let prismaCreateCalled = false;

jest.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(() => Promise.resolve(mockPrismaUser)),
      create: jest.fn((args) => {
        prismaCreateCalled = true;
        return Promise.resolve({
          id: "new-user-id",
          ...args.data,
        });
      }),
    },
  },
}));

// Mock NextResponse
const mockRedirects: string[] = [];

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => {
      mockRedirects.push(url.toString());
      return {
        type: "redirect",
        url: url.toString(),
      };
    },
    next: () => ({ type: "next" }),
    json: (data: unknown) => ({ json: data }),
  },
}));

/**
 * Helper to create a cloneable URL object for testing.
 * Next.js's request.nextUrl has a clone() method that standard URL doesn't have.
 */
function createCloneableURL(urlString: string) {
  const url = new URL(urlString);
  return Object.assign(url, {
    clone: function () {
      return createCloneableURL(this.toString());
    },
  });
}

describe("Auth Callback Route", () => {
  beforeEach(() => {
    mockExchangeCodeError = null;
    mockRedirects.length = 0;
  });

  function createMockRequest(pathname: string, searchParams: Record<string, string> = {}) {
    const url = createCloneableURL(`http://localhost:3000${pathname}`);
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return {
      nextUrl: url,
    };
  }

  it("exchanges code for session successfully and redirects to dashboard", async () => {
    const { GET } = require("../app/auth/callback/route");

    const request = createMockRequest("/auth/callback", { code: "valid-code" });
    await GET(request);

    expect(mockRedirects[0]).toContain("/dashboard");
  });

  it("handles missing code and redirects to login with error", async () => {
    const { GET } = require("../app/auth/callback/route");

    const request = createMockRequest("/auth/callback");
    await GET(request);

    expect(mockRedirects[0]).toContain("/login");
    expect(mockRedirects[0]).toContain("error=auth_callback_failed");
  });

  it("redirects to returnTo parameter when provided", async () => {
    const { GET } = require("../app/auth/callback/route");

    const request = createMockRequest("/auth/callback", {
      code: "valid-code",
      next: "/contract/new",
    });
    await GET(request);

    expect(mockRedirects[0]).toContain("/contract/new");
  });
});

describe("requireUser", () => {
  beforeEach(() => {
    mockSupabaseUser = null;
    mockPrismaUser = null;
    prismaCreateCalled = false;
  });

  it("retrieves user from cookie-based session", async () => {
    mockSupabaseUser = { id: "supabase-user-id", email: "test@example.com" };
    mockPrismaUser = {
      id: "prisma-user-id",
      supabaseUserId: "supabase-user-id",
      email: "test@example.com",
    };

    const { requireUser } = require("../server/auth/requireUser");
    const user = await requireUser();

    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  it("throws AuthError when not authenticated", async () => {
    mockSupabaseUser = null;

    const { requireUser, AuthError } = require("../server/auth/requireUser");

    await expect(requireUser()).rejects.toThrow(AuthError);
  });

  it("creates Prisma user on first auth", async () => {
    mockSupabaseUser = { id: "new-supabase-user-id", email: "new@example.com" };
    mockPrismaUser = null;

    const { requireUser } = require("../server/auth/requireUser");
    const user = await requireUser();

    expect(prismaCreateCalled).toBe(true);
    expect(user.supabaseUserId).toBe("new-supabase-user-id");
  });
});
