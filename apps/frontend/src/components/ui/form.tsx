import type { FormHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Form({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form className={cn('grid gap-4', className)} {...props} />;
}

