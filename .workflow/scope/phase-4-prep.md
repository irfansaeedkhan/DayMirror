# Phase 4 Prep — Scope

> Living scope for the current slice: beta readiness before public launch.
> Workflow skills installed from [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills).
> Artifacts live in `.workflow/` (not shipped with the Next.js app).

**Status:** in progress  
**Last updated:** 2026-07-04

---

## Ordered work (one at a time)

| # | Item | Status | Owner skill | Notes |
|---|---|---|---|---|
| 1 | Feedback modal + `feedback` table | **done** | develop | Account menu → Send feedback; `POST /api/feedback`; 10/hr rate limit |
| 2 | Security pass (API limiters, headers, auth) | **done** | check + audit | See `.workflow/reviews/security-pass-2026-07-04.md` |
| 3 | Tracker hour window UX | **done** | develop | Settings + per day from/to on tracker header |
| 4 | Work sessions (multi-block days) | **done** | develop | Custom sessions per day; rest gaps between blocks |
| 5 | Tasks + tracker flow/UI polish | planned | develop | After #3–4 specs exist; no unsolicited visual changes |

---

## Slice 1 — Feedback (shipped in code)

**Intent:** Let beta users tell the founder what to improve without leaving the app.

**Acceptance:**
- [x] Authenticated users can submit feedback from app shell
- [x] Message required (10–5000 chars); optional 1–5 rating; category bug/idea/other
- [x] Stores userId, page path, user-agent, timestamp
- [x] Stricter rate limit on feedback route (10/hour/IP)
- [ ] `yarn db:push` on local + Neon before production use

**Follow-up:** Admin read path (Neon SQL or simple `/admin` later) — not in this slice.

---

## Slice 2 — Security (done)

**Intent:** Confirm production hardening is complete and close known gaps.

**Checklist:**
- [x] Verify global + per-route rate limits (auth, feedback, writes)
- [x] Re-run `SECURITY-AUDIT.md` userId isolation on new `feedback` table
- [x] CSP / headers updated for Vercel Analytics + Google avatars + HSTS
- [x] CORS allowlist unchanged (same-origin + explicit `ALLOWED_ORIGINS`)
- [x] Document findings in `.workflow/reviews/security-pass-2026-07-04.md`

**Run:** `/check verify` on deploy — manual checklist in review doc.

---

## Slice 3 — Tracker hour window (shipped)

**Spec:** [0001-tracker-hour-window](../specs/0001-tracker-hour-window/index.md)  
**Design change (2026-07-04):** Dropped auto current hour (`nowHour`). Uses global defaults (6–22) + per day override + header controls.

**Acceptance:**
- [x] `effectiveWindow` from settings or day override
- [x] From/to selects on tracker header
- [x] Save as my usual (PATCH settings)
- [x] Reset day to usual (DELETE day override)
- [x] Logged hours outside window still visible (AC-7)
- [ ] `/check verify` on production after deploy

---

## Slice 4 — Work sessions

**Problem:** Real days have breaks; gap hours are rest, not “wasted.”

**Direction (needs spec):**
- Model work sessions per day (e.g. 6–10, 13–17)
- Tracker UI scoped to active session or “rest” between sessions
- Analytics: distinguish rest vs unlogged vs wasted

**Run:** `/architect` first — touches schema + tracker + analytics.

---

## Slice 5 — Tasks + tracker UI flow

**Intent:** Improve task ↔ hour linking and daily flow after #3–4 decisions.

**Constraint:** Logic and flow first; visual changes only when you approve.

---

## Workflow commands (Cursor / agents)

| Command | When |
|---|---|
| `/audit` | Refresh `AGENTS.md` from real repo (brownfield) |
| `/scope` | Re-read or extend this file |
| `/architect` | Before load-bearing decisions (#3, #4) |
| `/develop` | Build from spec |
| `/check verify` | Run app, prove acceptance criteria |
| `/sync` | After merge — reconcile scope + AGENTS.md |

Skills path: `chronos/.agents/skills/{scope,audit,architect,develop,check,test,document,sync,debug}/`
