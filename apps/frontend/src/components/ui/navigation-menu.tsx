import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type NavigationMenuProps = {
  children: ReactNode;
  className?: string;
};

export function NavigationMenu({ children, className }: NavigationMenuProps) {
  return <nav className={cn('flex items-center gap-1', className)}>{children}</nav>;
}

type NavigationMenuItemProps = {
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

export function NavigationMenuItem({ children, isActive, onClick }: NavigationMenuItemProps) {
  return (
    <button
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        isActive && 'bg-muted text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

