import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { BoardColumn } from '@/types/board';
import type { TaskPriority } from '@/types/task';

type TaskDialogProps = {
  columnId: number | null;
  columns: BoardColumn[];
  description: string;
  isEditing: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onColumnChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: TaskPriority) => void;
  onSubmit: (event: FormEvent) => void;
  onTitleChange: (value: string) => void;
  priority: TaskPriority;
  title: string;
};

export function TaskDialog({
  columnId,
  columns,
  description,
  isEditing,
  isOpen,
  isSaving,
  onClose,
  onColumnChange,
  onDescriptionChange,
  onPriorityChange,
  onSubmit,
  onTitleChange,
  priority,
  title,
}: TaskDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={isEditing ? 'Edit task' : 'Create task'}
      description="Tasks are cards inside board columns."
      onClose={onClose}
    >
      <Form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="task-title">Title</Label>
          <Input id="task-title" value={title} onChange={(event) => onTitleChange(event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="task-column">Column</Label>
            <Select value={columnId ? String(columnId) : undefined} onValueChange={(value) => onColumnChange(Number(value))}>
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
            <Select value={priority} onValueChange={(value) => onPriorityChange(value as TaskPriority)}>
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner className="mr-2" /> : null}
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
