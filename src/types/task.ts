export type TaskType = 'assignment' | 'exam' | 'recording' | 'project' | 'reading';
export type TaskStatus = 'open' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface StatusChange {
  status: TaskStatus;
  changedAt: string;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  type: TaskType;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  link: string;
  tags: string[];
  estimatedMinutes: number | null;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  statusHistory: StatusChange[];
}

export type TaskInput = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'statusHistory'
>;

export type TaskPatch = Partial<Omit<Task, 'id' | 'createdAt' | 'statusHistory'>>;

export type ViewMode = 'table' | 'kanban' | 'timeline';

export interface Filters {
  course: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
}
