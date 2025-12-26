# Onboarding UX — Web & Mobile (Real Lock-In Flow)

This document defines the onboarding experience for new users entering Locked In via the web, with real money at stake. The same design will apply to mobile web and native mobile apps.

> **Scope:** This covers the Real Lock-In flow only. Paper Lock-In onboarding (for iOS App Store entry) will be defined separately.

---

## Design Principles

### Voice & Tone

- **Empowering, not confrontational.** We don't bash other apps or make users feel bad about past failures.
- **Calm, confident mentor.** Zen-like presence. Reassuring without being overbearing.
- **Future self pulling forward.** The better version of you is waiting. This isn't pressure — it's invitation.
- **Authentic, not corporate.** Personal, warm, focused. Never enterprise-speak.

### Aesthetic Direction

- **Premium/minimal.** Clean, focused, intentional. Reference: Linear, The Way (Henry Shuckman).
- **Zen-like focus.** The user is about to enter one deeply focused cycle. The UI should feel like that.
- **Not a finance app.** Despite involving money, this should never feel like banking, crypto, or fintech.
- **Light & dark.** Must work beautifully in both modes. Dark should feel focused, not developer/crypto.
- **Illustrations present but subtle.** Not a defining characteristic. Typography and space do the heavy lifting.

### Interaction Philosophy

- **Get users invested early.** Small inputs throughout, not just passive reading.
- **Education through interaction.** Quiz-like moments that teach while engaging.
- **Discrete escape hatches.** Existing users can log in without friction, but it's not the primary path.

### Navigation

- **Back navigation:** Users can go back to any previous screen at any point — until they slide to lock in. Once the slide gesture completes, they're committed and redirected to Stripe.
- **Progress indicators:** Onboarding screens (1-5) show progress dots. Cycle configuration steps (1-4) show "Step X of 4".
- **Existing users:** The "Already have an account? Log in" link persists through onboarding. After login, users land on the Dashboard (which handles both active cycles and empty states).

---

## User State Assumptions

Users arrive in one of three mindsets (often in this progression):

1. **Curious but skeptical** — Just discovered it. Evaluating legitimacy.
2. **Frustrated and desperate** — Tried everything. Looking for something that actually works.
3. **Intrigued by the mechanism** — Heard about "money on the line" and wants to understand.

We assume users know **very little** about the concept. Onboarding is their introduction.

---

## Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  ONBOARDING (5 screens)                                     │
│  ───────────────────────                                    │
│  Screen 1: Emotional Hook                                   │
│  Screen 2: Core Concept                                     │
│  Screen 3: Psychology #1 (Loss Aversion Quiz)               │
│  Screen 4: Psychology #2 (Intermittent Reward Quiz)         │
│  Screen 5: How It Works + Disclaimers                       │
├─────────────────────────────────────────────────────────────┤
│  ACCOUNT CREATION                                           │
│  ───────────────────────                                    │
│  Apple / Google / Phone / Email (magic links, no passwords) │
├─────────────────────────────────────────────────────────────┤
│  CYCLE CONFIGURATION (4 steps)                              │
│  ───────────────────────                                    │
│  Step 1: Pick a Template (category → template → connect)    │
│  Step 2: Duration (14 / 21 / 30 days)                       │
│  Step 3: Amount ($100 / $150 / $200 / $250 / custom)        │
│  Step 4: Summary + Slide to Lock In                         │
├─────────────────────────────────────────────────────────────┤
│  PAYMENT                                                    │
│  ───────────────────────                                    │
│  Stripe Checkout                                            │
├─────────────────────────────────────────────────────────────┤
│  POST-PAYMENT                                               │
│  ───────────────────────                                    │
│  Confirmation + Dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

A discrete "Already have an account? Log in" link appears on Screen 1 and persists through onboarding.

---

## Screen-by-Screen Breakdown

### Screen 1: Emotional Hook

**Purpose:** Capture attention. Create resonance. Set the tone.

**Content:**

```
[Headline - Option A]
The accountability coach you've always wanted
but could never justify paying for.

[Headline - Option B]
The first accountability coach
that refunds you on your success.

[Subtext]
Real commitment. Real stakes. Real results.

[Visual]
Subtle, abstract — perhaps a gentle pulse or glow suggesting potential energy.

[CTA]
Continue →

[Secondary]
Already have an account? Log in
```

