# TaskFlow Clean Monorepo

TaskFlow is a Kanban todo app for the ITWS final project. This version uses a clearer layered architecture inspired by the existing `WS/itws-monorepo` structure.

## Architecture

```text
apps/frontend
  src/api          API endpoints and HTTP client
  src/services     Frontend service layer
  src/types        TypeScript domain types
  src/pages        Route-level screens
  src/components   Reusable UI and Kanban components

apps/backend
  src/modules/*/presentation      NestJS controllers
  src/modules/*/application       Business services
  src/modules/*/domain            Domain entities/types
  src/modules/*/infrastructure    Database repositories
  src/shared/prisma               Shared Prisma client

database
  dump.sql        PostgreSQL schema and starter data for submission
```

## Exam Requirements Covered

- Database has two tables: `boards` and `tasks`
- One-to-many relation: one board has many tasks
- CRUD is planned for both boards and tasks
- Backend: NestJS
- Frontend: React, Vite, Tailwind CSS
- Database dump included in `database/dump.sql`

## Database

The project uses PostgreSQL. The local development database name is `ws`.

```bash
createdb -U postgres ws
psql -U postgres -d ws -f database/dump.sql
```

## Run Locally

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
npm run prisma:generate
npm run dev
```

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3000/api`
