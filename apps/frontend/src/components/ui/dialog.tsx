import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DialogProps = {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
};

export function Dialog({ children, description, isOpen, title, onClose }: DialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  body: string;
  confirmLabel?: string;
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  body,
  confirmLabel = 'Delete',
  isOpen,
  title,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} title={title} description={body} onClose={onCancel}>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export function DialogActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />;
}
