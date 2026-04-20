import { forwardRef } from 'react';
import { LayoutGrid, List, Search, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import { TASK_STATUSES, VIEW } from '@/constants/task';
import type { TaskStatus, ViewMode } from '@/types/task';
import {
  selectCourses,
  selectFiltersActive,
  useTaskStore,
} from '@/stores/taskStore';

interface Props {
  searchInputRef: React.Ref<HTMLInputElement>;
}

const viewItems: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: VIEW.TABLE, label: t.toolbar.view.table, icon: List },
  { id: VIEW.KANBAN, label: t.toolbar.view.kanban, icon: LayoutGrid },
  { id: VIEW.TIMELINE, label: t.toolbar.view.timeline, icon: CalendarClock },
];

export const Toolbar = forwardRef<HTMLDivElement, Props>(function Toolbar(
  { searchInputRef },
  ref
) {
  const view = useTaskStore((s) => s.view);
  const setView = useTaskStore((s) => s.setView);
  const filters = useTaskStore((s) => s.filters);
  const setFilter = useTaskStore((s) => s.setFilter);
  const clearFilters = useTaskStore((s) => s.clearFilters);
  const courses = useTaskStore(selectCourses);
  const active = useTaskStore(selectFiltersActive);

  return (
    <div
      ref={ref}
      className="card-surface flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
    >
      <div
        className="flex rounded-md border border-border bg-background/60 p-0.5"
        role="tablist"
        aria-label={t.toolbar.view.table}
      >
        {viewItems.map((v) => {
          const active = view === v.id;
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.id)}
              className={cn(
                'inline-flex min-h-[40px] items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-surface text-ink shadow-soft'
                  : 'text-muted-foreground hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Select
          value={filters.course}
          onValueChange={(v) => setFilter('course', v)}
        >
          <SelectTrigger className="w-auto min-w-[140px] max-w-[220px]" aria-label={t.toolbar.filterCourse}>
            <SelectValue placeholder={t.toolbar.filterCourse} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.toolbar.allCourses}</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => setFilter('status', v as TaskStatus | 'all')}
        >
          <SelectTrigger className="w-auto min-w-[140px]" aria-label={t.toolbar.filterStatus}>
            <SelectValue placeholder={t.toolbar.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.toolbar.allStatuses}</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.statuses[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={searchInputRef}
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t.toolbar.searchPlaceholder}
            aria-label={t.toolbar.search}
            className="ps-9"
          />
        </div>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
            {t.toolbar.clearFilters}
          </Button>
        )}
      </div>
    </div>
  );
});
