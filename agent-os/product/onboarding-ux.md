# Onboarding UX — Web & Mobile (Real Lock-In Flow)

This document defines the onboarding experience for new users entering Locked In via the web, with real money at stake. The same design will apply to mobile web and native mobile apps.

> **Scope:** This covers the Real Lock-In flow only. Paper Lock-In onboarding (for iOS App Store entry) will be defined separately.

---

## Design Principles

### Voice & Tone

- **Direct and confident.** No fluff. Say what it is.
- **No-bullshit attitude.** We're not another habit app with streaks and badges. We say that plainly.
- **Stakes are real.** The tone reflects the product — serious commitment, real consequences.
- **Authentic, not corporate.** Personal, bold, focused. Never enterprise-speak or startup jargon.

### Aesthetic Direction

- **Premium/minimal.** Clean, focused, intentional. Reference: Linear.
- **Typography-led.** Let the words hit. No need for abstract orbs or generic wellness imagery.
- **Not a finance app.** Despite involving money, this should never feel like banking, crypto, or fintech. No "smart contracts" or "wallets."
- **Light & dark.** Must work beautifully in both modes. Dark should feel bold and focused.
- **Visuals earn their place.** Only add imagery if it clarifies or amplifies. When in doubt, let the copy do the work.

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
│  Screen 1: The Hook (what this is)                          │
│  Screen 2: The Mechanism (how it works)                     │
│  Screen 3: The Twist (next-day reveal)                      │
│  Screen 4: The Science (loss aversion quiz)                 │
│  Screen 5: The Rules (disclaimers)                          │
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

### Screen 1: The Hook

**Purpose:** Immediately differentiate from every other habit app. Set the tone: this is serious.

**Content:**

```
[Headline]
Accountability coaching, for real.

[Body]
No streaks. No badges. No bullshit.

Real money. Real consequences.

[CTA]
Get Locked In →

[Secondary]
Already have an account? Log in
```

**Visual direction:**
- Dark, minimal. Let the typography hit.
- Could feature the Locked In wordmark or a subtle lock icon.
- No abstract orbs, no zen imagery. The words are the visual.

**Notes:**
- Opens with attitude. This isn't a gentle invitation — it's a statement.
- "No streaks. No badges. No bullshit." immediately tells them what this ISN'T.
- "Real money. Real consequences." tells them what it IS.
- CTA uses the brand name: "Get Locked In" — the action IS the product.

---

### Screen 2: The Mechanism

**Purpose:** Explain how it works in the simplest terms. The mechanism IS the hook.

**Content:**

```
[Headline]
Put up money.
Do the work.
Earn it back.

[Body]
Complete your daily habit and recover up to 100% of your deposit.

Miss a day that had a reward? That money's gone.
Not to charity. Not refunded. Gone.

That's what makes this work.

[CTA]
Continue →
```

**Visual direction:**
- Typography-led. The rhythm of "Put. Do. Earn." is the visual.
- Could use a simple 3-step treatment, but keep it minimal.
- Let the weight of "Gone." land.

**Notes:**
- This is the core mechanism in plain language.
- The repetition of "Gone." emphasizes the stakes.
- "That's what makes this work." — confident, not apologetic about the consequences.

---

### Screen 3: The Twist

**Purpose:** Reveal the next-day mystery — the most unique part of the product. Create intrigue.

**Content:**

```
[Headline]
Here's the thing:

[Body]
You won't know which days earn rewards.
You won't know how much they're worth.
You'll find out the next day.

Complete today. Discover tomorrow.

[CTA]
Continue →
```

**Visual direction:**
- This screen could support subtle animation — a day flipping, a reward amount blurring then revealing.
- *Possibly* advent calendar vibe or reveal-type experience.
- Or keep it pure typography with strong hierarchy.
- The mystery should feel intriguing, not confusing.

**Notes:**
- This *must* be the "aha" moment. The twist that makes Locked In different.
- "Complete today. Discover tomorrow." is the tagline for the reveal mechanic.
- The uncertainty is a feature, not a bug — and we're owning it.

---

### Screen 4: The Science

**Purpose:** Introduce loss aversion — the psychological principle that makes this work.

**Content:**

```
[Headline]
Quick question:

[Quiz]
Which changes behavior more effectively?

[ ] The chance to earn $10
[ ] The risk of losing $10

[After selection, reveal:]

[If they chose "earn $10":]
Losing hits harder.

[If they chose "losing $10":]
Exactly.

[Body - same for both:]
Research shows the fear of loss is 2–2.5x more powerful than the promise of gain.

That's why your money is already yours in Locked In.
You're not earning rewards — you're protecting what you've committed.

[CTA]
Continue →
```

**Visual direction:**
- Clean quiz UI with two clear options.
- Reveal animation when they select.
- The statistic (2–2.5x) should be visually emphasized.

**Notes:**
- Interactive moment. User selects an answer.
- Response adapts based on their choice — validates or gently corrects.
- The 2–2.5x statistic is specific, credible, and memorable.
- Key reframe: "You're not earning rewards — you're protecting what you've committed."

---

### Screen 5: The Rules

**Purpose:** Set expectations. Cover the important stuff. Get acknowledgment.

**Content:**

```
[Headline]
Before you lock in:

[Interactive acknowledgment cards — user taps each to expand, read, and acknowledge:]

Each card expands on tap, then collapses with a checkmark when acknowledged.
A subtle progress indicator fills as they complete each one.

□ → ✓  Miss a day with a reward? It's forfeited instantly.
        You won't know which days have rewards until the next day.
        That's the point.

□ → ✓  Forfeited money goes to Locked In.
        Not to charity. Not refunded. That's what keeps the stakes real.

□ → ✓  Need to quit early? 48 hours = full refund.
        After that: 50% of remaining rewards back, 50% forfeited.
        Life happens, but commitment has weight.

□ → ✓  We verify automatically.
        Strava, Apple Health, GitHub, and more.
        For habits we can't auto-verify, photo + AI confirmation works.

□ → ✓  Only deposit what you're willing to lose.
        This is a commitment device, not a savings account.

[CTA - disabled until all acknowledged]
I understand. Let's go →

[CTA - enabled after all acknowledged]
✓ I understand. Let's go →
```

**Visual direction:**
- Cards should feel substantial but not overwhelming.
- Checkmarks provide satisfying feedback.
- Progress indicator fills as they acknowledge each one.
- Final CTA unlocks only after all items are acknowledged.

**Notes:**
- Each acknowledgment is a micro-commitment.
- Language is direct: "That's the point." / "That's what keeps the stakes real."
- No crypto language (smart contracts, wallets). No "community verification."
- The 48-hour refund policy is clearly stated.
- Consent is earned, not assumed.

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

1. **Hook** with attitude — this isn't another habit app
2. **Explain** the mechanism in plain terms — put money up, do the work, get it back
3. **Reveal** the twist — you won't know which days have rewards until tomorrow
4. **Teach** the science — loss aversion is why this works
5. **Set rules** — get acknowledgment on the important stuff
6. **Create account** with passwordless auth
7. **Capture intent** with template selection and verification
8. **Commit** with deposit and slide-to-lock-in
9. **Confirm** with a clear "you're locked in" moment

The tone is direct and no-bullshit. The aesthetic is premium-minimal with typography doing the heavy lifting. The stakes are real, and the copy reflects that.

Users should finish onboarding knowing exactly what they're getting into — and choosing to do it anyway.
