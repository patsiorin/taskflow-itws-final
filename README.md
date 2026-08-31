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

### Runtime

The project is tested with Node.js `22.15.1` and npm `10.9.2`.

Use the included `.nvmrc` if you have NVM installed:

```bash
nvm use
```

The root `package.json` also declares `engines` as Node `>=20 <23` and npm `>=10`. Node 22 LTS is the recommended version for the exam/demo setup.

### Backend Architecture

The backend is a NestJS REST API using Prisma as the database client.

```text
src/main.ts
  Starts the NestJS app, sets the /api prefix, enables CORS, and turns on DTO validation.

src/app.module.ts
  Root NestJS module. It imports the feature modules used by the app.

src/shared/prisma
  PrismaService wraps PrismaClient so NestJS can inject one shared database client.

src/modules/boards
  CRUD and ordering for boards.

src/modules/columns
  CRUD and ordering for board columns.

src/modules/tasks
  CRUD, task movement between columns, and task ordering.
```

Each backend feature module follows the same layered structure:

```text
presentation/controller
  Receives HTTP requests and maps routes such as GET, POST, PATCH, DELETE.

application/service
  Contains business rules, for example checking that a board exists before creating a column.

infrastructure/repository
  Contains Prisma queries. This is the only layer that talks directly to the database.

dto
  Request body validation classes. class-validator decorators reject invalid input.

domain
  Simple TypeScript types representing the app's main data objects.
```

Important Prisma ideas used here:

- `include` loads related data, for example a board with its columns and tasks.
- `_count` asks Prisma to return counts of related records without loading all those records.
- `select` chooses only specific fields from a model, useful for existence checks like `select: { id: true }`.
- `$transaction` runs several database updates as one unit, useful when saving drag-and-drop order.
- `UncheckedCreateInput` / `UncheckedUpdateInput` allow writing foreign key fields such as `boardId` and `columnId` directly.

### Frontend Architecture

The frontend is a React + Vite app. It talks to the backend through typed service classes.

```text
src/App.tsx
  Small client-side router and dark mode state.

src/api
  API root, endpoint builders, and the shared fetch wrapper.

src/services
  Frontend API service layer. Components call BoardService, ColumnService, and TaskService.

src/types
  TypeScript shapes shared by pages, components, and services.

src/pages
  Route-level screens: board list and one board's Kanban view.

src/components/boards
  Board table rows and board create/edit/delete dialogs.

src/components/kanban
  Kanban board, columns, task cards, dialogs, and dnd-kit drag-and-drop wiring.

src/components/ui
  Reusable UI primitives such as buttons, cards, dialogs, tables, inputs, and alerts.
```

Frontend data flow:

1. A page loads data through a service, for example `BoardService.getBoard(id)`.
2. The service calls `httpClient`, which sends a request to `/api/...`.
3. React state stores the result and passes it down to components.
4. Create/edit/delete/reorder actions call a service method.
5. After saving, the page updates local state or reloads the board from the backend.

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
