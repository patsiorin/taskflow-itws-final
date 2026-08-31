import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { BoardColumn } from "@/types/board";
import type { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  column: BoardColumn;
  isLoading: boolean;
  onDeleteColumn: (column: BoardColumn) => void;
  onDeleteTask: (task: Task) => void;
  onEditColumn: (column: BoardColumn) => void;
  onEditTask: (task: Task) => void;
};

export function KanbanColumn({
  column,
  isLoading,
  onDeleteColumn,
  onDeleteTask,
  onEditColumn,
  onEditTask,
}: KanbanColumnProps) {
  const columnTasks = column.tasks ?? [];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${column.id}`,
    data: { type: "column", column },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className="column-card flex min-h-[420px] w-[min(22rem,calc(100vw-3rem))] flex-none flex-col rounded-lg border border-border bg-muted/40"
      data-column-card-id={column.id}
      style={style}
    >
      <div
        className="column-drag-handle flex cursor-grab items-center justify-between gap-3 border-b border-border px-4 py-3 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{column.name}</h2>
          <Badge>{columnTasks.length}</Badge>
        </div>
        <div className="flex gap-1" onPointerDown={(event) => event.stopPropagation()}>
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

        <SortableContext items={columnTasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
          {!isLoading
            ? columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
              ))
            : null}
        </SortableContext>
      </div>
    </div>
  );
}
