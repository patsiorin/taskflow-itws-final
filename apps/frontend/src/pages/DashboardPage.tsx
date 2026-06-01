import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { BoardService } from '@/services/board.service';
import { TaskService } from '@/services/task.service';
import type { Board } from '@/types/board';
import type { Task, TaskStatus } from '@/types/task';

export function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tasks = useMemo(() => activeBoard?.tasks ?? [], [activeBoard]);

  useEffect(() => {
    let isMounted = true;

    async function loadBoards() {
      try {
        setError(null);
        setIsLoadingBoards(true);
        const nextBoards = await BoardService.getBoards();

        if (!isMounted) {
          return;
        }

        setBoards(nextBoards);
        setSelectedBoardId((currentBoardId) => currentBoardId ?? nextBoards[0]?.id ?? null);
      } catch {
        if (isMounted) {
          setError('Unable to load boards.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingBoards(false);
        }
      }
    }

    loadBoards();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBoardId) {
      setActiveBoard(null);
      return;
    }

    let isMounted = true;
    const boardId = selectedBoardId;

    async function loadBoard() {
      try {
        setError(null);
        setIsLoadingBoard(true);
        const board = await BoardService.getBoard(boardId);

        if (isMounted) {
          setActiveBoard(board);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load the selected board.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingBoard(false);
        }
      }
    }

    loadBoard();

    return () => {
      isMounted = false;
    };
  }, [selectedBoardId]);

  async function handleMoveTask(task: Task, status: TaskStatus) {
    try {
      setError(null);
      setMovingTaskId(task.id);
      const updatedTask = await TaskService.updateTask(task.id, { status });

      setActiveBoard((board) => {
        if (!board?.tasks) {
          return board;
        }

        return {
          ...board,
          tasks: board.tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
        };
      });
    } catch {
      setError('Unable to update task status.');
    } finally {
      setMovingTaskId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ITWS Final Project</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">TaskFlow Kanban</h1>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New task
          </Button>
        </header>

        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{activeBoard?.name ?? 'Boards'}</h2>
            <p className="text-sm text-muted-foreground">
              {activeBoard?.description ?? `${tasks.length} tasks loaded from the API`}
            </p>
          </div>

          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            disabled={isLoadingBoards || boards.length === 0}
            value={selectedBoardId ?? ''}
            onChange={(event) => setSelectedBoardId(Number(event.target.value))}
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </section>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <KanbanBoard
          isLoading={isLoadingBoards || isLoadingBoard}
          movingTaskId={movingTaskId}
          tasks={tasks}
          onMoveTask={handleMoveTask}
        />
      </div>
    </main>
  );
}
