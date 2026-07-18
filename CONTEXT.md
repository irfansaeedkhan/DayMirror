# DayMirror — context for new Cursor sessions

> Read this first when opening this repo in a fresh Cursor chat.
> Chat history does **not** transfer between repos/workspaces — this file replaces it.

## What this app is

**DayMirror** — hourly reflection + planner. The wedge is the tracker, not another todo app.

- **Tagline:** See where your day actually went.
- **Positioning:** Most apps help you plan your day. DayMirror helps you understand the day you actually lived.
- **Brand pillars:** Reflect → Understand → Improve (see `BRAND.md`)

## Stack

Next.js 16 App Router · Hono API at `/api/*` · Better Auth at `/api/auth/*` · Drizzle + PostgreSQL · TanStack Query · shadcn/Tailwind

## Repo & infra

| Item | Status |
|---|---|
| GitHub | `git@github.com:irfansaeedkhan/DayMirror.git` ✅ pushed |
| Neon Postgres | ✅ project created — use **pooled** URL on Vercel, **direct** URL for `db:push` |
| Vercel | ✅ `https://day-mirror-mocha.vercel.app` — Google OAuth working |

## Current phase (as of 2026-07-04)

| Phase | Status |
|---|---|
| 0 Production hardening | ✅ Done |
| 1 Auth (email + Google OAuth) | ✅ Done — production verified |
| 2 Deploy (Vercel + Neon) | ✅ Live on Vercel free tier — domain deferred |
| 3 Landing page + SEO | 🔄 **In progress** — `/` landing live, guides pending |
| 4 Free beta launch | Pending — prep items 1–2 done, #3 spec ready |

## Must-read docs (in order)

1. `BRAND.md` — positioning, tagline, pillars
2. `ROADMAP.md` — launch phases
3. `DEPLOY.md` — Vercel + Neon step-by-step
4. `PROJECT-CONVENTIONS.md` — architecture
5. `DESIGN-ETHICS.md` — Sunsama-aligned UI rules
6. `SECURITY-AUDIT.md` — userId isolation (passed)
7. `OAUTH-SETUP.md` — Google redirect URIs
8. `AGENTS.md` — agent instructions + workflow
9. `.workflow/scope/phase-4-prep.md` — current agent slice
10. `.workflow/specs/0001-tracker-hour-window/` — tracker window spec (next build)

## Local dev

```bash
yarn db:up          # Docker Postgres (local)
yarn db:push --force
cp .env.example .env.local   # secrets never committed
yarn dev            # http://localhost:3000 (yarn dev:clean if port busy)
yarn db:push        # schema push (--force, includes feedback table)
```

## Deploy checklist (Phase 2)

- [x] GitHub repo — DayMirror
- [x] Neon project + schema pushed
- [x] Vercel deployed — `day-mirror-mocha.vercel.app`
- [x] Google OAuth production working
- [x] `BETTER_AUTH_URL` + Vercel URL auto-detect
- [ ] Custom domain (`daymirror.com` / `.app`)
- [ ] Sentry error tracking
- [ ] Enable Vercel Analytics in dashboard
- [ ] Neon PITR backup verified

## Intentionally deferred

- Email verification / password reset (needs domain + Resend)
- Paid tier / Stripe / AI / influencers (see ROADMAP)
