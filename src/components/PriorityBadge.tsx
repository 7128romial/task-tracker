import { t } from '@/locales/he';
import { cn } from '@/lib/utils';
import { TASK_PRIORITY } from '@/constants/task';
import type { TaskPriority } from '@/types/task';

const styles: Record<TaskPriority, string> = {
  [TASK_PRIORITY.HIGH]: 'text-priority-high bg-priority-high-bg',
  [TASK_PRIORITY.MEDIUM]: 'text-priority-medium bg-priority-medium-bg',
  [TASK_PRIORITY.LOW]: 'text-priority-low bg-priority-low-bg',
};

interface Props {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        styles[priority],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {t.priorities[priority]}
    </span>
  );
}
