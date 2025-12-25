# Task Breakdown: Strava Integration Prototype

## Overview
Total Tasks: 4 Task Groups with 31 sub-tasks

This spec implements the first third-party verifier by adding Strava OAuth and activity-based verification to the contract wizard. Users can connect their Strava account during contract setup and select which activity types count toward their daily check-ins.

## Task List

### API Layer

#### Task Group 1: Strava API Routes & OAuth Flow
**Dependencies:** None

- [x] 1.0 Complete Strava API layer
  - [x] 1.1 Write 4-6 focused tests for Strava API routes
    - Test OAuth callback code exchange (success case)
    - Test token refresh when access token expired
    - Test activities fetch with date range filtering
    - Test error handling for invalid tokens
    - Mock all Strava API calls
  - [x] 1.2 Create environment variable configuration
    - Add STRAVA_CLIENT_ID to environment
    - Add STRAVA_CLIENT_SECRET to environment
    - Add STRAVA_REDIRECT_URI for OAuth callback
    - Document variables in .env.example if present
  - [x] 1.3 Create OAuth callback API route (`/api/integrations/strava/callback`)
    - Accept authorization code from Strava redirect
    - Exchange code for access_token, refresh_token, expires_at via Strava API
    - Return tokens to client for localStorage storage
    - Follow existing API route pattern from `src/app/api/auth/me/route.ts`
    - Use NextRequest/NextResponse patterns
  - [x] 1.4 Create token refresh API route (`/api/integrations/strava/refresh`)
    - Accept refresh_token from client
    - Call Strava API to get new access_token
    - Return new access_token, refresh_token, expires_at
    - Handle expired refresh token errors gracefully
  - [x] 1.5 Create activities fetch API route (`/api/integrations/strava/activities`)
    - Accept access_token, startDate, endDate as parameters
    - Accept optional refresh_token for auto-refresh if expired
    - Query Strava API for activities in date range
    - Return array of activities with type and start_date fields
    - Handle pagination if needed for large date ranges
  - [x] 1.6 Ensure API layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify all endpoints respond correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- OAuth callback successfully exchanges code for tokens
- Token refresh works when access token expires
- Activities can be fetched for any date range
- All Strava API calls are server-side only

---

### Data Layer

#### Task Group 2: Schema & Storage Updates
**Dependencies:** Task Group 1

- [x] 2.0 Complete data layer updates
  - [x] 2.1 Write 3-5 focused tests for schema and storage
    - Test contract schema validates new fields correctly
    - Test Strava token storage save/load/clear operations
    - Test Strava sync state storage operations
    - Test backward compatibility (contracts without new fields)
  - [x] 2.2 Update contract schema (`src/schemas/contract.ts`)
    - Add verificationType field: z.enum(["strava", "honor_system"]).default("honor_system")
    - Add stravaActivityTypes field: z.array(z.string()).optional()
    - Update contractFormSchema with new fields
    - Update contractSchema with new fields
    - Export new types: VerificationType, StravaActivityTypes
  - [x] 2.3 Create Strava token storage utilities (`src/lib/strava-storage.ts`)
    - Storage key: "locked-in-strava-tokens"
    - Store object: { access_token, refresh_token, expires_at }
    - Functions: saveStravaTokens, loadStravaTokens, clearStravaTokens
    - Include SSR safety checks (typeof window !== "undefined")
    - Follow pattern from `src/lib/contract-storage.ts`
  - [x] 2.4 Create Strava sync state storage utilities
    - Storage key: "locked-in-strava-sync"
    - Store object: { lastSyncTimestamp }
    - Functions: saveSyncState, loadSyncState, clearSyncState
    - Add in same file as token storage or separate as appropriate
  - [x] 2.5 Create helper function to check if Strava is connected
    - Function: isStravaConnected() checks if valid tokens exist
    - Function: isTokenExpired() checks expires_at against current time
    - Export from strava-storage.ts
  - [x] 2.6 Ensure data layer tests pass
    - Run ONLY the 3-5 tests written in 2.1
    - Verify schema validation works correctly
    - Verify storage operations work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 2.1 pass
