# Locked In — Monetization, Platform Constraints, and Onboarding Strategy

This document captures the product, UX, and platform decisions behind Locked In’s
**web + iOS app architecture**, including Apple policy constraints, Stripe-based
monetization, and the introduction of **Paper Lock-Ins** as a first-class experience.

This is not a workaround or hack — it is an intentional design that aligns:
- business viability
- App Store compliance
- psychological integrity
- long-term product strategy

---

## 1. Core Product Philosophy

Locked In is an **accountability and coaching platform**, not a digital content app.

- Users work toward real-world commitments
- Actions are verified via third-party systems (HealthKit, Strava, GitHub, etc.)
- Coaching is a real service delivered by a human and/or AI
- Financial stakes exist only in **Real Lock-Ins**
- The app’s job is to verify reality, not to sell access

This distinction matters deeply for both UX and Apple policy compliance.

---

## 2. Apple Platform Constraints (What Is and Isn’t Allowed)

### 2.1 What Apple Requires In-App Purchases (IAP) For

Apple requires IAP **only** for:
- Digital goods
- Digital subscriptions
- Digital services consumed *entirely inside the app*

Examples:
- Streaming content
- App features unlocked by payment
- Digital tools whose value is fully delivered in-app

Locked In does **not** fall into this category.

---

### 2.2 What Apple Allows Without IAP

Apple explicitly allows apps to avoid IAP for:
- Real-world services
- One-to-one coaching
- Consulting
- Training
- Accountability systems
- Companion apps for paid services

Locked In qualifies because:
- The paid offering is **coaching**
- The app supports execution and verification
- Payment is not for “features,” but for a service relationship

---

### 2.3 The Non-Negotiable Rule (Steering)

Inside the iOS app, we **must not**:
- Show pricing
- Show “Buy,” “Subscribe,” or “Upgrade” CTAs
- Link to Stripe or web checkout
- Mention payment methods
- Say “Sign up on our website”
- Deep-link to any payment flow

This is known as **steering** and is the #1 cause of App Store rejection.

---

### 2.4 What Is Allowed

We **can**:
- Accept payments via Stripe on the web
- Create accounts on the web
- Let paid users log into the iOS app
- Deliver full value in the app *after payment*
- Allow non-paying users to explore the system (Paper Lock-Ins)

The app is not a store.  
It is a tool used by people who may already be customers.

---

## 3. Web vs iPhone App Responsibilities

This is not “web first” vs “mobile first.”  
It is **separation of concerns**.

### 3.1 The Website (Commercial Surface)

The website handles:
- Explaining the Locked In philosophy
- Explaining Real vs Paper Lock-Ins
- Explaining refunds and verification
- Displaying pricing
- Accepting Stripe payments
- Setting expectations

The website is where **commitment happens**.

---

### 3.2 The iPhone App (Execution Surface)

The iOS app handles:
- Daily usage
- Action creation
- Verification
- Evidence ingestion
- Feedback
- Coaching interaction
- HealthKit / Strava / GitHub integrations

The app is where **reality is confronted**.

---

### 3.3 Why This Split Is Intentional

- Avoids Apple’s 15–30% tax
- Preserves pricing flexibility
- Enables refunds cleanly
- Aligns with coaching trust dynamics
- Produces higher-quality customers
- Supports TikTok discovery without violating policy

---

## 4. Discovery Paths and UX Strategy

There are **two legitimate entry paths** into Locked In.

They converge into the same core experience.

---

## 5. App Store / TikTok → iPhone App Path

### 5.1 User Mindset
- Curious
- Low commitment
- Mobile-native
- Evaluating legitimacy

### 5.2 First-Launch UX Goals
- Explain the idea quickly
- Demonstrate seriousness
- Avoid hype
- Avoid selling
- Avoid bait-and-switch

---

### 5.3 First-Launch Flow (iOS)

1. **Concept Onboarding (2–3 screens max)**
   - “Most habit apps let you lie.”
   - “Locked In verifies actions using real-world data.”
   - “Used for real accountability and coaching.”

2. **Audience Framing**
   > “Locked In is designed for people working with an accountability coach.
   > You can explore how it works here.”

3. **Choice**
   - Start a **Paper Lock-In**
   - Log in (for existing clients)

No pricing.  
No CTAs related to payment.

---

## 6. Website → App Path (Paying Users)

### 6.1 User Mindset
- Intentional
- Evaluating outcomes
- Willing to commit
- Willing to pay

### 6.2 Flow
1. User learns about Locked In on the web
2. User purchases coaching via Stripe
3. Account is created
4. Confirmation page instructs to download the iOS app
5. Email/SMS includes App Store link
6. User logs in and enters **Real Lock-In mode**

The iOS app immediately feels “alive” and purposeful.

---

## 7. Paper Lock-Ins (Core Concept)

### 7.1 What Paper Lock-Ins Are

Paper Lock-Ins are:
- Full-fidelity simulations of Locked In
- No money at stake
- Real verification
- Real failure detection
- Real consequences — explained, not enforced

Like paper trading:
- Rules are real
- Outcomes are real
- Capital is simulated

---

### 7.2 What Paper Lock-Ins Are NOT

Paper Lock-Ins are not:
- A demo
- A free trial
- Fake success
- Gamified dopamine

They are **practice under truth-preserving conditions**.

---

## 8. Paper Lock-In UX Details

### 8.1 Creating a Paper Lock-In
User goes through the same flow as a real one:
- Define the action
- Choose verification sources
- Set schedule and duration

Instead of escrow:
- A **Paper Stake** is shown (e.g. $200)
- Clearly labeled as simulated

---

### 8.2 Daily Experience
Identical to Real Lock-Ins:
- Evidence ingestion
- Verification
- Pending / verified / failed states
- Same language and UI

No visual downgrade.

---

### 8.3 Failure in Paper Lock-In
When a user fails:
> “Paper Lock-In failed.
> In a real Lock-In, this would have cost you $200.
> Reason: No verified run detected.”

This moment is intentionally uncomfortable.

---

### 8.4 Completion of Paper Lock-In
When a user succeeds:
> “Paper Lock-In completed.
> You followed through.
> In a real Lock-In, you would have earned your refund.”

No upsell.
No CTA.
No link.

Just truth.

---

## 9. Limits on Paper Lock-Ins (Important)

Paper Lock-Ins are for learning, not hiding.

### Enforced Constraints
- Maximum **2 Paper Lock-Ins per account**
- Only **1 active Paper Lock-In at a time**

Rationale:
- Prevents indefinite avoidance of commitment
- Preserves psychological seriousness
- Encourages transition when ready

After limits are reached:
> “Paper Lock-Ins are complete.
> Locked In is designed to be used with real commitments.”

No payment language.

---

## 10. Real Lock-Ins (Paid Experience)

Real Lock-Ins:
- Are created only after payment
- Use the same mechanics
- Include real escrow and refunds
- Are not initiated inside the iOS app

From the app’s perspective:
- User simply “has an active Lock-In”
- No purchase logic exists

---

## 11. Why This Architecture Works

- App Store compliant
- TikTok friendly
- High trust
- High signal users
- No margin leakage
- No dark patterns
- Strong alignment with values

**The app demonstrates seriousness.  
The web handles commitment.**

---

## 12. Guiding Principle

Locked In is not optimized for:
- maximum installs
- casual engagement
- vanity metrics

It is optimized for:
- follow-through
- integrity
- belief through experience
- real outcomes

Paper Lock-Ins are the bridge between curiosity and commitment — without compromise.

