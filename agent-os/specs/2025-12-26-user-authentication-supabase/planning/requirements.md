# Spec Requirements: User Authentication with Supabase

## Initial Description

This is item #8 from the product roadmap: "User Authentication - Implement email/password and OAuth sign-up/sign-in using Supabase Auth, including session management and protected routes for both web and mobile."

The feature adds user authentication to the Locked In web application using Supabase Auth with passwordless authentication methods (Email and SMS). This moves the app from an anonymous prototype phase toward production readiness.

**Context:**
- The app is a Next.js 15 web application
- Currently uses localStorage for contract data (prototype phase)
- Stripe integration was just completed - contracts have paymentStatus field
- Existing basic email/password login pages exist but will be replaced with passwordless

## Requirements Discussion

### First Round Questions

**Q1:** You mentioned Apple OAuth, Google OAuth, SMS passwordless, and Email passwordless. I'm assuming we should implement all four providers in this initial spec. Is that correct, or should we start with a subset?

**Answer:** Email + SMS passwordless only. User does not have a domain yet, which blocks Apple OAuth setup (requires domain verification). User doesn't want to offer Google OAuth without Apple OAuth for parity. Apple and Google OAuth can be added in a future spec once the domain is finalized.

**Q2:** The codebase already has basic email/password login pages using `supabase.auth.signInWithPassword()`. Should we replace these with passwordless email, or keep email/password as an additional option?

**Answer:** Replace with passwordless email (magic links/OTP). Do not keep email/password authentication.

**Q3:** For Next.js 15 with App Router, Supabase recommends using their SSR package (`@supabase/ssr`) with cookie-based sessions. Should we migrate from the current client-only auth approach to proper cookie-based session management with middleware for protected routes?

**Answer:** Yes - migrate to `@supabase/ssr` with cookie-based sessions and middleware for protected routes.

**Q4:** Looking at the current app structure, I'm assuming these routes should require authentication: `/dashboard`, `/check-in`, `/contract/new`, `/profile`. And these should remain public: `/`, `/login`, `/signup`. Is this split correct?

**Answer:** Yes - proposed split is correct.

**Q5:** Currently, contracts and check-ins are stored in localStorage. Should this spec keep localStorage as-is, or include a basic user-scoping layer where localStorage keys are prefixed with user ID?

**Answer:** Keep localStorage as-is for now. Auth only for this spec; persistence/database migration is roadmap item #10.

**Q6:** The existing Strava OAuth flow stores tokens in localStorage. When a user logs in with Supabase Auth, should we keep Strava tokens separate (user re-connects Strava after each login) or associate them with the authenticated user?

**Answer:** Keep Strava tokens separate from Supabase auth. User will need to re-connect Strava after login. Full migration of Strava tokens to user-associated storage will happen later with the database persistence work.

**Q7:** After successful authentication, I assume users should be redirected to `/dashboard` if they have an active contract, or `/contract/new` if they don't. Is this the desired flow?

**Answer:** If authentication happens as part of an onboarding flow, return to the onboarding flow after auth. Otherwise, redirect to `/dashboard` if user has an active contract, or `/contract/new` if no contract exists.

**Q8:** The roadmap mentions "both web and mobile" for authentication. Should this spec focus on web only?

**Answer:** Yes - web only for now. Mobile auth patterns can be documented for future reference but implementation is out of scope.

**Q9:** Is there anything explicitly out of scope?

**Answer:** Exclude password reset flows, account deletion, email verification requirements, and rate limiting from this spec.

### Existing Code to Reference

**Similar Features Identified:**

- **Login/Signup Pages:** `/web/src/app/(public)/login/page.tsx`, `/web/src/app/(public)/signup/page.tsx` - Current email/password forms using centered card layout. Will be replaced but can reference styling patterns.

- **OAuth Callback Pattern:** `/web/src/app/api/integrations/strava/callback/route.ts` - Existing pattern for handling OAuth callbacks and token exchange. Similar pattern may be useful for auth callback handling.

- **Auth Utilities:** `/web/src/server/auth/requireUser.ts` - Existing `requireUser()` function and `AuthError` class for API route protection. This will need updates for the new session management approach.

- **Supabase Admin Client:** `/web/src/server/auth/supabaseAdmin.ts` - Server-side Supabase client with service role key.

- **Supabase Client:** `/web/src/lib/supabase.ts` - Current client-side Supabase client. Will need to be replaced/updated for SSR approach.

