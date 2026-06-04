import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type ToastKind = 'success' | 'error';

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

let listeners: Array<(toast: Toast) => void> = [];
let nextId = 1;

function publish(kind: ToastKind, message: string) {
  const toast = { id: nextId++, kind, message };
  listeners.forEach((listener) => listener(toast));
}

export const toast = {
  success(message: string) {
    publish('success', message);
  },
  error(message: string) {
    publish('error', message);
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handleToast(toast: Toast) {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3500);
    }

    listeners = [...listeners, handleToast];
    return () => {
      listeners = listeners.filter((listener) => listener !== handleToast);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((item) => {
        const Icon = item.kind === 'success' ? CheckCircle2 : XCircle;

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg"
          >
            <Icon className={item.kind === 'success' ? 'h-5 w-5 text-accent' : 'h-5 w-5 text-destructive'} />
            <span className="flex-1">{item.message}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setToasts((current) => current.filter((toast) => toast.id !== item.id))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

