import { ArrowRight, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Task, TaskStatus } from '@/types/task';

const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: 'TODO', label: 'Todo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'DONE', label: 'Done' },
];

const priorityClass = {
  LOW: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-rose-50 text-rose-700',
};

type KanbanBoardProps = {
  isLoading: boolean;
  movingTaskId: number | null;
  tasks: Task[];
  onMoveTask: (task: Task, status: TaskStatus) => void;
};

function getNextStatus(status: TaskStatus) {
  const index = columns.findIndex((column) => column.status === status);
  return columns[index + 1] ?? null;
}

function formatDueDate(value: string | null) {
  if (!value) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

export function KanbanBoard({ isLoading, movingTaskId, tasks, onMoveTask }: KanbanBoardProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <div key={column.status} className="flex min-h-[420px] flex-col rounded-lg border border-border bg-muted/40">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">{column.label}</h2>
              <Badge>{columnTasks.length}</Badge>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-3">
              {isLoading ? (
                <Card className="p-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="mt-3 h-3 w-full rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </Card>
              ) : null}

              {!isLoading && columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No tasks
                </div>
              ) : null}

              {!isLoading
                ? columnTasks.map((task) => {
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <Card key={task.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
                          <Badge className={priorityClass[task.priority]}>{task.priority}</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {task.description ?? 'No description'}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {formatDueDate(task.dueDate)}
                          </div>

                          {nextStatus ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={movingTaskId === task.id}
                              onClick={() => onMoveTask(task, nextStatus.status)}
                            >
                              <ArrowRight className="mr-2 h-3.5 w-3.5" />
                              {nextStatus.label}
                            </Button>
                          ) : null}
                        </div>
                      </Card>
                    );
                  })
                : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
