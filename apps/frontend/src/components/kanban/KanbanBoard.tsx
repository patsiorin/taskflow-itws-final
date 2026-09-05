import { useState } from "react";
import type { CSSProperties } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import type { BoardColumn, ReorderColumnInput } from "@/types/board";
import type { ReorderTaskInput, Task } from "@/types/task";
import { KanbanColumn, KanbanColumnContent } from "./KanbanColumn";
import { TaskCardContent } from "./TaskCard";

type KanbanBoardProps = {
  columns: BoardColumn[];
  isLoading: boolean;
  onDeleteColumn: (column: BoardColumn) => void;
  onDeleteTask: (task: Task) => void;
  onEditColumn: (column: BoardColumn) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (column: BoardColumn) => void;
  onReorderColumns: (columns: ReorderColumnInput[]) => void;
  onReorderTasks: (tasks: ReorderTaskInput[]) => void;
};

type DragSize = {
  width: number;
};

export function KanbanBoard({
  columns,
  isLoading,
  onDeleteColumn,
  onDeleteTask,
  onEditColumn,
  onEditTask,
  onCreateTask,
  onReorderColumns,
  onReorderTasks,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeDragSize, setActiveDragSize] = useState<DragSize | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    const column = event.active.data.current?.column as BoardColumn | undefined;
    const rect = event.active.rect.current.initial;

    setActiveTask(task ?? null);
    setActiveColumn(column ?? null);
    setActiveDragSize(rect ? { width: rect.width } : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    clearActiveDrag();

    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";

    if (!overId || activeId === overId) {
      return;
    }

    if (activeId.startsWith("column-")) {
      const overColumnId = overId.startsWith("task-")
        ? findTaskColumn(columns, getNumericId(overId))?.id
        : getNumericId(overId);

      if (overColumnId) {
        reorderColumns(activeId, getItemId("column", overColumnId));
      }

      return;
    }

    if (activeId.startsWith("task-")) {
      reorderTasks(activeId, overId);
    }
  }

  function reorderColumns(activeId: string, overId: string) {
    const oldIndex = columns.findIndex((column) => getItemId("column", column.id) === activeId);
    const newIndex = columns.findIndex((column) => getItemId("column", column.id) === overId);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const nextColumns = arrayMove(columns, oldIndex, newIndex);
    onReorderColumns(nextColumns.map((column, index) => ({ id: column.id, position: index + 1 })));
  }

  function reorderTasks(activeId: string, overId: string) {
    const activeTaskId = getNumericId(activeId);
    const sourceColumn = findTaskColumn(columns, activeTaskId);
    const targetColumn = overId.startsWith("task-")
      ? findTaskColumn(columns, getNumericId(overId))
      : columns.find((column) => getItemId("column", column.id) === overId);

    if (!sourceColumn || !targetColumn) {
      return;
    }

    const sourceTasks = sourceColumn.tasks ?? [];

    if (sourceColumn.id === targetColumn.id && overId.startsWith("task-")) {
      const oldIndex = sourceTasks.findIndex((task) => task.id === activeTaskId);
      const newIndex = sourceTasks.findIndex((task) => task.id === getNumericId(overId));

      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const nextColumns = columns.map((column) =>
        column.id === sourceColumn.id ? { ...column, tasks: arrayMove(sourceTasks, oldIndex, newIndex) } : column,
      );
      onReorderTasks(toTaskOrder(nextColumns));
      return;
    }

    const activeTask = sourceTasks.find((task) => task.id === activeTaskId);

    if (!activeTask) {
      return;
    }

    if (sourceColumn.id === targetColumn.id) {
      const withoutActiveTask = sourceTasks.filter((task) => task.id !== activeTaskId);
      const nextColumns = columns.map((column) =>
        column.id === sourceColumn.id ? { ...column, tasks: [...withoutActiveTask, activeTask] } : column,
      );
      onReorderTasks(toTaskOrder(nextColumns));
      return;
    }

    const nextColumns = columns.map((column) => {
      if (column.id === sourceColumn.id) {
        return { ...column, tasks: (column.tasks ?? []).filter((task) => task.id !== activeTaskId) };
      }

      if (column.id === targetColumn.id) {
        const nextTasks = [...(column.tasks ?? [])];
        const targetIndex = overId.startsWith("task-")
          ? nextTasks.findIndex((task) => task.id === getNumericId(overId))
          : nextTasks.length;
        nextTasks.splice(targetIndex < 0 ? nextTasks.length : targetIndex, 0, {
          ...activeTask,
          columnId: targetColumn.id,
        });
        return { ...column, tasks: nextTasks };
      }

      return column;
    });

    onReorderTasks(toTaskOrder(nextColumns));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={clearActiveDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto overflow-y-hidden pb-3">
        <SortableContext items={columns.map((column) => getItemId("column", column.id))} strategy={horizontalListSortingStrategy}>
          <section className="grid w-full grid-flow-col auto-cols-[minmax(17rem,calc((100%_-_3rem)/4))] gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                isLoading={isLoading}
                onDeleteColumn={onDeleteColumn}
                onDeleteTask={onDeleteTask}
                onEditColumn={onEditColumn}
                onEditTask={onEditTask}
                onCreateTask={onCreateTask}
              />
            ))}
            {!isLoading && columns.length === 0 ? (
              <Card className="min-w-[17rem] p-6 text-center text-sm text-muted-foreground">
                Add a column to start organizing tasks.
              </Card>
            ) : null}
          </section>
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeColumn ? (
          <KanbanColumnContent
            column={activeColumn}
            isLoading={false}
            onDeleteColumn={onDeleteColumn}
            onDeleteTask={onDeleteTask}
            onEditColumn={onEditColumn}
            onEditTask={onEditTask}
            onCreateTask={onCreateTask}
            renderSortableTasks={false}
            className="cursor-grabbing shadow-lg"
            style={getOverlayStyle(activeDragSize)}
          />
        ) : activeTask ? (
          <TaskCardContent
            task={activeTask}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            className="cursor-grabbing shadow-lg"
            style={getOverlayStyle(activeDragSize)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  function clearActiveDrag() {
    setActiveTask(null);
    setActiveColumn(null);
    setActiveDragSize(null);
  }
}

function findTaskColumn(columns: BoardColumn[], taskId: number) {
  return columns.find((column) => (column.tasks ?? []).some((task) => task.id === taskId));
}

function getItemId(type: "column" | "task", id: number) {
  return `${type}-${id}`;
}

function getNumericId(id: string) {
  return Number(id.split("-")[1]);
}

function getOverlayStyle(size: DragSize | null): CSSProperties | undefined {
  return size ? { width: size.width } : undefined;
}

function toTaskOrder(columns: BoardColumn[]): ReorderTaskInput[] {
  return columns.flatMap((column) =>
    (column.tasks ?? []).map((task, index) => ({
      id: task.id,
      columnId: column.id,
      position: index + 1,
    })),
  );
}
