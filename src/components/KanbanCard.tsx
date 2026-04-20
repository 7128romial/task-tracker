import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import { daysUntil, formatDDMMYY, isOverdue } from '@/utils/dates';
import { PriorityBadge } from '@/components/PriorityBadge';
import { t } from '@/locales/he';

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
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  return (
    <div
      ref={sortable ? setNodeRef : undefined}
      style={style}
      className={cn(
        'group relative flex select-none flex-col gap-2 rounded-md border border-border bg-surface p-3 shadow-soft transition-colors',
        isDragging && 'opacity-40',
        !sortable && 'cursor-pointer'
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
        onClick();
      }}
    >
      <div className="flex items-start gap-2">
        {sortable && (
          <button
            type="button"
            data-drag-handle
            className="mt-0.5 cursor-grab touch-none text-muted-foreground/60 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100 active:cursor-grabbing"
            aria-label="גרירה"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onClick}
            className="w-full text-start font-medium text-ink hover:text-accent"
          >
            {task.title}
          </button>
          {task.course && (
            <div className="mt-0.5 text-xs text-muted-foreground">{task.course}</div>
          )}
        </div>
        {task.link && (
          <a
            href={task.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-accent"
            aria-label="פתיחת קישור"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <PriorityBadge priority={task.priority} />
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{t.types[task.type]}</span>
        {task.deadline && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className={cn('num', overdue && 'text-priority-high')}>
              {formatDDMMYY(task.deadline)}
              {d !== null && d >= 0 && d <= 7 && (
                <span className="ms-1 text-muted-foreground">({d}ד׳)</span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
