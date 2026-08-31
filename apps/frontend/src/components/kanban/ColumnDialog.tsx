import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type ColumnDialogProps = {
  isEditing: boolean;
  isOpen: boolean;
  isSaving: boolean;
  name: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onPositionChange: (value: number) => void;
  onSubmit: (event: FormEvent) => void;
  position: number;
};

export function ColumnDialog({
  isEditing,
  isOpen,
  isSaving,
  name,
  onClose,
  onNameChange,
  onPositionChange,
  onSubmit,
  position,
}: ColumnDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={isEditing ? 'Edit column' : 'Create column'}
      description="Columns define the stages inside a board."
      onClose={onClose}
    >
      <Form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="column-name">Name</Label>
          <Input id="column-name" value={name} onChange={(event) => onNameChange(event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="column-position">Position</Label>
          <Input
            id="column-position"
            min={1}
            type="number"
            value={position}
            onChange={(event) => onPositionChange(Number(event.target.value))}
          />
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
