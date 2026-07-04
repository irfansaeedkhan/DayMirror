# Chronos — context for new Cursor sessions

> Read this first when opening this repo in a fresh Cursor chat.
> Chat history does **not** transfer between repos/workspaces — this file replaces it.

## What this app is

**Chronos** — hybrid productivity app: planner/calendar + hourly reflection tracker + analytics.  
Positioning: **"See where your day actually went."** (hourly tracker is the wedge, not another todo app).

## Stack

Next.js 16 App Router · Hono API at `/api/*` · Better Auth at `/api/auth/*` · Drizzle + PostgreSQL · TanStack Query · shadcn/Tailwind

## Current phase (as of 2026-07-04)

| Phase | Status |
|---|---|
| 0 Production hardening | ✅ Done |
| 1 Auth (email + Google OAuth) | ✅ Done locally |
| 2 Deploy (Vercel + Neon) | 👉 **Next** — follow `DEPLOY.md` |
| 3 Landing page + SEO | Pending |
| 4 Free beta launch | Pending |

## Must-read docs (in order)

1. `ROADMAP.md` — launch phases and checklist
2. `DEPLOY.md` — Vercel + Neon step-by-step (first-time deploy)
3. `PROJECT-CONVENTIONS.md` — folder structure, controller→service→repository
4. `DESIGN-ETHICS.md` — Sunsama-aligned UI rules (locked for landing/UI work)
5. `SECURITY-AUDIT.md` — userId isolation audit (passed)
6. `OAUTH-SETUP.md` — Google OAuth redirect URIs
7. `AGENTS.md` — agent instructions + skills in `.agents/skills/`

## Local dev

```bash
yarn db:up          # Docker Postgres
yarn db:push --force
cp .env.example .env.local   # fill BETTER_AUTH_SECRET, Google creds
yarn dev            # http://localhost:3000
```

## Deploy checklist (Phase 2)

- [ ] Create Neon project → copy pooled + direct connection strings
- [ ] `DATABASE_URL=<neon-direct> yarn db:push --force` from laptop
- [ ] Push repo to GitHub
- [ ] Vercel: import repo, root = `.` (this folder is the repo root)
- [ ] Vercel env: `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google creds
- [ ] Google Console: add production redirect URI
- [ ] Redeploy after setting `BETTER_AUTH_URL`

## Intentionally deferred

- Email verification / password reset (needs custom domain + Resend)
- Paid tier / Stripe
- AI features
- Influencer program (after day-7 retention proven)

## Reference code (not in this repo)

`best-practices-flow/` in the parent monorepo had clinic patterns (auth.ts, require-auth, api-error) — conventions adapted in `PROJECT-CONVENTIONS.md`.
