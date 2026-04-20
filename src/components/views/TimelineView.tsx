import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import { TASK_PRIORITY, TASK_STATUS } from '@/constants/task';
import type { Task } from '@/types/task';
import { daysUntil, formatDDMMYY, isOverdue } from '@/utils/dates';
import { compareTasksForOrder } from '@/stores/taskStore';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

function markerClasses(task: Task): string {
  if (task.status === TASK_STATUS.DONE) {
    return 'bg-status-done border-status-done';
  }
  if (task.priority === TASK_PRIORITY.HIGH) {
    return 'bg-priority-high border-priority-high';
  }
  return 'bg-surface border-border';
}

function TimelineItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const overdue = task.status !== TASK_STATUS.DONE && isOverdue(task.deadline);
  const d = daysUntil(task.deadline);

  return (
    <li className="relative ps-8">
      <span
        className={cn(
          'absolute start-[14px] top-3 h-3 w-3 -translate-x-1/2 rounded-full border-2 rtl:translate-x-1/2',
          markerClasses(task)
        )}
        aria-hidden
      />
      <button
        type="button"
        onClick={onClick}
        className="block w-full rounded-md border border-border bg-surface p-4 text-start shadow-soft transition-colors hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={cn('num text-sm font-medium', overdue ? 'text-priority-high' : 'text-ink')}>
              {formatDDMMYY(task.deadline)}
            </span>
            {d !== null && task.status !== TASK_STATUS.DONE && (
              <span className="text-xs text-muted-foreground">
                {d < 0
                  ? t.table.daysLate
                  : d === 0
                    ? t.table.daysToday
                    : d === 1
                      ? t.table.daysTomorrow
                      : `${t.table.daysIn} ${d} ${t.table.daysUnit}`}
              </span>
            )}
          </div>
          <StatusBadge status={task.status} />
        </div>
        <h3 className="mt-1 font-medium text-ink">{task.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.course && <span>{task.course}</span>}
          {task.course && <span>·</span>}
          <span>{t.types[task.type]}</span>
          <span>·</span>
          <PriorityBadge priority={task.priority} />
        </div>
      </button>
    </li>
  );
}

export function TimelineView({ tasks, onEditTask }: Props) {
  const { withDeadline, withoutDeadline } = useMemo(() => {
    const withD: Task[] = [];
    const withoutD: Task[] = [];
    for (const task of tasks) {
      if (task.deadline) withD.push(task);
      else withoutD.push(task);
    }
    withD.sort(compareTasksForOrder);
    withoutD.sort((a, b) => a.title.localeCompare(b.title, 'he'));
    return { withDeadline: withD, withoutDeadline: withoutD };
  }, [tasks]);

  return (
    <div className="card-surface p-4 sm:p-6">
      <ol className="relative">
        <span
          className="absolute bottom-0 start-[14px] top-0 w-px bg-border rtl:start-[14px]"
          aria-hidden
        />
        <div className="flex flex-col gap-3">
          {withDeadline.map((task) => (
            <TimelineItem key={task.id} task={task} onClick={() => onEditTask(task)} />
          ))}
        </div>
      </ol>

      {withoutDeadline.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.timeline.noDeadlineHeading}
          </h4>
          <ul className="flex flex-col gap-2">
            {withoutDeadline.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="block w-full rounded-md border border-border bg-surface p-3 text-start text-sm shadow-soft transition-colors hover:border-accent/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  {task.course && (
                    <div className="mt-0.5 text-xs text-muted-foreground">{task.course}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
