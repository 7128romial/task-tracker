import { forwardRef } from 'react';
import { LayoutGrid, List, Search, X, CalendarClock, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/FilterChip';
import { cn } from '@/lib/utils';
import { t } from '@/locales/he';
import { TASK_PRIORITIES, TASK_STATUSES, VIEW } from '@/constants/task';
import { PRIORITY_CODE } from '@/constants/colors';
import type { TaskPriority, TaskStatus, ViewMode } from '@/types/task';
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
      className="flex flex-wrap items-center gap-2 border-b border-border-inner px-3 py-2"
    >
      {/* View switcher — joined border, flush with panel edge */}
      <div
        className="flex overflow-hidden rounded-sm border border-border"
        role="tablist"
      >
        {viewItems.map((v, i) => {
          const active = view === v.id;
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.id)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 px-2.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                i > 0 && 'border-s border-border',
                active
                  ? 'bg-panel-elev text-primary'
                  : 'bg-panel text-muted-foreground hover:bg-panel-hover hover:text-body'
              )}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Filter chips + add-filter dropdowns */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.course !== 'all' && (
          <FilterChip
            label={t.filterLabel.course}
            value={filters.course}
            onRemove={() => setFilter('course', 'all')}
          />
        )}
        {filters.status !== 'all' && (
          <FilterChip
            label={t.filterLabel.status}
            value={t.statuses[filters.status as TaskStatus]}
            onRemove={() => setFilter('status', 'all')}
          />
        )}
        {filters.priority !== 'all' && (
          <FilterChip
            label={t.filterLabel.priority}
            value={PRIORITY_CODE[filters.priority as TaskPriority]}
            onRemove={() => setFilter('priority', 'all')}
          />
        )}

        {/* Course filter add button */}
        {filters.course === 'all' && courses.length > 0 && (
          <Select
            value="all"
            onValueChange={(v) => v !== 'all' && setFilter('course', v)}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-[11px] text-muted-foreground" aria-label={t.filterLabel.course}>
              <SlidersHorizontal className="h-3 w-3" />
              <span>{t.filterLabel.course}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterLabel.any}</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {filters.status === 'all' && (
          <Select
            value="all"
            onValueChange={(v) => v !== 'all' && setFilter('status', v as TaskStatus)}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-[11px] text-muted-foreground" aria-label={t.filterLabel.status}>
              <SlidersHorizontal className="h-3 w-3" />
              <span>{t.filterLabel.status}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterLabel.any}</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t.statuses[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {filters.priority === 'all' && (
          <Select
            value="all"
            onValueChange={(v) => v !== 'all' && setFilter('priority', v as TaskPriority)}
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-[11px] text-muted-foreground" aria-label={t.filterLabel.priority}>
              <SlidersHorizontal className="h-3 w-3" />
              <span>{t.filterLabel.priority}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterLabel.any}</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_CODE[p]} · {t.priorities[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {active && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" />
            {t.toolbar.clear}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative ms-auto min-w-[180px] max-w-[260px] flex-1">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-subtle" aria-hidden />
        <Input
          ref={searchInputRef}
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder={t.toolbar.searchPlaceholder}
          aria-label={t.toolbar.searchLabel}
          className="ps-7"
        />
      </div>
    </div>
  );
});
