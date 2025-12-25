# Specification: Strava Integration Prototype

## Goal

Build the first third-party verifier by implementing Strava OAuth and activity-based verification, allowing users to auto-verify daily check-ins based on logged Strava activities instead of manual honor-system confirmation.

## User Stories

- As a user, I want to connect my Strava account during contract setup so that my daily check-ins can be automatically verified based on my logged activities
- As a user, I want to select which activity types count toward my goal so that only relevant workouts verify my commitment

## Specific Requirements

**OAuth Flow Implementation**
- Implement Strava OAuth 2.0 authorization flow with redirect to Strava and callback handling
- Exchange authorization code for access token and refresh token via server-side API route
- Store tokens in localStorage: access_token, refresh_token, expires_at
- Implement automatic token refresh when access token expires (6-hour expiry)
- All Strava API calls must be server-side via Next.js API routes for security

**Contract Wizard Modification**
- Increase wizard steps from 5 to 6 by inserting new "Verification Method" step
- New step appears as step 2 (after habit title, before duration selection)
- Two verification method options: "Strava" and "Honor System" displayed as tappable cards
- When Strava selected and not connected: show "Connect Strava" button that initiates OAuth
- When Strava connected: show activity type multi-select checkboxes
- Update wizard store to handle 6 steps and new verification-related form fields

**Activity Type Selection**
- Display curated activity type list: Run, Ride, Swim, Walk, Hike, Workout, Yoga
- Multi-select checkboxes allowing user to select multiple valid activity types
- Enhancement: fetch user's recent 20-50 activities from Strava to add any custom activity types not in curated list
- Store selected activity types as string array in contract data

**Contract Schema Updates**
- Add verificationType field to contract schema: "strava" | "honor_system" (default: "honor_system")
- Add stravaActivityTypes field: optional string array of selected activity types
- Maintain backward compatibility with existing contracts (treat missing field as "honor_system")

**Dashboard Verification Display**
- When contract uses Strava verification: replace manual check-in button with verification status display
- Show "Verified via Strava" indicator with green checkmark when matching activity found for today
- Show "No activity found" status when no matching activity exists for today
- Add "Force Sync" button that triggers manual sync with Strava API
- Display last sync timestamp (stored in localStorage) near Force Sync button

**Activity Verification Logic**
- Simple "activity exists" check: any activity matching selected types counts as completion
- No minimum thresholds for duration, distance, or other metrics in this prototype
- Use user's browser locale/timezone for matching activities to contract days
- Verification runs automatically on dashboard page load
- Force Sync checks all unrevealed days in contract period, not just today

**Retroactive Verification**
- Force Sync can retroactively verify days that have matching Strava activities
- Only days that have NOT been revealed can be retroactively verified
- Days already revealed (and any forfeitures shown) are locked and cannot be changed
- This supports grace periods for users who couldn't sync their device in time

**localStorage Token Storage**
- New key for Strava tokens: "locked-in-strava-tokens" storing { access_token, refresh_token, expires_at }
- New key for sync state: "locked-in-strava-sync" storing { lastSyncTimestamp }
- Token refresh handled transparently before API calls when expired

## Visual Design

No visual mockups provided. Follow existing wizard step patterns for verification method selection UI:
- Use card-based selection pattern from DurationStep for Strava vs Honor System choice
- Use checkbox pattern similar to DurationStep cards for activity type multi-select
- Verification status on dashboard should follow existing metrics/status display patterns

## Existing Code to Leverage

**Contract Wizard Store (src/stores/contract-wizard-store.ts)**
- Existing 5-step wizard with step validation pattern
- Use same updateFormData and step navigation patterns
- Extend StepStatus interface and validation functions for step 6

**Wizard Step Components (src/components/contract-wizard/steps/)**
- DurationStep provides card-based selection pattern to replicate for verification method choice
- Consistent styling, button patterns, and accessibility attributes to follow
- Same layout structure with prompt, options, and next button

**Contract Schema (src/schemas/contract.ts)**
- Add new fields to contractSchema and contractFormSchema
- Follow existing Zod schema patterns with proper validation

**API Route Pattern (src/app/api/auth/me/route.ts)**
- Follow existing API route structure with error handling pattern
- Use NextRequest/NextResponse patterns for new Strava endpoints

**localStorage Pattern (src/lib/contract-storage.ts)**
- Follow existing save/load patterns for Strava token and sync state storage
- Include SSR safety checks (typeof window !== "undefined")

## Out of Scope

- Webhook-based real-time sync from Strava (polling/manual sync only)
- Minimum activity thresholds (distance, duration, pace, heart rate, etc.)
- Server-side token storage (localStorage only for prototype)
- Mobile app integration or Expo SecureStore usage
- Timezone configuration in user preferences (use browser locale)
- Historical activity import for contracts created before Strava connection
- Strava API rate limit handling UI (rely on default rate limits for now)
- Multiple verification sources per contract (only one method: Strava OR Honor System)
- Disconnect/reconnect Strava flow (initial connection only)
- Activity detail display (just existence check, no activity summaries shown)
