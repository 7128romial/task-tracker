import { useCallback, useMemo, useRef, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { StatsRow } from '@/components/StatsRow';
import { Toolbar } from '@/components/Toolbar';
import { TaskForm } from '@/components/TaskForm';
import { EmptyState } from '@/components/EmptyState';
import { Footer } from '@/components/Footer';
import { Panel } from '@/components/Panel';
import { CommandPalette } from '@/components/CommandPalette';
import { TableView } from '@/components/views/TableView';
import { KanbanView } from '@/components/views/KanbanView';
import { TimelineView } from '@/components/views/TimelineView';
import { CompletionChart } from '@/components/panels/CompletionChart';
import { CourseDistribution } from '@/components/panels/CourseDistribution';
import { VIEW } from '@/constants/task';
import { useKeyboardShortcuts } from '@/hooks/useKeyboard';
import type { Task, ViewMode } from '@/types/task';
import { t } from '@/locales/he';
import {
  selectFilteredTasks,
  selectFiltersActive,
  useTaskStore,
} from '@/stores/taskStore';

export function Dashboard() {
  const view = useTaskStore((s) => s.view);
  const tasksTotal = useTaskStore((s) => s.tasks.length);
  const filtered = useTaskStore(selectFilteredTasks);
  const filtersActive = useTaskStore(selectFiltersActive);
  const setView = useTaskStore((s) => s.setView);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const openAdd = useCallback(() => {
    setEditingTask(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
    searchRef.current?.select();
  }, []);

  const handleSetView = useCallback((v: ViewMode) => setView(v), [setView]);
  const openPalette = useCallback(() => setPaletteOpen(true), []);

  useKeyboardShortcuts({
    onNewTask: openAdd,
    onFocusSearch: focusSearch,
    onSetView: handleSetView,
    onOpenPalette: openPalette,
    modalOpen: formOpen,
  });

  const viewContent = useMemo(() => {
    if (tasksTotal === 0) {
      return <EmptyState variant="empty" onNewTask={openAdd} />;
    }
    if (filtered.length === 0 && filtersActive) {
      return <EmptyState variant="filtered" />;
    }
    switch (view) {
      case VIEW.TABLE:
        return <TableView tasks={filtered} onEditTask={openEdit} />;
      case VIEW.KANBAN:
        return (
          <div className="p-3">
            <KanbanView tasks={filtered} onEditTask={openEdit} />
          </div>
        );
      case VIEW.TIMELINE:
        return <TimelineView tasks={filtered} onEditTask={openEdit} />;
    }
  }, [view, filtered, tasksTotal, filtersActive, openAdd, openEdit]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onNewTask={openAdd} onOpenPalette={openPalette} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3">
          <StatsRow />

          <Panel
            title={t.panels.tasksTitle}
            titleEnd={<span className="num text-[11px] text-muted-foreground">{filtered.length}</span>}
            bodyClassName="p-0"
          >
            <Toolbar searchInputRef={searchRef} />
            <div className="fade-in" key={view}>
              {viewContent}
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <CompletionChart />
            <CourseDistribution />
          </div>
        </div>
      </main>
      <Footer />
      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNewTask={openAdd} />
    </div>
  );
}
