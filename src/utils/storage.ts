import { BACKUP_KEYS, STORAGE_KEY, STORAGE_VERSION } from '@/constants/task';
import type { Task } from '@/types/task';

export interface StoredBlob {
  version: typeof STORAGE_VERSION;
  tasks: Task[];
}

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.course === 'string' &&
    typeof t.type === 'string' &&
    (t.deadline === null || typeof t.deadline === 'string') &&
    typeof t.priority === 'string' &&
    typeof t.status === 'string' &&
    typeof t.notes === 'string' &&
    typeof t.link === 'string' &&
    Array.isArray(t.tags) &&
    (t.estimatedMinutes === null || typeof t.estimatedMinutes === 'number') &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string' &&
    (t.completedAt === null || typeof t.completedAt === 'string') &&
    Array.isArray(t.statusHistory)
  );
}

/** Narrows an unknown blob; throws on bad shape or unknown version. */
export function migrate(input: unknown): StoredBlob {
  if (!input || typeof input !== 'object') {
    throw new StorageError('blob is not an object');
  }
  const blob = input as Record<string, unknown>;

  if (blob.version === STORAGE_VERSION && Array.isArray(blob.tasks)) {
    const tasks = blob.tasks.filter(isTask);
    return { version: STORAGE_VERSION, tasks };
  }

  // Future migrations would go here, e.g.:
  // if (blob.version === 0) return migrateV0toV1(blob);

  throw new StorageError(`unknown schema version: ${String(blob.version)}`);
}

export function loadState(): Task[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return migrate(parsed).tasks;
  } catch (err) {
    console.error('[storage] loadState failed', err);
    return [];
  }
}

function rotateBackups(current: string | null): void {
  if (current === null) return;
  try {
    for (let i = BACKUP_KEYS.length - 1; i >= 1; i -= 1) {
      const prev = localStorage.getItem(BACKUP_KEYS[i - 1]!);
      if (prev !== null) {
        localStorage.setItem(BACKUP_KEYS[i]!, prev);
      }
    }
    localStorage.setItem(BACKUP_KEYS[0]!, current);
  } catch (err) {
    console.warn('[storage] backup rotation failed', err);
  }
}

export function saveState(tasks: Task[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    rotateBackups(current);
    const blob: StoredBlob = { version: STORAGE_VERSION, tasks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch (err) {
    console.error('[storage] saveState failed', err);
    throw new StorageError('saveState failed', err);
  }
}

export function clearState(): void {
  if (typeof localStorage === 'undefined') return;
  const current = localStorage.getItem(STORAGE_KEY);
  rotateBackups(current);
  localStorage.removeItem(STORAGE_KEY);
}
