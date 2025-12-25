# Spec Requirements: Strava Integration Prototype

## Initial Description

Build initial Strava OAuth flow and activity verification as the first third-party verifier. Prove the concept: user connects Strava, selects activity type (run, ride, etc.), and daily check-ins auto-verify against logged activities. Keep it simple—this informs the verifier abstraction we'll refactor into later.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the Strava connection will be initiated from a new "Connect Strava" section within the contract setup flow, allowing users to link their account before starting a new contract. Is that correct, or should this be a separate settings/integrations page that applies to future contracts?
**Answer:** Correct - add a step in the contract wizard to choose verification method. "Strava" and "Honor System" will be the first two options.

**Q2:** I'm assuming we'll store the Strava OAuth tokens (access token and refresh token) in localStorage for now, consistent with the prototype phase approach. Should we plan for server-side token storage in the future, or is client-side storage acceptable for this prototype?
**Answer:** localStorage for now, server-side later.

**Q3:** For activity type selection, I assume users will choose a single activity type per contract (e.g., "Run", "Ride", "Swim", "Workout") during contract setup, and any logged Strava activity matching that type counts as verification for the day. Is that correct, or should users be able to select multiple activity types (e.g., "Run OR Ride")?
**Answer:** Checkbox to select multiple valid activity types. Verifier looks for any matching activity from the selected types.

**Q4:** I assume we'll use a simple "activity exists" check - if Strava shows any activity of the selected type logged on the contract day, the day is auto-verified. Should there be minimum thresholds (e.g., minimum distance, minimum duration) or is presence of any matching activity sufficient?
**Answer:** For now, simple "activity exists" check. Future enhancement for more detailed requirements.

**Q5:** What timezone handling should we use for matching Strava activities to contract days? I assume we'll use the user's local timezone (as already used for contract day calculations), meaning activities logged on that calendar day count.
**Answer:** User's locale. May need to add this to system preferences in future.

**Q6:** I assume when Strava is connected, the manual "Check In" button will be replaced with an automatic verification status that shows whether a matching activity was found. Users would still see the same check-in page but with a "Verified via Strava" indicator instead of a button. Is that the intended UX, or should manual check-in remain as a fallback?
**Answer:** Correct - no manual check-in when Strava is selected. BUT add a "force sync" button for user peace-of-mind. Store last sync timestamp in localStorage.

**Q7:** For the reveal experience, I assume the Strava integration only affects how days get marked as "completed" - the next-day reveal mechanics, reward calculation, and all other contract logic remain unchanged. Is that correct?
**Answer:** Correct - Strava only affects verification of completion/miss. Doesn't affect reveal mechanics.

**Q8:** Is there anything specific you want to exclude from this prototype? For example: webhook-based real-time sync, historical activity import, multi-activity contracts, or integration with the future mobile app?
**Answer:** No webhooks or real-time sync. Strava API calls should be server-side with our own API endpoint that client calls. Can fine-tune Strava API queries later.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** I assume the verification method selection (Strava vs Honor System) should appear early in the wizard - perhaps as the second step after habit title, before duration/deposit selection. This way, if Strava is selected, we can show the activity type selection immediately. Does that order make sense?
**Answer:** Good suggestion - verification method as second step after habit title, before duration/deposit.

**Follow-up 2:** For the Strava activity type checkboxes, I'm thinking we should offer the most common activity types initially: Run, Ride, Swim, Walk, Hike, Workout (gym/weights), Yoga. Should we include all Strava activity types, or start with a curated subset like this?
**Answer:** The curated list works! Alternative idea: could pull user's most recent 20-50 activities from Strava and include any additional activity types not in our curated list, making it custom to the user.

**Follow-up 3:** For the OAuth flow: User clicks "Connect Strava" in wizard, redirects to Strava authorization page, Strava redirects back to a callback API route, API route exchanges code for tokens and returns them to client, client stores tokens in localStorage. Is this flow correct? And should the Strava app credentials be set up already?
**Answer:** Confirmed correct. User already has Strava app credentials.

