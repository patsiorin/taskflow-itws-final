import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog, Dialog, DialogActions } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { BoardService } from '@/services/board.service';
import { ColumnService } from '@/services/column.service';
import { TaskService } from '@/services/task.service';
import type { Board, BoardColumn } from '@/types/board';
import type { Task, TaskPriority } from '@/types/task';

type BoardPageProps = {
  boardId: number;
  navigate: (to: string) => void;
};

type DeleteTarget =
  | { kind: 'column'; item: BoardColumn }
  | { kind: 'task'; item: Task }
  | null;

export function BoardPage({ boardId, navigate }: BoardPageProps) {
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
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

  async function handleMoveTask(task: Task, columnId: number, position: number) {
    try {
      setError(null);
      await TaskService.updateTask(task.id, { columnId, position });
      toast.success('Task moved.');
      await loadBoard();
    } catch {
      setError('Unable to move task.');
      toast.error('Unable to move task.');
    }
  }

  async function handleReorderColumns(nextColumns: BoardColumn[]) {
    setActiveBoard((board) => (board ? { ...board, columns: nextColumns } : board));

    try {
      setError(null);
      await Promise.all(
        nextColumns.map((column) => ColumnService.updateColumn(column.id, { position: column.position })),
      );
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
                onMoveTask={handleMoveTask}
                onReorderColumns={handleReorderColumns}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={isColumnDialogOpen}
        title={editingColumn ? 'Edit column' : 'Create column'}
        description="Columns define the stages inside a board."
        onClose={() => setIsColumnDialogOpen(false)}
      >
        <Form onSubmit={handleSaveColumn}>
          <div className="grid gap-2">
            <Label htmlFor="column-name">Name</Label>
            <Input id="column-name" value={columnName} onChange={(event) => setColumnName(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="column-position">Position</Label>
            <Input
              id="column-position"
              min={0}
              type="number"
              value={columnPosition}
              onChange={(event) => setColumnPosition(Number(event.target.value))}
            />
          </div>
          <DialogActions>
            <Button type="button" variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner className="mr-2" /> : null}
              {editingColumn ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

      <Dialog
        isOpen={isTaskDialogOpen}
        title={editingTask ? 'Edit task' : 'Create task'}
        description="Tasks are cards inside board columns."
        onClose={() => setIsTaskDialogOpen(false)}
      >
        <Form onSubmit={handleSaveTask}>
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-column">Column</Label>
              <Select
                value={taskColumnId ? String(taskColumnId) : undefined}
                onValueChange={(value) => setTaskColumnId(Number(value))}
              >
                <SelectTrigger id="task-column">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={String(column.id)}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as TaskPriority)}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogActions>
            <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner className="mr-2" /> : null}
              {editingTask ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.kind === 'column' ? 'Delete column?' : 'Delete task?'}
        body={
          deleteTarget?.kind === 'column'
            ? `This will delete "${deleteTarget.item.name}" and all tasks inside it.`
            : `This will delete "${deleteTarget?.item.title ?? 'this task'}".`
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
