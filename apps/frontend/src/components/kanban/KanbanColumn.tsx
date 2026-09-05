import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BoardColumn } from "@/types/board";
import type { Task } from "@/types/task";
import { TaskCard, TaskCardContent } from "./TaskCard";

type KanbanColumnProps = {
  column: BoardColumn;
  isLoading: boolean;
  onDeleteColumn: (column: BoardColumn) => void;
  onDeleteTask: (task: Task) => void;
  onEditColumn: (column: BoardColumn) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (column: BoardColumn) => void;
};

type KanbanColumnContentProps = KanbanColumnProps &
  HTMLAttributes<HTMLDivElement> & {
    dragHandleProps?: HTMLAttributes<HTMLDivElement>;
    renderSortableTasks?: boolean;
  };

export function KanbanColumn({
  column,
  isLoading,
  onDeleteColumn,
  onDeleteTask,
  onEditColumn,
  onEditTask,
  onCreateTask,
}: KanbanColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${column.id}`,
    data: { type: "column", column },
  });
  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : undefined,
  };

  return (
    <KanbanColumnContent
      ref={setNodeRef}
      column={column}
      isLoading={isLoading}
      onDeleteColumn={onDeleteColumn}
      onDeleteTask={onDeleteTask}
      onEditColumn={onEditColumn}
      onEditTask={onEditTask}
      onCreateTask={onCreateTask}
      data-column-card-id={column.id}
      dragHandleProps={{ ...attributes, ...listeners }}
      style={style}
    />
  );
}

// Shared column UI lets DragOverlay show a preview without nesting another sortable column.
export const KanbanColumnContent = forwardRef<HTMLDivElement, KanbanColumnContentProps>(
  (
    {
      column,
      isLoading,
      onDeleteColumn,
      onDeleteTask,
      onEditColumn,
      onEditTask,
      onCreateTask,
      className,
      dragHandleProps,
      renderSortableTasks = true,
      ...props
    },
    ref,
  ) => {
    const columnTasks = column.tasks ?? [];

    return (
      <div
        ref={ref}
        className={cn(
          "column-card flex min-h-[420px] w-full min-w-0 flex-col rounded-lg border border-border bg-muted/40",
          className,
        )}
        {...props}
      >
        <div
          className="column-drag-handle flex cursor-grab items-center justify-between gap-3 border-b border-border px-4 py-3 active:cursor-grabbing"
          {...dragHandleProps}
        >
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold">{column.name}</h2>
            <Badge>{columnTasks.length}</Badge>
          </div>
          <div className="flex gap-1" onPointerDown={(event) => event.stopPropagation()}>
            <Tooltip content="New task">
              <Button size="icon" variant="ghost" onClick={() => onCreateTask(column)}>
                <Plus className="h-4 w-4" />
              </Button>
            </Tooltip>
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

        <div className="task-drop-zone flex flex-1 flex-col gap-3 p-3" data-column-id={column.id}>
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

          {renderSortableTasks ? (
            <SortableContext items={columnTasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
              {!isLoading
                ? columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
                  ))
                : null}
            </SortableContext>
          ) : !isLoading ? (
            columnTasks.map((task) => (
              <TaskCardContent key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
            ))
          ) : null}
        </div>
      </div>
    );
  },
);

KanbanColumnContent.displayName = "KanbanColumnContent";
