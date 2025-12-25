import { NextRequest, NextResponse } from "next/server";

/**
 * Strava activities fetch handler.
 * Fetches user activities within a specified date range.
 *
 * GET /api/integrations/strava/activities?access_token=<token>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>&refresh_token=<optional>
 *
 * Returns: { activities: Array<{ id, type, start_date, ... }> }
 *
 * Note: Strava API uses epoch timestamps for date filtering (after/before params).
 * The per_page limit is set to 100, which should be sufficient for typical date ranges.
 * For very large date ranges, pagination may be needed (not implemented in prototype).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get("access_token");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Both startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Convert dates to epoch timestamps for Strava API
    // Start of startDate (00:00:00)
    const afterTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    // End of endDate (23:59:59)
    const beforeTimestamp = Math.floor(
      new Date(endDate + "T23:59:59").getTime() / 1000
    );

    // Build Strava API URL with date range filters
    const stravaUrl = new URL(
      "https://www.strava.com/api/v3/athlete/activities"
    );
    stravaUrl.searchParams.set("after", afterTimestamp.toString());
    stravaUrl.searchParams.set("before", beforeTimestamp.toString());
    stravaUrl.searchParams.set("per_page", "100"); // Max activities per request

    let activitiesResponse = await fetch(stravaUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If token expired and refresh token provided, try to refresh
    if (activitiesResponse.status === 401 && refreshToken) {
      const refreshResult = await attemptTokenRefresh(refreshToken);

      if (refreshResult.success && refreshResult.access_token) {
        // Retry with new access token
        activitiesResponse = await fetch(stravaUrl.toString(), {
          headers: {
            Authorization: `Bearer ${refreshResult.access_token}`,
          },
        });

        // Include new tokens in response so client can update localStorage
        if (activitiesResponse.ok) {
          const activities = await activitiesResponse.json();
          return NextResponse.json({
            activities: activities.map(formatActivity),
            new_tokens: {
              access_token: refreshResult.access_token,
              refresh_token: refreshResult.refresh_token,
              expires_at: refreshResult.expires_at,
            },
          });
        }
      }
    }

    if (!activitiesResponse.ok) {
      const errorData = await activitiesResponse.json().catch(() => ({}));
      console.error("Strava activities fetch failed:", errorData);

      if (activitiesResponse.status === 401) {
        return NextResponse.json(
          { error: "Access token is invalid or expired" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: activitiesResponse.status }
      );
    }

    const activities = await activitiesResponse.json();

    return NextResponse.json({
      activities: activities.map(formatActivity),
    });
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Formats a Strava activity to include only the fields we need.
 */
function formatActivity(activity: {
  id: number;
  type: string;
  start_date: string;
  name?: string;
  distance?: number;
  moving_time?: number;
}) {
  return {
    id: activity.id,
    type: activity.type,
    start_date: activity.start_date,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
  };
}

/**
 * Attempts to refresh the access token using the refresh token.
 */
async function attemptTokenRefresh(refreshToken: string): Promise<{
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}> {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false };
    }

    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return { success: false };
    }

    const tokenData = await tokenResponse.json();
    return {
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
    };
  } catch {
    return { success: false };
  }
}
