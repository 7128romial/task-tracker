import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import { TASK_PRIORITY, TASK_STATUS } from '@/constants/task';
import { PRIORITY_CODE, PRIORITY_TONE, STATUS_TONE } from '@/constants/colors';
import type { Task } from '@/types/task';
import { daysUntil, formatDDMMYY, isOverdue } from '@/utils/dates';
import { compareTasksForOrder } from '@/stores/taskStore';
import { Badge } from '@/components/Badge';
import { shortId } from '@/utils/id';

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

function markerClasses(task: Task): string {
  if (task.status === TASK_STATUS.DONE) return 'bg-severity-done border-severity-done';
  if (task.priority === TASK_PRIORITY.HIGH) return 'bg-severity-danger border-severity-danger';
  return 'bg-panel border-border-strong';
}

function daysLabel(iso: string | null, status: Task['status']): string | null {
  if (!iso) return null;
  if (status === 'done') return t.table.done;
  const d = daysUntil(iso);
  if (d === null) return null;
  if (d < 0) return `${t.table.daysLate} ${d}d`;
  if (d === 0) return t.table.daysToday;
  if (d === 1) return t.table.daysTomorrow;
  return t.table.daysIn(d);
}

function TimelineItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const overdue = task.status !== TASK_STATUS.DONE && isOverdue(task.deadline);
  const daysText = daysLabel(task.deadline, task.status);

  return (
    <li className="relative ps-8">
      <span
        className={cn(
          'absolute start-[14px] top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 rtl:translate-x-1/2',
          markerClasses(task)
        )}
        aria-hidden
      />
      <button
        type="button"
        onClick={onClick}
        className="block w-full rounded-sm border border-border bg-panel p-3 text-start transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={cn('num text-xs font-medium', overdue ? 'text-severity-danger' : 'text-primary')}>
              {formatDDMMYY(task.deadline)}
            </span>
            {daysText && <span className="num text-[11px] text-muted-foreground">{daysText}</span>}
          </div>
          <Badge tone={STATUS_TONE[task.status]}>{t.statuses[task.status]}</Badge>
        </div>
        <h3 className="mt-1 text-[12px] font-medium text-primary">{task.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="num text-subtle">{shortId(task.id)}</span>
          {task.course && (
            <>
              <span className="text-subtle">·</span>
              <span>{task.course}</span>
            </>
          )}
          <span className="text-subtle">·</span>
          <Badge tone={PRIORITY_TONE[task.priority]}>
            <span className="num">{PRIORITY_CODE[task.priority]}</span>
          </Badge>
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
    <div className="p-4">
      <ol className="relative">
        <span className="absolute bottom-0 start-[14px] top-0 w-px bg-border-inner" aria-hidden />
        <div className="flex flex-col gap-2">
          {withDeadline.map((task) => (
            <TimelineItem key={task.id} task={task} onClick={() => onEditTask(task)} />
          ))}
        </div>
      </ol>

      {withoutDeadline.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 panel-title">{t.timeline.noDeadlineHeading}</h4>
          <ul className="flex flex-col gap-1.5">
            {withoutDeadline.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="block w-full rounded-sm border border-border bg-panel p-2.5 text-start text-[12px] transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-primary">{task.title}</span>
                    <Badge tone={STATUS_TONE[task.status]}>{t.statuses[task.status]}</Badge>
                  </div>
                  {task.course && <div className="mt-0.5 text-[11px] text-muted-foreground">{task.course}</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
