# Product Roadmap

## Development Phases

This roadmap follows a strategic order based on validating the core experience first, then adding infrastructure to make it production-ready. The goal is to prove the UX works before investing in auth, payments, and persistence.

---

## Phase 1A: Experience Prototype

Validate the core habit cycle experience. No real money, no auth, no database—just localStorage and mock data. This phase answers: "Does the UX feel right?"

1. [x] Variable Reward Allocation Algorithm & Test Harness — Implement the core algorithm that randomly distributes the deposited amount across 20-85% of contract days with varying reward amounts (2-80% of principal per day). Build an admin-facing test harness to visualize generated distributions and simulate user scenarios. `L`

2. [x] Contract Setup Flow (Prototype) — Build the UI for users to start a new habit cycle: simple text input for habit description, duration slider (7-30 days), and deposit amount input ($100-$1000). No actual payment—just capture the intent and generate the hidden reward schedule. Store in localStorage. `M`

3. [x] Daily Check-In Experience — Create the daily interface where users mark their habit as complete. Focus on the emotional design: the friction of commitment, the satisfaction of checking off, the anticipation of what tomorrow's reveal might show. Self-report only for now. `M`

4. [x] Next-Day Reveal Experience — Build the reveal moment where users discover yesterday's reward status. This is the core engagement hook. Design for emotional impact: the anticipation, the reveal animation, the joy of recovery or sting of forfeiture. `M`

5. [x] Cycle Progress View — Show where the user is in their journey: days remaining, current streak, running totals of recovered/forfeited amounts. Hide future reward information. Focus on progress visualization that motivates continued engagement. `M`

6. [x] Strava Integration Prototype — Build initial Strava OAuth flow and activity verification as the first third-party verifier. Prove the concept: user connects Strava, selects activity type (run, ride, etc.), and daily check-ins auto-verify against logged activities. Keep it simple—this informs the verifier abstraction we'll refactor into later. `M`

7. [ ] Cycle Completion Experience — Handle end-of-cycle: display the full journey summary, final recovery percentage, and emotional closure. Prompt to "start another cycle" (which just resets localStorage for now). `S`

---

## Phase 1B: Production Infrastructure

Make the prototype real. Add the systems needed for actual users with real money.

8. [ ] User Authentication — Implement email/password and OAuth sign-up/sign-in using Supabase Auth, including session management and protected routes for both web and mobile. `M`

9. [ ] User Profile & Settings — Create user profile storage and settings management including notification preferences, timezone, and display name. `S`

10. [ ] Database Schema & Persistence — Move from localStorage to Supabase/Prisma. Store contracts, daily completions, reward schedules, and user progress. Migrate the prototype's data model to proper persistence. `M`

11. [ ] Stripe Integration — Set up Stripe Connect for deposit collection and withdrawal processing, including webhook handling for payment events and secure key management. `M`

12. [ ] Wallet System — Implement in-app wallet for tracking user balances. Recovered rewards accumulate here during cycles. Support deposits from Stripe, withdrawals to bank, and balance checks. This is the central ledger for all user funds. `M`

13. [ ] Reward Processing Engine — Build the automated system that checks daily completions against the hidden reward schedule, credits recovered amounts to user wallet, and marks forfeitures. Runs after each day's completion window closes. `M`

14. [ ] Basic Notifications — Implement daily reminder notifications (push for mobile, email for web) at user-configured times to prompt habit completion. `S`

15. [ ] Early Exit Flow — Implement the ability to exit a contract early with appropriate refund logic: full refund within 48 hours, 50% of remaining unrevealed rewards after. Include clear confirmation UI explaining forfeiture amount. `S`

---

## Phase 2: Enhanced - AI Coaching & Advanced Verification

Add intelligence and flexibility to drive higher completion rates.

16. [ ] AI Coaching Engine — Integrate Claude API to provide personalized coaching messages based on user's habit type, progress patterns, and current streak status. Include motivational check-ins and obstacle troubleshooting. `L`

17. [ ] Adaptive Messaging System — Build a system that adjusts AI coaching tone, timing, and frequency based on user engagement patterns and preferences. Learn what works for each user. `M`

18. [ ] Photo Verification — Add camera capture and photo upload for visual habit proof (e.g., gym selfie, healthy meal, completed work). Store securely in Supabase Storage. `M`

19. [ ] Extended Fitness Tracker Integration — Expand verifier framework with Apple Health and Google Fit support, building on the Strava prototype from Phase 1A. `L`

20. [ ] Progress Analytics Dashboard — Create detailed analytics showing completion rates over time, best/worst days of the week, streak history, and comparison across contracts. `M`

21. [ ] Pattern Insights Engine — Analyze user data to surface actionable insights: "You're 40% more likely to complete your habit before 9am" or "Mondays are your weakest day." `M`

22. [ ] Multiple Simultaneous Contracts — Enable users to run several habit contracts at once, with options for independent reward pools per habit or a shared pool for higher stakes. Unified dashboard view and combined daily check-in experience. `M`

23. [ ] Contract Templates — Offer pre-configured contract templates for common habits (daily exercise, meditation, coding, reading) with suggested durations and deposit ranges. `S`

---

## Phase 3: Scale - Social Features & Ecosystem

Build community and expand the platform's reach.

24. [ ] Accountability Partners — Allow users to invite friends to view their contract progress in real-time, with optional notifications when they complete (or miss) a day. `M`

25. [ ] Public Commitments — Enable users to share their active contracts publicly with a unique URL, creating social accountability through visibility. `S`

26. [ ] Community Feed — Build a feed where users can optionally share completions, milestones, and contract completions with the broader Locked In community. `L`

27. [ ] Coding Platform Integration — Connect with GitHub API to automatically verify coding habits based on commits, PRs, or contribution activity. `M`

28. [ ] Meditation App Integration — Integrate with Headspace, Calm, or Insight Timer APIs to verify meditation habit completion. `M`

29. [ ] AI-Assisted Verification — Use vision AI to validate photo proofs and natural language processing to verify subjective habit completions with appropriate confidence scoring. `L`

30. [ ] Achievement System — Create meaningful achievements and milestones (first contract completed, 30-day streak, $500 recovered) that celebrate user success without undermining the core mechanism. `S`

31. [ ] Referral Program — Implement a referral system where users can invite friends and both receive benefits (e.g., reduced platform fees or bonus recovery percentage). `M`

32. [ ] Advanced Notification Intelligence — Use ML to optimize notification timing and content based on when users are most likely to engage and complete their habits. `L`

33. [ ] Contract Groups — Enable groups of users to start synchronized contracts together, creating shared accountability and friendly competition. `L`

---

> Notes
> - Phase 1A validates the core experience before building infrastructure
> - Phase 1B adds auth, payments, and persistence to make it production-ready
> - Phase 2 focuses on features that improve completion rates and user success
> - Phase 3 builds network effects and platform stickiness
> - Each item should represent a testable increment of functionality
> - Effort estimates: XS (1 day), S (2-3 days), M (1 week), L (2 weeks), XL (3+ weeks)
