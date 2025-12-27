# Specification: User Authentication with Supabase

## Goal

Implement passwordless authentication (Email magic link/OTP and SMS OTP via Twilio) using Supabase Auth with `@supabase/ssr` for cookie-based session management, middleware-protected routes, and smart post-authentication redirects.

## User Stories

- As a user, I want to sign in with my email (magic link or OTP) so that I can access my habit contracts without remembering a password
- As a user, I want to sign in with my phone number (SMS OTP) so that I have an alternative passwordless authentication method

## Specific Requirements

**Email Passwordless Authentication**
- Use Supabase `signInWithOtp()` with email type for magic link and OTP delivery
- User enters email address and chooses to receive magic link or 6-digit OTP code
- Magic link redirects to `/auth/callback` route which exchanges code for session
- OTP flow shows verification input where user enters the 6-digit code
- Handle invalid/expired OTP with clear error message and resend option
- OTP codes should be valid for the Supabase default duration (configurable in dashboard)

**SMS Passwordless Authentication (Twilio)**
- Use Supabase `signInWithOtp()` with phone type for SMS OTP
- User enters phone number with country code selector (default US +1)
- Supabase sends 6-digit OTP via Twilio (configured in Supabase dashboard)
- Show verification input for OTP entry after phone number submission
- Handle invalid/expired OTP with clear error message and resend option
- Recommend CAPTCHA in Supabase dashboard to prevent SMS abuse (cost control)

**Session Management with @supabase/ssr**
- Install and configure `@supabase/ssr` package for Next.js 15 App Router
- Create server-side Supabase client factory using `createServerClient()` with cookies
- Create client-side Supabase client using `createBrowserClient()` for client components
- Sessions stored in HTTP-only cookies (not localStorage tokens)
- Automatic session refresh handled by the SSR package via middleware

**Next.js Middleware for Route Protection**
- Create `middleware.ts` at project root using Supabase SSR utilities
- Middleware refreshes session on every request (prevents stale sessions)
- Protected routes: `/dashboard`, `/check-in`, `/contract/*`, `/profile`
- Public routes: `/`, `/login`, `/signup`, `/auth/callback`
- Redirect unauthenticated users from protected routes to `/login`
- Redirect authenticated users from `/login` and `/signup` to appropriate destination

**Post-Authentication Redirect Logic**
- Check for `returnTo` query parameter first (for onboarding flow continuity)
- If `returnTo` exists, redirect there after successful auth
- Otherwise check localStorage for active contract with `paymentStatus: "completed"`
- If active contract exists, redirect to `/dashboard`
- If no active contract, redirect to `/contract/new`
- Store intended destination before auth redirect for seamless UX

**Auth Callback Route**
- Create `/auth/callback/route.ts` API route handler for magic link redirects
- Exchange authorization code for session using `exchangeCodeForSession()`
- Set session cookies and redirect user to appropriate destination
- Handle errors gracefully with redirect to `/login?error=...`

**Update requireUser() for SSR Compatibility**
- Modify `requireUser()` to read session from cookies instead of Authorization header
- Use server-side Supabase client created with request cookies
- Maintain backward compatibility with existing API routes
- Keep existing Prisma user upsert logic (find or create by supabaseUserId)

**Update apiFetch() Utility**
- Remove manual Authorization header logic (cookies sent automatically)
- Simplify to standard fetch wrapper since auth is cookie-based
- Keep error handling patterns with `ApiError` class

**Environment Variables**
- `TWILIO_ACCOUNT_SID` - configured in Supabase dashboard Phone provider settings
- `TWILIO_AUTH_TOKEN` - configured in Supabase dashboard Phone provider settings
- `TWILIO_PHONE_NUMBER` - SMS sender number (or Messaging Service SID)
- Note: Twilio credentials go in Supabase dashboard, not app env vars

## Visual Design

No visual mockups provided. Implementation should follow existing login/signup page styling patterns:

**Existing Pattern Reference**
- Centered card layout with white background and shadow
- Max width of `max-w-md` for form container
- Gray-50 page background
- Blue-600 primary button color with hover state
- Red-50 background for error messages
- Geist font family (already configured globally)
- Form inputs with consistent border and focus ring styling

## Existing Code to Leverage

**`/web/src/app/(public)/login/page.tsx` and `/signup/page.tsx`**
- Reuse card layout structure and Tailwind styling classes
- Adapt form state management pattern (useState for form fields, loading, error)
- Update to use passwordless auth methods instead of email/password
- Consider merging into single auth page since passwordless handles both sign-in and sign-up

**`/web/src/server/auth/requireUser.ts`**
- Keep `AuthError` class for consistent error handling across API routes
- Update `requireUser()` function to use cookie-based session retrieval
- Preserve Prisma user lookup/creation logic (findUnique, create by supabaseUserId)
- Maintain same return type (User from Prisma)

**`/web/src/lib/supabase.ts`**
- Replace with new SSR-compatible client factories
- Create `createClient()` for browser components using `createBrowserClient()`
- Create `createServerClient()` for server components and API routes
- Deprecate the existing proxy-based client pattern

**`/web/src/lib/api.ts`**
- Simplify `apiFetch()` by removing manual Authorization header injection
- Cookies will be sent automatically with same-origin requests
- Keep `ApiError` class and error handling logic

**`/web/src/schemas/user.ts`**
- Add new Zod schemas for auth form validation (email input, phone input, OTP input)
- Reuse existing `userSchema` for API responses
- Follow established pattern of schema-first types

## Out of Scope

- Apple OAuth authentication (blocked by domain verification requirement)
- Google OAuth authentication (deferred until Apple is available for parity)
- Password reset flows (not applicable for passwordless authentication)
- Account deletion functionality
- Email verification requirements beyond OTP
- Rate limiting implementation (use Supabase dashboard settings)
- Mobile application authentication (web only for this spec)
- LocalStorage user-scoping (deferred to database persistence spec)
- Strava token association with authenticated users (remains in localStorage)
- Database persistence for contracts/check-ins (roadmap item #10)
