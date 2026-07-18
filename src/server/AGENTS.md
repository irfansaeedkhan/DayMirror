# Hono API — Agent context

Business API mounted at `/api/*` via `src/app/api/[[...route]]/route.ts`.

## Module layout

Each feature under `src/server/modules/{feature}/`:

| File | Role |
|---|---|
| `{feature}.controller.ts` | HTTP routes, Zod validation, status codes |
| `{feature}.service.ts` | Business rules, ownership checks |
| `{feature}.repository.ts` | Drizzle queries, always filter `userId` |
| `{feature}.schemas.ts` | Zod request schemas |

## Global middleware (order matters)

1. `secureHeaders`, `cors`, global rate limit (300/min/IP)
2. `bodyLimit` 100kb
3. Per route: `authMiddleware` + `writeRateLimiter` on tasks, tracker, feedback
4. Feedback POST: extra 10/hour limit

## Modules

| Path | Auth | Notes |
|---|---|---|
| `/api/health` | No | 60/min rate limit |
| `/api/tasks` | Yes | CRUD + completions |
| `/api/tracker` | Yes | Day logs, attach task; day window spec 0001 pending |
| `/api/analytics` | Yes | Ledger read |
| `/api/feedback` | Yes | POST only, insert feedback |

Auth routes live separately at `/api/auth/*` (Better Auth).

## Rules

- Never put business logic in controllers
- Every repository method filters by `userId`
- Use `apiError()` from error handler for typed failures
- Register new modules in `src/server/index.ts`

## Key files

- `src/server/index.ts` — app assembly
- `src/server/middleware/auth.ts` — session + dev `DEV_USER_ID` fallback
- `src/server/middleware/rate-limit.ts` — layered limiters
- `SECURITY-AUDIT.md` — userId isolation matrix

---

*Drafted by /audit gap-fill, 2026-07-04*
