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
  deltaOpen: number;
  deltaInProgress: number;
  deltaDone: number;
  deltaUrgent: number;
}

interface TaskStoreState {
  tasks: Task[];
  filters: Filters;
  view: ViewMode;
  /** Timestamp of the last mutation — used by the "refreshed Xs ago" indicator. */
  lastMutationAt: string;

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
  priority: 'all',
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

function touch(): string {
  return nowIso();
}

export const useTaskStore = create<TaskStoreState>()(
  subscribeWithSelector((set, get) => ({
    tasks: loadState(),
    filters: DEFAULT_FILTERS,
    view: VIEW.TABLE,
    lastMutationAt: nowIso(),

    addTask: (input) => {
      const task = makeTask(input);
      set({ tasks: [task, ...get().tasks], lastMutationAt: touch() });
      return task;
    },

    updateTask: (id, patch) => {
      set({
        tasks: get().tasks.map((t) => (t.id === id ? applyPatch(t, patch) : t)),
        lastMutationAt: touch(),
      });
    },

    deleteTask: (id) => {
      set({
        tasks: get().tasks.filter((t) => t.id !== id),
        lastMutationAt: touch(),
      });
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

    replaceAll: (tasks) => set({ tasks, lastMutationAt: touch() }),
    clearAll: () => set({ tasks: [], lastMutationAt: touch() }),
    loadSample: (sample) => set({ tasks: sample, lastMutationAt: touch() }),
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
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
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

/**
 * Reconstruct status at a given point in time by walking statusHistory.
 * Returns null if the task didn't exist yet (createdAt is after `at`).
 */
function statusAt(task: Task, at: Date): TaskStatus | null {
  if (new Date(task.createdAt) > at) return null;
  let current: TaskStatus = task.statusHistory[0]?.status ?? task.status;
  for (const entry of task.statusHistory) {
    if (new Date(entry.changedAt) <= at) {
      current = entry.status;
    } else {
      break;
    }
  }
  return current;
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

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  let pastOpen = 0;
  let pastInProgress = 0;
  let pastDone = 0;
  let pastUrgent = 0;
  for (const t of tasks) {
    const s = statusAt(t, weekAgo);
    if (s === null) continue;
    if (s === TASK_STATUS.OPEN) pastOpen += 1;
    else if (s === TASK_STATUS.IN_PROGRESS) pastInProgress += 1;
    else if (s === TASK_STATUS.DONE) pastDone += 1;
    // urgent window back then: deadline within 7 days of weekAgo and not yet done
    if (s !== TASK_STATUS.DONE && t.deadline) {
      const d = new Date(t.deadline);
      const diff = (d.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= URGENT_WINDOW_DAYS) pastUrgent += 1;
    }
  }

  return {
    total,
    open,
    inProgress,
    done,
    donePercent,
    urgentThisWeek: urgent,
    deltaOpen: open - pastOpen,
    deltaInProgress: inProgress - pastInProgress,
    deltaDone: done - pastDone,
    deltaUrgent: urgent - pastUrgent,
  };
}

/** Distribution of tasks per course × status, sorted by total desc. */
export function selectCourseDistribution(
  state: TaskStoreState
): { course: string; open: number; inProgress: number; done: number; total: number }[] {
  const byCourse = new Map<
    string,
    { course: string; open: number; inProgress: number; done: number; total: number }
  >();
  for (const t of state.tasks) {
    const key = t.course.trim() || 'ללא קורס';
    const row = byCourse.get(key) ?? {
      course: key,
      open: 0,
      inProgress: 0,
      done: 0,
      total: 0,
    };
    if (t.status === TASK_STATUS.OPEN) row.open += 1;
    else if (t.status === TASK_STATUS.IN_PROGRESS) row.inProgress += 1;
    else row.done += 1;
    row.total += 1;
    byCourse.set(key, row);
  }
  return [...byCourse.values()].sort((a, b) => b.total - a.total);
}

/** Last N days of completions + newly opened, bucketed by calendar day. */
export function selectCompletionSeries(
  state: TaskStoreState,
  days: number
): { date: string; opened: number; completed: number; cumulativeCompleted: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { date: string; opened: number; completed: number; cumulativeCompleted: number }[] =
    [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    buckets.push({ date: iso, opened: 0, completed: 0, cumulativeCompleted: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));

  for (const t of state.tasks) {
    const createdIso = t.createdAt.slice(0, 10);
    if (index.has(createdIso)) {
      buckets[index.get(createdIso)!]!.opened += 1;
    }
    const lastDone = [...t.statusHistory]
      .reverse()
      .find((e) => e.status === TASK_STATUS.DONE);
    if (lastDone) {
      const doneIso = lastDone.changedAt.slice(0, 10);
      if (index.has(doneIso)) {
        buckets[index.get(doneIso)!]!.completed += 1;
      }
    }
  }

  let cum = 0;
  for (const b of buckets) {
    cum += b.completed;
    b.cumulativeCompleted = cum;
  }
  return buckets;
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
