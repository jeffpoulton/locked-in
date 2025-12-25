import { NextRequest, NextResponse } from "next/server";

/**
 * Strava token refresh handler.
 * Exchanges a refresh token for a new access token when the current one expires.
 * Strava access tokens expire after 6 hours.
 *
 * POST /api/integrations/strava/refresh
 * Body: { refresh_token: string }
 *
 * Returns: { access_token, refresh_token, expires_at }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Strava OAuth: Missing client credentials in environment");
      return NextResponse.json(
        { error: "Strava integration not configured" },
        { status: 500 }
      );
    }

    // Request new tokens using the refresh token
    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("Strava token refresh failed:", errorData);

      // Return 401 for authentication errors (expired/invalid refresh token)
      if (tokenResponse.status === 401) {
        return NextResponse.json(
          { error: "Refresh token is expired or invalid" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    // Return the new tokens
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
    });
  } catch (error) {
    console.error("Error in Strava token refresh:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
