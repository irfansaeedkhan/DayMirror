# Security pass — 2026-07-04

> Phase 4 prep item #2. Verdict: **PASS** with hardening applied.

---

## Summary

DayMirror's API and auth layers were reviewed end-to-end. Core isolation (userId on every query) remains sound. This pass added layered rate limits, tightened auth throttling, fixed CSP gaps for production services, and documented the new feedback module.

---

## Rate limiting (before → after)

| Layer | Before | After |
|---|---|---|
| Global API | 300 req/min per IP | Same, namespaced `global:` prefix |
| Health | Unbounded (within global) | 60 req/min per IP |
| Authenticated writes | Same as reads | **90 writes/min per user** (`writeRateLimiter`) |
| Feedback POST | 10/hour per IP | Same + `feedback:` prefix (no bucket collision) |
| Better Auth | Enabled in prod, default limits | **100 req/min** explicit (`window: 60, max: 100`) |

**Note:** In-memory limiters reset per serverless instance. Swap to Upstash Redis when traffic grows (already noted in ROADMAP Phase 0).

---

## Headers & CSP

| Check | Status |
|---|---|
| `X-Frame-Options: DENY` | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ |
| `Referrer-Policy` | ✅ |
| `Strict-Transport-Security` | ✅ **Added** (1 year) |
| `Permissions-Policy` | ✅ |
| `poweredByHeader: false` | ✅ |
| Hono `secureHeaders()` on `/api/*` | ✅ |
| CSP `connect-src` for Vercel Analytics | ✅ **Added** `vitals.vercel-insights.com` |
| CSP `img-src` for Google avatars | ✅ **Added** `*.googleusercontent.com` |

CSP still allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js — acceptable for beta; tighten with nonces post-launch.

---

## Auth & access control

| Check | Status |
|---|---|
| `authMiddleware` on all data routes | ✅ tasks, tracker, analytics, feedback |
| Dev `x-user-id` fallback | ✅ development only |
| UUID format validated for dev header | ✅ |
| Route protection via `proxy.ts` | ✅ planner, tracker, analytics |
| Better Auth `useSecureCookies` in prod | ✅ |
| OAuth tokens encrypted | ✅ |
| `trustedOrigins` from env + Vercel host | ✅ |
| Task `:id` params validated as UUID | ✅ **Added** (400 on malformed ids) |

---

## CORS & payload

| Check | Status |
|---|---|
| CORS allowlist from `ALLOWED_ORIGINS` only | ✅ same-origin passes without Origin |
| Body limit 100kb on API | ✅ |
| Errors never leak stack traces | ✅ generic 500 message |

---

## userId isolation (re-audit)

| Module | Verdict |
|---|---|
| Tasks | ✅ PASS |
| Tracker | ✅ PASS |
| Analytics | ✅ PASS |
| **Feedback** | ✅ PASS — insert-only, `userId` from session, no cross-user reads |

See [SECURITY-AUDIT.md](../../SECURITY-AUDIT.md) for full repository matrix.

---

## Frontend considerations

| Check | Status |
|---|---|
| API client sends `credentials: include` | ✅ |
| Dev header only in `NODE_ENV === development` | ✅ |
| No secrets in client bundle | ✅ |

---

## Remaining (non-blocking)

- [ ] Upstash Redis rate-limit store for multi-instance Vercel
- [ ] CSP nonces (remove `unsafe-inline` / `unsafe-eval`)
- [ ] DB FK `tasks.userId` → `user.id`
- [ ] Integration tests with two user sessions
- [ ] Admin path to read feedback (Neon SQL is fine for beta)
- [ ] Email verification + forgot-password when domain + Resend ready

---

## Manual verify checklist

1. Sign in → create task → log hour → submit feedback → all succeed
2. Hit `/api/health` rapidly → eventually 429 with `Retry-After`
3. Malformed task id `GET /api/tasks/not-a-uuid` → 400 validation error
4. Sign out → `GET /api/tasks` → 401
5. Production: confirm Google avatar loads on account menu

---

## Files changed in this pass

- `src/server/middleware/rate-limit.ts` — layered limiter, `writeRateLimiter`
- `src/server/index.ts` — write limits on protected routes, health cap
- `src/server/middleware/uuid-param.ts` — UUID param schema
- `src/server/modules/tasks/tasks.controller.ts` — param validation
- `src/lib/auth.ts` — explicit Better Auth rate limits
- `next.config.ts` — HSTS, CSP fixes
- `SECURITY-AUDIT.md` — feedback module added
