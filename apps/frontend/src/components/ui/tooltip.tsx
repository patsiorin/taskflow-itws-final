import type { ReactNode } from 'react';

type TooltipProps = {
  children: ReactNode;
  content: string;
};

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm group-hover:block">
        {content}
      </span>
    </span>
  );
}

