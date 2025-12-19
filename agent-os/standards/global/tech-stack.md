```markdown
## Tech Stack

This stack is optimized for a solo founder building web + mobile apps with AI assistance. It prioritizes TypeScript consistency, minimal moving parts, and fast iteration.

### Architecture Philosophy
- **Two separate projects:** Web (Next.js) and Mobile (Expo) - not a monorepo initially
- **API-first security:** All data access through Next.js API routes, never direct client-to-database
- **Single language:** TypeScript across entire stack (web, mobile, backend)
- **Authentication model:** Supabase Auth for identity, API enforces all permissions
- **No Supabase RLS:** Permissions enforced in TypeScript API code, not SQL policies

---

### Web Application
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Runtime:** Node.js 20+
- **Package Manager:** pnpm (or npm)
- **CSS Framework:** Tailwind CSS
- **State Management:** Zustand or React Context API
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** Next.js file-based routing (App Router)

### Mobile Application
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Router:** Expo Router (file-based, similar to Next.js)
- **Styling:** NativeWind (Tailwind for React Native)
- **State Management:** Zustand (shared with web)
- **Data Fetching:** TanStack Query (same as web)
- **Secure Storage:** Expo SecureStore

### Backend (API)
- **Location:** Next.js API Routes (`/app/api/*`)
- **Language:** TypeScript (Node.js runtime)
- **Validation:** Zod schemas (shared with frontend)
- **Authentication:** JWT verification via Supabase
- **Error Handling:** Standardized JSON error responses

### Database & Storage
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma
- **Migrations:** Prisma Migrate
- **File Storage:** Supabase Storage
- **Auth Provider:** Supabase Auth (email/password, OAuth)

### Development Tools
- **Code Editor:** VS Code or Cursor
- **AI Assistance:** Claude, GitHub Copilot, or Cursor AI
- **API Testing:** REST Client (VS Code extension) or Postmark
- **Database GUI:** Prisma Studio or Supabase Dashboard
- **Linting:** ESLint
- **Formatting:** Prettier

### Testing & Quality
- **Test Framework:** Jest (add when needed, not Day 1)
- **E2E Testing:** Playwright (add when needed)
- **Type Checking:** TypeScript strict mode
- **Code Quality:** ESLint + Prettier

### Deployment & Infrastructure
- **Web Hosting:** Vercel (Next.js optimized)
- **Mobile Builds:** Expo EAS (app store builds)
- **Database Hosting:** Supabase (includes backups)
- **CI/CD:** GitHub Actions (for deployment triggers)
- **Domain/DNS:** Vercel (or Cloudflare)
- **Monitoring:** Built-in Vercel Analytics (upgrade to Sentry if needed)

### External APIs
- **AI/LLM Services:** 
  - Anthropic Claude API
  - OpenAI API
  - Google Gemini API
- **Email:** (TBD - SendGrid or Resend when needed)
- **Payments:** (TBD - Stripe when needed)

### Environment Variables
**Web (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `DATABASE_URL` - Direct PostgreSQL connection (server-only)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (server-only)
- API keys for AI services (server-only)

**Mobile (.env):**
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `EXPO_PUBLIC_API_BASE_URL` - Next.js API endpoint

### Key Libraries & Dependencies

**Shared (Web + Mobile):**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@tanstack/react-query": "^5.0.0",
  "zod": "^3.22.0",
  "zustand": "^4.4.0"
}
```

**Web Only:**
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.0",
  "@prisma/client": "^5.7.0",
  "prisma": "^5.7.0"
}
```

**Mobile Only:**
```json
{
  "expo": "~50.0.0",
  "expo-router": "^3.4.0",
  "nativewind": "^4.0.0",
  "expo-secure-store": "^12.8.0"
}
```

### Code Sharing Strategy
- **Types:** Copy/paste between web and mobile initially (optimize later if needed)
- **Validation Schemas:** Copy Zod schemas to mobile project
- **API Client:** Similar pattern in both apps (same function signatures)
- **Utilities:** Copy common functions as needed

**Note:** We start simple (separate folders, copy/paste) and only introduce a monorepo if sharing pain becomes significant.

### Security Model
1. **Client-side:** Use Supabase client ONLY for auth (sign in/up/out)
2. **API Routes:** Verify JWT, enforce permissions, query database via Prisma
3. **Database:** Never expose direct connection to clients
4. **Tokens:** Include `Authorization: Bearer <token>` header in all API calls
5. **Keys:** Keep `SERVICE_ROLE_KEY` and `DATABASE_URL` server-only

### Not Using (Deliberately)
- ❌ Separate backend framework (Fastify/Express) - Next.js API routes sufficient
- ❌ Monorepo tooling (Turborepo) - two folders simpler to start
- ❌ Supabase RLS policies - API enforces permissions instead
- ❌ GraphQL or tRPC - REST with Zod validation sufficient
- ❌ Complex state management (Redux) - React Query + Zustand sufficient
- ❌ CSS-in-JS libraries - Tailwind/NativeWind sufficient

### Upgrade Path (When Needed)
Add these only when you feel the pain of not having them:
- Separate Fastify backend (if Next.js API limits are hit)
- Monorepo with Turborepo (if code sharing pain is significant)
- Background job infrastructure (if serverless limits are exceeded)
- Advanced monitoring (Sentry, LogRocket)
- Comprehensive testing suite
```