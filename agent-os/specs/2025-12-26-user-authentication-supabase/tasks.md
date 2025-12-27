# Task Breakdown: User Authentication with Supabase

## Overview
Total Tasks: 6 Task Groups

This breakdown implements passwordless authentication (Email magic link/OTP and SMS OTP via Twilio) using Supabase Auth with `@supabase/ssr` for cookie-based session management, middleware-protected routes, and smart post-authentication redirects.

## Task List

### Foundation Layer

#### Task Group 1: Package Installation and Supabase Client Setup
**Dependencies:** None

- [x] 1.0 Complete Supabase SSR foundation
  - [x] 1.1 Write 3-4 focused tests for Supabase client utilities
    - Test that browser client can be created without errors
    - Test that server client can be created with mock cookies
    - Test that middleware client can be created and returns expected interface
  - [x] 1.2 Install `@supabase/ssr` package
    - Run: `pnpm add @supabase/ssr`
    - Verify package added to `package.json`
  - [x] 1.3 Create browser client utility
    - File: `/web/src/lib/supabase/browser.ts`
    - Use `createBrowserClient()` from `@supabase/ssr`
    - Export typed client for use in client components
  - [x] 1.4 Create server client utility
    - File: `/web/src/lib/supabase/server.ts`
    - Use `createServerClient()` from `@supabase/ssr` with cookies
    - Accept cookies from Next.js `cookies()` function
    - Export factory function for use in Server Components and API routes
  - [x] 1.5 Create middleware client utility
    - File: `/web/src/lib/supabase/middleware.ts`
    - Use `createServerClient()` with request/response cookie handling
    - Return both client and updated response for middleware chain
  - [x] 1.6 Create barrel export file
    - File: `/web/src/lib/supabase/index.ts`
    - Re-export all client utilities for clean imports
  - [x] 1.7 Deprecate existing supabase.ts
    - Add deprecation comment to `/web/src/lib/supabase.ts`
    - Keep temporarily for backward compatibility during migration
  - [x] 1.8 Ensure Supabase client tests pass
    - Run ONLY the 3-4 tests written in 1.1
    - Verify all client utilities can be instantiated

**Acceptance Criteria:**
- The 3-4 tests written in 1.1 pass
- `@supabase/ssr` package installed and in dependencies
- Three client utilities created (browser, server, middleware)
- Existing code continues to work during migration

---

#### Task Group 2: Next.js Middleware for Route Protection
**Dependencies:** Task Group 1

- [x] 2.0 Complete route protection middleware
  - [x] 2.1 Write 4-5 focused tests for middleware behavior
    - Test that public routes (`/`, `/login`, `/signup`, `/auth/callback`) allow unauthenticated access
    - Test that protected routes (`/dashboard`, `/check-in`, `/contract/*`, `/profile`) redirect to `/login` when unauthenticated
    - Test that authenticated users on `/login` or `/signup` are redirected appropriately
    - Test that middleware refreshes session cookies on each request
  - [x] 2.2 Create middleware.ts at project root
    - File: `/web/middleware.ts`
    - Import middleware client from `lib/supabase/middleware`
    - Configure route matcher for relevant paths
  - [x] 2.3 Implement session refresh logic
    - Call `supabase.auth.getUser()` to refresh session
    - Update cookies with refreshed session tokens
    - Handle session refresh errors gracefully
  - [x] 2.4 Implement route protection rules
    - Define public routes array: `["/", "/login", "/signup", "/auth/callback"]`
    - Define protected routes pattern: `/dashboard`, `/check-in`, `/contract/*`, `/profile`
    - Redirect unauthenticated users from protected routes to `/login`
  - [x] 2.5 Implement authenticated user redirects
    - Redirect authenticated users from `/login` to `/dashboard` (or use redirect logic from Task Group 5)
    - Redirect authenticated users from `/signup` to `/dashboard`
  - [x] 2.6 Configure middleware matcher
    - Exclude static files (`/_next/static`, `/_next/image`, `/favicon.ico`)
    - Exclude API routes that handle their own auth (`/api/*`)
    - Include all page routes
  - [x] 2.7 Ensure middleware tests pass
    - Run ONLY the 4-5 tests written in 2.1
    - Verify route protection works correctly

