import { useCallback, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { Toolbar } from '@/components/Toolbar';
import { TaskForm } from '@/components/TaskForm';
import { EmptyState } from '@/components/EmptyState';
import { Footer } from '@/components/Footer';
import { TableView } from '@/components/views/TableView';
import { KanbanView } from '@/components/views/KanbanView';
import { TimelineView } from '@/components/views/TimelineView';
import { VIEW } from '@/constants/task';
import { useKeyboardShortcuts } from '@/hooks/useKeyboard';
import type { Task, ViewMode } from '@/types/task';
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

  const handleSetView = useCallback(
    (v: ViewMode) => {
      setView(v);
    },
    [setView]
  );

  useKeyboardShortcuts({
    onNewTask: openAdd,
    onFocusSearch: focusSearch,
    onSetView: handleSetView,
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
        return <KanbanView tasks={filtered} onEditTask={openEdit} />;
      case VIEW.TIMELINE:
        return <TimelineView tasks={filtered} onEditTask={openEdit} />;
    }
  }, [view, filtered, tasksTotal, filtersActive, openAdd, openEdit]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onNewTask={openAdd} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:gap-5">
          <StatsCards />
          <Toolbar searchInputRef={searchRef} />
          <div className="animate-fade-in">{viewContent}</div>
        </div>
      </main>
      <Footer />
      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
    </div>
  );
}
