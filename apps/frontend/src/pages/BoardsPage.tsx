import { FormEvent, useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { BoardDeleteDialog } from '@/components/boards/BoardDeleteDialog';
import { BoardDialog } from '@/components/boards/BoardDialog';
import { BoardRow } from '@/components/boards/BoardRow';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { BoardService } from '@/services/board.service';
import type { Board, ReorderBoardInput } from '@/types/board';

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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
        await BoardService.createBoard({ name, description, color, position: boards.length + 1 });
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

  async function saveBoardOrder(nextOrder: ReorderBoardInput[]) {
    const positionByBoardId = new Map(nextOrder.map((board) => [board.id, board.position]));
    const nextBoards = [...boards]
      .map((board) => ({
        ...board,
        position: positionByBoardId.get(board.id) ?? board.position,
      }))
      .sort((left, right) => left.position - right.position);

    setBoards(nextBoards);

    try {
      setError(null);
      await BoardService.reorderBoards(nextOrder);
      toast.success('Board order saved.');
    } catch {
      setError('Unable to save board order.');
      toast.error('Unable to save board order.');
      await loadBoards();
    }
  }

  function handleBoardDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = getNumericId(active.id, 'board-');
    const overId = getNumericId(over.id, 'board-');
    const oldIndex = boards.findIndex((board) => board.id === activeId);
    const newIndex = boards.findIndex((board) => board.id === overId);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const nextBoards = arrayMove(boards, oldIndex, newIndex);
    void saveBoardOrder(nextBoards.map((board, index) => ({ id: board.id, position: index + 1 })));
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBoardDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12" />
                        <TableHead>Board</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Columns</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <SortableContext
                      items={boards.map((board) => `board-${board.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <TableBody>
                        {boards.map((board) => (
                          <BoardRow
                            key={board.id}
                            board={board}
                            onDelete={setDeletingBoard}
                            onEdit={openEditForm}
                            onOpen={(selectedBoard) => navigate(`/boards/${selectedBoard.id}`)}
                          />
                        ))}
                      </TableBody>
                    </SortableContext>
                  </Table>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BoardDialog
        color={color}
        description={description}
        isEditing={Boolean(editingBoard)}
        isOpen={isFormOpen}
        isSaving={isSaving}
        name={name}
        onClose={() => setIsFormOpen(false)}
        onColorChange={setColor}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onSubmit={handleSubmit}
      />

      <BoardDeleteDialog board={deletingBoard} onCancel={() => setDeletingBoard(null)} onConfirm={confirmDelete} />
    </main>
  );
}

function getNumericId(id: string | number, prefix: string) {
  return Number(String(id).replace(prefix, ''));
}
