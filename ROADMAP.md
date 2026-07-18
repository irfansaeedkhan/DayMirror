# DayMirror — Launch Roadmap

> The single source of truth for taking DayMirror from local project to live product.
> Owner: you. Review cadence: weekly. Cross items off — don't let this rot.
>
> Positioning in one line: **"See where your day actually went."**
> Category: **The Time Audit App** — see `BRAND.md` for full copy bank.

---

## Phase 0 — Production Hardening (Week 1) `[DONE]`

Goal: the codebase is safe to expose to the public internet.

- [x] **Env validation** — `src/lib/env.ts` validates all env vars with Zod at boot; fail fast with clear errors. Add `.env.example`.
- [x] **Rate limiting** — per-IP + per-user limiter middleware on the Hono API. In-memory for launch, swap to Upstash Redis when serverless traffic grows.
- [x] **CORS locked down** — same-origin only (explicit allowlist from env), not the default wide-open `cors()`.
- [x] **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy via `next.config.ts`; remove `x-powered-by`.
- [x] **Body size limit** on API requests (prevents payload abuse).
- [x] **Auth middleware hardened** — dev header fallback allowed ONLY in development; production requires a real session (Phase 1).
- [x] **Error hygiene** — never leak stack traces or internals in API responses (already mostly done; verify).

## Phase 1 — Real Auth (Week 1–2) `[DONE]`

Goal: multiple real users, each seeing only their own data.

- [x] **Better Auth** with Drizzle adapter — email/password + Google OAuth.
- [x] Auth tables added to `src/db/schema/auth.ts`
- [x] Replace `x-user-id` middleware with Better Auth session lookup (dev fallback kept)
- [x] Login / signup pages (shadcn, calm aesthetic per DESIGN-ETHICS.md)
- [x] Run `yarn db:push` after Docker/Neon is up (auth tables)
- [x] Audit every repository query: confirm `userId` filter on every read/write — see `SECURITY-AUDIT.md`
- [x] Sign-out in app shell
- [x] Google OAuth — verified on production (`day-mirror-mocha.vercel.app`)
- [ ] Forgot-password flow — deferred until domain + email provider (see note below)

> **Email deferred:** No verification or password-reset emails until we have a custom domain. Resend requires domain verification for production sends; beta uses Google OAuth + email/password without verification.

## Phase 2 — Deploy & Operate (Week 2) `[IN PROGRESS]`

Goal: live URL, monitored, stable enough for strangers to sign up.

> **Guide:** [DEPLOY.md](./DEPLOY.md)

### Done ✅

- [x] **GitHub** — `irfansaeedkhan/DayMirror`
- [x] **Neon Postgres** — schema pushed (users, tasks, hour_logs, auth)
- [x] **Vercel hosting** — live at `https://day-mirror-mocha.vercel.app`
- [x] **Google OAuth** — production login working
- [x] **Auth URL auto-detect** — `VERCEL_URL` fallback in `getAuthBaseURL()`
- [x] **Vercel Web Analytics** — `<Analytics />` in layout (enable in dashboard)
- [x] **Next.js 16 proxy** — `src/proxy.ts` route protection
- [x] **Build pipeline** — yarn-only lockfile, no conflicting `package-lock.json`

### Remaining (finish before Phase 3)

| Task | Why | Effort |
|---|---|---|
| [ ] **Buy domain** (`daymirror.com` or `.app`) | SEO + email + trust. Set once, never change. | 30 min |
| [ ] **Point domain to Vercel** | Replace `*.vercel.app` in `BETTER_AUTH_URL` + Google OAuth | 1 hr |
| [ ] **Enable Vercel Analytics** in dashboard | Traffic baseline before landing page launch | 5 min |
| [ ] **Sentry** (free tier) | Catch production errors you'd never see | 2 hrs |
| [ ] **Verify Neon PITR** | Confirm backup retention in Neon dashboard | 15 min |
| [ ] **Production smoke test doc** | Sign up → log hour → create task → refresh → sign out → sign in | 15 min |
| [ ] **Update `CONTEXT.md`** after domain live | Single source of truth for new sessions | 5 min |

### Optional (can defer to Phase 4)

- [ ] Staging = Vercel preview deployments + Neon branch DB
- [ ] Uptime monitoring (Better Uptime free tier or Vercel)

### Phase 2 exit criteria

Before starting the landing page:

1. Custom domain live (or committed decision to ship on `.vercel.app` for beta)
2. Sentry catching errors
3. You can sign up on production, use the app for a full day, data persists
4. Analytics enabled — you can see visitor count

---

## Phase 3 — Landing Page + SEO/AEO (Week 3) `[NEXT]`

Goal: convert visitors + rank for how people actually search.

> **All copy lives in `BRAND.md`** — hero, tagline bank, SEO keywords, page wireframe.

### Landing page (Next.js, same repo)