**Acceptance Criteria:**
- The 4-5 tests written in 2.1 pass
- Middleware refreshes session on every request
- Protected routes redirect unauthenticated users to `/login`
- Public routes remain accessible without authentication
- Authenticated users are redirected away from auth pages

---

### API Layer

#### Task Group 3: Auth Callback Route and requireUser Update
**Dependencies:** Task Group 1

- [x] 3.0 Complete auth API layer
  - [x] 3.1 Write 4-5 focused tests for auth API functionality
    - Test that `/auth/callback` exchanges code for session successfully
    - Test that `/auth/callback` handles errors and redirects to `/login?error=...`
    - Test that `requireUser()` retrieves user from cookie-based session
    - Test that `requireUser()` creates Prisma user on first auth
  - [x] 3.2 Create auth callback route
    - File: `/web/src/app/auth/callback/route.ts`
    - Handle GET request with `code` query parameter
    - Use server client to call `exchangeCodeForSession(code)`
  - [x] 3.3 Implement callback error handling
    - Catch and log errors from code exchange
    - Redirect to `/login?error=auth_callback_failed` on error
    - Include original error message in logs for debugging
  - [x] 3.4 Implement callback success redirect
    - On successful session creation, redirect to `/dashboard` (or use redirect logic from Task Group 5)
    - Ensure session cookies are set before redirect
  - [x] 3.5 Update requireUser() for cookie-based auth
    - File: `/web/src/server/auth/requireUser.ts`
    - Replace Authorization header logic with cookie-based session retrieval
    - Use server client created with request cookies
    - Call `supabase.auth.getUser()` to get authenticated user
  - [x] 3.6 Maintain backward compatibility in requireUser()
    - Keep `AuthError` class unchanged
    - Preserve Prisma user lookup/creation logic
    - Return same User type from Prisma
  - [x] 3.7 Update apiFetch() utility
    - File: `/web/src/lib/api.ts`
    - Remove manual Authorization header injection
    - Cookies are sent automatically with same-origin requests
    - Keep `ApiError` class and error handling patterns
  - [x] 3.8 Ensure auth API tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify callback route and requireUser work correctly

**Acceptance Criteria:**
- The 4-5 tests written in 3.1 pass
- Auth callback route exchanges code for session
- Error handling redirects to login with error message
- `requireUser()` works with cookie-based sessions
- Existing API routes continue to function

---

### Frontend Components

#### Task Group 4: Passwordless Auth Forms and OTP Verification
**Dependencies:** Task Group 1, Task Group 3

