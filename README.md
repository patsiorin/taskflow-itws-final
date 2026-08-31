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
  dump.sql        PostgreSQL schema and sample data for submission
```

## Exam Requirements Covered

- Database has three tables: `boards`, `board_columns`, and `tasks`
- One-to-many relations: board to columns, board to tasks, column to tasks
- CRUD is available for boards, columns, and tasks
- Drag-and-drop ordering is available for boards, columns, and task cards
- Backend: NestJS
- Frontend: React, Vite, Tailwind CSS
- Database dump with schema and sample data included in `database/dump.sql`

## API Endpoints

The backend uses the `/api` global prefix.

| Resource | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Boards | GET | `/api/boards` | List boards |
| Boards | GET | `/api/boards/:id` | Get one board with columns and tasks |
| Boards | POST | `/api/boards` | Create board |
| Boards | PATCH | `/api/boards/reorder` | Save board order |
| Boards | PATCH | `/api/boards/:id` | Update board |
| Boards | DELETE | `/api/boards/:id` | Delete board |
| Columns | GET | `/api/columns` | List columns |
| Columns | GET | `/api/columns?boardId=1` | List columns for one board |
| Columns | GET | `/api/columns/:id` | Get one column |
| Columns | POST | `/api/columns` | Create column |
| Columns | PATCH | `/api/columns/reorder` | Save column order for a board |
| Columns | PATCH | `/api/columns/:id` | Update column |
| Columns | DELETE | `/api/columns/:id` | Delete column |
| Tasks | GET | `/api/tasks` | List tasks |
| Tasks | GET | `/api/tasks?boardId=1` | List tasks for one board |
| Tasks | GET | `/api/tasks/:id` | Get one task |
| Tasks | POST | `/api/tasks` | Create task |
| Tasks | PATCH | `/api/tasks/reorder` | Save task order across columns |
| Tasks | PATCH | `/api/tasks/:id` | Update task |
| Tasks | DELETE | `/api/tasks/:id` | Delete task |

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
npm run db:apply
npm run prisma:generate
npm run dev
```

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3000/api`

## Submission Checklist

- Push this folder as a GitHub repository.
- Include `database/dump.sql` in the repository.
- Confirm `npm run build` passes before sending.
- Send the GitHub repository link to the Teams chat.