**Follow-up 4:** When the user clicks "Force Sync", should this only check for today's activities, or check for all days in the current contract that are still pending/unverified?
**Answer:** Open to checking all days in the contract period. This raises a UX consideration around retroactive verification - user leans toward supporting a lenient approach (allow retroactive verification for days where an activity exists but wasn't synced in time) for better UX, such as grace periods for users who couldn't sync their device.

**Follow-up 5:** For retroactive verification, should it apply to ALL past days in the contract (including days already marked as "missed"), or only to days that are still "pending"?
**Answer:** Allow retroactive verification only for days that haven't been revealed yet. Once a day is revealed (and any forfeiture is shown), it's locked. This preserves the integrity of the reveal experience while allowing grace periods for sync delays.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - prototype phase, no designs yet.

## Requirements Summary

### Functional Requirements

**OAuth & Connection:**
- Add Strava OAuth flow with authorization redirect and callback handling
- Store Strava tokens (access_token, refresh_token, expires_at) in localStorage
- Handle token refresh when access token expires
- Strava API calls must be server-side via Next.js API routes (client calls our API, our API calls Strava)

**Contract Wizard Changes:**
- Add new wizard step: "Verification Method" as second step (after habit title, before duration/deposit)
- Two verification options: "Strava" and "Honor System"
- When Strava selected: show "Connect Strava" button if not connected
- When Strava connected: show activity type selection (multi-select checkboxes)
- Curated activity type list: Run, Ride, Swim, Walk, Hike, Workout, Yoga
- Enhancement: optionally fetch user's recent activities to add any additional activity types they use

**Activity Verification:**
- Simple "activity exists" check - no minimum thresholds for duration/distance
- Match activities by type against user's selected activity types
- Use user's local timezone for matching activities to contract days
- Verification runs on page load and on "Force Sync" button click

**Check-in Experience Changes:**
- When contract uses Strava verification: replace manual check-in button with automatic verification status
- Show "Verified via Strava" indicator when matching activity found
- Show "No activity found" status when no matching activity for today
- Add "Force Sync" button for manual refresh
- Display last sync timestamp (stored in localStorage)

**Retroactive Verification:**
- Force Sync checks all unrevealed days in the contract period
- Can retroactively mark days as "completed" if matching Strava activity exists
- Days that have already been revealed are locked and cannot be changed
- This supports grace periods for sync delays (e.g., user on cruise without connectivity)

**Data Model Changes:**
- Contract schema needs: verificationType ("strava" | "honor_system"), stravaActivityTypes (string array)
- New localStorage keys for Strava tokens and last sync timestamp
- Check-in records may need verification source indicator

### Reusability Opportunities

- This prototype will inform the verifier abstraction pattern for future integrations (Apple Health, GitHub, etc.)
- OAuth flow pattern can be reused for other third-party integrations
- Activity type selection UI pattern can be adapted for other verification sources

### Scope Boundaries

**In Scope:**
- Strava OAuth flow (authorization + token exchange + refresh)
- Contract wizard step for verification method selection
- Activity type multi-select during contract setup
- Server-side API route for Strava API calls
- Automatic verification on check-in page load
- Force Sync button with last sync timestamp
- Retroactive verification for unrevealed days
- localStorage storage for tokens and sync state

**Out of Scope:**
- Webhook-based real-time sync from Strava
- Detailed activity thresholds (minimum distance, duration, etc.)
- Mobile app integration
- Server-side token storage (future enhancement)
- Timezone settings in user preferences (use browser locale for now)
- Historical activity import for contracts started before Strava connection

### Technical Considerations

- Strava API credentials already configured in developer account
- Need environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
- OAuth callback URL must be registered in Strava app settings
- Strava API rate limits should be considered (default: 100 requests per 15 minutes, 1000 per day)
- Token refresh flow needed since Strava access tokens expire (6 hours)
- API routes needed:
  - `POST /api/integrations/strava/callback` - OAuth code exchange
  - `POST /api/integrations/strava/refresh` - Token refresh
  - `GET /api/integrations/strava/activities` - Fetch activities for date range
- Strava activity types are predefined strings (Run, Ride, Swim, Walk, Hike, Workout, Yoga, etc.)
