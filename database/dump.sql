DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS board_columns;
DROP TABLE IF EXISTS boards;
DROP TYPE IF EXISTS "TaskPriority";

CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  color VARCHAR(32) NOT NULL DEFAULT '#2563eb',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_columns (
  id SERIAL PRIMARY KEY,
  board_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT board_columns_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  board_id INT NOT NULL,
  column_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  priority "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  due_date TIMESTAMP(3) NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_board_id_fkey FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  CONSTRAINT tasks_column_id_fkey FOREIGN KEY (column_id) REFERENCES board_columns(id) ON DELETE CASCADE
);

CREATE INDEX board_columns_board_id_idx ON board_columns(board_id);
CREATE INDEX tasks_board_id_idx ON tasks(board_id);
CREATE INDEX tasks_column_id_idx ON tasks(column_id);

INSERT INTO boards (id, name, description, color, position, created_at, updated_at) VALUES
  (1, 'ITWS Final Project', 'Kanban board for planning and presenting the final project.', '#0f766e', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Study Plan', 'Course preparation tasks for lectures, labs, and exam review.', '#7c3aed', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO board_columns (id, board_id, name, position, created_at, updated_at) VALUES
  (1, 1, 'Backlog', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 'In Progress', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 'Done', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 2, 'To Review', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 2, 'Practiced', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (id, board_id, column_id, title, description, priority, due_date, position, created_at, updated_at) VALUES
  (1, 1, 3, 'Create database schema', 'Define boards, columns, and tasks with one-to-many relations.', 'HIGH', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 3, 'Build CRUD API', 'Implement create, read, update, and delete endpoints for all tables.', 'HIGH', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 2, 'Prepare project demo', 'Run the frontend and backend and show the Kanban workflow.', 'MEDIUM', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 2, 4, 'Review HTTP and REST', 'Revise status codes, JSON APIs, and client-server architecture.', 'MEDIUM', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 2, 5, 'Practice BFS and DFS', 'Implement both graph traversal algorithms from scratch.', 'LOW', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('boards', 'id'), 2, true);
SELECT setval(pg_get_serial_sequence('board_columns', 'id'), 5, true);
SELECT setval(pg_get_serial_sequence('tasks', 'id'), 5, true);
