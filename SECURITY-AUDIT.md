# Chronos — userId security audit

> Audit date: 2026-07-04 (updated 2026-07-04 — feedback module + security pass)  
> Verdict: **PASS**

Every API route goes through `authMiddleware` → `c.get("userId")` from Better Auth session.  
Repositories must always filter by `userId`. Services must verify ownership before mutations.

---

## Route → controller → service chain

| Module | Routes protected | userId source |
|---|---|---|
| Tasks | `/api/tasks/*` | `c.get("userId")` on every handler |
| Tracker | `/api/tracker/*` | `c.get("userId")` on every handler |
| Analytics | `/api/analytics/*` | `c.get("userId")` on every handler |
| Feedback | `/api/feedback/*` | `c.get("userId")` on every handler |
| Auth | `/api/auth/*` | Better Auth (separate) |

---

## Repository audit

### Tasks (`tasks.repository.ts`)

| Method | userId filter | Notes |
|---|---|---|
| `findInRange` | ✅ `eq(tasks.userId)` + date range | **Fixed:** was missing `start` date filter |
| `findById` | ✅ id + userId | |
| `create` | ✅ sets userId on insert | |
| `update` | ✅ id + userId | |
| `delete` | ✅ id + userId | |
| `listCompletions` | ✅ userId | |
| `toggleCompletion` | ✅ userId on delete; service verifies task ownership before insert | |

### Tracker (`tracker.repository.ts`)

| Method | userId filter | Notes |
|---|---|---|
| `findDayLogs` | ✅ hourLogs + hourLogTasks | |
| `upsert` | ✅ userId on insert/update | |
| `attachTask` | ✅ userId on link rows | **Fixed:** service now verifies task belongs to user |
| `findById` | ✅ id + userId | |
| `getSettings` | ✅ userId | |

### Analytics (`analytics.repository.ts`)

| Method | userId filter | Notes |
|---|---|---|
| `listLedger` | ✅ hourLogs.userId | |
| `listTasksForContext` | ✅ tasks.userId | |

### Feedback (`feedback.repository.ts`)

| Method | userId filter | Notes |
|---|---|---|
| `create` | ✅ sets userId on insert | Insert-only; no read/update/delete endpoints yet |

---

## Service-layer ownership checks

| Operation | Pre-check |
|---|---|
| Task update/delete | `findById(userId, id)` |
| Toggle completion | `findById(userId, taskId)` |
| Hour log upsert (by id) | `findById(userId, id)` |
| Attach task to hour | `findById` on log + task |

---

## Manual test (you confirmed ✅)

1. User A (email/password) — sees own todos
2. User B (Google) — empty todos, isolated data

---

## Remaining recommendations (non-blocking)

- [ ] Add DB foreign key from `tasks.userId` → `user.id` (auth table) when stable
- [ ] Default `user_settings` row created on first login (hook) — currently returns hardcoded defaults
- [ ] Integration tests with two user sessions (post-launch)

---

## Fixes applied in this audit

1. **`findInRange`** — now filters `start` AND `end` dates (was returning all historical tasks)
2. **`attachTask`** — verifies task belongs to user before linking to hour log