**Notes:**
- Both headline options introduce the core value prop immediately.
- Option A speaks to the pain (wanted but couldn't justify) → we solve it.
- Option B leads with the mechanism (refunds on success) → intriguing and different.
- Test both. They appeal to slightly different mindsets.
- Tone: confident, clear, slightly bold.

---

### Screen 2: Core Concept

**Purpose:** Introduce what Locked In is. Plant the "refund" hook.

**Content:**

```
[Headline]
The only accountability coach that refunds you for your success.

[Body]
You put real money on the line.
Complete your daily action, and earn it back — up to 100%.

This isn't a subscription. It's an investment in yourself.

[Visual]
Simple representation of the cycle concept — perhaps a minimal arc or timeline.

[CTA]
How does it work? →
```

**Notes:**
- This is the pitch. Keep it tight.
- "Investment in yourself" reframes the deposit positively.
- No details on the mechanism yet — just the promise.

---

### Screen 3: Psychology Principle #1 — Loss Aversion

**Purpose:** Educate through interaction. Introduce loss aversion.

**Content:**

```
[Question - Quiz Style]
Quick question:

Which is more effective at changing behavior?

[ ] The chance to earn $10
[ ] The threat of losing $10

[After selection, reveal:]

[If they chose "earn $10":]
[Headline]
Actually, it's losing $10.

[If they chose "losing $10":]
[Headline]
Exactly right.

[Body - same for both:]
It's called loss aversion — and decades of research show that the fear of losing is 2–2.5x more powerful than the promise of gaining.

This is the foundation of Locked In.

You're not chasing rewards. You're protecting what's already yours. And that changes everything.

[CTA]
Next →
```

**Notes:**
- Interactive moment. User selects an answer.
- Response adapts based on their choice — validates if correct, gently corrects if not.
- The 2–2.5x statistic is the anchor. It's specific, credible, and memorable.
- "This is the foundation of Locked In" — connects principle to product.
- Link opportunity: "Learn more about the psychology →" (opens modal with deeper content)

---

### Screen 4: Psychology Principle #2 — Intermittent Reinforcement

**Purpose:** Introduce variable rewards. Address the "gambling" psychology ethically.

**Content:**

```
[Question - Multiple Choice]
What makes games (and yes, slot machines) so hard to put down?

[ ] Big rewards
[ ] Frequent rewards
[ ] Unpredictable rewards
[ ] Social pressure

[After selection, reveal:]

[If they chose "Unpredictable rewards":]
[Headline]
Exactly.

[If they chose anything else:]
[Headline]
Close — it's unpredictable rewards.

[Body - same for both:]
It's called intermittent reinforcement. Your brain is wired to stay engaged when it doesn't know if the next action will pay off.

Locked In uses this same principle — but instead of pulling you toward your phone, it pushes you toward your goals.

Complete your action today.
Discover your reward tomorrow.

[CTA]
Almost there →
```

**Notes:**
- Four options makes it feel like a real quiz.
- Response adapts based on their choice — validates if correct, gently corrects if not.
- "Complete today. Discover tomorrow." is the light-touch reveal education.
- Acknowledges the gambling parallel honestly, then reframes it.
- Link opportunity: "Why this works →" (deeper psychology modal)

---

### Screen 5: How It Works + Disclaimers

**Purpose:** Concrete mechanics. Set expectations. Cover legal/ethical ground.

**Content:**

```
[Headline]
How a cycle works

[Step-by-step, minimal:]

1. Choose your habit and how long you want to commit (14–30 days)
2. Deposit an amount you're willing to put on the line ($100–$1,000)
3. Complete your daily action — we verify it automatically
4. Each day you complete may have a reward waiting (revealed the next day)
5. Complete the cycle and recover up to 100% of your deposit

[Divider]

[Headline - Smaller]
A few things to know

[Interactive acknowledgment cards — user taps/clicks each to "accept":]

Each card expands on tap, then collapses with a checkmark when acknowledged.
A subtle progress indicator fills as they complete each one.

□ → ✓  What happens if I miss a day?
        If that day had a reward, it's forfeited. You don't know which days
        have rewards until it's too late — that's what keeps you showing up.

□ → ✓  Where does forfeited money go?
        To Locked In. Not to charity, not refunded. Real stakes require real
        consequences. That's what makes this work.

□ → ✓  Can I quit early?
        Within 48 hours: full refund. After that: 50% of remaining rewards,
        50% forfeited. Life happens, but commitment has weight.

□ → ✓  What if I can't verify automatically?
        We integrate with Strava, Apple Health, and more. For habits we can't
        verify, photo + AI confirmation is available.

□ → ✓  How much should I deposit?
        Only what you can afford to lose. This is a commitment device, not a
        savings account.

[CTA - disabled until all acknowledged]
I understand. Let's begin →

[CTA - enabled after all acknowledged]
✓ I understand. Let's begin →
```

**Notes:**
- Each acknowledgment feels like a micro-commitment, not a legal burden.
- Progress indicator (or filling bar) creates momentum — like leveling up.
- Checkmarks provide satisfying feedback. The user is "earning" their readiness.
- Language is direct but not cold. "That's what makes this work" — confident.
- The final CTA unlocks only after all items are acknowledged — consent is earned, not assumed.
- Light gamification without feeling like a video game. More like "preparing for launch."

---

## Post-Onboarding: Account Creation

After the info screens, user creates an account before configuring their cycle.

### Account Creation

**Purpose:** Minimal friction. No passwords. Get them signed in fast.

**Layout:**

```
[Headline]
Create your account

[Primary options - large buttons:]
Continue with Apple
Continue with Google

[Divider]
or

[Secondary options:]
Continue with phone number
Continue with email

[If phone selected:]
[Phone input] → Send magic link via SMS

[If email selected:]
[Email input] → Send magic link

[Legal - small]
By continuing, you agree to our Terms of Service and Privacy Policy.
```

**Notes:**
- No passwords. Ever. Magic links for phone and email.
- Apple/Google OAuth are the primary paths — fastest and most trusted.
- Account creation happens BEFORE cycle configuration so we can save their progress.
- If they abandon mid-setup, we can follow up.

---

## Cycle Configuration (4 Steps)

Each step is its own screen. Progress indicator shows 1/4, 2/4, etc.

---

### Step 1: Pick a Template

**Purpose:** What habit + how we verify it — bundled together. Like picking a Zap on Zapier. The template defines the commitment and the verification is baked in.

---

**Layout — Phase 1 (Category):**

```
[Progress: Step 1 of 4]

[Headline]
What do you want to lock in?

[Category tiles - 6 options:]
🧘 Meditation
🏃 Exercise
🧑‍💻 Coding
📸 Content
✍️ Writing
😴 Sleep
```

---

**Layout — Phase 2 (Templates) — appears after category selection:**

Each category reveals a set of template cards. Each card bundles:
- A specific habit/goal
- The verification method(s) that work for it
- Some include suggested duration

User picks a template, then connects the verification service inline (if OAuth is required).

---

#### 🧘 Meditation Templates

```
┌─────────────────────────────────────────────────────────────┐
│  Build a daily meditation routine                           │
│                                                             │
│  Verified by: Apple Health · Google Health                  │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  20-minute meditation sit                                   │
│  Suggested: 21 days                                         │
│                                                             │
│  Verified by: Apple Health · Google Health                  │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own meditation habit                     │
│                                                             │
│  Verified by: Apple Health · Google Health                  │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 🏃 Exercise Templates

```
┌─────────────────────────────────────────────────────────────┐
│  Build a rock-solid legs routine                            │
│                                                             │
│  Verified by: Strava · Apple Health · Google Health         │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Hit abs every day                                          │
│  Suggested: 30 days                                         │
│                                                             │
│  Verified by: Strava · Apple Health · Google Health         │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Daily 30-minute walk                                       │
│  Suggested: 30 days                                         │
│                                                             │
│  Verified by: Strava · Apple Health · Google Health         │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Build base for a marathon                                  │
│  Suggested: 30 days                                         │
│                                                             │
│  Verified by: Strava · Apple Health · Google Health         │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own workout habit                        │
│                                                             │
│  Verified by: Strava · Apple Health · Google Health         │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 🧑‍💻 Coding Templates

```
┌─────────────────────────────────────────────────────────────┐
│  Learn React programming                                    │
│  Suggested: 21 days                                         │
│                                                             │
│  Verified by: GitHub                                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Launch a new app                                           │
│  Suggested: 14 days                                         │
│                                                             │
│  Verified by: GitHub                                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Ship a new feature every day                               │
│  Suggested: 21 days                                         │
│                                                             │
│  Verified by: GitHub                                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own coding habit                         │
│                                                             │
│  Verified by: GitHub                                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 📸 Content Templates

```
┌─────────────────────────────────────────────────────────────┐
│  Create at least one TikTok a day                           │
│  Suggested: 14 days                                         │
│                                                             │
│  Verified by: TikTok                                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Post on X twice a day                                      │
│  Build an audience                                          │
│                                                             │
│  Verified by: X                                             │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Post on Instagram daily                                    │
│  Suggested: 21 days                                         │
│                                                             │
│  Verified by: Instagram                                     │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own content habit                        │
│                                                             │
│  Verified by: TikTok · X · Instagram                        │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

---

#### ✍️ Writing Templates

```
┌─────────────────────────────────────────────────────────────┐
│  Write at least 500 words a day                             │
│                                                             │
│  Verified by: Photo upload (no account needed)              │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Journal daily                                              │
│  Suggested: 30 days                                         │
│                                                             │
│  Verified by: Photo upload (no account needed)              │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own writing habit                        │
│                                                             │
│  Verified by: Photo upload (no account needed)              │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Photo upload templates skip the OAuth connection step entirely. After selecting, user proceeds directly to Step 2 (Duration).

---

#### 😴 Sleep Templates

```
┌─────────────────────────────────────────────────────────────┐
│  In bed by 9pm                                              │
│  Suggested: 21 days                                         │
│                                                             │
│  Verified by: Whoop · Apple Health · Google Health          │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Get at least 7 hours of sleep                              │
│  Suggested: 14 days                                         │
│                                                             │
│  Verified by: Whoop · Apple Health · Google Health          │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✏️ Customize your own sleep habit                          │
│                                                             │
│  Verified by: Whoop · Apple Health · Google Health          │
│                                                   [Select]  │
└─────────────────────────────────────────────────────────────┘
```

---

**Layout — Phase 3 (Connect) — after selecting a template:**

The selected template expands to show verification connection options.

```
[Progress: Step 1 of 4]

[Selected template summary:]
┌─────────────────────────────────────────────────────────────┐
│  🏃 Build base for a marathon                               │
│  Suggested: 30 days                                         │
└─────────────────────────────────────────────────────────────┘

[Headline]
Connect a service to verify your workouts

[Verification options — pick one:]

┌─────────────────────────────────────────────────────────────┐
│  Strava                                           [Connect] │
│  We'll check for any logged run or workout.                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Apple Health                                     [Connect] │
│  We'll check for workout data from your watch or phone.    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Google Health                                    [Connect] │
│  We'll check for fitness data from your Android device.    │
└─────────────────────────────────────────────────────────────┘
```

When user taps [Connect]:

```
[Modal]

Connect to Strava

Locked In will check your Strava activity each day to verify
you completed your workout. We only read activity data — we
never post or modify anything.

[Connect with Strava — initiates OAuth]

[Cancel]
```

After successful connection:

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Strava connected                                         │
│  We'll check for any logged run or workout.                │
└─────────────────────────────────────────────────────────────┘

[CTA]
Next →
```

---

**Layout — Phase 4 (Customize title) — optional, for "Customize" templates:**

If user selected a "Customize your own..." template, they get a title input:

```
[Progress: Step 1 of 4]

[Headline]
Give it a name

[Text input:]
[________________________________]

[AI-assisted suggestions based on category:]
"Morning run"
"Daily workout"
"Gym session"

[The selected verification shows as context:]
✓ Verified by Strava

[CTA]
Next →
```

For pre-built templates, the title is already set — user can edit if they want but it's optional.

---

**Notes:**
- Templates bundle habit + verification + (sometimes) suggested duration.
- "Suggested: X days" pre-fills the duration step but user can still change it.
- Each category has 2-4 pre-built templates + a "Customize" option.
- Verification is shown upfront on every card — no surprises.
- **OAuth templates** (Strava, Apple Health, GitHub, etc.): User must connect before proceeding.
- **Photo upload templates** (Writing): No OAuth needed — user selects and proceeds directly to Duration.
- Pre-built templates have titles ready; "Customize" templates prompt for a name.
- This approach reduces decisions: pick a package, connect (if needed), go.

---

### Step 2: Duration

**Purpose:** How long is this commitment?

**Layout:**

```
[Progress: Step 2 of 4]

[Headline]
How long do you want to commit?

[Three preset options - large, tappable cards:]

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   14 days   │  │   21 days   │  │   30 days   │
│             │  │             │  │             │
│  Two weeks  │  │ Three weeks │  │  One month  │
│   Starter   │  │ Recommended │  │   Serious   │
└─────────────┘  └─────────────┘  └─────────────┘

[CTA]
Next →
```

**Notes:**
- Three options only. No slider, no custom.
- 21 days marked as "Recommended" — the classic habit-formation benchmark.
- Descriptive labels help frame the commitment level.
- Constraints reduce decision fatigue.

---

### Step 3: Amount

**Purpose:** How much are they putting on the line?

**Layout:**

```
[Progress: Step 3 of 4]

[Headline]
How much are you locking in?

[Four preset options - large, tappable cards:]

┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  $100  │  │  $150  │  │  $200  │  │  $250  │
└────────┘  └────────┘  └────────┘  └────────┘

[Below presets:]
Or enter a custom amount ($100 – $1,000)
[$ ________]

[Reminder - small, reassuring:]
Only lock in what you can afford to lose.
Complete your daily action and recover up to 100%.

[CTA]
Next →
```

**Notes:**
- Presets reduce friction and anchor expectations.
- $100 minimum keeps stakes meaningful.
- $1,000 maximum prevents gambling behavior.
- Reminder reinforces the "invest in yourself" framing.

---

### Step 4: Summary & Lock In

**Purpose:** Final confirmation. Slide to commit. Initiates payment.

**Layout:**

```
[Progress: Step 4 of 4]

[Headline]
Ready to lock in?

[Summary card:]
┌─────────────────────────────────────────┐
│                                         │
│  🏃 Daily morning run                   │
│                                         │
│  Verified by: Strava                    │
│  Duration: 21 days                      │
│  Amount: $200                           │
│                                         │
│  Complete daily → recover up to $200    │
│  Miss a reward day → that amount is     │
│  forfeited                              │
│                                         │
└─────────────────────────────────────────┘

[Slide to lock in - full width:]
┌─────────────────────────────────────────┐
│  ◉────────────────→  Slide to lock in   │
└─────────────────────────────────────────┘

[Below slider - small:]
You'll be redirected to complete payment.
```

**Notes:**
- Summary shows all choices in one place — no surprises.
- Slide-to-confirm adds intentionality. This isn't an accidental tap.
- The gesture itself feels like a commitment.
- After slide, redirect to Stripe Checkout for $200 (or whatever amount).

---

## Post-Payment

### Confirmation Screen

```
[Headline]
You're locked in.

[Subheadline]
Your first cycle starts tomorrow.

[Summary card - reflecting their choices:]
┌─────────────────────────────────────────┐
│                                         │
│  🏃 Daily morning run                   │
│  ✓ Verified by Strava                   │
│                                         │
│  21 days · $200 on the line             │
│                                         │
└─────────────────────────────────────────┘

[Body]
Complete your run each day. We'll check Strava automatically.
Check back the next day to discover if there was a reward waiting.

[Visual]
Simple cycle timeline showing Day 1 → Day 21, with "Tomorrow" marked as Day 1.

[CTA]
Go to your dashboard →

[Secondary]
Download the app for daily check-ins
```

**Notes:**
- Verification is already connected — no additional step needed.
- Summary reinforces what they committed to.
- Clear next steps: do the action, come back tomorrow.
- App download prompt for mobile experience.

---

## Future Considerations

### Simulation Mode

Allow users to step through a mock cycle before committing real money:

- Experience the daily check-in flow
- See a mock reveal ("Yesterday had $8!")
- Feel the mechanism without stakes

This could significantly reduce friction for skeptical users.

### Psychology Deep-Dive Modal

A well-designed modal or slide-over with an approachable "whitepaper" on:

- Loss aversion research
- Variable reinforcement studies
- Why this mechanism works
- Links to academic sources

Triggered by "Learn more about the psychology" CTAs throughout onboarding.

---

## Open Questions

1. **Social proof:** Any place for testimonials, completion rates, or community stats in onboarding?

2. **Mobile app download prompt:** When and how aggressively do we push the native app after web signup?

---

## Summary

This onboarding flow is designed to:

1. **Hook** with the future-self invitation
2. **Educate** through interactive psychology moments
3. **Set expectations** with clear, honest disclaimers
4. **Create account** with passwordless auth
5. **Capture intent** with template selection and verification
6. **Commit** with deposit and slide-to-lock-in
7. **Confirm** with a clear "you're in" moment

The tone is zen mentor — calm, confident, never pushy. The aesthetic is premium-minimal with warmth. The psychology is surfaced through experience, not lecture.

Users should finish onboarding feeling focused, committed, and ready to become the person they've been meaning to be.
