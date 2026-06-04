import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog, Dialog, DialogActions } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Tooltip } from '@/components/ui/tooltip';
import { BoardService } from '@/services/board.service';
import type { Board } from '@/types/board';

type BoardsPageProps = {
  navigate: (to: string) => void;
};

export function BoardsPage({ navigate }: BoardsPageProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#facc15');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      toast.error('Unable to load boards.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingBoard(null);
    setName('');
    setDescription('');
    setColor('#facc15');
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(board: Board) {
    setEditingBoard(board);
    setName(board.name);
    setDescription(board.description ?? '');
    setColor(board.color);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      setError(null);

      if (editingBoard) {
        await BoardService.updateBoard(editingBoard.id, { name, description, color });
        toast.success('Board updated.');
      } else {
        await BoardService.createBoard({ name, description, color });
        toast.success('Board created.');
      }

      setIsFormOpen(false);
      resetForm();
      await loadBoards();
    } catch {
      setError('Unable to save board.');
      toast.error('Unable to save board.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingBoard) {
      return;
    }

    try {
      setError(null);
      await BoardService.deleteBoard(deletingBoard.id);
      toast.success('Board deleted.');
      setDeletingBoard(null);
      await loadBoards();
    } catch {
      setError('Unable to delete board.');
      toast.error('Unable to delete board.');
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ITWS Final Project</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Boards</h1>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            New board
          </Button>
        </header>

        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Each board is a project with its own columns and tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : boards.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Create a board to start planning.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Board</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boards.map((board) => (
                      <TableRow key={board.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} />
                            {board.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[340px] text-muted-foreground">
                          {board.description ?? 'No description'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">{board._count?.columns ?? 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">{board._count?.tasks ?? 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Tooltip content="Edit board">
                              <Button size="icon" variant="outline" onClick={() => openEditForm(board)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete board">
                              <Button size="icon" variant="outline" onClick={() => setDeletingBoard(board)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Open board">
                              <Button size="icon" onClick={() => navigate(`/boards/${board.id}`)}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={isFormOpen}
        title={editingBoard ? 'Edit board' : 'Create board'}
        description="Boards represent projects or workspaces."
        onClose={() => setIsFormOpen(false)}
      >
        <Form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="board-name">Name</Label>
            <Input id="board-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="board-description">Description</Label>
            <Input
              id="board-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="board-color">Color</Label>
            <Input id="board-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </div>
          <DialogActions>
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner className="mr-2" /> : null}
              {editingBoard ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deletingBoard)}
        title="Delete board?"
        body={`This will delete "${deletingBoard?.name ?? 'this board'}" and all of its columns and tasks.`}
        onCancel={() => setDeletingBoard(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
