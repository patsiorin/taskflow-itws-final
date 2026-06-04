import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BoardService } from '@/services/board.service';
import { ColumnService } from '@/services/column.service';
import { TaskService } from '@/services/task.service';
import type { Board, BoardColumn } from '@/types/board';
import type { Task, TaskPriority } from '@/types/task';

type BoardPageProps = {
  boardId: number;
  navigate: (to: string) => void;
};

export function BoardPage({ boardId, navigate }: BoardPageProps) {
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [columnName, setColumnName] = useState('');
  const [columnPosition, setColumnPosition] = useState(0);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskColumnId, setTaskColumnId] = useState<number | null>(null);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => activeBoard?.columns ?? [], [activeBoard]);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  async function loadBoard() {
    try {
      setError(null);
      setIsLoadingBoard(true);
      const board = await BoardService.getBoard(boardId);
      setActiveBoard(board);
      setTaskColumnId((currentColumnId) => currentColumnId ?? board.columns?.[0]?.id ?? null);
    } catch {
      setError('Unable to load board.');
    } finally {
      setIsLoadingBoard(false);
    }
  }

  function resetColumnForm() {
    setEditingColumn(null);
    setColumnName('');
    setColumnPosition(columns.length);
  }

  function resetTaskForm() {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskColumnId(columns[0]?.id ?? null);
    setTaskPriority('MEDIUM');
  }

  function startEditColumn(column: BoardColumn) {
    setEditingColumn(column);
    setColumnName(column.name);
    setColumnPosition(column.position);
  }

  function startEditTask(task: Task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description ?? '');
    setTaskColumnId(task.columnId);
    setTaskPriority(task.priority);
  }

  async function handleSaveColumn(event: FormEvent) {
    event.preventDefault();

    try {
      setError(null);

      if (editingColumn) {
        await ColumnService.updateColumn(editingColumn.id, {
          name: columnName,
          position: columnPosition,
        });
      } else {
        await ColumnService.createColumn({
          boardId,
          name: columnName,
          position: columnPosition,
        });
      }

      resetColumnForm();
      await loadBoard();
    } catch {
      setError('Unable to save column.');
    }
  }

  async function handleDeleteColumn(column: BoardColumn) {
    if (!window.confirm(`Delete "${column.name}" and its tasks?`)) {
      return;
    }

    try {
      setError(null);
      await ColumnService.deleteColumn(column.id);
      await loadBoard();
    } catch {
      setError('Unable to delete column.');
    }
  }

  async function handleSaveTask(event: FormEvent) {
    event.preventDefault();

    if (!taskColumnId) {
      setError('Create a column before adding tasks.');
      return;
    }

    try {
      setError(null);

      if (editingTask) {
        await TaskService.updateTask(editingTask.id, {
          title: taskTitle,
          description: taskDescription,
          columnId: taskColumnId,
          priority: taskPriority,
        });
      } else {
        await TaskService.createTask({
          boardId,
          columnId: taskColumnId,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
        });
      }

      resetTaskForm();
      await loadBoard();
    } catch {
      setError('Unable to save task.');
    }
  }

  async function handleMoveTask(task: Task, columnId: number) {
    try {
      setError(null);
      setSavingTaskId(task.id);
      await TaskService.updateTask(task.id, { columnId });
      await loadBoard();
    } catch {
      setError('Unable to move task.');
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    try {
      setError(null);
      setSavingTaskId(task.id);
      await TaskService.deleteTask(task.id);
      await loadBoard();
    } catch {
      setError('Unable to delete task.');
    } finally {
      setSavingTaskId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Button variant="ghost" className="mb-2 px-0" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Boards
            </Button>
            <h1 className="text-3xl font-semibold tracking-normal">{activeBoard?.name ?? 'Board'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{activeBoard?.description ?? 'Columns and tasks'}</p>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Columns</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={handleSaveColumn}>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                placeholder="Column name"
                value={columnName}
                onChange={(event) => setColumnName(event.target.value)}
                required
              />
              <input
                className="h-10 w-24 rounded-md border border-border bg-background px-3 text-sm"
                min={0}
                type="number"
                value={columnPosition}
                onChange={(event) => setColumnPosition(Number(event.target.value))}
              />
              <div className="flex gap-2">
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingColumn ? 'Save' : 'Add'}
                </Button>
                {editingColumn ? (
                  <Button type="button" variant="outline" onClick={resetColumnForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <form className="mt-4 grid gap-3" onSubmit={handleSaveTask}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  required
                />
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={taskColumnId ?? ''}
                  onChange={(event) => setTaskColumnId(Number(event.target.value))}
                  required
                >
                  <option value="" disabled>
                    Select column
                  </option>
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  placeholder="Description"
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                />
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={taskPriority}
                  onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <div className="flex gap-2">
                  <Button type="submit">{editingTask ? 'Save' : 'Add task'}</Button>
                  {editingTask ? (
                    <Button type="button" variant="outline" onClick={resetTaskForm}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </form>
          </Card>
        </section>

        <KanbanBoard
          columns={columns}
          isLoading={isLoadingBoard}
          savingTaskId={savingTaskId}
          onDeleteColumn={handleDeleteColumn}
          onDeleteTask={handleDeleteTask}
          onEditColumn={startEditColumn}
          onEditTask={startEditTask}
          onMoveTask={handleMoveTask}
        />
      </div>
    </main>
  );
}

