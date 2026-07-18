# Rationale: Tracker hour window

## Context

DayMirror's tracker renders one row per hour. `user_settings` stores `defaultStartHour` (default 1) and `defaultEndHour` (default 23). The view always uses that full range. At 3pm the user sees roughly 15 rows before the current hour, which feels like wasted scroll and makes the product feel broken on first use.

This is a display window problem, not a data model problem. Hour logs are already keyed by `(userId, date, hour)`. We must not delete or hide logged data when the window shrinks.

The app has no global settings UI yet for default hours. Users need a per day override without waiting for a settings page.

Timezone matters. The user's "today" and "current hour" come from the browser. Server UTC midnight does not match user midnight for all users.

## Options considered

### Option 1: Client only today shift

Move today logic entirely into `tracker-view.tsx`: if `isToday`, `start = nowHour`, else use settings.

**Pros**:
- No schema or API change
- Correct timezone automatically

**Cons**:
- Per day override still needs storage; would be a second phase anyway
- Window logic split across client and future API
- Harder to test and verify consistently

### Option 2: Server stored overrides plus effective window in GET response

New `tracker_day_windows` table. GET `/api/tracker` returns `effectiveWindow`. Client passes `nowHour` when viewing today. Minimal day range control in tracker header.

**Pros**:
- Single source of truth for overrides
- Testable service layer
- `/check verify` can hit API directly
- Aligns with existing module pattern

**Cons**:
- `nowHour` param is a client hint (documented tradeoff)
- Small schema migration

### Option 3: Expand `user_settings` with JSON map of date to window

Store per day overrides as JSON on `user_settings`.

**Pros**:
- No new table

**Cons**:
- JSON blob harder to query and validate
- Grows without bound
- Breaks repository patterns used elsewhere

## Rationale

Option 2 fits DayMirror's existing architecture: controller, service, repository, Zod schemas, TanStack Query. It solves today's scroll pain immediately via `nowHour` plus `effectiveWindow`, and adds per day overrides in the same slice. Option 1 would need revisiting for overrides. Option 3 fights Drizzle patterns already used for `hour_logs` and `tasks`.

We accept the `nowHour` hint tradeoff because the user is authenticated, the value only affects their own display, and the worst case is a wrong scroll position until refresh. A future slice can add timezone on `user_settings` if needed.

## References

**Project sources**:
- `src/components/tracker/tracker-view.tsx` (current hour filter at lines 29 to 34)
- `src/db/schema/index.ts` (`user_settings.defaultStartHour`, `defaultEndHour`)
- `PROJECT-CONVENTIONS.md` (module pattern)
- `.workflow/scope/phase-4-prep.md` item #3
