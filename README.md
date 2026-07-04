# Chronos

Production-grade hybrid productivity app — planner, hourly tracker, and analytics ledger.

## Stack

- **Next.js** (App Router, strict TypeScript)
- **Hono.js** — NestJS-inspired domain API (`controllers` → `services` → `repositories`)
- **PostgreSQL + Drizzle ORM**
- **TanStack Query + ky**
- **TanStack Table** (analytics ledger)
- **Zod + React Hook Form**
- **Tailwind CSS + shadcn/ui primitives**
- **Sonner** toasts

## Getting started

### 1. Install Docker (one-time)

Download **Docker Desktop** for Windows: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Install it, start Docker Desktop, and wait until it shows **Engine running**.

### 2. Run the app

```bash
cd chronos
cp .env.example .env.local   # credentials already match docker-compose.yml

yarn install
yarn db:setup                # starts Postgres in Docker + pushes Drizzle schema
yarn dev
```

Open [http://localhost:3000/planner](http://localhost:3000/planner).

### Database commands

| Command | What it does |
|---------|----------------|
| `yarn db:up` | Start Postgres container |
| `yarn db:down` | Stop Postgres container |
| `yarn db:reset` | Wipe data volume and restart fresh |
| `yarn db:push` | Push schema to running Postgres |
| `yarn db:studio` | Open Drizzle Studio GUI |

## Architecture

```
src/
├── app/                    # Next.js routes
│   ├── (dashboard)/        # Planner, Tracker, Analytics
│   └── api/[[...route]]/   # Hono API handler
├── server/                 # Backend domain layer
│   ├── middleware/         # Auth, Zod validation, error handler
│   └── modules/
│       ├── tasks/          # Controller → Service → Repository
│       ├── tracker/
│       └── analytics/
├── db/                     # Drizzle schema + client
├── lib/                    # API client (ky), validators, recurrence
├── hooks/                  # TanStack Query hooks
├── components/             # UI + feature modules
└── types/                  # Shared API types
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks?start=&end=` | Tasks in range |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks` | Update task |
| GET | `/api/tracker?date=` | Day hour logs |
| POST | `/api/tracker` | Upsert hour log |
| POST | `/api/tracker/attach-task` | Link task to hour |
| GET | `/api/analytics/ledger` | Historical ledger |

## UX modules (per architecture guide)

1. **Planner** — 7×6 month grid with inline task chips; day click → day view; task chip → side drawer
2. **Tracker** — 01:00–12:00 AM timeline; current hour expands inline; status capsules
3. **Integration** — Task attach drawer + ghost chip suggestion hook
4. **Analytics** — TanStack Table ledger (Design B retrospective view)
5. **New Task** — Zod-validated modal with conversational header

## Scripts

- `yarn dev` — development server
- `yarn build` — production build
- `yarn db:generate` — generate migrations
- `yarn db:push` — push schema to DB
- `yarn db:studio` — Drizzle Studio
