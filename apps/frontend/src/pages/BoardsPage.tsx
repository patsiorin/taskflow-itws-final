import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BoardService } from '@/services/board.service';
import type { Board } from '@/types/board';

type BoardsPageProps = {
  navigate: (to: string) => void;
};

export function BoardsPage({ navigate }: BoardsPageProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      setError(null);
      setIsLoading(true);
      setBoards(await BoardService.getBoards());
    } catch {
      setError('Unable to load boards.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingBoard(null);
    setName('');
    setDescription('');
    setColor('#2563eb');
  }

  function startEdit(board: Board) {
    setEditingBoard(board);
    setName(board.name);
    setDescription(board.description ?? '');
    setColor(board.color);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setError(null);

      if (editingBoard) {
        await BoardService.updateBoard(editingBoard.id, { name, description, color });
      } else {
        await BoardService.createBoard({ name, description, color });
      }

      resetForm();
      await loadBoards();
    } catch {
      setError('Unable to save board.');
    }
  }

  async function handleDelete(board: Board) {
    if (!window.confirm(`Delete "${board.name}" and its tasks?`)) {
      return;
    }

    try {
      setError(null);
      await BoardService.deleteBoard(board.id);
      await loadBoards();
    } catch {
      setError('Unable to delete board.');
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-sm font-medium text-muted-foreground">ITWS Final Project</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">TaskFlow Boards</h1>
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <Card className="p-4">
          <form className="grid gap-3 lg:grid-cols-[1fr_1.5fr_auto_auto]" onSubmit={handleSubmit}>
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              placeholder="Board name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <input
              className="h-10 w-20 rounded-md border border-border bg-background px-2"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Board color"
            />
            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                {editingBoard ? 'Save' : 'Create'}
              </Button>
              {editingBoard ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <section className="grid gap-3 md:grid-cols-2">
          {isLoading ? <Card className="p-4 text-sm text-muted-foreground">Loading boards...</Card> : null}

          {!isLoading && boards.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">Create a board to start planning.</Card>
          ) : null}

          {boards.map((board) => (
            <Card key={board.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} />
                    <h2 className="text-lg font-semibold">{board.name}</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{board.description ?? 'No description'}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {board._count?.columns ?? 0} columns · {board._count?.tasks ?? 0} tasks
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" title="Edit board" onClick={() => startEdit(board)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" title="Delete board" onClick={() => handleDelete(board)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" title="Open board" onClick={() => navigate(`/boards/${board.id}`)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}

