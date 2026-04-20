import { TASK_PRIORITY, TASK_STATUS } from '@/constants/task';
import type { TaskPriority, TaskStatus } from '@/types/task';

/** Recharts + custom bar fill hex values — keep in sync with CSS vars. */
export const HEX = {
  accent: '#FF780A',
  open: '#9194A1',
  progress: '#5794F2',
  done: '#73BF69',
  warn: '#F2CC0C',
  danger: '#F2495C',
  muted: '#656A73',
  borderInner: '#22252B',
  panel: '#181B1F',
  panelElev: '#22252B',
  textMuted: '#9194A1',
} as const;

export const STATUS_HEX: Record<TaskStatus, string> = {
  [TASK_STATUS.OPEN]: HEX.open,
  [TASK_STATUS.IN_PROGRESS]: HEX.progress,
  [TASK_STATUS.DONE]: HEX.done,
};

export type BadgeTone = 'danger' | 'warning' | 'info' | 'success' | 'muted';

export const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  [TASK_PRIORITY.HIGH]: 'danger',
  [TASK_PRIORITY.MEDIUM]: 'warning',
  [TASK_PRIORITY.LOW]: 'muted',
};

export const STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  [TASK_STATUS.OPEN]: 'muted',
  [TASK_STATUS.IN_PROGRESS]: 'info',
  [TASK_STATUS.DONE]: 'success',
};

/** Short engineering-style label: P0/P1/P2 */
export const PRIORITY_CODE: Record<TaskPriority, string> = {
  [TASK_PRIORITY.HIGH]: 'P0',
  [TASK_PRIORITY.MEDIUM]: 'P1',
  [TASK_PRIORITY.LOW]: 'P2',
};
