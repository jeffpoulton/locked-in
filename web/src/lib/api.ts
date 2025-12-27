export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper for API calls.
 *
 * Authentication is handled automatically via cookies (set by @supabase/ssr).
 * Same-origin requests include cookies by default, so no manual Authorization
 * header is needed.
 *
 * @param endpoint - API endpoint path (without /api prefix)
 * @param options - Standard fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-OK responses
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    // Ensure cookies are included with same-origin requests (default behavior)
    credentials: "same-origin",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}