- [x] 4.0 Complete passwordless authentication UI
  - [x] 4.1 Write 4-6 focused tests for auth UI components
    - Test email form submission triggers `signInWithOtp()` with email type
    - Test phone form submission triggers `signInWithOtp()` with phone type
    - Test OTP verification form submits code correctly
    - Test error states display appropriately
    - Test loading states during form submission
  - [x] 4.2 Create Zod schemas for auth forms
    - File: `/web/src/schemas/auth.ts`
    - `emailAuthSchema`: email validation
    - `phoneAuthSchema`: phone number with country code validation
    - `otpSchema`: 6-digit code validation
  - [x] 4.3 Create auth method selection component
    - File: `/web/src/components/auth/AuthMethodSelector.tsx`
    - Toggle between Email and SMS authentication
    - Clean, tab-like or segmented control UI
    - Follow existing card layout patterns
  - [x] 4.4 Create email auth form component
    - File: `/web/src/components/auth/EmailAuthForm.tsx`
    - Email input with validation
    - Option to choose magic link or OTP (or default to one)
    - Submit button with loading state
    - Error message display
    - Use `signInWithOtp({ email, options: { emailRedirectTo } })`
  - [x] 4.5 Create phone auth form component
    - File: `/web/src/components/auth/PhoneAuthForm.tsx`
    - Country code selector (default US +1)
    - Phone number input with validation
    - Submit button with loading state
    - Error message display
    - Use `signInWithOtp({ phone })`
  - [x] 4.6 Create OTP verification component
    - File: `/web/src/components/auth/OTPVerification.tsx`
    - 6-digit code input (single input or 6 separate inputs)
    - Auto-submit on complete entry (optional UX enhancement)
    - Resend code button with cooldown timer
    - Error message for invalid/expired codes
    - Use `verifyOtp({ email/phone, token, type })`
  - [x] 4.7 Update login page
    - File: `/web/src/app/(public)/login/page.tsx`
    - Replace email/password form with passwordless flow
    - Integrate AuthMethodSelector, EmailAuthForm, PhoneAuthForm
    - Show OTPVerification after form submission
    - Maintain existing card layout and styling
  - [x] 4.8 Update or consolidate signup page
    - File: `/web/src/app/(public)/signup/page.tsx`
    - Consider merging with login (passwordless handles both)
    - If keeping separate, use same components with different messaging
    - Redirect to login or implement identical passwordless flow
  - [x] 4.9 Ensure auth UI tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify forms submit correctly and display states

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Email and SMS passwordless flows work end-to-end
- OTP verification handles valid and invalid codes
- Error messages are clear and actionable
- Resend functionality works with appropriate cooldown
- UI matches existing app styling patterns

---

### Integration Layer

#### Task Group 5: Post-Authentication Redirect Logic
**Dependencies:** Task Group 2, Task Group 3, Task Group 4

- [x] 5.0 Complete post-authentication redirect logic
  - [x] 5.1 Write 3-4 focused tests for redirect logic
    - Test redirect to `returnTo` query parameter when present
    - Test redirect to `/dashboard` when user has active contract
    - Test redirect to `/contract/new` when user has no contract
  - [x] 5.2 Create redirect utility function
    - File: `/web/src/lib/auth/getPostAuthRedirect.ts`
    - Accept `returnTo` parameter (from URL or session storage)
    - Check localStorage for contract with `paymentStatus: "completed"`
    - Return appropriate redirect path
  - [x] 5.3 Integrate redirect logic in auth callback
    - Update `/web/src/app/auth/callback/route.ts`
    - Read `returnTo` from query params or state
    - Use redirect utility to determine destination
  - [x] 5.4 Integrate redirect logic in OTP verification
    - After successful `verifyOtp()`, use redirect utility
    - Navigate user to appropriate destination
  - [x] 5.5 Store intended destination before auth redirect
    - When redirecting to `/login` from protected route, store original URL
    - Use sessionStorage or URL state parameter
    - Retrieve after successful authentication
  - [x] 5.6 Update middleware redirect logic
    - Update `/web/middleware.ts`
    - Pass `returnTo` parameter when redirecting to login
    - Example: `/login?returnTo=/contract/new`
  - [x] 5.7 Ensure redirect logic tests pass
    - Run ONLY the 3-4 tests written in 5.1
    - Verify redirects work correctly in all scenarios

**Acceptance Criteria:**
- The 3-4 tests written in 5.1 pass
- `returnTo` parameter is respected for onboarding flow continuity
- Users with active contracts go to `/dashboard`
- Users without contracts go to `/contract/new`
- Intended destination is preserved across auth flow

---

### Configuration and Testing

