# Chronos Project Conventions

> Living architecture guide for Chronos (Next.js + Hono monolith).
> Adapted from `best-practices-flow/` clinic monorepo patterns, adjusted for a single Next.js app.
> **Read this before creating new modules, routes, or auth code.**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| API | Hono (`src/server/`) mounted at `/api/[[...route]]` |
| Auth | Better Auth (`src/lib/auth.ts`) at `/api/auth/[...all]` |
| ORM | Drizzle + PostgreSQL |
| Client data | TanStack Query + ky |
| UI | shadcn/Radix + Tailwind v4 |
| Validation | Zod (shared between API schemas and forms) |

---

## Folder structure

```
chronos/src/
├── app/                      # Next.js routes only — thin page shells
│   ├── (auth)/               # login, signup, forgot-password
│   ├── (dashboard)/          # planner, tracker, analytics (protected)
│   ├── api/
│   │   ├── auth/[...all]/    # Better Auth handler
│   │   └── [[...route]]/     # Hono business API
│   └── page.tsx              # landing (future)
│
├── components/
│   ├── ui/                   # shadcn primitives — no business logic
│   ├── layout/               # app-shell, dashboard-layout
│   ├── planner/              # feature components
│   ├── tracker/
│   ├── analytics/
│   ├── tasks/
│   └── providers/
│
├── server/                   # Hono backend (business API only)
│   ├── index.ts              # app assembly, global middleware
│   ├── middleware/           # auth, rate-limit, error-handler, zod-validator
│   └── modules/
│       └── {feature}/
│           ├── {feature}.controller.ts   # HTTP layer — parse request, return response
│           ├── {feature}.service.ts      # business rules — no HTTP, no DB directly
│           ├── {feature}.repository.ts   # Drizzle queries — no business rules
│           └── {feature}.schemas.ts      # Zod request/response schemas
│
├── db/
│   ├── index.ts              # drizzle client
│   └── schema/
│       ├── index.ts          # re-exports all tables
│       ├── auth.ts           # Better Auth tables (CLI-generated)
│       └── ...               # domain tables (task, hour-log, etc.)
│
├── lib/                      # shared utilities, no React
│   ├── auth.ts               # Better Auth server instance
│   ├── auth-client.ts        # Better Auth React client
│   ├── env.ts                # validated environment
│   ├── api-client.ts         # ky client for business API
│   └── ...
│
├── hooks/                    # TanStack Query hooks (client)
├── types/                    # shared TypeScript types
└── proxy.ts                  # Next.js route protection (auth redirects)
```

### Separation rules

| Concern | Lives in | Must NOT live in |
|---|---|---|
| HTTP routing / status codes | `*.controller.ts` | service, repository, components |
| Business rules / orchestration | `*.service.ts` | controller (beyond I/O), repository |
| SQL / Drizzle queries | `*.repository.ts` | service, controller |
| Request validation | `*.schemas.ts` + zod-validator middleware | inline in controller |
| Session / identity | Better Auth + `server/middleware/auth.ts` | components, repositories |
| UI state | components + hooks | server modules |

---

## Naming conventions

From `best-practices-flow/.cursor/rules/project-conventions.mdc`:

- **Files & folders:** `kebab-case` (`task-detail-drawer.tsx`, `hour-row.tsx`)
- **Exports:** named exports only — no default exports (except Next.js pages where required)
- **Functions with 3+ params:** single object parameter

```typescript
// ❌ BAD
export function createTask(userId: string, title: string, date: string) {}

// ✅ GOOD
export function createTask(params: CreateTaskParams) {
  const { userId, title, date } = params;
}
```

### Database naming (Chronos-specific note)

Chronos domain tables use **plural** names (`tasks`, `hour_logs`) — already migrated.  
Better Auth tables use **singular** model names (`user`, `session`, `account`) per Better Auth convention.  
**Do not rename existing domain tables** — only new tables should follow one consistent style going forward.

---

## API patterns (from clinic `best-practices-flow`)

### Error handling
- Use typed error helpers — never throw raw strings
- `apiError(code, message, status)` in Hono error handler
- Never leak stack traces or internal details to clients
- Log server-side only; return generic messages for 500s

### Auth on business API
Pattern from clinic `require-auth.ts`, adapted for Chronos:

```typescript
// 1. Session middleware sets userId from Better Auth session
// 2. requireAuth rejects if no session
// 3. Every repository query filters by userId
```

### Response shape
```typescript
// Success
{ data: T }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

---

## Better Auth patterns (from `.agents/skills/`)

**Always consult skills before auth work:**

| Skill | Use when |
|---|---|
| `.agents/skills/better-auth-best-practices/` | Config, adapters, plugins, CLI |
| `.agents/skills/better-auth-security-best-practices/` | Rate limits, CSRF, cookies, secrets |
| `.agents/skills/create-auth-skill/` | Full auth scaffold workflow |
| `.agents/skills/email-and-password-best-practices/` | Sign-up, reset, verification |
| `.agents/skills/oauth/` | Google/social provider setup |
| `.agents/skills/organization-best-practices/` | Teams/orgs (future — not launch) |

### Chronos auth config checklist
- [ ] `BETTER_AUTH_SECRET` (32+ chars) via env — never in code
- [ ] `drizzleAdapter` with `provider: "pg"` and explicit schema map
- [ ] `advanced.database.generateId: "uuid"` — matches Chronos `userId` columns
- [ ] `nextCookies()` plugin for Next.js App Router
- [ ] `trustedOrigins` includes production + staging URLs
- [ ] `rateLimit` enabled in production (Better Auth built-in)
- [ ] `emailAndPassword: { enabled: true }` for launch
- [ ] Google OAuth added when `GOOGLE_CLIENT_ID` is set
- [ ] Session: `cookieCache` enabled for performance
- [ ] Never set `disableCSRFCheck: true`

### Auth routes
- Better Auth: `/api/auth/*` (session cookies)
- Business API: `/api/tasks/*`, `/api/tracker/*`, `/api/analytics/*` (session via middleware)

---

## Security essentials (always on)

- Rate limiting on Hono API (`server/middleware/rate-limit.ts`)
- Body size limit (100kb)
- CORS: same-origin + explicit allowlist
- Security headers via `next.config.ts`
- Env validation via `src/lib/env.ts` — fail fast at boot
- `userId` scoping on every DB read/write
- Dev `x-user-id` header **only** in `NODE_ENV=development`

---

## Client patterns

- **Auth state:** `useSession()` from `auth-client.ts`
- **Business data:** TanStack Query hooks in `src/hooks/`
- **API calls:** `apiGet` / `apiPost` from `lib/api-client.ts` with credentials
- **Forms:** React Hook Form + Zod resolver (reuse schemas from server where possible)

---

## Adding a new feature module

1. Create `server/modules/{name}/` with controller, service, repository, schemas
2. Register route in `server/index.ts`
3. Add Zod schemas for all inputs
4. Add repository methods that always accept `userId`
5. Add TanStack Query hook in `src/hooks/`
6. Add UI components under `src/components/{name}/`
7. Add thin page in `src/app/(dashboard)/{name}/page.tsx`

---

## Reference projects

| Path | What to learn |
|---|---|
| `best-practices-flow/apps/backend/` | Hono module structure, auth.ts, require-auth, api-error |
| `best-practices-flow/apps/frontend/` | auth-client, session queries, login flow |
| `chronos/.agents/skills/` | Better Auth-specific patterns |
| `chronos/DESIGN-ETHICS.md` | UI/landing page standards |
| `chronos/ROADMAP.md` | Launch phases and priorities |
