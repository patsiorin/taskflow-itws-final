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
