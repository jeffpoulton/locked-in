/**
 * Tests for Strava API routes
 *
 * These tests verify the OAuth callback, token refresh, and activities fetch endpoints.
 * All Strava API calls are mocked to isolate our API layer.
 */

// Mock fetch globally before importing anything
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock NextRequest and NextResponse
class MockNextRequest {
  private _url: string;
  private _method: string;
  private _body: string | null;

  constructor(url: string, options?: { method?: string; body?: string }) {
    this._url = url;
    this._method = options?.method || "GET";
    this._body = options?.body || null;
  }

  get url() {
    return this._url;
  }

  get method() {
    return this._method;
  }

  async json() {
    return this._body ? JSON.parse(this._body) : {};
  }

  get nextUrl() {
    const urlObj = new URL(this._url);
    return {
      searchParams: urlObj.searchParams,
    };
  }

  get headers() {
    return new Map();
  }
}

jest.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
      _data: data,
    }),
  },
}));

// Import route handlers after mocking
import { GET as callbackHandler } from "@/app/api/integrations/strava/callback/route";
import { POST as refreshHandler } from "@/app/api/integrations/strava/refresh/route";
import { GET as activitiesHandler } from "@/app/api/integrations/strava/activities/route";

describe("Strava API Routes", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Set up environment variables for tests
    process.env.STRAVA_CLIENT_ID = "test_client_id";
    process.env.STRAVA_CLIENT_SECRET = "test_client_secret";
    process.env.STRAVA_REDIRECT_URI = "http://localhost:3000/strava/callback";
  });

  afterEach(() => {
    delete process.env.STRAVA_CLIENT_ID;
    delete process.env.STRAVA_CLIENT_SECRET;
    delete process.env.STRAVA_REDIRECT_URI;
  });

  describe("OAuth Callback (/api/integrations/strava/callback)", () => {
    it("successfully exchanges authorization code for tokens", async () => {
      const mockTokenResponse = {
        access_token: "mock_access_token_12345",
        refresh_token: "mock_refresh_token_67890",
        expires_at: 1735000000,
        athlete: { id: 12345 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      const request = new MockNextRequest(
        "http://localhost:3000/api/integrations/strava/callback?code=auth_code_abc123"
      );

      const response = await callbackHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.access_token).toBe("mock_access_token_12345");
      expect(data.refresh_token).toBe("mock_refresh_token_67890");
      expect(data.expires_at).toBe(1735000000);

      // Verify the correct Strava API call was made
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.strava.com/oauth/token",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );
    });

    it("returns error when authorization code is missing", async () => {
      const request = new MockNextRequest(
        "http://localhost:3000/api/integrations/strava/callback"
      );

      const response = await callbackHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("Token Refresh (/api/integrations/strava/refresh)", () => {
    it("successfully refreshes an expired access token", async () => {
      const mockRefreshResponse = {
        access_token: "new_access_token_xyz",
        refresh_token: "new_refresh_token_abc",
        expires_at: 1735100000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      });

      const request = new MockNextRequest(
        "http://localhost:3000/api/integrations/strava/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refresh_token: "old_refresh_token" }),
        }
      );

      const response = await refreshHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.access_token).toBe("new_access_token_xyz");
      expect(data.refresh_token).toBe("new_refresh_token_abc");
      expect(data.expires_at).toBe(1735100000);
    });

    it("returns error when refresh token is invalid", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid refresh token" }),
      });

      const request = new MockNextRequest(
        "http://localhost:3000/api/integrations/strava/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refresh_token: "invalid_token" }),
        }
      );

      const response = await refreshHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe("Activities Fetch (/api/integrations/strava/activities)", () => {
    it("fetches activities within date range", async () => {
      const mockActivities = [
        { id: 1, type: "Run", start_date: "2024-01-15T08:00:00Z" },
        { id: 2, type: "Ride", start_date: "2024-01-16T10:00:00Z" },
        { id: 3, type: "Swim", start_date: "2024-01-17T06:00:00Z" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities,
      });

      const startDate = "2024-01-15";
      const endDate = "2024-01-17";
      const request = new MockNextRequest(
        `http://localhost:3000/api/integrations/strava/activities?access_token=valid_token&startDate=${startDate}&endDate=${endDate}`
      );

      const response = await activitiesHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activities).toHaveLength(3);
      expect(data.activities[0].type).toBe("Run");
      expect(data.activities[1].type).toBe("Ride");
      expect(data.activities[2].type).toBe("Swim");

      // Verify Strava API was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://www.strava.com/api/v3/athlete/activities"),
        expect.objectContaining({
          headers: { Authorization: "Bearer valid_token" },
        })
      );
    });

    it("returns error when access token is invalid", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Authorization Error" }),
      });

      const request = new MockNextRequest(
        "http://localhost:3000/api/integrations/strava/activities?access_token=invalid_token&startDate=2024-01-15&endDate=2024-01-17"
      );

      const response = await activitiesHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });
});
