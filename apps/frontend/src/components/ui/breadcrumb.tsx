import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

type BreadcrumbProps = {
  items: Array<{
    label: string;
    onClick?: () => void;
  }>;
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {item.onClick ? (
            <button className="hover:text-foreground" onClick={item.onClick} type="button">
              {item.label}
            </button>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

