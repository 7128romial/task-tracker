import { CircleDashed, Circle, CheckCircle2 } from 'lucide-react';
import { t } from '@/locales/he';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types/task';
import { TASK_STATUS } from '@/constants/task';

interface Props {
  status: TaskStatus;
  as?: 'button' | 'span';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  title?: string;
}

const styles: Record<TaskStatus, string> = {
  [TASK_STATUS.OPEN]: 'text-status-open bg-status-open-bg',
  [TASK_STATUS.IN_PROGRESS]: 'text-status-progress bg-status-progress-bg',
  [TASK_STATUS.DONE]: 'text-status-done bg-status-done-bg',
};

const Icon = {
  [TASK_STATUS.OPEN]: CircleDashed,
  [TASK_STATUS.IN_PROGRESS]: Circle,
  [TASK_STATUS.DONE]: CheckCircle2,
} as const;

export function StatusBadge({ status, as = 'span', onClick, className, title }: Props) {
  const I = Icon[status];
  const base =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none';

  if (as === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title ?? t.table.toggleStatus}
        aria-label={title ?? t.table.toggleStatus}
        className={cn(base, styles[status], 'transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}
      >
        <I className="h-3.5 w-3.5" aria-hidden />
        {t.statuses[status]}
      </button>
    );
  }

  return (
    <span className={cn(base, styles[status], className)}>
      <I className="h-3.5 w-3.5" aria-hidden />
      {t.statuses[status]}
    </span>
  );
}
