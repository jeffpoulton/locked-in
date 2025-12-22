# Specification: Next-Day Reveal Experience

## Goal
Separate the check-in and reveal actions into independent experiences, creating an engaging next-day reveal moment where users discover yesterday's reward outcome with anticipation and emotional impact.

## User Stories
- As a user, I want to discover yesterday's reward status through an exciting reveal experience so that I feel the emotional stakes of my daily commitment
- As a user, I want to check in for today without seeing today's reward so that the hidden reward schedule maintains suspense

## Specific Requirements

**Separate Check-In and Reveal as Independent Actions**
- Check-in action: User reports habit completion for today
- After check-in, show only confirmation: "Come back tomorrow to see your reward status"
- Reveal action: User discovers yesterday's reward outcome (completely separate from check-in)
- Remove current same-day reward reveal from check-in flow
- Both actions can happen in same session but are conceptually distinct

**Automatic Reveal State Detection**
- When user opens app, detect if there are unrevealed prior days
- If unrevealed days exist, automatically enter reveal state
- User sees reveal prompt but can choose to skip to current day check-in
- Track which days have been "revealed" separately from "resolved" status

**Four Reveal Outcome States**
- Earned: Completed + Reward Allocated - "You earned $X!" with celebration styling (green, glow effect)
- No Reward: Completed + No Reward Allocated - "No reward was scheduled" with neutral positive styling (blue)
- Forfeited: Missed + Reward Allocated - "You forfeited $X" with loss styling (red/gray, somber)
- Lucky Break: Missed + No Reward Allocated - "Lucky break - no reward scheduled!" with relief styling (amber)

**Reveal Animation Sequence**
- Anticipation phase (1.5s): Pulsing animation, "Revealing yesterday..." text
- Reveal phase: Scale-up animation with outcome message and appropriate styling
- Auto-advance to next state after reveal completes
- Extend existing RewardReveal.tsx animation patterns (anticipation, scale-reveal, pulse-glow)

**Sequential Multi-Day Reveal**
- If multiple unrevealed days exist, reveal one day at a time
- After each reveal, prompt for next reveal or allow skip to check-in
- Days without reported check-in are auto-marked as "missed" (existing behavior)
- Users can always reveal past unrevealed days from timeline

**Post-Reveal Flow Routing**
- After reveal, if user has NOT checked in today: Transition to check-in prompt
- After reveal, if user HAS checked in today: Show done state with "Come back tomorrow to reveal today's reward"
- Journey timeline visible in done state showing revealed/unrevealed status

**New Data Model: Reveal Tracking**
- Add `revealed: boolean` field to check-in record schema
- Track reveal timestamp separately from check-in timestamp
- Update check-in-storage.ts to handle reveal state persistence
- Extend check-in-store.ts with reveal-specific actions and selectors

**Refactor Check-In Page State Machine**
- Current states: "loading" | "pending" | "revealing" | "done"
- New states: "loading" | "reveal-prompt" | "revealing" | "pending" | "confirming" | "done"
- "reveal-prompt": Shows unrevealed day(s) with reveal button
- "confirming": Post-check-in confirmation (replaces revealing for same-day)

## Visual Design

No visual assets provided. Follow existing design patterns from RewardReveal.tsx and DoneState.tsx:
- Anticipation phase: Pulsing circle with spinning icon, "Revealing..." text
- Earned state: Green glow, large dollar amount, celebration message
- Forfeited state: Gray/red styling, somber X icon, loss messaging
- Lucky break state: Amber/gold styling, relief messaging
- Use existing Tailwind animation classes: animate-pulse, animate-ping, animate-scale-reveal, animate-fade-in-up

## Existing Code to Leverage

**RewardReveal.tsx Component**
- Provides anticipation and reveal phase pattern with timer-based transitions
- Animation classes: animate-ping, animate-pulse, animate-spin, animate-scale-reveal, animate-pulse-glow, animate-fade-in-up
- Extend to handle four outcome states instead of two (reward/no-reward)
- Keep onComplete callback pattern for state machine transitions

**DoneState.tsx Component**
- Shows completed/missed variants with appropriate styling
- Running total display pattern to reuse
- "Come back tomorrow" messaging pattern
- Extend to include "reveal tomorrow's reward" messaging

**Check-in Store (check-in-store.ts)**
- Zustand store pattern with initialize, actions, and computed helpers
- Add new actions: revealDay, getUnrevealedDays, hasUnrevealedDays
- Add new state: revealQueue (array of day numbers pending reveal)
- Follow existing pattern for localStorage persistence via check-in-storage.ts

**Check-in Page (page.tsx)**
- PageState type pattern for state machine
- Layout with timeline integration
- Extend state machine with new reveal-prompt and confirming states
- Follow existing pattern of useEffect for state determination on mount

**JourneyTimeline.tsx Component**
- Already supports DayTile with status display
- May need visual indicator for "revealed" vs "unrevealed" past days
- Tappable past days can trigger reveal modal for unrevealed days

## Out of Scope
- Push notifications for reveal reminders
- Shareable social content or screenshots
- Confetti or particle animations
- Audio feedback or sound effects
- Haptic feedback (mobile web limitation)
- Reveal history or statistics page
- Undo reveal action
- Skip all reveals at once
- Reveal from settings or menu
- Backend API integration (localStorage only)