#### Task Group 6: Environment Setup and Manual Configuration
**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete environment and configuration
  - [x] 6.1 Document environment variables
    - Update `.env.example` or create documentation
    - Note that Twilio credentials go in Supabase dashboard, not app env vars
    - Document any new Next.js environment variables needed
  - [ ] 6.2 Configure Supabase Dashboard - Email Provider
    - **MANUAL STEP**: Log into Supabase Dashboard
    - Navigate to Authentication > Providers > Email
    - Enable Email OTP if not already enabled
    - Configure OTP expiration settings
    - Set up email templates for magic links
  - [ ] 6.3 Configure Supabase Dashboard - Phone Provider (Twilio)
    - **MANUAL STEP**: Log into Supabase Dashboard
    - Navigate to Authentication > Providers > Phone
    - Enable Phone provider
    - Enter Twilio Account SID, Auth Token, and Phone Number
    - Test SMS delivery
  - [ ] 6.4 Configure Supabase Dashboard - Redirect URLs
    - **MANUAL STEP**: Log into Supabase Dashboard
    - Navigate to Authentication > URL Configuration
    - Add `http://localhost:3000/auth/callback` for development
    - Add production callback URL when deployed
  - [ ] 6.5 Configure Supabase Dashboard - CAPTCHA (Recommended)
    - **MANUAL STEP**: Log into Supabase Dashboard
    - Navigate to Authentication > Providers > Phone
    - Enable CAPTCHA to prevent SMS abuse
    - Choose hCaptcha or Turnstile
    - Update frontend to include CAPTCHA widget if enabled
  - [x] 6.6 Run full feature test suite
    - Run all tests written in Task Groups 1-5
    - Expected total: approximately 18-24 tests
    - Verify all critical flows work end-to-end

**Acceptance Criteria:**
- Environment variables documented
- Supabase Email provider configured with OTP enabled
- Supabase Phone provider configured with Twilio credentials
- Redirect URLs configured for local development
- CAPTCHA configured (optional but recommended)
- All feature tests pass

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Package Installation and Supabase Client Setup**
   - Foundation for all other work
   - No dependencies, can start immediately

2. **Task Group 2: Next.js Middleware for Route Protection**
   - Depends on Task Group 1 (needs middleware client)
   - Establishes route protection before UI changes

3. **Task Group 3: Auth Callback Route and requireUser Update**
   - Depends on Task Group 1 (needs server client)
   - API layer must be ready before frontend integration

4. **Task Group 4: Passwordless Auth Forms and OTP Verification**
   - Depends on Task Group 1 (needs browser client)
   - Depends on Task Group 3 (auth callback must exist for magic links)
   - Main UI work for the feature

5. **Task Group 5: Post-Authentication Redirect Logic**
   - Depends on Task Groups 2, 3, 4 (integrates with all layers)
   - Final integration to complete user flows

6. **Task Group 6: Environment Setup and Manual Configuration**
   - Contains Supabase Dashboard manual steps
   - Can be done in parallel with development but required for testing
   - Final verification of complete feature

---

## Notes

### Supabase Dashboard Configuration Required
Several configuration steps must be done manually in the Supabase Dashboard:
- Email OTP settings and templates
- Twilio credentials for SMS provider
- Redirect URL configuration
- Optional CAPTCHA setup for SMS cost control

### Existing Code Migration
- The existing `/web/src/lib/supabase.ts` will be deprecated
- Existing `requireUser()` function will be updated in place
- Existing login/signup pages will be updated, not replaced
- `apiFetch()` utility will be simplified

### Testing Approach
Following project standards:
- Write minimal tests during development (2-8 per task group)
- Focus on core user flows only
- Defer edge case testing
- Mock Supabase client in tests

### File Locations Summary
New files to create:
- `/web/src/lib/supabase/browser.ts`
- `/web/src/lib/supabase/server.ts`
- `/web/src/lib/supabase/middleware.ts`
- `/web/src/lib/supabase/index.ts`
- `/web/middleware.ts`
- `/web/src/app/auth/callback/route.ts`
- `/web/src/schemas/auth.ts`
- `/web/src/components/auth/AuthMethodSelector.tsx`
- `/web/src/components/auth/EmailAuthForm.tsx`
- `/web/src/components/auth/PhoneAuthForm.tsx`
- `/web/src/components/auth/OTPVerification.tsx`
- `/web/src/lib/auth/getPostAuthRedirect.ts`

Files to update:
- `/web/src/lib/supabase.ts` (deprecate)
- `/web/src/server/auth/requireUser.ts`
- `/web/src/lib/api.ts`
- `/web/src/app/(public)/login/page.tsx`
- `/web/src/app/(public)/signup/page.tsx`
