import { ConfirmDialog } from '@/components/ui/dialog';
import type { BoardColumn } from '@/types/board';
import type { Task } from '@/types/task';

export type KanbanDeleteTarget =
  | { kind: 'column'; item: BoardColumn }
  | { kind: 'task'; item: Task }
  | null;

type KanbanDeleteDialogProps = {
  target: KanbanDeleteTarget;
  onCancel: () => void;
  onConfirm: () => void;
};

export function KanbanDeleteDialog({ target, onCancel, onConfirm }: KanbanDeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={Boolean(target)}
      title={target?.kind === 'column' ? 'Delete column?' : 'Delete task?'}
      body={
        target?.kind === 'column'
          ? `This will delete "${target.item.name}" and all tasks inside it.`
          : `This will delete "${target?.item.title ?? 'this task'}".`
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
