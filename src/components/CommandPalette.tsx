import { AlertTriangle, Database, Eraser, FileDown, LayoutGrid, List, Plus, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { TASK_STATUS, VIEW } from '@/constants/task';
import { t } from '@/locales/he';
import { useTaskStore } from '@/stores/taskStore';
import { exportJson } from '@/utils/export';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTask: () => void;
}

export function CommandPalette({ open, onOpenChange, onNewTask }: Props) {
  const setView = useTaskStore((s) => s.setView);
  const setFilter = useTaskStore((s) => s.setFilter);
  const clearFilters = useTaskStore((s) => s.clearFilters);
  const tasks = useTaskStore((s) => s.tasks);

  const close = () => onOpenChange(false);

  const run = (fn: () => void) => {
    fn();
    close();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t.topbar.openPalette}>
      <CommandInput placeholder={t.palette.placeholder} />
      <CommandList>
        <CommandEmpty>{t.palette.empty}</CommandEmpty>

        <CommandGroup heading={t.palette.groupFilters}>
          <CommandItem
            onSelect={() =>
              run(() => {
                clearFilters();
                setFilter('status', TASK_STATUS.OPEN);
                // A nice-to-have: also imply urgent. Left as OPEN filter for clarity.
                toast.success(t.palette.urgentThisWeek);
              })
            }
          >
            <AlertTriangle className="h-3.5 w-3.5 text-severity-danger" />
            {t.palette.urgentThisWeek}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                clearFilters();
                setFilter('course', 'BI');
              })
            }
          >
            <Database className="h-3.5 w-3.5 text-severity-progress" />
            {t.palette.biTasks}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                clearFilters();
                setFilter('status', TASK_STATUS.OPEN);
              })
            }
          >
            <LayoutGrid className="h-3.5 w-3.5 text-severity-warn" />
            {t.palette.openProjects}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.palette.groupViews}>
          <CommandItem onSelect={() => run(() => setView(VIEW.TABLE))}>
            <List className="h-3.5 w-3.5" />
            {t.palette.goTable}
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView(VIEW.KANBAN))}>
            <LayoutGrid className="h-3.5 w-3.5" />
            {t.palette.goKanban}
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView(VIEW.TIMELINE))}>
            <CalendarClock className="h-3.5 w-3.5" />
            {t.palette.goTimeline}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.palette.groupActions}>
          <CommandItem onSelect={() => run(onNewTask)}>
            <Plus className="h-3.5 w-3.5 text-accent" />
            {t.palette.newTask}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                exportJson(tasks);
                toast.success(t.toast.exportSuccess);
              })
            }
          >
            <FileDown className="h-3.5 w-3.5" />
            {t.palette.exportJson}
          </CommandItem>
          <CommandItem onSelect={() => run(clearFilters)}>
            <Eraser className="h-3.5 w-3.5" />
            {t.palette.clearFilters}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
