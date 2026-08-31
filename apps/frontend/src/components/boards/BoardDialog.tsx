import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type BoardDialogProps = {
  color: string;
  description: string;
  isEditing: boolean;
  isOpen: boolean;
  isSaving: boolean;
  name: string;
  onClose: () => void;
  onColorChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function BoardDialog({
  color,
  description,
  isEditing,
  isOpen,
  isSaving,
  name,
  onClose,
  onColorChange,
  onDescriptionChange,
  onNameChange,
  onSubmit,
}: BoardDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title={isEditing ? 'Edit board' : 'Create board'}
      description="Boards represent projects or workspaces."
      onClose={onClose}
    >
      <Form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="board-name">Name</Label>
          <Input id="board-name" value={name} onChange={(event) => onNameChange(event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="board-description">Description</Label>
          <Input
            id="board-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="board-color">Color</Label>
          <Input id="board-color" type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
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
