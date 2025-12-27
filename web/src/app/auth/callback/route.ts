import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler for magic link redirects.
 *
 * This route handles the redirect from Supabase when a user clicks a magic link.
 * It exchanges the authorization code for a session and redirects the user
 * to their intended destination.
 *
 * GET /auth/callback?code=<authorization_code>&next=<optional_redirect>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const returnTo = searchParams.get("next") || searchParams.get("returnTo");

  // Default redirect destination
  const defaultRedirect = "/dashboard";
  const redirectTo = returnTo || defaultRedirect;

  if (!code) {
    console.error("Auth callback: No code provided");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "auth_callback_failed");
    url.searchParams.set("error_description", "No authorization code provided");
    return NextResponse.redirect(url);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback: Code exchange failed", error);
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "auth_callback_failed");
      url.searchParams.set("error_description", error.message);
      return NextResponse.redirect(url);
    }

    // Successful authentication - redirect to intended destination
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.search = ""; // Clear query params for clean redirect
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Auth callback: Unexpected error", error);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "auth_callback_failed");
    url.searchParams.set(
      "error_description",
      "An unexpected error occurred during authentication"
    );
    return NextResponse.redirect(url);
  }
}
