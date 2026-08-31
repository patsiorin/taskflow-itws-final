import { ConfirmDialog } from '@/components/ui/dialog';
import type { Board } from '@/types/board';

type BoardDeleteDialogProps = {
  board: Board | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BoardDeleteDialog({ board, onCancel, onConfirm }: BoardDeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={Boolean(board)}
      title="Delete board?"
      body={`This will delete "${board?.name ?? 'this board'}" and all of its columns and tasks.`}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
