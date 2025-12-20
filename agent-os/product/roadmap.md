# Product Roadmap

## Development Phases

This roadmap follows a strategic order based on technical dependencies and the most direct path to achieving the mission: helping users build lasting habits through the Variable Interval Deposit Contract mechanism.

---

## Phase 1: MVP - Core Contract Mechanism

The foundation: users can deposit money, complete daily habits, and recover their stake.

1. [x] Variable Reward Allocation Algorithm & Test Harness — Implement the core VIDC algorithm that randomly distributes the deposited amount across 20-85% of contract days with varying reward amounts (2-80% of principal per day). Build an admin-facing test harness UI to visualize generated reward distributions across sample contracts and simulate user scenarios (completing/missing days) to observe reward/forfeiture outcomes. `L`

2. [ ] User Authentication — Implement email/password and OAuth sign-up/sign-in using Supabase Auth, including session management and protected routes for both web and mobile. `M`

3. [ ] User Profile & Settings — Create user profile storage and settings management including notification preferences, timezone, and display name. `S`

4. [ ] Stripe Integration — Set up Stripe Connect for deposit collection and withdrawal processing, including webhook handling for payment events and secure key management. `M`

5. [ ] Wallet System — Implement in-app wallet for tracking user balances. Recovered rewards accumulate here during cycles. Support deposits from Stripe, withdrawals to bank, and balance checks. This is the central ledger for all user funds. `M`

6. [ ] Contract Creation Flow — Build the UI and API for users to create a new habit contract: define the habit, set deposit amount ($100-$1000), choose cycle length (7-30 days, with 14 and 21 being recommended), and fund from wallet balance or via new Stripe deposit. `L`

7. [ ] Daily Habit Logging (Self-Report Fallback) — Create the daily check-in interface where users mark their habit as complete. This is the MVP verification method and fallback for habits that can't be auto-verified. Include appropriate friction, timestamp validation, and once-per-day limits. `M`

8. [ ] Next-Day Reveal System — Build the reveal mechanic where users discover yesterday's reward status. Display whether the previous day had a reward, the amount recovered (or forfeited if missed), and update wallet balance accordingly. This is a core engagement driver. `M`

9. [ ] Reward Processing Engine — Build the automated system that checks daily completions against the hidden reward schedule, credits recovered amounts to user wallet, and marks forfeitures. Runs after each day's completion window closes. `M`

10. [ ] Contract Dashboard — Display active contract status including days remaining, current streak, wallet balance, total recovered, total forfeited, and next action deadline. Hide upcoming reward day/amount information. `M`

11. [ ] Basic Notifications — Implement daily reminder notifications (push for mobile, email for web) at user-configured times to prompt habit completion. `S`

12. [ ] Contract Completion Flow — Handle end-of-contract logic: calculate final recovery amount, display summary of wallet gains, and prompt for rollover into new cycle or withdrawal. `S`

13. [ ] Early Exit Flow — Implement the ability to exit a contract early with appropriate refund logic: full refund within 48 hours, 50% of remaining unrevealed rewards credited to wallet after. Include clear confirmation UI explaining forfeiture amount and a graceful exit message. `S`

---

## Phase 2: Enhanced - AI Coaching & Advanced Verification

Add intelligence and flexibility to drive higher completion rates.

14. [ ] AI Coaching Engine — Integrate Claude API to provide personalized coaching messages based on user's habit type, progress patterns, and current streak status. Include motivational check-ins and obstacle troubleshooting. `L`

15. [ ] Adaptive Messaging System — Build a system that adjusts AI coaching tone, timing, and frequency based on user engagement patterns and preferences. Learn what works for each user. `M`

16. [ ] Photo Verification — Add camera capture and photo upload for visual habit proof (e.g., gym selfie, healthy meal, completed work). Store securely in Supabase Storage. `M`

17. [ ] Fitness Tracker Integration — Connect with Apple Health, Google Fit, and Fitbit APIs to automatically verify exercise-related habits based on activity data. `L`

18. [ ] Progress Analytics Dashboard — Create detailed analytics showing completion rates over time, best/worst days of the week, streak history, and comparison across contracts. `M`

19. [ ] Pattern Insights Engine — Analyze user data to surface actionable insights: "You're 40% more likely to complete your habit before 9am" or "Mondays are your weakest day." `M`

20. [ ] Multiple Simultaneous Contracts — Enable users to run several habit contracts at once, with options for independent reward pools per habit or a shared pool for higher stakes. Unified dashboard view and combined daily check-in experience. `M`

21. [ ] Contract Templates — Offer pre-configured contract templates for common habits (daily exercise, meditation, coding, reading) with suggested durations and deposit ranges. `S`

---

## Phase 3: Scale - Social Features & Ecosystem

Build community and expand the platform's reach.

22. [ ] Accountability Partners — Allow users to invite friends to view their contract progress in real-time, with optional notifications when they complete (or miss) a day. `M`

23. [ ] Public Commitments — Enable users to share their active contracts publicly with a unique URL, creating social accountability through visibility. `S`

24. [ ] Community Feed — Build a feed where users can optionally share completions, milestones, and contract completions with the broader Locked In community. `L`

25. [ ] Coding Platform Integration — Connect with GitHub API to automatically verify coding habits based on commits, PRs, or contribution activity. `M`

26. [ ] Meditation App Integration — Integrate with Headspace, Calm, or Insight Timer APIs to verify meditation habit completion. `M`

27. [ ] AI-Assisted Verification — Use vision AI to validate photo proofs and natural language processing to verify subjective habit completions with appropriate confidence scoring. `L`

28. [ ] Achievement System — Create meaningful achievements and milestones (first contract completed, 30-day streak, $500 recovered) that celebrate user success without undermining the core mechanism. `S`

29. [ ] Referral Program — Implement a referral system where users can invite friends and both receive benefits (e.g., reduced platform fees or bonus recovery percentage). `M`

30. [ ] Advanced Notification Intelligence — Use ML to optimize notification timing and content based on when users are most likely to engage and complete their habits. `L`

31. [ ] Contract Groups — Enable groups of users to start synchronized contracts together, creating shared accountability and friendly competition. `L`

---

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature
> - Phase 1 delivers a complete, usable product with the core value proposition
> - Phase 2 focuses on features that improve completion rates and user success
> - Phase 3 builds network effects and platform stickiness
> - Effort estimates: XS (1 day), S (2-3 days), M (1 week), L (2 weeks), XL (3+ weeks)
