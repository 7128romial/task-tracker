import { Fragment, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/Badge';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import { PRIORITY_CODE, PRIORITY_TONE, STATUS_TONE } from '@/constants/colors';
import type { Task, TaskStatus } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { daysUntil, isOverdue } from '@/utils/dates';
import { shortId } from '@/utils/id';

type SortKey = 'id' | 'title' | 'course' | 'type' | 'deadline' | 'priority' | 'status';
type SortDir = 'asc' | 'desc';

interface Props {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
const statusOrder: Record<TaskStatus, number> = { open: 0, in_progress: 1, done: 2 };

function compare(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'id':
      return a.id.localeCompare(b.id);
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

function DaysCell({ iso, status }: { iso: string | null; status: TaskStatus }) {
  if (!iso) return <span className="text-subtle">—</span>;
  if (status === 'done') {
    return <span className="num text-subtle">{t.table.done}</span>;
  }
  const d = daysUntil(iso);
  if (d === null) return <span className="text-subtle">—</span>;
  let label: string;
  let tone: string;
  if (d < 0) {
    label = `${t.table.daysLate} ${d}d`;
    tone = 'text-severity-danger';
  } else if (d === 0) {
    label = t.table.daysToday;
    tone = 'text-severity-warn';
  } else if (d === 1) {
    label = t.table.daysTomorrow;
    tone = 'text-severity-warn';
  } else if (d <= 7) {
    label = t.table.daysIn(d);
    tone = 'text-severity-progress';
  } else {
    label = t.table.daysIn(d);
    tone = 'text-subtle';
  }
  return <span className={cn('num text-[11px]', tone)}>{label}</span>;
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-body',
        className
      )}
    >
      {label}
      {active ? (
        dir === 'asc' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />
      ) : (
        <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
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
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border-inner">
            <th className="hidden px-3 py-1.5 text-start md:table-cell">
              <SortHeader label={t.table.colId} active={sortKey === 'id'} dir={sortDir} onClick={() => toggleSort('id')} />
            </th>
            <th className="px-3 py-1.5 text-start">
              <SortHeader label={t.table.colTitle} active={sortKey === 'title'} dir={sortDir} onClick={() => toggleSort('title')} />
            </th>
            <th className="hidden px-3 py-1.5 text-start md:table-cell">
              <SortHeader label={t.table.colCourse} active={sortKey === 'course'} dir={sortDir} onClick={() => toggleSort('course')} />
            </th>
            <th className="hidden px-3 py-1.5 text-start lg:table-cell">
              <SortHeader label={t.table.colType} active={sortKey === 'type'} dir={sortDir} onClick={() => toggleSort('type')} />
            </th>
            <th className="px-3 py-1.5 text-start">
              <SortHeader label={t.table.colDeadline} active={sortKey === 'deadline'} dir={sortDir} onClick={() => toggleSort('deadline')} />
            </th>
            <th className="hidden px-3 py-1.5 text-start md:table-cell">
              <SortHeader label={t.table.colPriority} active={sortKey === 'priority'} dir={sortDir} onClick={() => toggleSort('priority')} />
            </th>
            <th className="px-3 py-1.5 text-start">
              <SortHeader label={t.table.colStatus} active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
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
                  className="cursor-pointer border-b border-border-inner transition-colors hover:bg-panel-hover focus:outline-none focus-visible:bg-panel-hover focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <td className="hidden align-top px-3 py-2 md:table-cell">
                    <span className="num text-[11px] text-subtle">{shortId(task.id)}</span>
                  </td>
                  <td className="max-w-[320px] align-top px-3 py-2">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-primary">{task.title}</div>
                        <div className="mt-0.5 text-[11px] text-subtle md:hidden">
                          <span className="num">{shortId(task.id)}</span>
                          {task.course && <> · {task.course}</>}
                        </div>
                      </div>
                      {task.link && (
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 shrink-0 text-subtle hover:text-accent"
                          aria-label="קישור"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="hidden align-top px-3 py-2 text-muted-foreground md:table-cell">
                    {task.course || '—'}
                  </td>
                  <td className="hidden align-top px-3 py-2 text-muted-foreground lg:table-cell">
                    <span className="num text-[11px]">{task.type}</span>
                  </td>
                  <td className="align-top px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn('num text-[11px]', overdue ? 'text-severity-danger' : 'text-body')}>
                        {task.deadline ?? '—'}
                      </span>
                      <DaysCell iso={task.deadline} status={task.status} />
                    </div>
                  </td>
                  <td className="hidden align-top px-3 py-2 md:table-cell">
                    <Badge tone={PRIORITY_TONE[task.priority]}>
                      <span className="num">{PRIORITY_CODE[task.priority]}</span>
                    </Badge>
                  </td>
                  <td className="align-top px-3 py-2">
                    <button
                      type="button"
                      onClick={(e) => handleStatusClick(e, task.id)}
                      className="rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={t.table.toggleStatus}
                      title={t.table.toggleStatus}
                    >
                      <Badge tone={STATUS_TONE[task.status]}>{t.statuses[task.status]}</Badge>
                    </button>
                  </td>
                  <td className="align-top md:hidden">
                    <button
                      type="button"
                      className="rounded-sm p-1 text-subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(isExpanded ? null : task.id);
                      }}
                      aria-label="פרטים"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border-inner bg-panel-hover/40 md:hidden">
                    <td colSpan={4} className="px-3 py-2 text-[11px] text-muted-foreground">
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        <dt>{t.table.colCourse}</dt>
                        <dd className="text-body">{task.course || '—'}</dd>
                        <dt>{t.table.colType}</dt>
                        <dd className="num text-body">{task.type}</dd>
                        <dt>{t.table.colPriority}</dt>
                        <dd>
                          <Badge tone={PRIORITY_TONE[task.priority]}>
                            <span className="num">{PRIORITY_CODE[task.priority]}</span>
                          </Badge>
                        </dd>
                      </dl>
                      {task.notes && <p className="mt-2 text-body/80">{task.notes}</p>}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
