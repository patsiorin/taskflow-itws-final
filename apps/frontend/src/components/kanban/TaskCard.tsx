import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { Task } from "@/types/task";

const priorityClass = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

type TaskCardProps = {
  task: Task;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
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

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", task },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      className="task-card p-4"
      data-task-id={task.id}
      style={style}
      {...attributes}
      {...listeners}
    >
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

        <div className="flex gap-1" onPointerDown={(event) => event.stopPropagation()}>
          <Tooltip content="Edit task">
            <Button size="icon" variant="ghost" onClick={() => onEdit(task)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete task">
            <Button size="icon" variant="ghost" onClick={() => onDelete(task)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
