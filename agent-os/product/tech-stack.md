# Tech Stack - Locked In

This document defines the technology choices for Locked In, based on the global standards optimized for a solo founder building web + mobile apps with AI assistance.

---

## Architecture Overview

### Philosophy
- **Two separate projects:** Web (Next.js) and Mobile (Expo) - not a monorepo initially
- **API-first security:** All data access through Next.js API routes, never direct client-to-database
- **Single language:** TypeScript across entire stack (web, mobile, backend)
- **Authentication model:** Supabase Auth for identity, API enforces all permissions
- **No Supabase RLS:** Permissions enforced in TypeScript API code, not SQL policies

### Project Structure
```
locked-in/
├── web/                 # Next.js web application
│   ├── app/            # App Router pages and API routes
│   ├── components/     # React components
│   ├── lib/            # Utilities, API client, types
│   └── prisma/         # Database schema and migrations
│
└── mobile/             # Expo React Native application
    ├── app/            # Expo Router screens
    ├── components/     # React Native components
    └── lib/            # Utilities, API client, types
```

---

## Web Application

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5.x |
| Runtime | Node.js | 20+ |
| Package Manager | pnpm | Latest |
| CSS Framework | Tailwind CSS | 3.4+ |
| State Management | Zustand | 4.4+ |
| Data Fetching | TanStack Query | 5.x |
| Routing | Next.js file-based routing | - |

