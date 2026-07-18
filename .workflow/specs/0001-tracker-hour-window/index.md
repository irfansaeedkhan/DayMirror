# 0001. Tracker hour window

**Date**: 2026-07-04
**Status**: In Progress

## Summary

The hourly tracker currently lists too many hours when you open it mid day. This spec defines how DayMirror chooses which hours to show. For today, the list starts at the current local hour by default. For other days, it uses the user default range from settings. Users can override the from and to hours for a specific day. The window logic lives on the server where overrides are stored. The client applies local timezone for the today default.

## Requirements

**User stories**:
- As a user opening the tracker at 3pm, I want the hour list to start near 3pm so I am not scrolling past empty morning hours.
- As a user reviewing yesterday, I want the full default range from my settings so I can log or edit any hour in that day.
- As a user with an unusual schedule, I want to set a custom from and to range for one day without changing my global defaults.

**Acceptance criteria**:
- **AC-1**: When viewing **today** with no per day override, visible hours start at the user's current local hour and end at `defaultEndHour` from settings (default 23).
- **AC-2**: When viewing a **past or future date** with no per day override, visible hours use `defaultStartHour` and `defaultEndHour` from settings (defaults 1 and 23).
- **AC-3**: User can set a per day `startHour` and `endHour` override; it persists and applies on reload for that date only.
- **AC-4**: Per day override can be cleared; the day falls back to AC-1 or AC-2 rules.
- **AC-5**: `startHour` must be less than or equal to `endHour`; both must be integers 0 to 23; invalid input returns 400.
- **AC-6**: All window reads and writes are scoped to the authenticated `userId`; no cross user access.
- **AC-7**: Existing hour logs outside the visible window remain in the database and appear when the window is expanded via override.
- **AC-8**: Summary stats (`hours logged` denominator) use the **visible** hour count, not the full day.

## Decision

**Chosen option**: Option 2: Server stored per day overrides plus server returned effective window

The tracker GET response includes an `effectiveWindow` object. Today default start is computed using the client local hour passed as an optional query param `nowHour` (validated 0 to 23). Per day overrides live in a new `tracker_day_windows` table.

## Feature design

**Data model sketch**:

`tracker_day_windows` (new table):
| Column | Type | Notes |
|---|---|---|
| userId | uuid | PK part, not null |
| date | date | PK part, not null |
| startHour | smallint | 0 to 23, not null |
| endHour | smallint | 0 to 23, not null |
| createdAt | timestamptz | default now |
| updatedAt | timestamptz | default now |

Unique constraint on `(userId, date)`.

`user_settings` unchanged (`defaultStartHour`, `defaultEndHour`).

**State transitions**:
- No override row: effective window from rules (today vs other day)
- Override row exists: use stored start and end
- Override deleted: back to rule based window

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/tracker` | GET | `date` (req), `nowHour` (opt, 0 to 23) | logs, settings, dayWindow, effectiveWindow | session | 400, 401 |
| `/api/tracker/day-window` | PUT | `date`, `startHour`, `endHour` | dayWindow, effectiveWindow | session | 400, 401 |
| `/api/tracker/day-window` | DELETE | `date` (query) | effectiveWindow | session | 400, 401 |

`effectiveWindow` shape:
```typescript
{
  startHour: number;
  endHour: number;
  source: "today_default" | "user_settings" | "day_override";
}
```

**Window resolution rules** (in `tracker.service.ts`):

1. If `tracker_day_windows` row exists for `(userId, date)` → use it, `source: day_override`
2. Else if `date` equals client's today (compare `date` string to server UTC date OR trust client `nowHour` only when provided and date is "today" in client terms):
   - **Simpler rule**: when `nowHour` query param is present, treat as today mode: `startHour = nowHour`, `endHour = settings.defaultEndHour`, `source: today_default`
   - When `nowHour` absent, use user settings (backward compatible)
3. Else → `startHour = settings.defaultStartHour`, `endHour = settings.defaultEndHour`, `source: user_settings`

**Key invariants**:
- `0 <= startHour <= endHour <= 23`
- Window filters **display only**; upsert hour log still allowed for any hour 0 to 23 regardless of window (logging an hour outside window is valid if user expands range later)
- `nowHour` is a hint for today mode only; never stored

**Security model**:
- All queries filter by `userId` from session
- `nowHour` has no privilege impact; only affects display start for the requested date

**Configuration required**: none

**Critical test scenarios**:
- Happy path: open tracker at 3pm today, list starts at hour 15, verifies **AC-1**
- Past day: open yesterday, list starts at `defaultStartHour`, verifies **AC-2**
- Override: set 6 to 10 for today, reload, only hours 6 to 10 show, verifies **AC-3**
- Clear override: DELETE day window, today mode returns, verifies **AC-4**
- Auth: unauthenticated GET returns 401 in production, verifies **AC-6**

## Build plan

1. Add `tracker_day_windows` table to Drizzle schema and run `yarn db:push --force`, satisfies **AC-3**, **AC-6**
2. Add window resolution in `tracker.service.ts` and extend GET `/api/tracker` response with `dayWindow` and `effectiveWindow`, satisfies **AC-1**, **AC-2**
3. Add PUT and DELETE `/api/tracker/day-window` with Zod schemas, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**
4. Update `trackerApi`, types, and `useDayHourLogs` to pass `nowHour` when viewing today, satisfies **AC-1**
5. Update `tracker-view.tsx` to filter hours from `effectiveWindow` (not raw settings), satisfies **AC-1**, **AC-2**, **AC-8**
6. Add minimal per day from or to control (reuse existing Select or TimePicker patterns, no layout redesign), satisfies **AC-3**, **AC-4**
7. Manual verify per `verify.md`, satisfies all ACs

## Consequences

**Positive**:
- Shorter list when opening mid day; better activation for beta users
- Per day flexibility without changing global settings

**Negative / tradeoffs**:
- `nowHour` query param is a client hint; wrong value could show wrong window until reload
- One new table and two endpoints to maintain

**Neutral**:
- Hour logs outside visible window still exist; expanding window reveals them (**AC-7**)

## Follow-up

- [ ] Item #4 work sessions may compose with day windows; revisit after sessions spec
- [ ] Settings UI for global `defaultStartHour` / `defaultEndHour` (currently DB defaults only)

## Rationale

See [rationale.md](./rationale.md).
