import { useRef, useState } from 'react';
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
import { t } from '@/locales/he';
import { useTaskStore } from '@/stores/taskStore';
import { buildSampleTasks } from '@/stores/sampleData';
import { exportJson, parseImport, readFileAsText } from '@/utils/export';
import type { Task } from '@/types/task';

export function Footer() {
  const tasks = useTaskStore((s) => s.tasks);
  const replaceAll = useTaskStore((s) => s.replaceAll);
  const clearAll = useTaskStore((s) => s.clearAll);
  const loadSample = useTaskStore((s) => s.loadSample);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Task[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    try {
      exportJson(tasks);
      toast.success(t.toast.exportSuccess);
    } catch {
      toast.error(t.toast.storageError);
    }
  };

  const handleImportClick = () => {
    fileRef.current?.click();
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

  const handleSample = () => {
    loadSample(buildSampleTasks());
    toast.success(t.toast.sampleLoaded);
  };

  return (
    <footer className="mx-auto mt-8 w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6">
      <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {t.footer.taskCount}: <span className="num font-medium text-ink">{tasks.length}</span>
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden flex-wrap items-center gap-1.5 sm:inline-flex">
            <Kbd>N</Kbd> {t.footer.shortcutNew}
            <span className="mx-1">·</span>
            <Kbd>/</Kbd> {t.footer.shortcutSearch}
            <span className="mx-1">·</span>
            <Kbd>1</Kbd>
            <Kbd>2</Kbd>
            <Kbd>3</Kbd> {t.footer.shortcutViews}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSample}>
            <Sparkles className="h-3.5 w-3.5" />
            {t.footer.loadSample}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            {t.footer.export}
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-3.5 w-3.5" />
            {t.footer.import}
          </Button>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClear(true)}
              className="text-muted-foreground hover:text-priority-high"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.footer.clear}
            </Button>
          )}
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
            <DialogTitle className="font-fraunces italic">{t.footer.confirmImportTitle}</DialogTitle>
            <DialogDescription>
              {pendingImport
                ? t.footer.confirmImportWithCount(pendingImport.length)
                : t.footer.confirmImportBody}
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
            <DialogTitle className="font-fraunces italic">{t.footer.confirmClearTitle}</DialogTitle>
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="num inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-surface px-1 text-[10px] font-medium text-ink shadow-soft">
      {children}
    </kbd>
  );
}
