import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { TASK_STATUS, TASK_STATUSES } from '@/constants/task';
import { HEX } from '@/constants/colors';
import { t } from '@/locales/he';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task';
import { useTaskStore, compareTasksForOrder } from '@/stores/taskStore';
import { useIsTouch } from '@/hooks/useMediaQuery';
import { KanbanCard } from '@/components/views/KanbanCard';

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
  [TASK_STATUS.OPEN]: HEX.open,
  [TASK_STATUS.IN_PROGRESS]: HEX.progress,
  [TASK_STATUS.DONE]: HEX.done,
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
  const ids = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const accent = columnAccent[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'panel relative flex min-h-[280px] flex-col',
        isOver && 'ring-1 ring-accent/40'
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: accent }} aria-hidden />
      <div className="flex items-center justify-between border-b border-border-inner px-3 py-1.5">
        <span className="panel-title">{columnLabel[status]}</span>
        <span className="num text-[11px] text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border py-5 text-center text-[11px] text-subtle">
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
        </SortableContext>
      </div>
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

  const activeTask = tasks.find((task) => task.id === activeId) ?? null;

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

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
          <div className="rotate-1">
            <KanbanCard task={activeTask} sortable={false} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
