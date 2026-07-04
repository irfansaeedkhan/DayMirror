# DayMirror — Launch Roadmap

> The single source of truth for taking DayMirror from local project to live product.
> Owner: you. Review cadence: weekly. Cross items off — don't let this rot.
>
> Positioning in one line: **"See where your day actually went."**
> The hourly reflection tracker is the hero. The planner/todo is supporting cast.

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

## Phase 1 — Real Auth (Week 1–2) `[IN PROGRESS]`

Goal: multiple real users, each seeing only their own data.

- [x] **Better Auth** with Drizzle adapter — email/password (+ Google when credentials added).
- [x] Auth tables added to `src/db/schema/auth.ts`
- [x] Replace `x-user-id` middleware with Better Auth session lookup (dev fallback kept)
- [x] Login / signup pages (shadcn, calm aesthetic per DESIGN-ETHICS.md)
- [x] Run `yarn db:push` after Docker/Neon is up (auth tables)
- [x] Audit every repository query: confirm `userId` filter on every read/write — see `SECURITY-AUDIT.md`
- [x] Sign-out in app shell
- [ ] Forgot-password flow — deferred until domain + email provider (see note below)
- [x] Google OAuth (Gmail sign-in) — verified locally

> **Email deferred:** No verification or password-reset emails until we have a custom domain. Resend requires domain verification for production sends; beta uses Google OAuth + email/password without verification.

## Phase 2 — Deploy (Week 2) `[READY — follow DEPLOY.md]`

Goal: live URL, monitored, with real data safety.

> **Step-by-step guide:** [DEPLOY.md](./DEPLOY.md) — Vercel + Neon for first-time deployers.

- [x] **Database: Neon** — schema pushed (`user`, `tasks`, `hour_logs`, auth tables, etc.)
- [ ] **Hosting: Vercel** — import `irfansaeedkhan/DayMirror`, root directory = `.`
- [ ] **Domain** — buy the .com (or .app). Short, spellable. Set up before SEO work, never change it after.
- [ ] **Sentry** (free tier) for error tracking, client + server.
- [ ] **Vercel Analytics** or Plausible for traffic.
- [ ] Backups: Neon PITR is on by default — verify retention settings.
- [ ] Staging = Vercel preview deployments + Neon branch DB.

## Phase 3 — Landing Page + SEO/AEO (Week 3)

Goal: a Sunsama-quality landing page that ranks on Google AND gets cited by AI assistants.

### Landing page (Next.js, same repo, statically rendered)
- [ ] Hero: **"Stop guessing where your day went."** + subhead from `BRAND.md` + CTA **Start Reflecting**
- [ ] Problem → solution narrative (Sunsama's structure: "work is chaotic" ❌❌❌ → "clarity" ✅✅✅).
- [ ] Feature sections with real screenshots: hourly tracker, planner, analytics.
- [ ] Social proof section (starts empty — fill with beta user quotes ASAP).
- [ ] Single CTA everywhere: "Start free — no credit card."
- [ ] Feedback modal inside the app (simple: rating + text → DB table + optional email notification to you).

### Classic SEO
- [ ] Next.js Metadata API on every page: title, description, OpenGraph, Twitter cards.
- [ ] `sitemap.xml` + `robots.txt` (Next.js has built-in generators).
- [ ] JSON-LD structured data: `SoftwareApplication` + `FAQPage` schema.
- [ ] Google Search Console + Bing Webmaster verified on day one.
- [ ] Core Web Vitals green (static landing page ⇒ near-free win).

### AEO / AI-search optimization (ChatGPT, Perplexity, Google AI Overviews)
AI assistants cite pages that answer questions directly. Ship a `/blog` or `/guides` section with question-shaped, genuinely useful content:
- [ ] "Where does my time actually go? How to run a time audit" 
- [ ] "Why todo lists fail (and what to do instead)"
- [ ] "Hourly time tracking vs time blocking: which fixes focus?"
- [ ] "How to build a daily review habit that sticks"
- [ ] FAQ page with literal questions people ask ("how do I stop wasting my day", "app to see where my time goes").
- [ ] Every article: clear H2 questions, direct first-paragraph answers, comparison tables, updated dates. This is what LLMs quote.
- [ ] Get listed: AlternativeTo, Product Hunt, futurepedia-style directories — AI models crawl these heavily.

## Phase 4 — Free Beta Launch (Week 4)

- [ ] Feedback modal live + a `feedback` DB table. Read every entry.
- [ ] Onboarding: first-run walkthrough that gets the user to log ONE hour and add ONE task (activation moment).
- [ ] Launch posts: Product Hunt, Hacker News (Show HN), r/productivity, r/SideProject, X/Twitter build-in-public thread.
- [ ] Measure ONE metric: **day-7 tracker retention** (did they log hours a week later?). Everything else is noise.
- [ ] Weekly changelog posts — shipping visibly is marketing.

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
3. **Ship weekly, publicly.** Build-in-public is a free marketing channel that compounds.
4. **One metric per phase.** Phase 4: day-7 retention. Phase 5: referred-user activation. Phase 6: free→paid conversion.
5. **Don't rebuild the stack.** Next.js + Hono + Drizzle + Postgres is right. Boring is a feature.
