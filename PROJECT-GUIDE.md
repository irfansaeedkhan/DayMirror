# Chronos — Complete Project Guide

This document explains **what was built**, **how data flows** from UI → API → database, and **which file owns which responsibility**. Use it as a map while reading and improving the code.

---

## 1. What is Chronos?

Chronos is a hybrid productivity app with three main surfaces:

| Route | Purpose |
|-------|---------|
| `/planner` | Monthly calendar + day agenda (tasks) |
| `/tracker` | Hour-by-hour reflection timeline |
| `/analytics` | Historical ledger table (retrospective review) |

The old app at the repo root (`flow-horizon-app/`) uses TanStack Start + Supabase. **Chronos** (`chronos/`) is a fresh rewrite using Next.js + Hono + Drizzle, following your architecture PDF and hybrid UX spec.

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (React Client Components)                              │
│  planner-view / tracker-view / analytics-ledger / task-modal    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ TanStack Query hooks
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  hooks/use-tasks.ts, use-tracker.ts, use-analytics.ts          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ ky HTTP client
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  lib/api/index.ts  →  lib/api-client.ts                       │
│  GET/POST/PATCH/DELETE  /api/*                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  app/api/[[...route]]/route.ts  (Next.js catches all /api/*)   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ hono/vercel adapter
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  server/index.ts — Hono app                                     │
│    middleware: auth, error-handler, zod-validator                 │
│    modules: tasks | tracker | analytics                         │
│      Controller (thin) → Service (logic) → Repository (DB)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL — tables: tasks, hour_logs, task_completions, etc.  │
└─────────────────────────────────────────────────────────────────┘
```

**Rule:** UI never talks to the database directly. Everything goes through the API layer.

---

## 3. Folder structure (what lives where)

```
chronos/
├── src/
│   ├── app/                          # Next.js App Router (routes only)
│   │   ├── layout.tsx                # Root: fonts, QueryProvider, Toaster
│   │   ├── page.tsx                  # Redirects / → /planner
│   │   ├── error.tsx                 # Route-level error boundary
│   │   ├── global-error.tsx          # App-wide fatal error boundary
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # App shell + global New Task button
│   │   │   ├── planner/page.tsx      # Renders <PlannerView />
│   │   │   ├── tracker/page.tsx      # Renders <TrackerView />
│   │   │   └── analytics/page.tsx    # Renders <AnalyticsLedger />
│   │   └── api/[[...route]]/route.ts # Single entry: all Hono API traffic
│   │
│   ├── server/                       # Backend (runs on server only)
│   │   ├── index.ts                  # Hono app assembly + route mounting
│   │   ├── middleware/
│   │   │   ├── auth.ts               # Reads x-user-id (dev) / future JWT
│   │   │   ├── error-handler.ts      # Structured JSON errors
│   │   │   └── zod-validator.ts      # Request validation middleware
│   │   └── modules/
│   │       ├── tasks/                # Task CRUD + completions
│   │       ├── tracker/              # Hour logs + task linking
│   │       └── analytics/            # Historical ledger queries
│   │
│   ├── db/
│   │   ├── schema/index.ts           # Drizzle table definitions + infer types
│   │   └── index.ts                  # DB client (lazy connect via DATABASE_URL)
│   │
│   ├── lib/                          # Shared utilities (client + server)
│   │   ├── api-client.ts             # ky instance + apiGet/apiPost helpers
│   │   ├── api/index.ts              # tasksApi, trackerApi, analyticsApi
│   │   ├── recurrence.ts             # Expand recurring tasks into occurrences
│   │   ├── constants.ts              # Category colors, mood config
│   │   └── validators/task-form.ts   # Zod schema for New Task modal
│   │
│   ├── hooks/                        # TanStack Query wrappers (client)
│   │   ├── use-tasks.ts
│   │   ├── use-tracker.ts
│   │   ├── use-analytics.ts
│   │   └── use-task-suggestion.ts    # Ghost chip: task matching current hour
│   │
│   ├── types/api.ts                  # Shared DTO types (no `any`)
│   │
│   └── components/
│       ├── layout/                   # app-shell, dashboard-layout
│       ├── providers/                # QueryProvider, AppToaster
│       ├── ui/                       # shadcn primitives (button, dialog, sheet…)
│       ├── planner/                  # Calendar + day view + task drawer
│       ├── tracker/                  # Timeline + hour row + attach drawer
│       ├── analytics/                # TanStack Table ledger
│       └── tasks/                    # New Task modal (Zod + RHF)
│
├── drizzle.config.ts                 # Drizzle Kit config
├── .env.example / .env.local         # DATABASE_URL, DEV_USER_ID
└── PROJECT-GUIDE.md                  # This file
```

---

## 4. Request lifecycle (step by step)

### Example: User creates a task

1. **UI** — User clicks **New Task** in `components/layout/app-shell.tsx` → opens `components/tasks/task-modal.tsx`.
2. **Form** — `task-modal.tsx` uses `react-hook-form` + `zodResolver(taskFormSchema)` from `lib/validators/task-form.ts`.
3. **Mutation** — On submit, calls `useUpsertTask()` from `hooks/use-tasks.ts`.
4. **API client** — Hook calls `tasksApi.create()` in `lib/api/index.ts` → `apiPost("tasks", payload)` in `lib/api-client.ts`.
5. **HTTP** — ky sends `POST /api/tasks` with header `x-user-id` (from `NEXT_PUBLIC_DEV_USER_ID`).
6. **Next.js** — `app/api/[[...route]]/route.ts` forwards to Hono via `handle(app)`.
7. **Hono router** — `server/index.ts` routes to `tasksController`.
8. **Controller** — `tasks.controller.ts`:
   - `zodValidator("json", createTaskSchema)` validates body
   - Calls `tasksService.create(userId, body)` — **no business logic here**
9. **Service** — `tasks.service.ts` orchestrates rules (e.g. not-found checks).
10. **Repository** — `tasks.repository.ts` runs Drizzle `insert` on `tasks` table.
11. **Response** — `{ data: Task }` JSON bubbles back; TanStack Query invalidates `["tasks"]` cache; UI refreshes.

### Example: User logs an hour in Tracker

1. **UI** — `tracker-view.tsx` renders `HourRow` for each hour (1–23).
2. **Expand** — Clicking a collapsed hour sets `expandedHour` state; current hour auto-expands.
3. **Type** — User types in textarea → debounced `useUpsertHourLog()` mutation.
4. **API** — `POST /api/tracker` with `{ date, hour, description, mood, productivity }`.
5. **Backend** — `tracker.controller` → `tracker.service.upsertHourLog` → `tracker.repository.upsert` (insert or conflict update on `user_id + date + hour`).
6. **Suggestion** — `useTaskSuggestion` hook scans today's tasks; if one overlaps the hour, `HourRow` shows ghost chip **"Working on X?"**.
7. **Attach** — **Attach task** opens `task-attach-drawer.tsx` → `POST /api/tracker/attach-task`.

### Example: Planner calendar click matrix

| Click target | Handler | Result |
|--------------|---------|--------|
| Empty day cell / date number | `onDayClick` in `month-grid.tsx` | Navigate to `?view=day&date=YYYY-MM-DD` |
| Task chip | `onTaskClick` (stops propagation) | Opens `task-detail-drawer.tsx` |
| Checkbox in drawer | `useToggleCompletion()` | `POST /api/tasks/completions/toggle` |

---

## 5. Backend modules (NestJS-style)

Each domain follows the same pattern:

```
module/
├── *.schemas.ts      # Zod input/output shapes
├── *.repository.ts   # Drizzle queries only
├── *.service.ts      # Business rules, calls repository
└── *.controller.ts   # HTTP routes, validation, calls service
```

### Tasks module

| File | Responsibility |
|------|----------------|
| `tasks.schemas.ts` | `createTaskSchema`, `updateTaskSchema`, `toggleCompletionSchema`, etc. |
| `tasks.repository.ts` | `findInRange`, `create`, `update`, `delete`, `toggleCompletion` |
| `tasks.service.ts` | `listInRange`, `create`, `update`, `remove`, `toggleCompletion` |
| `tasks.controller.ts` | `GET /`, `GET /:id`, `POST /`, `PATCH /`, `DELETE /:id`, `POST /completions/toggle` |

### Tracker module

| File | Responsibility |
|------|----------------|
| `tracker.schemas.ts` | `dayQuerySchema`, re-exports upsert/attach schemas |
| `tracker.repository.ts` | `findDayLogs`, `upsert`, `attachTask`, `getSettings` |
| `tracker.service.ts` | Validates log exists before attach |
| `tracker.controller.ts` | `GET /`, `POST /`, `POST /attach-task` |

### Analytics module

| File | Responsibility |
|------|----------------|
| `analytics.repository.ts` | `listLedger` — filtered hour_logs for table |
| `analytics.service.ts` | Wraps repository, returns `{ rows, total }` |
| `analytics.controller.ts` | `GET /ledger` |

---

## 6. Database schema (`src/db/schema/index.ts`)

| Table | Purpose |
|-------|---------|
| `tasks` | Planner tasks (title, date, times, priority, recurrence…) |
| `task_completions` | Per-occurrence completion for recurring tasks |
| `hour_logs` | One row per user per date per hour (0–23) |
| `hour_log_tasks` | Many-to-many: which tasks linked to which hour |
| `user_settings` | Tracker hour range, theme, week start |

**Enums:** `task_priority`, `task_recurrence`, `hour_mood` (success, moderate, wasted, in_progress, planning).

**Inferred types:** `Task`, `NewTask`, `HourLog`, etc. — use these instead of `any`.

---

## 7. Frontend modules (UX from architecture PDF)

### Module 1 — Planner (`components/planner/`)

| Component | Role |
|-----------|------|
| `planner-view.tsx` | Orchestrates month/day toggle, date navigation, modals |
| `month-grid.tsx` | 7×6 grid; inline task chips; dual click targets |
| `day-agenda.tsx` | Single-day task list with checkboxes |
| `task-detail-drawer.tsx` | Design B side drawer for task details |

**Data:** `useTasksInRange` + `expandTasksForRange` (`lib/recurrence.ts`) to show recurring tasks on correct days.

### Module 2 — Tracker (`components/tracker/`)

| Component | Role |
|-----------|------|
| `tracker-view.tsx` | Day navigation, stats, timeline container |
| `hour-row.tsx` | Collapsed capsule vs expanded inline form (Design C) |
| `task-attach-drawer.tsx` | Right sheet: recommended + remaining tasks |

**Data:** `useDayHourLogs`, `useUpsertHourLog`, `useAttachTaskToHour`.

### Module 3 — Integration

| Piece | Role |
|-------|------|
| `hooks/use-task-suggestion.ts` | Finds task whose `startAt` overlaps current hour |
| `task-attach-drawer.tsx` | Groups tasks into Recommended / Remaining |

### Module 4 — Forms & Analytics

| Component | Role |
|-----------|------|
| `tasks/task-modal.tsx` | "What needs to be done?" — Zod + RHF |
| `analytics/analytics-ledger.tsx` | TanStack Table — sortable historical rows |

---

## 8. API reference

All responses: `{ data: T }`  
All errors: `{ error: { code, message, details? } }`

| Method | Path | Hook / Caller |
|--------|------|---------------|
| GET | `/api/health` | — |
| GET | `/api/tasks?start=&end=` | `useTasksInRange` |
| POST | `/api/tasks` | `useUpsertTask` (create) |
| PATCH | `/api/tasks` | `useUpsertTask` (update) |
| DELETE | `/api/tasks/:id` | `useDeleteTask` |
| POST | `/api/tasks/completions/toggle` | `useToggleCompletion` |
| GET | `/api/tracker?date=` | `useDayHourLogs` |
| POST | `/api/tracker` | `useUpsertHourLog` |
| POST | `/api/tracker/attach-task` | `useAttachTaskToHour` |
| GET | `/api/analytics/ledger` | `useAnalyticsLedger` |

---

## 9. Auth (current — dev only)

- `server/middleware/auth.ts` reads `x-user-id` header.
- `lib/api-client.ts` sets that header from `NEXT_PUBLIC_DEV_USER_ID`.
- **Production:** replace with session/JWT and validate in `authMiddleware`.

---

## 10. Environment variables

| Variable | Where used |
|----------|------------|
| `DATABASE_URL` | `db/index.ts`, `drizzle.config.ts` |
| `DEV_USER_ID` | Server-side auth fallback |
| `NEXT_PUBLIC_DEV_USER_ID` | Client ky header |

---

## 11. Scripts

```bash
yarn dev          # Start dev server
yarn build        # Production build
yarn db:push      # Push schema to PostgreSQL (needs running DB)
yarn db:generate  # Generate SQL migrations
yarn db:studio    # Drizzle Studio GUI
```

---

## 12. How to test locally

### Option A — Docker (recommended)

1. Install **Docker Desktop**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. `cp .env.example .env.local` (defaults match `docker-compose.yml`)
3. `yarn db:setup` — starts Postgres + pushes schema
4. `yarn dev` — open http://localhost:3000/planner
5. Test flows:
   - **Planner:** click dates, click task chips, create task via **New Task**
   - **Tracker:** expand an hour, set mood, attach a task
   - **Analytics:** view ledger after logging hours

### Option B — Existing PostgreSQL

Set `DATABASE_URL` in `.env.local` to your instance, then `yarn db:push`.

### Docker files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Postgres 16 on port `5432`, db `chronos`, user/pass `postgres`/`password` |
| `.env.docker` | Reference env values that match Docker |

Without a running database, the UI loads but API calls will fail with connection errors.

---

## 13. Suggested improvement order

1. **Real auth** — replace dev `x-user-id` header
2. **Weekly time-block view** — planner week grid with hourly axis
3. **Two-way task status** — linking task to hour updates planner status
4. **Theme toggle** — wire `user_settings.theme` to light/dark class on `<html>`
5. **Optimistic updates** — TanStack Query `onMutate` for faster tracker UX
6. **Server Components** — move initial data fetch to RSC where it makes sense

---

## 14. Key design decisions (why it's structured this way)

| Decision | Reason |
|----------|--------|
| Hono inside Next API route | Single deploy, typed backend, no separate server |
| Controller → Service → Repository | Testable layers; routes stay dumb |
| ky + TanStack Query | Cached client state; ky is minimal fetch wrapper |
| Client components for features | Heavy interactivity (calendar clicks, timeline expand) |
| Analytics isolated route | Design B table is for review, not daily input |
| Recurrence in `lib/recurrence.ts` | Shared between planner month grid and day view |

---

## 15. File → function quick index

| Want to change… | Open |
|-----------------|------|
| API routes | `server/index.ts`, `*/controller.ts` |
| Business rules | `*/service.ts` |
| SQL / queries | `*/repository.ts`, `db/schema/index.ts` |
| Request validation | `*/schemas.ts`, `middleware/zod-validator.ts` |
| HTTP client / headers | `lib/api-client.ts` |
| React data fetching | `hooks/use-*.ts` |
| Calendar UI | `components/planner/month-grid.tsx` |
| Hour logging UI | `components/tracker/hour-row.tsx` |
| New task form fields | `lib/validators/task-form.ts`, `task-modal.tsx` |
| Nav / shell | `components/layout/app-shell.tsx` |
| Global providers | `app/layout.tsx`, `providers/query-provider.tsx` |

---

*Generated for the Chronos scaffold. Update this guide as you add auth, weekly view, and production deployment.*
