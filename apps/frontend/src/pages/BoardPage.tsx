import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ColumnDialog } from '@/components/kanban/ColumnDialog';
import { KanbanDeleteDialog, type KanbanDeleteTarget } from '@/components/kanban/KanbanDeleteDialog';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { BoardService } from '@/services/board.service';
import { ColumnService } from '@/services/column.service';
import { TaskService } from '@/services/task.service';
import type { Board, BoardColumn, ReorderColumnInput } from '@/types/board';
import type { ReorderTaskInput, Task, TaskPriority } from '@/types/task';

type BoardPageProps = {
  boardId: number;
  navigate: (to: string) => void;
};

export function BoardPage({ boardId, navigate }: BoardPageProps) {
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KanbanDeleteTarget>(null);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [columnPosition, setColumnPosition] = useState(0);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskColumnId, setTaskColumnId] = useState<number | null>(null);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      toast.error('Unable to load board.');
    } finally {
      setIsLoadingBoard(false);
    }
  }

  function resetColumnForm() {
    setEditingColumn(null);
    setColumnName('');
    setColumnPosition(columns.length + 1);
  }

  function resetTaskForm() {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskColumnId(columns[0]?.id ?? null);
    setTaskPriority('MEDIUM');
  }

  function openCreateColumn() {
    resetColumnForm();
    setIsColumnDialogOpen(true);
  }

  function openCreateTask() {
    resetTaskForm();
    setIsTaskDialogOpen(true);
  }

  function startEditColumn(column: BoardColumn) {
    setEditingColumn(column);
    setColumnName(column.name);
    setColumnPosition(column.position);
    setIsColumnDialogOpen(true);
  }

  function startEditTask(task: Task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description ?? '');
    setTaskColumnId(task.columnId);
    setTaskPriority(task.priority);
    setIsTaskDialogOpen(true);
  }

  async function handleSaveColumn(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      setError(null);

      if (editingColumn) {
        await ColumnService.updateColumn(editingColumn.id, {
          name: columnName,
          position: columnPosition,
        });
        toast.success('Column updated.');
      } else {
        await ColumnService.createColumn({
          boardId,
          name: columnName,
          position: columnPosition,
        });
        toast.success('Column created.');
      }

      setIsColumnDialogOpen(false);
      resetColumnForm();
      await loadBoard();
    } catch {
      setError('Unable to save column.');
      toast.error('Unable to save column.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveTask(event: FormEvent) {
    event.preventDefault();

    if (!taskColumnId) {
      setError('Create a column before adding tasks.');
      toast.error('Create a column before adding tasks.');
      return;
    }

    setIsSaving(true);

    try {
      setError(null);

      if (editingTask) {
        await TaskService.updateTask(editingTask.id, {
          title: taskTitle,
          description: taskDescription,
          columnId: taskColumnId,
          priority: taskPriority,
        });
        toast.success('Task updated.');
      } else {
        await TaskService.createTask({
          boardId,
          columnId: taskColumnId,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
        });
        toast.success('Task created.');
      }

      setIsTaskDialogOpen(false);
      resetTaskForm();
      await loadBoard();
    } catch {
      setError('Unable to save task.');
      toast.error('Unable to save task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReorderTasks(nextTasks: ReorderTaskInput[]) {
    setActiveBoard((board) => {
      if (!board?.columns) {
        return board;
      }

      const existingTasks = new Map(board.columns.flatMap((column) => column.tasks ?? []).map((task) => [task.id, task]));

      return {
        ...board,
        columns: board.columns.map((column) => ({
          ...column,
          tasks: nextTasks
            .filter((task) => task.columnId === column.id)
            .map((task) => {
              const existingTask = existingTasks.get(task.id);
              return existingTask ? { ...existingTask, columnId: task.columnId, position: task.position } : null;
            })
            .filter((task): task is Task => Boolean(task)),
        })),
      };
    });

    try {
      setError(null);
      await TaskService.reorderTasks(boardId, nextTasks);
      toast.success('Task order saved.');
    } catch {
      setError('Unable to save task order.');
      toast.error('Unable to save task order.');
      await loadBoard();
    }
  }

  async function handleReorderColumns(nextColumns: ReorderColumnInput[]) {
    setActiveBoard((board) => {
      if (!board?.columns) {
        return board;
      }

      const positionByColumnId = new Map(nextColumns.map((column) => [column.id, column.position]));
      const orderedColumns = [...board.columns]
        .map((column) => ({
          ...column,
          position: positionByColumnId.get(column.id) ?? column.position,
        }))
        .sort((left, right) => left.position - right.position);

      return { ...board, columns: orderedColumns };
    });

    try {
      setError(null);
      await ColumnService.reorderColumns(boardId, nextColumns);
      toast.success('Column order saved.');
    } catch {
      setError('Unable to save column order.');
      toast.error('Unable to save column order.');
      await loadBoard();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setError(null);

      if (deleteTarget.kind === 'column') {
        await ColumnService.deleteColumn(deleteTarget.item.id);
        toast.success('Column deleted.');
      } else {
        await TaskService.deleteTask(deleteTarget.item.id);
        toast.success('Task deleted.');
      }

      setDeleteTarget(null);
      await loadBoard();
    } catch {
      setError(deleteTarget.kind === 'column' ? 'Unable to delete column.' : 'Unable to delete task.');
      toast.error(deleteTarget.kind === 'column' ? 'Unable to delete column.' : 'Unable to delete task.');
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'Boards', onClick: () => navigate('/') },
                { label: activeBoard?.name ?? 'Board' },
              ]}
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">{activeBoard?.name ?? 'Board'}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{activeBoard?.description ?? 'Columns and tasks'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Boards
            </Button>
            <Button variant="secondary" onClick={openCreateColumn}>
              <Plus className="mr-2 h-4 w-4" />
              Column
            </Button>
            <Button onClick={openCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Task
            </Button>
          </div>
        </header>

        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <Card>
          <CardHeader>
            <CardTitle>Board Workspace</CardTitle>
            <CardDescription>Manage columns and task cards for this board.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBoard ? (
              <div className="grid gap-4 lg:grid-cols-4">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
              </div>
            ) : (
              <KanbanBoard
                columns={columns}
                isLoading={isLoadingBoard}
                onDeleteColumn={(column) => setDeleteTarget({ kind: 'column', item: column })}
                onDeleteTask={(task) => setDeleteTarget({ kind: 'task', item: task })}
                onEditColumn={startEditColumn}
                onEditTask={startEditTask}
                onReorderColumns={handleReorderColumns}
                onReorderTasks={handleReorderTasks}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ColumnDialog
        isEditing={Boolean(editingColumn)}
        isOpen={isColumnDialogOpen}
        isSaving={isSaving}
        name={columnName}
        position={columnPosition}
        onClose={() => setIsColumnDialogOpen(false)}
        onNameChange={setColumnName}
        onPositionChange={setColumnPosition}
        onSubmit={handleSaveColumn}
      />

      <TaskDialog
        columnId={taskColumnId}
        columns={columns}
        description={taskDescription}
        isEditing={Boolean(editingTask)}
        isOpen={isTaskDialogOpen}
        isSaving={isSaving}
        priority={taskPriority}
        title={taskTitle}
        onClose={() => setIsTaskDialogOpen(false)}
        onColumnChange={setTaskColumnId}
        onDescriptionChange={setTaskDescription}
        onPriorityChange={setTaskPriority}
        onSubmit={handleSaveTask}
        onTitleChange={setTaskTitle}
      />

      <KanbanDeleteDialog target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </main>
  );
}
