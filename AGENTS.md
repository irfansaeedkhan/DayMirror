# Chronos — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## Next.js version note

This is NOT the Next.js you know. Next.js 16 has breaking changes — read guides in `node_modules/next/dist/docs/` before writing code.
<!-- END:nextjs-agent-rules -->

---

## Before any task — read these first

| Doc | When |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | **Start here in a new Cursor session** — phase status and doc index |
| [ROADMAP.md](./ROADMAP.md) | Launch priorities, phase order |
| [DEPLOY.md](./DEPLOY.md) | Vercel + Neon deploy guide |
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | userId isolation audit |
| [PROJECT-CONVENTIONS.md](./PROJECT-CONVENTIONS.md) | Architecture, folder structure, API patterns |
| [DESIGN-ETHICS.md](./DESIGN-ETHICS.md) | UI, landing page, Sunsama comparison standard |
| [PROJECT-GUIDE.md](./PROJECT-GUIDE.md) | Existing feature map and API reference |

---

## Skills — load before working in that area

All skills live in `.agents/skills/`. **Read the relevant skill before implementing.**

| Skill | Trigger |
|---|---|
| `better-auth-best-practices` | Auth config, Drizzle adapter, plugins, CLI |
| `better-auth-security-best-practices` | Rate limits, CSRF, cookies, secrets, production hardening |
| `create-auth-skill` | Scaffolding login/signup/OAuth from scratch |
| `email-and-password-best-practices` | Sign-up, password reset, email verification |
| `oauth` | Google/social OAuth, redirect URI setup |
| `organization-best-practices` | Teams/orgs (post-launch only) |
| `two-factor-authentication-best-practices` | 2FA (post-launch only) |

---

## Reference codebase (patterns, not copy-paste)

`../best-practices-flow/` — clinic management monorepo with production-grade patterns:

- `apps/backend/src/lib/auth.ts` — Better Auth server config with hooks
- `apps/backend/src/middleware/require-auth.ts` — session guard pattern
- `apps/backend/src/lib/api-error.ts` — typed API errors
- `apps/backend/src/db/schema/auth.schema.ts` — auth tables
- `apps/frontend/src/lib/auth-client.ts` — React auth client
- `.cursor/rules/project-conventions.mdc` — naming and export rules

Adapt patterns to Chronos single-repo layout (see PROJECT-CONVENTIONS.md).

---

## Hard rules

1. **yarn only** — never npm
2. **No UI changes** unless user asks — logic/backend/auth OK without asking
3. **Sunsama design ethics** — see DESIGN-ETHICS.md for any UI/landing work
4. **Business logic in services** — never in controllers or components
5. **userId on every query** — no cross-user data leaks
6. **No secrets in code** — env vars only, validated in `src/lib/env.ts`
7. **No git commits** unless user explicitly asks
8. **Minimize scope** — smallest correct diff

---

## Current phase

**Phase 1: Better Auth** — see ROADMAP.md. Email/password first, Google OAuth when credentials are ready.
