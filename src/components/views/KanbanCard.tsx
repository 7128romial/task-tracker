import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, GripVertical } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { cn } from '@/lib/utils';
import { PRIORITY_CODE, PRIORITY_TONE } from '@/constants/colors';
import { t } from '@/locales/he';
import type { Task } from '@/types/task';
import { daysUntil, isOverdue } from '@/utils/dates';
import { shortId } from '@/utils/id';

interface Props {
  task: Task;
  sortable: boolean;
  onClick: () => void;
}

export function KanbanCard({ task, sortable, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  const overdue = task.status !== 'done' && isOverdue(task.deadline);
  const d = daysUntil(task.deadline);

  const style: React.CSSProperties | undefined = sortable
    ? { transform: CSS.Transform.toString(transform), transition }
    : undefined;

  return (
    <div
      ref={sortable ? setNodeRef : undefined}
      style={style}
      className={cn(
        'group relative flex select-none flex-col gap-1.5 rounded-sm border border-border bg-panel p-2.5 transition-colors hover:border-border-strong',
        isDragging && 'opacity-40'
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
        onClick();
      }}
    >
      <div className="flex items-start gap-1.5">
        {sortable && (
          <button
            type="button"
            data-drag-handle
            className="mt-0.5 cursor-grab touch-none text-subtle opacity-0 transition-opacity hover:text-body group-hover:opacity-100 active:cursor-grabbing"
            aria-label="גרירה"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onClick}
            className="block w-full truncate text-start text-[12px] font-medium text-primary hover:text-accent"
          >
            {task.title}
          </button>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-subtle">
            <span className="num">{shortId(task.id)}</span>
            {task.course && <span className="text-muted-foreground">· {task.course}</span>}
          </div>
        </div>
        {task.link && (
          <a
            href={task.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-subtle hover:text-accent"
            aria-label="קישור"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <Badge tone={PRIORITY_TONE[task.priority]}>
          <span className="num">{PRIORITY_CODE[task.priority]}</span>
        </Badge>
        <span className="text-subtle">·</span>
        <span className="num text-muted-foreground">{task.type}</span>
        {task.deadline && (
          <>
            <span className="text-subtle">·</span>
            <span className={cn('num', overdue ? 'text-severity-danger' : 'text-body')}>
              {task.deadline}
            </span>
            {d !== null && d >= 0 && d <= 7 && task.status !== 'done' && (
              <span className="num text-subtle">({t.table.daysIn(d)})</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
