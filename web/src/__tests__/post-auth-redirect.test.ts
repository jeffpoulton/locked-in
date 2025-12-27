/**
 * Tests for post-authentication redirect logic.
 *
 * These tests verify:
 * - Redirect to returnTo parameter when present
 * - Redirect to /dashboard when user has active contract
 * - Redirect to /contract/new when user has no contract
 */

// Mock contract-storage module
const mockLoadCompletedContract = jest.fn();
jest.mock("@/lib/contract-storage", () => ({
  loadCompletedContract: mockLoadCompletedContract,
}));

describe("getPostAuthRedirect", () => {
  // Store original window reference
  const originalWindow = global.window;

  beforeEach(() => {
    jest.resetModules();
    mockLoadCompletedContract.mockReset();

    // Mock window to enable client-side behavior
    // @ts-expect-error - Mocking window for tests
    global.window = {};
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("returns returnTo parameter when provided", () => {
    const { getPostAuthRedirect } = require("@/lib/auth/getPostAuthRedirect");
    const result = getPostAuthRedirect("/contract/new");
    expect(result).toBe("/contract/new");
  });

  it("rejects non-relative paths for security", () => {
    mockLoadCompletedContract.mockReturnValue(null);

    const { getPostAuthRedirect } = require("@/lib/auth/getPostAuthRedirect");

    // These should fallback to checking localStorage
    const result1 = getPostAuthRedirect("https://evil.com");
    expect(result1).toBe("/contract/new"); // No contract

    const result2 = getPostAuthRedirect("//evil.com");
    expect(result2).toBe("/contract/new"); // No contract
  });

  it("returns /dashboard when user has active contract with completed payment", () => {
    const contract = {
      id: "test-contract-id",
      habitDescription: "Exercise daily",
      amount: 5000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: "completed" as const,
      checkInTime: "09:00",
      habitType: "exercise" as const,
    };
    mockLoadCompletedContract.mockReturnValue(contract);

    const { getPostAuthRedirect } = require("@/lib/auth/getPostAuthRedirect");

    const result = getPostAuthRedirect();
    expect(result).toBe("/dashboard");
  });

  it("returns /contract/new when user has no contract", () => {
    mockLoadCompletedContract.mockReturnValue(null);

    const { getPostAuthRedirect } = require("@/lib/auth/getPostAuthRedirect");

    const result = getPostAuthRedirect();
    expect(result).toBe("/contract/new");
  });
});

describe("storeIntendedDestination and getStoredIntendedDestination", () => {
  const originalWindow = global.window;
  let mockSessionStorage: Record<string, string>;

  beforeEach(() => {
    jest.resetModules();
    mockSessionStorage = {};

    // Mock window with sessionStorage
    // @ts-expect-error - Mocking window for tests
    global.window = {};
    Object.defineProperty(global, "sessionStorage", {
      value: {
        getItem: (key: string) => mockSessionStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockSessionStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockSessionStorage[key];
        },
        clear: () => {
          mockSessionStorage = {};
        },
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("stores and retrieves intended destination", () => {
    const {
      storeIntendedDestination,
      getStoredIntendedDestination,
    } = require("@/lib/auth/getPostAuthRedirect");

    storeIntendedDestination("/profile");
    const result = getStoredIntendedDestination();

    expect(result).toBe("/profile");
  });

  it("clears stored destination after retrieval", () => {
    const {
      storeIntendedDestination,
      getStoredIntendedDestination,
    } = require("@/lib/auth/getPostAuthRedirect");

    storeIntendedDestination("/profile");
    getStoredIntendedDestination(); // First retrieval
    const result = getStoredIntendedDestination(); // Second retrieval

    expect(result).toBeNull();
  });
});
