import type { TaskPriority, TaskStatus, TaskType } from '@/types/task';

export const TASK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const satisfies Record<string, TaskStatus>;

export const TASK_STATUSES: readonly TaskStatus[] = [
  TASK_STATUS.OPEN,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
];

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const satisfies Record<string, TaskPriority>;

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.LOW,
];

export const TASK_TYPE = {
  ASSIGNMENT: 'assignment',
  EXAM: 'exam',
  RECORDING: 'recording',
  PROJECT: 'project',
  READING: 'reading',
} as const satisfies Record<string, TaskType>;

export const TASK_TYPES: readonly TaskType[] = [
  TASK_TYPE.ASSIGNMENT,
  TASK_TYPE.EXAM,
  TASK_TYPE.RECORDING,
  TASK_TYPE.PROJECT,
  TASK_TYPE.READING,
];

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  [TASK_STATUS.OPEN]: TASK_STATUS.IN_PROGRESS,
  [TASK_STATUS.IN_PROGRESS]: TASK_STATUS.DONE,
  [TASK_STATUS.DONE]: TASK_STATUS.OPEN,
};

export const VIEW = {
  TABLE: 'table',
  KANBAN: 'kanban',
  TIMELINE: 'timeline',
} as const;

export const STORAGE_KEY = 'taskTracker.v1';
export const BACKUP_KEYS = [
  'taskTracker.backup.1',
  'taskTracker.backup.2',
  'taskTracker.backup.3',
] as const;
export const STORAGE_VERSION = 1 as const;

export const URGENT_WINDOW_DAYS = 7;

/** Hardcoded for now — shown in the top-bar breadcrumb. */
export const SEMESTER_CONTEXT = "סמסטר ב' 2026";
export const TIME_RANGE_LABEL = '30 ימים אחרונים';
export const COMPLETION_WINDOW_DAYS = 14;
