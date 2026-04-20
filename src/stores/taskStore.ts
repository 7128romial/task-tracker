import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  NEXT_STATUS,
  TASK_STATUS,
  URGENT_WINDOW_DAYS,
  VIEW,
} from '@/constants/task';
import type {
  Filters,
  Task,
  TaskInput,
  TaskPatch,
  TaskStatus,
  ViewMode,
} from '@/types/task';
import { isWithinNextDays, nowIso } from '@/utils/dates';
import { uid } from '@/utils/id';
import { loadState, saveState } from '@/utils/storage';

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  donePercent: number;
  urgentThisWeek: number;
}

interface TaskStoreState {
  tasks: Task[];
  filters: Filters;
  view: ViewMode;

  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, patch: TaskPatch) => void;
  deleteTask: (id: string) => void;
  cycleStatus: (id: string) => void;
  setStatus: (id: string, next: TaskStatus) => void;

  setView: (view: ViewMode) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;

  replaceAll: (tasks: Task[]) => void;
  clearAll: () => void;
  loadSample: (sample: Task[]) => void;
}

const DEFAULT_FILTERS: Filters = {
  course: 'all',
  status: 'all',
  search: '',
};

/**
 * The ONLY place where task metadata (updatedAt, completedAt, statusHistory) is computed.
 * Components must never touch those fields directly.
 */
function applyPatch(task: Task, patch: TaskPatch): Task {
  const now = nowIso();
  const next: Task = { ...task, ...patch, updatedAt: now };

  const statusChanged =
    typeof patch.status === 'string' && patch.status !== task.status;

  if (statusChanged) {
    next.statusHistory = [
      ...task.statusHistory,
      { status: next.status, changedAt: now },
    ];
    if (next.status === TASK_STATUS.DONE) {
      next.completedAt = now;
    } else if (task.status === TASK_STATUS.DONE) {
      next.completedAt = null;
    }
  }

  return next;
}

function makeTask(input: TaskInput): Task {
  const now = nowIso();
  return {
    ...input,
    id: uid(),
    createdAt: now,
    updatedAt: now,
    completedAt: input.status === TASK_STATUS.DONE ? now : null,
    statusHistory: [{ status: input.status, changedAt: now }],
  };
}

export const useTaskStore = create<TaskStoreState>()(
  subscribeWithSelector((set, get) => ({
    tasks: loadState(),
    filters: DEFAULT_FILTERS,
    view: VIEW.TABLE,

    addTask: (input) => {
      const task = makeTask(input);
      set({ tasks: [task, ...get().tasks] });
      return task;
    },

    updateTask: (id, patch) => {
      set({
        tasks: get().tasks.map((t) => (t.id === id ? applyPatch(t, patch) : t)),
      });
    },

    deleteTask: (id) => {
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
    },

    cycleStatus: (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;
      const next = NEXT_STATUS[task.status];
      get().updateTask(id, { status: next });
    },

    setStatus: (id, next) => {
      get().updateTask(id, { status: next });
    },

    setView: (view) => set({ view }),
    setFilter: (key, value) =>
      set({ filters: { ...get().filters, [key]: value } }),
    clearFilters: () => set({ filters: DEFAULT_FILTERS }),

    replaceAll: (tasks) => set({ tasks }),
    clearAll: () => set({ tasks: [] }),
    loadSample: (sample) => set({ tasks: sample }),
  }))
);

/**
 * Persist any change to tasks to localStorage.
 * Done as a subscription so every mutation path is covered without plumbing.
 */
useTaskStore.subscribe(
  (s) => s.tasks,
  (tasks) => {
    try {
      saveState(tasks);
    } catch {
      // error surfaced separately via toast in the calling component when applicable
    }
  }
);

// ---- Selectors ----

const statusOrder: Record<TaskStatus, number> = {
  [TASK_STATUS.OPEN]: 0,
  [TASK_STATUS.IN_PROGRESS]: 1,
  [TASK_STATUS.DONE]: 2,
};

export function selectFilteredTasks(state: TaskStoreState): Task[] {
  const { tasks, filters } = state;
  const q = filters.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (filters.course !== 'all' && t.course !== filters.course) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (q.length > 0) {
      const hay = `${t.title} ${t.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function selectCourses(state: TaskStoreState): string[] {
  const seen = new Set<string>();
  for (const t of state.tasks) {
    const c = t.course.trim();
    if (c.length > 0) seen.add(c);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, 'he'));
}

export function selectStats(state: TaskStoreState): Stats {
  const { tasks } = state;
  let open = 0;
  let inProgress = 0;
  let done = 0;
  let urgent = 0;

  for (const t of tasks) {
    if (t.status === TASK_STATUS.OPEN) open += 1;
    else if (t.status === TASK_STATUS.IN_PROGRESS) inProgress += 1;
    else if (t.status === TASK_STATUS.DONE) done += 1;

    if (t.status !== TASK_STATUS.DONE && isWithinNextDays(t.deadline, URGENT_WINDOW_DAYS)) {
      urgent += 1;
    }
  }

  const total = tasks.length;
  const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, open, inProgress, done, donePercent, urgentThisWeek: urgent };
}

/** For filters/dropdowns: "are any filters active". */
export function selectFiltersActive(state: TaskStoreState): boolean {
  return (
    state.filters.course !== 'all' ||
    state.filters.status !== 'all' ||
    state.filters.search.trim().length > 0
  );
}

/** Timeline + table order: by deadline asc, null deadlines last, then by status order. */
export function compareTasksForOrder(a: Task, b: Task): number {
  if (a.deadline && b.deadline) {
    if (a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1;
  } else if (a.deadline) {
    return -1;
  } else if (b.deadline) {
    return 1;
  }
  if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
  return a.title.localeCompare(b.title, 'he');
}
