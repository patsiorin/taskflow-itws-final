import { useEffect, useMemo, useRef } from "react";
import dragula from "dragula";
import type { Drake } from "dragula";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { BoardColumn } from "@/types/board";
import type { Task } from "@/types/task";

const priorityClass = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

const interactiveSelector = "button, a, input, textarea, select, [role='button']";

type KanbanBoardProps = {
  columns: BoardColumn[];
  isLoading: boolean;
  onDeleteColumn: (column: BoardColumn) => void;
  onDeleteTask: (task: Task) => void;
  onEditColumn: (column: BoardColumn) => void;
  onEditTask: (task: Task) => void;
  onMoveTask: (task: Task, columnId: number, position: number) => void;
  onReorderColumns: (columns: BoardColumn[]) => void;
};

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
  onDeleteColumn,
  onDeleteTask,
  onEditColumn,
  onEditTask,
  onMoveTask,
  onReorderColumns,
}: KanbanBoardProps) {
  const columnsContainerRef = useRef<HTMLElement | null>(null);
  const containerRefs = useRef(new Map<number, HTMLDivElement>());
  const columnById = useMemo(() => {
    return new Map(columns.map((column) => [column.id, column]));
  }, [columns]);
  const taskById = useMemo(() => {
    return new Map(columns.flatMap((column) => column.tasks ?? []).map((task) => [task.id, task]));
  }, [columns]);

  useEffect(() => {
    if (isLoading || columns.length === 0) {
      return;
    }

    const containers = columns
      .map((column) => containerRefs.current.get(column.id))
      .filter((container): container is HTMLDivElement => Boolean(container));

    if (containers.length === 0) {
      return;
    }

    const drake: Drake = dragula(containers, {
      revertOnSpill: true,
      moves: (element, _source, handle) => {
        return Boolean(element?.hasAttribute("data-task-id") && !handle?.closest(interactiveSelector));
      },
      accepts: (element, target) => {
        return Boolean(element?.hasAttribute("data-task-id") && target?.hasAttribute("data-column-id"));
      },
    });

    drake.on("drop", (element, target) => {
      const taskId = Number((element as HTMLElement).dataset.taskId);
      const columnId = Number((target as HTMLElement | null)?.dataset.columnId);
      const taskCards = Array.from(target?.querySelectorAll<HTMLElement>("[data-task-id]") ?? []);
      const position = taskCards.findIndex((taskCard) => Number(taskCard.dataset.taskId) === taskId) + 1;
      const task = taskById.get(taskId);

      if (!task || !columnId || position < 1) {
        drake.cancel(true);
        return;
      }

      onMoveTask(task, columnId, position);
    });

    return () => drake.destroy();
  }, [columns, isLoading, onMoveTask, taskById]);

  useEffect(() => {
    if (isLoading || columns.length === 0 || !columnsContainerRef.current) {
      return;
    }

    const drake: Drake = dragula([columnsContainerRef.current], {
      direction: "horizontal",
      revertOnSpill: true,
      moves: (element, _source, handle) => {
        return Boolean(
          element?.hasAttribute("data-column-card-id") &&
            !handle?.closest(interactiveSelector) &&
            !handle?.closest("[data-task-id]"),
        );
      },
    });

    drake.on("drop", (_element, target) => {
      const orderedColumns = Array.from(target?.querySelectorAll<HTMLElement>("[data-column-card-id]") ?? [])
        .map((columnElement, index) => {
          const column = columnById.get(Number(columnElement.dataset.columnCardId));
          return column ? { ...column, position: index + 1 } : null;
        })
        .filter((column): column is BoardColumn => Boolean(column));

      if (orderedColumns.length !== columns.length) {
        drake.cancel(true);
        return;
      }

      onReorderColumns(orderedColumns);
    });

    return () => drake.destroy();
  }, [columnById, columns, isLoading, onReorderColumns]);

  function setContainerRef(columnId: number) {
    return (node: HTMLDivElement | null) => {
      if (node) {
        containerRefs.current.set(columnId, node);
      } else {
        containerRefs.current.delete(columnId);
      }
    };
  }

  return (
    <section ref={columnsContainerRef} className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = column.tasks ?? [];

        return (
          <div
            key={column.id}
            className="column-card flex min-h-[420px] flex-col rounded-lg border border-border bg-muted/40"
            data-column-card-id={column.id}
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
            <div
              ref={setContainerRef(column.id)}
              className="task-drop-zone flex flex-1 flex-col gap-3 p-3"
              data-column-id={column.id}
            >
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
                    return (
                      <Card key={task.id} className="task-card p-4" data-task-id={task.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2">
                            <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
                          </div>
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
