import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import type { Board } from '@/types/board';

type BoardRowProps = {
  board: Board;
  onDelete: (board: Board) => void;
  onEdit: (board: Board) => void;
  onOpen: (board: Board) => void;
};

export function BoardRow({ board, onDelete, onEdit, onOpen }: BoardRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `board-${board.id}`,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
  };

  return (
    <TableRow ref={setNodeRef} data-board-id={board.id} className="board-row" style={style}>
      <TableCell>
        <button
          type="button"
          className="cursor-grab rounded border border-transparent p-1 text-muted-foreground hover:border-border hover:bg-muted active:cursor-grabbing"
          data-drag-handle="board"
          aria-label={`Move ${board.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
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
            <Button size="icon" variant="outline" onClick={() => onEdit(board)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete board">
            <Button size="icon" variant="outline" onClick={() => onDelete(board)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Open board">
            <Button size="icon" onClick={() => onOpen(board)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
