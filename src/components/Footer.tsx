import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/Kbd';
import { t } from '@/locales/he';
import { useTaskStore } from '@/stores/taskStore';
import { buildSampleTasks } from '@/stores/sampleData';
import { exportJson, parseImport, readFileAsText } from '@/utils/export';
import type { Task } from '@/types/task';

function useSecondsSince(isoTimestamp: string): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);
  return Math.max(0, Math.round((Date.now() - new Date(isoTimestamp).getTime()) / 1000));
}

function formatSince(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function Footer() {
  const tasks = useTaskStore((s) => s.tasks);
  const lastMutationAt = useTaskStore((s) => s.lastMutationAt);
  const replaceAll = useTaskStore((s) => s.replaceAll);
  const clearAll = useTaskStore((s) => s.clearAll);
  const loadSample = useTaskStore((s) => s.loadSample);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Task[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const seconds = useSecondsSince(lastMutationAt);

  const handleExport = () => {
    try {
      exportJson(tasks);
      toast.success(t.toast.exportSuccess);
    } catch {
      toast.error(t.toast.storageError);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const blob = parseImport(text);
      setPendingImport(blob.tasks);
    } catch (err) {
      console.error(err);
      toast.error(t.toast.importError);
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    replaceAll(pendingImport);
    toast.success(t.toast.importSuccess(pendingImport.length));
    setPendingImport(null);
  };

  const handleClear = () => {
    clearAll();
    toast.success(t.toast.cleared);
    setConfirmClear(false);
  };

  return (
    <footer className="mx-auto w-full max-w-[1440px] border-t border-border px-4 py-2">
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        {/* Left: live refresh indicator */}
        <div className="flex items-center gap-2">
          <span className="pulse-dot" aria-hidden />
          <span>
            {t.footer.refreshedPrefix} <span className="num text-body">{formatSince(seconds)}</span>
          </span>
          <span className="text-subtle">·</span>
          <span>
            <span className="num text-body">{tasks.length}</span> {t.footer.tasksSuffix}
          </span>
        </div>

        {/* Middle: shortcut legend */}
        <div className="hidden items-center gap-1.5 md:flex">
          <span className="text-subtle">{t.footer.shortcutsLabel}</span>
          <Kbd>N</Kbd>
          <span className="text-subtle">{t.footer.shortcutNew}</span>
          <span className="text-subtle">·</span>
          <Kbd>/</Kbd>
          <span className="text-subtle">{t.footer.shortcutSearch}</span>
          <span className="text-subtle">·</span>
          <Kbd>1</Kbd>
          <Kbd>2</Kbd>
          <Kbd>3</Kbd>
          <span className="text-subtle">{t.footer.shortcutViews}</span>
          <span className="text-subtle">·</span>
          <Kbd>⌘K</Kbd>
          <span className="text-subtle">{t.footer.shortcutPalette}</span>
        </div>

        {/* Right: storage + actions */}
        <div className="ms-auto flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => loadSample(buildSampleTasks())} className="gap-1">
            <Sparkles className="h-3 w-3" />
            {t.footer.loadSample}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1">
            <Download className="h-3 w-3" />
            {t.footer.export}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="gap-1">
            <Upload className="h-3 w-3" />
            {t.footer.import}
          </Button>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClear(true)}
              className="gap-1 text-muted-foreground hover:text-severity-danger"
            >
              <Trash2 className="h-3 w-3" />
              {t.footer.clear}
            </Button>
          )}
          <span className="num ms-2 hidden text-subtle md:inline">{t.footer.storage}</span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />

      <Dialog open={pendingImport !== null} onOpenChange={(o) => !o && setPendingImport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.footer.confirmImportTitle}</DialogTitle>
            <DialogDescription>
              {pendingImport ? t.footer.confirmImportWithCount(pendingImport.length) : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingImport(null)}>
              {t.form.cancel}
            </Button>
            <Button onClick={confirmImport}>{t.footer.confirmImport}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.footer.confirmClearTitle}</DialogTitle>
            <DialogDescription>{t.footer.confirmClearBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              {t.form.cancel}
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              {t.footer.confirmClear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