- **User Hook:** `/web/src/lib/hooks/useUser.ts` - TanStack Query hook for fetching user data. May need updates for new auth flow.

- **Prisma User Model:** `/web/prisma/schema.prisma` - Existing User model with `supabaseUserId`, `email`, `name` fields.

### Follow-up Questions

**Follow-up 1:** How much more effort if we're using Supabase to integrate with Apple and Google in addition to SMS and email passwordless?

**Answer:** Research showed Apple OAuth requires domain verification (which user doesn't have yet) plus Apple Developer Console configuration (~1-2 hours). Google OAuth is simpler (~30 min). However, user decided to defer both OAuth providers until domain is finalized, preferring to offer them together rather than Google alone.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual mockups or wireframes were provided. Implementation should follow existing app styling patterns from the current login/signup pages (centered card layout, Tailwind CSS styling, Geist font family).

## Requirements Summary

### Functional Requirements

**Authentication Methods:**
- Email passwordless authentication (magic link and/or OTP)
- SMS passwordless authentication (OTP via Twilio)
- No email/password authentication (replacing existing)
- No OAuth providers in this phase (Apple/Google deferred)

**Session Management:**
- Migrate to `@supabase/ssr` package for server-side session handling
- Cookie-based session storage (not localStorage tokens)
- Next.js middleware for route protection
- Proper session refresh handling

**Protected Routes:**
- `/dashboard` - requires authentication
- `/check-in` - requires authentication
- `/contract/new` - requires authentication
- `/profile` - requires authentication

**Public Routes:**
- `/` - landing page (public)
- `/login` - authentication page (public)
- `/signup` - authentication page (public, may merge with login for passwordless)

**Post-Authentication Flow:**
- If user was in onboarding flow: return to onboarding
- If user has active contract (in localStorage): redirect to `/dashboard`
- If user has no contract: redirect to `/contract/new`

**SMS Provider:**
- Twilio integration for SMS OTP delivery
- CAPTCHA configuration for cost control (recommended by Supabase)

### Reusability Opportunities

- Existing login/signup page layout and styling patterns
- Strava OAuth callback pattern for any auth callbacks needed
- `requireUser()` function pattern (will need SSR updates)
- `AuthError` class for consistent error handling
- Prisma User model already exists with correct fields
- TanStack Query patterns from `useUser` hook

### Scope Boundaries

**In Scope:**
- Email passwordless (magic link/OTP) implementation
- SMS passwordless (OTP) implementation with Twilio
- Migration to `@supabase/ssr` for cookie-based sessions
- Next.js middleware for protected routes
- Login/signup UI updates for passwordless flows
- Post-authentication redirect logic
- Integration with existing Prisma User model
- Update to existing `requireUser()` for SSR compatibility

**Out of Scope:**
- Apple OAuth (blocked by domain requirement)
- Google OAuth (deferred until Apple is available)
- Password reset flows (N/A for passwordless)
- Account deletion functionality
- Email verification requirements
- Rate limiting implementation
- Mobile application authentication
- LocalStorage user-scoping (deferred to database persistence spec)
- Strava token association with users (deferred)
- Database persistence for contracts/check-ins (roadmap item #10)

### Technical Considerations

**Package Changes:**
- Add `@supabase/ssr` package for Next.js SSR support
- Configure Twilio credentials in environment variables

**Architecture Changes:**
- Replace client-only Supabase auth with SSR approach
- Add Next.js middleware (`middleware.ts`) for route protection
- Update Supabase client creation for server components vs client components
- Cookie-based session management instead of localStorage tokens

**Supabase Dashboard Configuration:**
- Enable Phone provider with Twilio credentials
- Configure Email OTP settings (expiration, rate limits)
- Set up redirect URLs for magic links
- Optional: Configure CAPTCHA for SMS cost control

**Environment Variables Needed:**
- `TWILIO_ACCOUNT_SID` - Twilio account identifier
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_PHONE_NUMBER` - SMS sender number (or Messaging Service SID)

**Existing Infrastructure to Preserve:**
- Prisma User model and database connection
- TanStack Query client setup
- Toast notification system
- Current localStorage contract/check-in storage (unchanged)
- Strava OAuth flow (unchanged, separate from user auth)

**Migration Considerations:**
- Existing `supabase.ts` client needs SSR-aware replacement
- `requireUser()` needs update for cookie-based auth
- API routes need to read session from cookies instead of Authorization header
- Consider backward compatibility during transition
