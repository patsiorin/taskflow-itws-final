DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS boards;
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";

CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  color VARCHAR(32) NOT NULL DEFAULT '#2563eb',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  board_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  status "TaskStatus" NOT NULL DEFAULT 'TODO',
  priority "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  due_date TIMESTAMP(3) NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX tasks_board_id_idx ON tasks(board_id);

INSERT INTO boards (name, description, color) VALUES
  ('ITWS Final Project', 'A Kanban board for managing the final exam project.', '#2563eb'),
  ('Personal Tasks', 'A sample board for daily planning.', '#16a34a');

INSERT INTO tasks (board_id, title, description, status, priority, due_date, position) VALUES
  (1, 'Create database dump', 'Include schema and starter data in the GitHub repository.', 'DONE', 'HIGH', NULL, 1),
  (1, 'Build board CRUD', 'Create, read, update, and delete boards from the API and UI.', 'IN_PROGRESS', 'HIGH', NULL, 2),
  (1, 'Build task CRUD', 'Create, read, update, delete, and move tasks across columns.', 'TODO', 'HIGH', NULL, 3),
  (2, 'Plan weekly errands', 'Use a second board to demonstrate board switching.', 'TODO', 'MEDIUM', NULL, 1);