### Key Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "zod": "^3.22.0",
  "@supabase/supabase-js": "^2.39.0",
  "@prisma/client": "^5.7.0"
}
```

---

## Mobile Application

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React Native with Expo | SDK 50+ |
| Language | TypeScript | 5.x |
| Router | Expo Router | 3.4+ |
| Styling | NativeWind | 4.0+ |
| State Management | Zustand | 4.4+ |
| Data Fetching | TanStack Query | 5.x |
| Secure Storage | Expo SecureStore | 12.8+ |

### Key Dependencies
```json
{
  "expo": "~50.0.0",
  "expo-router": "^3.4.0",
  "react-native": "0.73.x",
  "nativewind": "^4.0.0",
  "expo-secure-store": "^12.8.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "zod": "^3.22.0",
  "@supabase/supabase-js": "^2.39.0"
}
```

### Mobile-Specific Integrations
```json
{
  "expo-camera": "^14.0.0",
  "expo-image-picker": "^14.7.0",
  "expo-notifications": "^0.27.0",
  "react-native-health": "^1.18.0",
  "react-native-google-fit": "^0.19.0"
}
```

---

## Backend (API)

| Category | Technology | Notes |
|----------|------------|-------|
| Location | Next.js API Routes | `/app/api/*` |
| Language | TypeScript | Node.js runtime |
| Validation | Zod | Shared with frontend |
| Authentication | JWT verification | Via Supabase |
| Error Handling | Standardized JSON responses | Consistent error format |

### API Structure
```
app/api/
├── auth/               # Authentication endpoints
├── contracts/          # Contract CRUD and management
├── completions/        # Daily action logging
├── payments/           # Stripe webhook handlers
├── coaching/           # AI coaching endpoints
└── integrations/       # Third-party integrations
```

---

## Database & Storage

| Category | Technology | Notes |
|----------|------------|-------|
| Database | PostgreSQL | Hosted on Supabase |
| ORM | Prisma | Type-safe database access |
| Migrations | Prisma Migrate | Version-controlled schema |
| File Storage | Supabase Storage | Photo proofs, user uploads |
| Auth Provider | Supabase Auth | Email/password, OAuth |

### Core Data Models
- **User** - Profile, preferences, payment info
- **Contract** - Habit definition, deposit, duration, status
- **RewardSchedule** - Hidden allocation of rewards to days
- **Completion** - Daily action logs with verification
- **Recovery** - Financial transactions (deposits, recoveries, forfeitures)
- **CoachingMessage** - AI coaching interaction history

---

## Payments (Stripe)

| Category | Technology | Notes |
|----------|------------|-------|
| Payment Processing | Stripe | Deposits and payouts |
| Connect Type | Standard | For user payouts |
| Webhooks | Stripe Webhooks | Payment event handling |

### Stripe Integration Points
- **Checkout Sessions** - Initial deposit collection
- **Payment Intents** - Deposit processing
- **Transfers** - Recovery payouts to users
- **Webhooks** - `payment_intent.succeeded`, `transfer.created`, etc.

### Key Dependencies
```json
{
  "stripe": "^14.0.0",
  "@stripe/stripe-js": "^2.0.0"
}
```

---

## AI Integration

| Category | Technology | Use Case |
|----------|------------|----------|
| Primary LLM | Anthropic Claude API | Coaching, insights, verification |
| Secondary LLM | OpenAI API | Fallback, specialized tasks |
| Vision AI | Google Gemini API | Photo verification |

### AI Use Cases
1. **Personalized Coaching** - Daily motivation, obstacle navigation
2. **Adaptive Messaging** - Tone and timing optimization
3. **Photo Verification** - Visual proof validation
4. **Pattern Analysis** - Surfacing behavioral insights

### Key Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.14.0",
  "openai": "^4.0.0",
  "@google/generative-ai": "^0.2.0"
}
```

---

## Email & Notifications

| Category | Technology | Notes |
|----------|------------|-------|
| Transactional Email | Resend | Primary email provider |
| Push Notifications | Expo Notifications | Mobile push |
| Email Types | Transactional only | No marketing emails initially |

### Email Triggers
- Welcome / onboarding
- Daily habit reminders
- Contract completion summaries
- Recovery confirmations
- Account security alerts

### Key Dependencies
```json
{
  "resend": "^2.0.0"
}
```

---

## Deployment & Infrastructure

| Category | Technology | Notes |
|----------|------------|-------|
| Web Hosting | Vercel | Next.js optimized |
| Mobile Builds | Expo EAS | App store builds |
| Database Hosting | Supabase | Includes backups |
| CI/CD | GitHub Actions | Deployment triggers |
| Domain/DNS | Vercel | Or Cloudflare |
| Monitoring | Vercel Analytics | Upgrade to Sentry if needed |

### Environments
- **Development** - Local with Supabase local or dev project
- **Staging** - Vercel preview deployments
- **Production** - Vercel production + Supabase production

---

## Development Tools

| Category | Technology |
|----------|------------|
| Code Editor | VS Code or Cursor |
| AI Assistance | Claude Code, Cursor AI |
| API Testing | REST Client (VS Code) |
| Database GUI | Prisma Studio, Supabase Dashboard |
| Linting | ESLint |
| Formatting | Prettier |

---

## Testing & Quality

| Category | Technology | Notes |
|----------|------------|-------|
| Test Framework | Jest | Add when needed |
| E2E Testing | Playwright | Add when needed |
| Type Checking | TypeScript strict mode | Enabled from start |
| Code Quality | ESLint + Prettier | Configured from start |

---

## Environment Variables

### Web (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Services
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=

# Email
RESEND_API_KEY=
```

### Mobile (.env)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# API
EXPO_PUBLIC_API_BASE_URL=

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Third-Party Integrations (Phase 2+)

| Integration | API | Use Case |
|-------------|-----|----------|
| Apple Health | HealthKit | Exercise verification |
| Google Fit | Google Fit API | Exercise verification |
| Fitbit | Fitbit Web API | Exercise verification |
| GitHub | GitHub API | Coding habit verification |
| Strava | Strava API | Running/cycling verification |

---

## Security Model

1. **Client-side:** Use Supabase client ONLY for auth (sign in/up/out)
2. **API Routes:** Verify JWT, enforce permissions, query database via Prisma
3. **Database:** Never expose direct connection to clients
4. **Tokens:** Include `Authorization: Bearer <token>` header in all API calls
5. **Keys:** Keep `SERVICE_ROLE_KEY`, `DATABASE_URL`, and all API keys server-only
6. **Payments:** All Stripe operations happen server-side only

---

## Not Using (Deliberately)

- Separate backend framework (Fastify/Express) - Next.js API routes sufficient
- Monorepo tooling (Turborepo) - Two folders simpler to start
- Supabase RLS policies - API enforces permissions instead
- GraphQL or tRPC - REST with Zod validation sufficient
- Complex state management (Redux) - React Query + Zustand sufficient
- CSS-in-JS libraries - Tailwind/NativeWind sufficient

---

## Upgrade Path (When Needed)

Add these only when you feel the pain of not having them:
- Separate Fastify backend (if Next.js API limits are hit)
- Monorepo with Turborepo (if code sharing pain is significant)
- Background job infrastructure (Bull/BullMQ) for scheduled tasks
- Advanced monitoring (Sentry, LogRocket)
- Comprehensive testing suite
- Redis for caching (if performance requires it)
