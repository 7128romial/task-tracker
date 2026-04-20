import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';
import { TASK_STATUS, TASK_STATUSES } from '@/constants/task';
import { t } from '@/locales/he';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task';
import { useTaskStore, compareTasksForOrder } from '@/stores/taskStore';
import { useIsTouch } from '@/hooks/useMediaQuery';
import { KanbanCard } from '@/components/KanbanCard';

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const columnLabel: Record<TaskStatus, string> = {
  [TASK_STATUS.OPEN]: t.kanban.columnOpen,
  [TASK_STATUS.IN_PROGRESS]: t.kanban.columnInProgress,
  [TASK_STATUS.DONE]: t.kanban.columnDone,
};

const columnAccent: Record<TaskStatus, string> = {
  [TASK_STATUS.OPEN]: 'bg-status-open-bg text-status-open',
  [TASK_STATUS.IN_PROGRESS]: 'bg-status-progress-bg text-status-progress',
  [TASK_STATUS.DONE]: 'bg-status-done-bg text-status-done',
};

function Column({
  status,
  tasks,
  sortable,
  onEditTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  sortable: boolean;
  onEditTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  const ids = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'card-surface flex min-h-[300px] flex-col gap-3 p-3 transition-colors',
        isOver && 'bg-accent/5 ring-1 ring-accent/20'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', columnAccent[status])}>
            {columnLabel[status]}
          </span>
          <span className="num text-xs text-muted-foreground">{tasks.length}</span>
        </div>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              {t.kanban.empty}
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                sortable={sortable}
                onClick={() => onEditTask(task)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanView({ tasks, onEditTask }: Props) {
  const setStatus = useTaskStore((s) => s.setStatus);
  const isTouch = useIsTouch();
  const sortable = !isTouch;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const byStatus = useMemo<Record<TaskStatus, Task[]>>(() => {
    const acc: Record<TaskStatus, Task[]> = {
      [TASK_STATUS.OPEN]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.DONE]: [],
    };
    for (const task of tasks) acc[task.status].push(task);
    for (const s of TASK_STATUSES) acc[s].sort(compareTasksForOrder);
    return acc;
  }, [tasks]);

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const activeId = String(e.active.id);
    const overId = e.over?.id !== undefined ? String(e.over.id) : null;
    if (!overId) return;

    const task = tasks.find((x) => x.id === activeId);
    if (!task) return;

    let destStatus: TaskStatus | null = null;
    if (overId.startsWith('column:')) {
      destStatus = overId.slice('column:'.length) as TaskStatus;
    } else {
      const dest = tasks.find((x) => x.id === overId);
      if (dest) destStatus = dest.status;
    }

    if (destStatus && destStatus !== task.status) {
      setStatus(task.id, destStatus);
      toast.success(t.toast.statusChanged);
    }
    // Same-column reorder is not persisted (columns sort by deadline).
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TASK_STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            tasks={byStatus[s]}
            sortable={sortable}
            onEditTask={onEditTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rotate-1 opacity-90">
            <KanbanCard task={activeTask} sortable={false} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