- Contract schema accepts new verification fields
- Existing contracts without new fields are treated as "honor_system"
- Token and sync state storage works correctly with localStorage
- SSR-safe storage operations

---

### Frontend Components

#### Task Group 3: Contract Wizard & Dashboard UI
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete UI components
  - [x] 3.1 Write 4-6 focused tests for UI components
    - Test VerificationMethodStep renders Strava and Honor System options
    - Test activity type selection when Strava is connected
    - Test wizard navigation works with 6 steps
    - Test dashboard shows Strava verification status instead of check-in button
    - Test Force Sync button triggers sync action
  - [x] 3.2 Update contract wizard store (`src/stores/contract-wizard-store.ts`)
    - Change WIZARD_STEPS from 5 to 6
    - Update WizardStep type to include step 6
    - Update StepStatus interface for 6 steps
    - Add validateStep2 for verification method (step 2 is now verification)
    - Shift existing step validations: duration becomes step 3, deposit step 4, start date step 5, confirmation step 6
    - Update calculateStepStatus for 6 steps
    - Update initialState stepStatus for 6 steps
  - [x] 3.3 Create VerificationMethodStep component (`src/components/contract-wizard/steps/VerificationMethodStep.tsx`)
    - Display prompt: "How will you verify your check-ins?"
    - Two tappable cards: "Strava" and "Honor System"
    - Follow card pattern from DurationStep.tsx
    - When Strava selected and not connected: show "Connect Strava" button
    - When Strava selected and connected: show activity type checkboxes
    - Honor System card should indicate manual daily check-in
    - Strava card should indicate automatic verification via activities
  - [x] 3.4 Implement Strava OAuth initiation in VerificationMethodStep
    - Build Strava authorization URL with client_id, redirect_uri, scope
    - Scopes needed: activity:read_all
    - "Connect Strava" button redirects to Strava authorization page
    - Handle callback redirect and store tokens via API route
  - [x] 3.5 Implement activity type selection UI
    - Display curated activity types: Run, Ride, Swim, Walk, Hike, Workout, Yoga
    - Multi-select checkboxes allowing multiple selections
    - Store selected types in formData.stravaActivityTypes
    - At least one activity type must be selected to proceed
    - Enhancement: fetch user's recent activities to add custom types not in list
  - [x] 3.6 Create OAuth callback page (`src/app/strava/callback/page.tsx`)
    - Extract authorization code from URL query params
    - Call /api/integrations/strava/callback to exchange code for tokens
    - Store tokens in localStorage via strava-storage.ts
    - Redirect back to contract wizard at verification step
    - Show loading state during token exchange
    - Handle errors gracefully with user-friendly message
  - [x] 3.7 Update wizard step components for new step order
    - DurationStep is now step 3 (was step 2)
    - DepositStep is now step 4 (was step 3)
    - StartDateStep is now step 5 (was step 4)
    - ConfirmationStep is now step 6 (was step 5)
    - Update any hardcoded step references in components
    - Update wizard container/router to include VerificationMethodStep
  - [x] 3.8 Update ConfirmationStep to display verification method
    - Show selected verification method (Strava or Honor System)
    - If Strava: show selected activity types
    - Include in the contract summary displayed before confirmation
  - [x] 3.9 Update dashboard to handle Strava verification display
    - When contract.verificationType === "strava": hide manual check-in button
    - Show verification status: "Verified via Strava" with green checkmark OR "No activity found"
    - Run automatic verification check on page load
    - Display last sync timestamp if available
  - [x] 3.10 Add Force Sync button to dashboard
    - Button triggers manual sync with Strava API
    - Sync checks all unrevealed days in contract period
    - Update lastSyncTimestamp in localStorage after sync
    - Show loading state during sync
    - Display sync result (days verified, if any)
  - [x] 3.11 Implement activity verification logic
    - Create utility function to check if activities match selected types
    - Use user's browser locale/timezone for day matching
    - Simple "activity exists" check - no minimum thresholds
    - Return which days have matching activities
    - Handle retroactive verification for unrevealed days only
  - [x] 3.12 Ensure UI component tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify wizard navigation works with 6 steps
    - Verify Strava connection flow works
    - Verify dashboard shows correct verification status
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Wizard has 6 steps with verification method as step 2
- User can connect Strava account via OAuth
- User can select multiple activity types for verification
- Dashboard shows Strava verification status instead of manual check-in
- Force Sync updates verification for unrevealed days
- Matches existing wizard step styling and patterns

