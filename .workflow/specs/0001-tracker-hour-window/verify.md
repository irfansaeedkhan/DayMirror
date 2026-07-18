# Verify: Tracker hour window · spec 0001

## Commands

- [ ] `yarn db:push --force` applies `tracker_day_windows` without error → **AC-3**
- [ ] `yarn build` passes → all ACs

## API (authenticated session or dev with session cookie)

- [ ] `GET /api/tracker?date=<today>&nowHour=15` returns `effectiveWindow.startHour === 15` and `source === "today_default"` → **AC-1**
- [ ] `GET /api/tracker?date=<yesterday>` returns `effectiveWindow` matching user settings defaults → **AC-2**
- [ ] `PUT /api/tracker/day-window` with `{ date, startHour: 6, endHour: 10 }` persists; GET reflects override → **AC-3**
- [ ] `DELETE /api/tracker/day-window?date=<date>` clears override; GET falls back to rules → **AC-4**
- [ ] `PUT` with `startHour: 10, endHour: 6` returns 400 → **AC-5**
- [ ] Unauthenticated request in production returns 401 → **AC-6**

## UI / manual

- [ ] Open `/tracker` at 3pm (or simulate): first visible hour is current hour, not 1am → **AC-1**
- [ ] Navigate to yesterday: wider range per settings → **AC-2**
- [ ] Set custom from or to for today: list updates, survives refresh → **AC-3**
- [ ] Clear custom range: returns to today default → **AC-4**
- [ ] Log hour 8, shrink window to start at 10: expand window back, hour 8 log still visible → **AC-7**
- [ ] Summary "hours logged" denominator matches visible hour count → **AC-8**

## Acceptance criteria coverage

- AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6 · AC-7 · AC-8
