# DayMirror — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## Next.js version note

This is NOT the Next.js you know. Next.js 16 has breaking changes — read guides in `node_modules/next/dist/docs/` before writing code.
<!-- END:nextjs-agent-rules -->

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| API | Hono at `/api/*` |
| Auth | Better Auth at `/api/auth/*` |
| ORM | Drizzle + PostgreSQL (Neon prod, Docker local) |
| Client data | TanStack Query + ky (`src/lib/api-client.ts`) |
| UI | shadcn/Radix + Tailwind v4 |
| Validation | Zod (API schemas + forms) |

## Build approach

Tracer Bullet slices for beta prep: ship end to end per feature (schema → API → hook → UI), verify before marking done. See `.workflow/scope/phase-4-prep.md`.

## Workflow artifacts

State lives on disk, not in chat. Resolved via `workflow.json`:

| Artifact | Path |
|---|---|
| Scope | `.workflow/scope/` |
| Specs | `.workflow/specs/` |
| Reviews | `.workflow/reviews/` |

**Cursor invocation:** Before feature work, read `.agents/skills/<skill>/SKILL.md` and follow it. Example: "Read `.agents/skills/architect/SKILL.md` and run architect for tracker hour window."

**Mandatory sequence (brownfield):**
1. `/audit` — gap fill this file
2. `/scope` — read or update `.workflow/scope/`
3. `/architect` — spec before load bearing decisions
4. `/develop` — build from spec only (no "skip for now" on new features)
5. `/check verify` — prove acceptance criteria in spec `verify.md`
6. `/sync` — after merge

Human docs (`CONTEXT.md`, `ROADMAP.md`) stay for humans; `.workflow/` is the agent source of truth for active slices.

---

## Before any task — read these first

| Doc | When |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | **Start here in a new Cursor session** — phase status and doc index |
| [BRAND.md](./BRAND.md) | Positioning, tagline, brand pillars |
| [ROADMAP.md](./ROADMAP.md) | Launch priorities, phase order |
| [.workflow/scope/phase-4-prep.md](./.workflow/scope/phase-4-prep.md) | Current agent scope slice |
| [PROJECT-CONVENTIONS.md](./PROJECT-CONVENTIONS.md) | Architecture, folder structure, API patterns |
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | userId isolation audit |
| [DEPLOY.md](./DEPLOY.md) | Vercel + Neon deploy guide |
| [DESIGN-ETHICS.md](./DESIGN-ETHICS.md) | UI, landing page, Sunsama comparison standard |
| [PROJECT-GUIDE.md](./PROJECT-GUIDE.md) | Feature map and API reference |

## Context files

- [src/server/AGENTS.md](src/server/AGENTS.md) — Hono API modules, middleware, rules

---

## Commands

```bash
yarn dev              # http://localhost:3000 (use yarn dev:clean if port busy)
yarn dev:clean        # kill ports 3000-3002 then dev
yarn kill-ports       # free dev ports on Windows (Git Bash)
yarn build            # production build + typecheck
yarn lint             # eslint
yarn db:up            # Docker Postgres local
yarn db:push          # push schema (--force, non interactive)
yarn db:push:interactive  # push with drizzle prompts
yarn db:setup         # docker up + push
yarn db:studio        # Drizzle Studio
```

Package manager: **yarn only**, never npm.

---

## Skills — load before working in that area

All skills live in `.agents/skills/`. **Read the relevant `SKILL.md` before implementing.**

### Domain (Better Auth)

| Skill | Trigger |
|---|---|
| `better-auth-best-practices` | Auth config, Drizzle adapter, plugins, CLI |
| `better-auth-security-best-practices` | Rate limits, CSRF, cookies, secrets, production hardening |
| `create-auth-skill` | Scaffolding login/signup/OAuth from scratch |
| `email-and-password-best-practices` | Sign-up, password reset, email verification |
| `oauth` | Google/social OAuth, redirect URI setup |

### Engineering workflow (JS Mastery)

Installed: `npx skills add JavaScript-Mastery-Pro/skills`

| Skill | When |
|---|---|
| `scope` | Plan slices — `.workflow/scope/` |
| `audit` | Gap fill AGENTS.md from repo |
| `architect` | Decisions → `.workflow/specs/` |
| `develop` | Build from spec |
| `check` | `verify` or `review` → `.workflow/reviews/` |
| `test` | Regression tests after a change |
| `document` | PR/changelog from diff |
| `sync` | Reconcile scope + AGENTS.md after merge |
| `debug` | Root cause when something breaks |

---

## Dev gotchas

- **Port 3000 busy:** `yarn kill-ports` or `yarn dev:clean`
- **OAuth invalid origin:** add dev URL to `BETTER_AUTH_TRUSTED_ORIGINS` in `.env.local` (e.g. `http://localhost:3000`)
- **Dev auth impersonation:** `DEV_USER_ID` in `.env.local` auto authenticates API in development without cookies; verify auth on production or with real session
- **db:push in CI/non TTY:** use `yarn db:push` (includes `--force`) not bare `drizzle-kit push`
- **No UI changes** unless user asks — logic/backend OK
- **No git commits** unless user explicitly asks

---

## Reference codebase (patterns, not copy-paste)

`../best-practices-flow/` — clinic management monorepo with production-grade patterns. Adapt to DayMirror single-repo layout (see PROJECT-CONVENTIONS.md).

---

## Hard rules

1. **yarn only** — never npm
2. **No UI changes** unless user asks — logic/backend/auth OK without asking
3. **Sunsama design ethics** — see DESIGN-ETHICS.md for any UI/landing work
3b. **UI/UX skills order** — read `.agents/skills/ui-ux/SKILL.md` first; load skills 1→8 per manifest before designing components
4. **Business logic in services** — never in controllers or components
5. **userId on every query** — no cross-user data leaks
6. **No secrets in code** — env vars only, validated in `src/lib/env.ts`
7. **No git commits** unless user explicitly asks
8. **Minimize scope** — smallest correct diff
9. **Spec before build** — `/architect` for load bearing decisions; `/develop` implements spec only

---

## Current phase

**Phase 4 prep** — see [ROADMAP.md](./ROADMAP.md) and [.workflow/scope/phase-4-prep.md](./.workflow/scope/phase-4-prep.md).

| # | Item | Status |
|---|---|---|
| 1 | Feedback modal | done — `yarn db:push` applied locally |
| 2 | Security pass | done |
| 3 | Tracker hour window | done — header from/to + save as usual |
| 4 | Work sessions | needs `/architect` |
| 5 | Tasks + tracker flow | after #3–4 |

---

*Gap-filled by /audit, 2026-07-04. Curated sections preserved; workflow and commands added.*