- [x] **Hero** — "Stop guessing where your day went." + subhead + tracker preview + **Start Reflecting**
- [x] **Category line** — "Your personal Time Audit" / "The Time Audit App"
- [x] **Problem → solution** — planned vs actual narrative
- [x] **Pillars section** — Reflect / Understand / Improve
- [x] **Positioning quote** — "Most productivity apps help you plan…"
- [x] **Feature sections** — Tracker (hero), Planner, Analytics
- [x] **FAQ** — question-shaped copy (AEO-ready)
- [x] **CTA footer** — Start Reflecting + "Free — no credit card"
- [x] **Authed users** hitting `/` → redirect to `/planner`
- [x] **Metadata** — title, description, OpenGraph, Twitter
- [x] **`sitemap.xml` + `robots.txt`**
- [x] **JSON-LD** — `SoftwareApplication` + `FAQPage` schema
- [ ] **Real product screenshots** — replace static preview when ready
- [ ] **Social proof** — beta quotes (Phase 4)
- [ ] Google Search Console (needs custom domain or verify `.vercel.app`)

### AEO / AI-search (what gets cited by ChatGPT, Perplexity)

Ship `/guides` with articles that answer real searches:

| Article title | Targets search |
|---|---|
| Where does my time actually go? How to run a time audit | "time audit", "where did my day go" |
| Why todo lists fail (and what to do instead) | "productivity app", self-improvement |
| Hourly time tracking vs time blocking | "time tracker", "focus app" |
| How to build a daily review habit that sticks | "daily reflection", "daily review" |
| How do I stop wasting my day? | emotional search — hero copy answers this |

Every article: H2 = literal question, first paragraph = direct answer, comparison table, `dateModified` visible.

### Distribution (day one of landing)

- [ ] Submit to AlternativeTo, Product Hunt (prep), futurepedia-style directories
- [ ] One build-in-public post with positioning line from `BRAND.md`

---

## Phase 4 — Free Beta Launch (Week 4)

### Prep slice (current — see `.workflow/scope/phase-4-prep.md`)

1. [x] **Feedback modal** + `feedback` DB table (`POST /api/feedback`, account menu)
2. [x] **Security pass** — rate limits, headers, audit doc
3. [x] **Tracker hour window** — settings defaults + per day from/to on tracker
4. [x] **Work sessions** — multi-block days, rest between sessions
5. [ ] **Tasks + tracker flow** — after specs for #3–4

### Launch checklist

- [x] Feedback modal live + a `feedback` DB table. Read every entry. (`yarn db:push` applied)
- [ ] Onboarding: first-run walkthrough that gets the user to log ONE hour and add ONE task (activation moment).
- [ ] Launch posts: Product Hunt, Hacker News (Show HN), r/productivity, r/SideProject, X/Twitter build-in-public thread.
- [ ] Measure ONE metric: **day-7 tracker retention** (did they log hours a week later?). Everything else is noise.
- [ ] Weekly changelog posts — shipping visibly is marketing.
- [ ] Collect 3 beta quotes for landing page social proof section.

## Phase 5 — Influencer / Referral Program (Month 2+)

Your instinct is right, but sequence matters: **do NOT pitch influencers before retention proves itself.** If day-7 retention is bad, paid traffic just burns goodwill.

- [ ] Build referral tracking first: `?ref=CODE` → stored on signup → attribution table. (One column + one table; build it before any outreach.)
- [ ] Start with **micro-influencers** (5k–50k followers) in productivity/self-improvement niches: YouTube "productivity system" channels, StudyTube, ADHD-productivity creators (hourly tracking resonates strongly there), Notion-template creators.
- [ ] Offer at beta stage: free lifetime Pro + revenue share on referred paid users (20–30% for 12 months is standard; use Rewardful or a simple in-house ledger once billing exists).
- [ ] Motivational speakers: worth trying, but they convert worse than niche productivity creators — their audience wants inspiration, not tools. Test 2–3 cheaply before committing profit share.
- [ ] Prepare a creator kit: 30-second demo video, screenshots, one-paragraph pitch, their personal ref link.

## Phase 6 — Paid Tier (Month 3+, only after retention is proven)

- [ ] AI features = the paid tier: auto-plan tomorrow from your calendar + history, weekly AI review of where time went, task auto-categorization. (Vercel AI SDK on the existing Hono backend.)
- [ ] Pomodoro timer — free tier, client-side, table stakes.
- [ ] Pricing: $5–8/mo (you're unproven; undercut Sunsama's $20).
- [ ] Stripe + webhooks, entitlements table.

---

## Principles (read when tempted to deviate)

1. **Retention before reach.** Marketing amplifies what exists; it can't fix a leaky bucket.
2. **The tracker is the wedge.** Nobody needs another todo app; plan-vs-reality is the story.
3. **Brand + category.** DayMirror (memorable) + Time Audit (searchable). See `BRAND.md`.
4. **Ship weekly, publicly.** Build-in-public is a free marketing channel that compounds.
5. **One metric per phase.** Phase 2: production stability. Phase 3: landing conversion. Phase 4: day-7 retention. Phase 5: referred-user activation. Phase 6: free→paid conversion.
6. **Don't rebuild the stack.** Next.js + Hono + Drizzle + Postgres is right. Boring is a feature.
