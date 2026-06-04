import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border-border bg-popover text-popover-foreground',
          success: 'border-accent',
          error: 'border-destructive',
        },
      }}
    />
  );
}

export { toast };
