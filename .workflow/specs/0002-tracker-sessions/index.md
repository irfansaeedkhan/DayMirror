# Spec 0002 — Tracker work sessions

**Status:** implemented  
**Scope:** Phase 4 prep item #4

## Problem

Real days have breaks. Gap hours between work blocks are rest, not wasted time. Users need custom-named sessions (e.g. 6–10, 13–17), not fixed Morning/Afternoon/Evening presets.

## Decisions

| Topic | Choice |
|---|---|
| Data model | `tracker_day_sessions` per user + date |
| View modes | `simple` when zero sessions; `sessions` when ≥1 |
| Rest gaps | Computed client + server between non-overlapping session ranges |
| Presets | Deferred — custom add/edit/delete only |
| Default templates in settings | Deferred |

## API

| Route | Method | Body | Response |
|---|---|---|---|
| `/api/tracker` | GET | `date` | adds `sessions`, `restGaps`, `viewMode` |
| `/api/tracker/sessions` | POST | `date`, `name?`, `startHour`, `endHour` | `{ session }` |
| `/api/tracker/sessions` | PATCH | `id`, `name?`, `startHour?`, `endHour?` | `{ session }` |
| `/api/tracker/sessions/delete` | POST | `id` | `{ success }` |

DELETE uses POST reset pattern (Next.js/Hono compatibility).

## Acceptance criteria

- [x] AC-1: No sessions → simple hour window UI unchanged
- [x] AC-2: User can add named session with start/end hours
- [x] AC-3: User can edit and delete sessions
- [x] AC-4: Timeline shows session headers + hours per session
- [x] AC-5: Gaps between sessions render as rest rows
- [x] AC-6: Logged hours outside session range still visible in their session block
- [ ] AC-7: Analytics distinguishes rest vs wasted (follow-up)

## Verify

```bash
cd chronos && yarn db:push && yarn build
```

Manual: add two sessions with a gap (e.g. 6–10, 13–17) → rest row between them.
