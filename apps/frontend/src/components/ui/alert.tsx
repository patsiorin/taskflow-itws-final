import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive' | 'success';
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        variant === 'default' && 'border-border bg-card text-card-foreground',
        variant === 'destructive' && 'border-destructive/40 bg-destructive/10 text-destructive',
        variant === 'success' && 'border-accent/40 bg-accent/15 text-accent-foreground',
        className,
      )}
      role="alert"
      {...props}
    />
  );
}

