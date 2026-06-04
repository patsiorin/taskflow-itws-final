import { ArrowRight, CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import type { BoardColumn } from "@/types/board";
import type { Task } from "@/types/task";

const priorityClass = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

type KanbanBoardProps = {
  columns: BoardColumn[];
  isLoading: boolean;
  savingTaskId: number | null;
  onDeleteColumn: (column: BoardColumn) => void;
  onDeleteTask: (task: Task) => void;
  onEditColumn: (column: BoardColumn) => void;
  onEditTask: (task: Task) => void;
  onMoveTask: (task: Task, columnId: number) => void;
};

function getNextColumn(columns: BoardColumn[], columnId: number) {
  const index = columns.findIndex((column) => column.id === columnId);
  return columns[index + 1] ?? null;
}

function formatDueDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function KanbanBoard({
  columns,
  isLoading,
  savingTaskId,
  onDeleteColumn,
  onDeleteTask,
  onEditColumn,
  onEditTask,
  onMoveTask,
}: KanbanBoardProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = column.tasks ?? [];

        return (
          <div
            key={column.id}
            className="flex min-h-[420px] flex-col rounded-lg border border-border bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-sm font-semibold">{column.name}</h2>
                <Badge>{columnTasks.length}</Badge>
              </div>
              <div className="flex gap-1">
                <Tooltip content="Edit column">
                  <Button size="icon" variant="ghost" onClick={() => onEditColumn(column)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete column">
                  <Button size="icon" variant="ghost" onClick={() => onDeleteColumn(column)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
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
                    const nextColumn = getNextColumn(columns, task.columnId);

                    return (
                      <Card key={task.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-5">
                            {task.title}
                          </h3>
                          <Badge
                            className={priorityClass[task.priority]}
                            variant={task.priority === "HIGH" ? "danger" : task.priority === "LOW" ? "success" : "warning"}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {task.description ?? "No description"}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {formatDueDate(task.dueDate)}
                          </div>

                          <div className="flex gap-1">
                            <Tooltip content="Edit task">
                              <Button size="icon" variant="ghost" onClick={() => onEditTask(task)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete task">
                              <Button size="icon" variant="ghost" onClick={() => onDeleteTask(task)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            {nextColumn ? (
                              <Tooltip content={`Move to ${nextColumn.name}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={savingTaskId === task.id}
                                  onClick={() => onMoveTask(task, nextColumn.id)}
                                >
                                  {savingTaskId === task.id ? (
                                    <Spinner className="mr-2 h-3.5 w-3.5" />
                                  ) : (
                                    <ArrowRight className="mr-2 h-3.5 w-3.5" />
                                  )}
                                  {nextColumn.name}
                                </Button>
                              </Tooltip>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                : null}
            </div>
          </div>
        );
      })}
      {!isLoading && columns.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground lg:col-span-4">
          Add a column to start organizing tasks.
        </Card>
      ) : null}
    </section>
  );
}
