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
| Vercel | 👉 **Next** — import DayMirror repo |

## Current phase (as of 2026-07-04)

| Phase | Status |
|---|---|
| 0 Production hardening | ✅ Done |
| 1 Auth (email + Google OAuth) | ✅ Done locally |
| 2 Deploy (Vercel + Neon) | 👉 **In progress** — schema push + Vercel env |
| 3 Landing page + SEO | Pending — hero: "Stop guessing where your day went." |
| 4 Free beta launch | Pending |

## Must-read docs (in order)

1. `BRAND.md` — positioning, tagline, pillars
2. `ROADMAP.md` — launch phases
3. `DEPLOY.md` — Vercel + Neon step-by-step
4. `PROJECT-CONVENTIONS.md` — architecture
5. `DESIGN-ETHICS.md` — Sunsama-aligned UI rules
6. `SECURITY-AUDIT.md` — userId isolation (passed)
7. `OAUTH-SETUP.md` — Google redirect URIs
8. `AGENTS.md` — agent instructions

## Local dev

```bash
yarn db:up          # Docker Postgres (local)
yarn db:push --force
cp .env.example .env.local   # secrets never committed
yarn dev            # http://localhost:3000
```

## Deploy checklist (Phase 2)

- [x] GitHub repo — DayMirror
- [x] Neon project created
- [ ] `yarn db:push` against Neon **direct** connection string
- [ ] Vercel: import `irfansaeedkhan/DayMirror`, root = `.`
- [ ] Vercel env: `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google creds
- [ ] Google Console: production redirect URI for Vercel URL
- [ ] Redeploy after `BETTER_AUTH_URL` matches live URL

## Intentionally deferred

- Email verification / password reset (needs domain + Resend)
- Paid tier / Stripe / AI / influencers (see ROADMAP)
