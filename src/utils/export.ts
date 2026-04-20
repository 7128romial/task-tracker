import { format } from 'date-fns';
import { STORAGE_VERSION } from '@/constants/task';
import type { Task } from '@/types/task';
import { migrate, type StoredBlob } from '@/utils/storage';

export function exportJson(tasks: Task[]): void {
  const blob: StoredBlob = { version: STORAGE_VERSION, tasks };
  const json = JSON.stringify(blob, null, 2);
  const filename = `tasks-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): StoredBlob {
  const parsed: unknown = JSON.parse(text);
  return migrate(parsed);
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === 'string' ? result : '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
