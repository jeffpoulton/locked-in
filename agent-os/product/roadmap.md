# Product Roadmap

## Development Phases

This roadmap follows a strategic order based on technical dependencies and the most direct path to achieving the mission: helping users build lasting habits through the Variable Interval Deposit Contract mechanism.

---

## Phase 1: MVP - Core Contract Mechanism

The foundation: users can deposit money, complete daily habits, and recover their stake.

1. [ ] User Authentication — Implement email/password and OAuth sign-up/sign-in using Supabase Auth, including session management and protected routes for both web and mobile. `M`

2. [ ] User Profile & Settings — Create user profile storage and settings management including notification preferences, timezone, and display name. `S`

3. [ ] Stripe Integration — Set up Stripe Connect for deposit collection and automated payouts, including webhook handling for payment events and secure key management. `M`

4. [ ] Contract Creation Flow — Build the UI and API for users to create a new habit contract: define the habit, set deposit amount ($10-$1000), choose cycle length (7-90 days), and process the initial deposit via Stripe. `L`

5. [ ] Variable Reward Allocation Algorithm — Implement the core VIDC algorithm that randomly distributes the deposited amount across 20-85% of contract days with varying reward amounts (2-80% of principal per day). `M`

6. [ ] Daily Action Logging (Self-Report) — Create the daily check-in interface where users mark their habit as complete, with appropriate friction to prevent mindless check-offs. Include timestamp validation and once-per-day limits. `M`

7. [ ] Reward Recovery System — Build the automated system that checks daily completions against the hidden reward schedule and processes recoveries back to the user's payment method. `M`

8. [ ] Contract Dashboard — Display active contract status including days remaining, current streak, total recovered, total at risk, and next action deadline. Hide specific reward day/amount information. `M`

9. [ ] Basic Notifications — Implement daily reminder notifications (push for mobile, email for web) at user-configured times to prompt habit completion. `S`

10. [ ] Contract Completion Flow — Handle end-of-contract logic: calculate final recovery amount, process any remaining payouts, display summary, and prompt for contract renewal. `S`

---

## Phase 2: Enhanced - AI Coaching & Advanced Verification

Add intelligence and flexibility to drive higher completion rates.

11. [ ] AI Coaching Engine — Integrate Claude API to provide personalized coaching messages based on user's habit type, progress patterns, and current streak status. Include motivational check-ins and obstacle troubleshooting. `L`

12. [ ] Adaptive Messaging System — Build a system that adjusts AI coaching tone, timing, and frequency based on user engagement patterns and preferences. Learn what works for each user. `M`

13. [ ] Photo Verification — Add camera capture and photo upload for visual habit proof (e.g., gym selfie, healthy meal, completed work). Store securely in Supabase Storage. `M`

14. [ ] Fitness Tracker Integration — Connect with Apple Health, Google Fit, and Fitbit APIs to automatically verify exercise-related habits based on activity data. `L`

15. [ ] Progress Analytics Dashboard — Create detailed analytics showing completion rates over time, best/worst days of the week, streak history, and comparison across contracts. `M`

16. [ ] Pattern Insights Engine — Analyze user data to surface actionable insights: "You're 40% more likely to complete your habit before 9am" or "Mondays are your weakest day." `M`

17. [ ] Multiple Simultaneous Contracts — Enable users to run several habit contracts at once with a unified dashboard view and combined daily check-in experience. `M`

18. [ ] Contract Templates — Offer pre-configured contract templates for common habits (daily exercise, meditation, coding, reading) with suggested durations and deposit ranges. `S`

---

## Phase 3: Scale - Social Features & Ecosystem

Build community and expand the platform's reach.

19. [ ] Accountability Partners — Allow users to invite friends to view their contract progress in real-time, with optional notifications when they complete (or miss) a day. `M`

20. [ ] Public Commitments — Enable users to share their active contracts publicly with a unique URL, creating social accountability through visibility. `S`

21. [ ] Community Feed — Build a feed where users can optionally share completions, milestones, and contract completions with the broader Locked In community. `L`

22. [ ] Coding Platform Integration — Connect with GitHub API to automatically verify coding habits based on commits, PRs, or contribution activity. `M`

23. [ ] Meditation App Integration — Integrate with Headspace, Calm, or Insight Timer APIs to verify meditation habit completion. `M`

24. [ ] AI-Assisted Verification — Use vision AI to validate photo proofs and natural language processing to verify subjective habit completions with appropriate confidence scoring. `L`

25. [ ] Achievement System — Create meaningful achievements and milestones (first contract completed, 30-day streak, $500 recovered) that celebrate user success without undermining the core mechanism. `S`

26. [ ] Referral Program — Implement a referral system where users can invite friends and both receive benefits (e.g., reduced platform fees or bonus recovery percentage). `M`

27. [ ] Advanced Notification Intelligence — Use ML to optimize notification timing and content based on when users are most likely to engage and complete their habits. `L`

28. [ ] Contract Groups — Enable groups of users to start synchronized contracts together, creating shared accountability and friendly competition. `L`

---

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature
> - Phase 1 delivers a complete, usable product with the core value proposition
> - Phase 2 focuses on features that improve completion rates and user success
> - Phase 3 builds network effects and platform stickiness
> - Effort estimates: XS (1 day), S (2-3 days), M (1 week), L (2 weeks), XL (3+ weeks)
