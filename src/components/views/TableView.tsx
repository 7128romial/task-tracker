import { Fragment, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { daysUntil, formatDDMMYY, isOverdue } from '@/utils/dates';

type SortKey = 'title' | 'course' | 'type' | 'deadline' | 'priority' | 'status';
type SortDir = 'asc' | 'desc';

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
const statusOrder = { open: 0, in_progress: 1, done: 2 } as const;

function compare(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title, 'he');
    case 'course':
      return a.course.localeCompare(b.course, 'he');
    case 'type':
      return a.type.localeCompare(b.type);
    case 'deadline': {
      if (a.deadline && b.deadline) {
        if (a.deadline === b.deadline) return 0;
        return a.deadline < b.deadline ? -1 : 1;
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    }
    case 'priority':
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    case 'status':
      return statusOrder[a.status] - statusOrder[b.status];
  }
}

function DaysChip({ iso }: { iso: string | null }) {
  const d = daysUntil(iso);
  if (d === null) return null;
  let label: string;
  let tone: string;
  if (d < 0) {
    label = t.table.daysLate;
    tone = 'bg-priority-high-bg text-priority-high';
  } else if (d === 0) {
    label = t.table.daysToday;
    tone = 'bg-priority-medium-bg text-priority-medium';
  } else if (d === 1) {
    label = t.table.daysTomorrow;
    tone = 'bg-priority-medium-bg text-priority-medium';
  } else if (d <= 7) {
    label = `${t.table.daysIn} ${d} ${t.table.daysUnit}`;
    tone = 'bg-status-progress-bg text-status-progress';
  } else {
    return null;
  }
  return (
    <span className={cn('ms-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', tone)}>
      {label}
    </span>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-ink"
    >
      {label}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

export function TableView({ tasks, onEditTask }: Props) {
  const cycleStatus = useTaskStore((s) => s.cycleStatus);
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const copy = [...tasks];
    copy.sort((a, b) => {
      const cmp = compare(a, b, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [tasks, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleStatusClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    cycleStatus(id);
    toast.success(t.toast.statusChanged);
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-border bg-background/50">
            <tr>
              <th className="p-3 text-start">
                <SortHeader
                  label={t.table.colTitle}
                  active={sortKey === 'title'}
                  dir={sortDir}
                  onClick={() => toggleSort('title')}
                />
              </th>
              <th className="hidden p-3 text-start md:table-cell">
                <SortHeader
                  label={t.table.colCourse}
                  active={sortKey === 'course'}
                  dir={sortDir}
                  onClick={() => toggleSort('course')}
                />
              </th>
              <th className="hidden p-3 text-start lg:table-cell">
                <SortHeader
                  label={t.table.colType}
                  active={sortKey === 'type'}
                  dir={sortDir}
                  onClick={() => toggleSort('type')}
                />
              </th>
              <th className="p-3 text-start">
                <SortHeader
                  label={t.table.colDeadline}
                  active={sortKey === 'deadline'}
                  dir={sortDir}
                  onClick={() => toggleSort('deadline')}
                />
              </th>
              <th className="hidden p-3 text-start md:table-cell">
                <SortHeader
                  label={t.table.colPriority}
                  active={sortKey === 'priority'}
                  dir={sortDir}
                  onClick={() => toggleSort('priority')}
                />
              </th>
              <th className="p-3 text-start">
                <SortHeader
                  label={t.table.colStatus}
                  active={sortKey === 'status'}
                  dir={sortDir}
                  onClick={() => toggleSort('status')}
                />
              </th>
              <th className="w-8 md:hidden" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => {
              const overdue = task.status !== 'done' && isOverdue(task.deadline);
              const isExpanded = expanded === task.id;
              return (
                <Fragment key={task.id}>
                  <tr
                    onClick={() => onEditTask(task)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onEditTask(task);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t.a11y.editTask}: ${task.title}`}
                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <td className="max-w-[260px] p-3 align-top">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">
                            {task.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground md:hidden">
                            {task.course}
                          </div>
                        </div>
                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-accent"
                            aria-label="פתיחת קישור"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="hidden p-3 align-top text-muted-foreground md:table-cell">
                      {task.course || '—'}
                    </td>
                    <td className="hidden p-3 align-top text-muted-foreground lg:table-cell">
                      {t.types[task.type]}
                    </td>
                    <td className="p-3 align-top">
                      <div className={cn('num whitespace-nowrap', overdue && 'text-priority-high')}>
                        {formatDDMMYY(task.deadline)}
                      </div>
                      {task.deadline && task.status !== 'done' && <DaysChip iso={task.deadline} />}
                    </td>
                    <td className="hidden p-3 align-top md:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="p-3 align-top">
                      <StatusBadge
                        status={task.status}
                        as="button"
                        onClick={(e) => handleStatusClick(e, task.id)}
                      />
                    </td>
                    <td className="p-3 align-top md:hidden">
                      <button
                        type="button"
                        className="rounded p-1 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(isExpanded ? null : task.id);
                        }}
                        aria-label={t.table.expandRow}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-border/60 bg-background/40 md:hidden">
                      <td colSpan={4} className="p-3 text-xs text-muted-foreground">
                        <dl className="grid grid-cols-2 gap-2">
                          <dt className="text-muted-foreground">{t.table.colCourse}</dt>
                          <dd className="text-ink">{task.course || '—'}</dd>
                          <dt className="text-muted-foreground">{t.table.colType}</dt>
                          <dd className="text-ink">{t.types[task.type]}</dd>
                          <dt className="text-muted-foreground">{t.table.colPriority}</dt>
                          <dd>
                            <PriorityBadge priority={task.priority} />
                          </dd>
                        </dl>
                        {task.notes && (
                          <p className="mt-2 text-ink/80">{task.notes}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