---

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 4-6 tests written by API engineer (Task 1.1)
    - Review the 3-5 tests written by data layer engineer (Task 2.1)
    - Review the 4-6 tests written by UI designer (Task 3.1)
    - Total existing tests: approximately 11-17 tests
  - [x] 4.2 Analyze test coverage gaps for Strava integration only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to Strava integration feature
    - Prioritize end-to-end workflows: OAuth flow, activity verification, Force Sync
    - Do NOT assess entire application test coverage
  - [x] 4.3 Write up to 8 additional strategic tests maximum
    - Add maximum of 8 new tests to fill identified critical gaps
    - Priority tests:
      - End-to-end OAuth flow (redirect -> callback -> tokens stored)
      - Contract creation with Strava verification method selected
      - Dashboard auto-verification on page load
      - Retroactive verification respects revealed/unrevealed boundary
      - Token refresh triggers when access token expired
    - Skip edge cases, error states unless business-critical
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Strava integration (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 19-25 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 19-25 tests total)
- OAuth flow is tested end-to-end
- Activity verification logic is tested
- Retroactive verification boundary is respected
- No more than 8 additional tests added in gap analysis

---

## Execution Order

Recommended implementation sequence:

1. **API Layer (Task Group 1)** - Build Strava API routes first since other layers depend on them
2. **Data Layer (Task Group 2)** - Update schemas and storage utilities
3. **Frontend Components (Task Group 3)** - Build UI components and wire everything together
4. **Test Review (Task Group 4)** - Review coverage and fill critical gaps

---

## Technical Notes

### Environment Variables Required
- `STRAVA_CLIENT_ID` - Strava application client ID
- `STRAVA_CLIENT_SECRET` - Strava application client secret
- `STRAVA_REDIRECT_URI` - OAuth callback URL (e.g., `http://localhost:3000/strava/callback`)

### API Endpoints Created
- `POST /api/integrations/strava/callback` - OAuth code exchange
- `POST /api/integrations/strava/refresh` - Token refresh
- `GET /api/integrations/strava/activities` - Fetch activities for date range

### localStorage Keys
- `locked-in-strava-tokens` - Stores { access_token, refresh_token, expires_at }
- `locked-in-strava-sync` - Stores { lastSyncTimestamp }

### Curated Activity Types
Run, Ride, Swim, Walk, Hike, Workout, Yoga

### Key Files Modified
- `src/schemas/contract.ts` - Add verification fields
- `src/stores/contract-wizard-store.ts` - Expand to 6 steps
- `src/components/contract-wizard/steps/*.tsx` - Update step numbers
- Dashboard component - Add Strava verification display

### Key Files Created
- `src/app/api/integrations/strava/callback/route.ts`
- `src/app/api/integrations/strava/refresh/route.ts`
- `src/app/api/integrations/strava/activities/route.ts`
- `src/lib/strava-storage.ts`
- `src/lib/strava-verification.ts`
- `src/lib/__tests__/strava-verification.test.ts`
- `src/components/contract-wizard/steps/VerificationMethodStep.tsx`
- `src/app/strava/callback/page.tsx`

---

## Out of Scope Reminders

Per spec, the following are explicitly out of scope:
- Webhook-based real-time sync from Strava
- Minimum activity thresholds (distance, duration, etc.)
- Server-side token storage
- Mobile app integration
- Timezone configuration in user preferences
- Historical activity import for pre-existing contracts
- Strava API rate limit handling UI
- Multiple verification sources per contract
- Disconnect/reconnect Strava flow
- Activity detail display
