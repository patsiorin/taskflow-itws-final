import { useEffect, useMemo, useRef } from "react";
import dragula from "dragula";
import type { Drake } from "dragula";
import { Card } from "@/components/ui/card";
import type { BoardColumn } from "@/types/board";
import type { Task } from "@/types/task";
import { KanbanColumn } from "./KanbanColumn";

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

    // Task Dragula instance: cards can move within a column or between columns.
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
      // DOM order after drop becomes the saved task position.
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

    // Column Dragula instance: the whole column moves unless the drag starts on a task or button.
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
      // DOM order after drop becomes the saved column position.
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
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          isLoading={isLoading}
          taskDropRef={setContainerRef(column.id)}
          onDeleteColumn={onDeleteColumn}
          onDeleteTask={onDeleteTask}
          onEditColumn={onEditColumn}
          onEditTask={onEditTask}
        />
      ))}
      {!isLoading && columns.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground lg:col-span-4">
          Add a column to start organizing tasks.
        </Card>
      ) : null}
    </section>
  );
}
