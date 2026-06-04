import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-muted-foreground',
        success: 'border-transparent bg-accent text-accent-foreground',
        warning: 'border-transparent bg-secondary text-secondary-foreground',
        danger: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}
