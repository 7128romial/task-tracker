import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY,
  TASK_STATUS,
  TASK_STATUSES,
  TASK_TYPE,
  TASK_TYPES,
} from '@/constants/task';
import { PRIORITY_CODE } from '@/constants/colors';
import { t } from '@/locales/he';
import type { Task, TaskInput, TaskPriority, TaskStatus, TaskType } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { shortId } from '@/utils/id';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

interface FormState {
  title: string;
  course: string;
  type: TaskType;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  link: string;
  tagsInput: string;
  estimatedMinutes: string;
}

const emptyForm: FormState = {
  title: '',
  course: '',
  type: TASK_TYPE.ASSIGNMENT,
  deadline: '',
  priority: TASK_PRIORITY.MEDIUM,
  status: TASK_STATUS.OPEN,
  notes: '',
  link: '',
  tagsInput: '',
  estimatedMinutes: '',
};

function fromTask(task: Task): FormState {
  return {
    title: task.title,
    course: task.course,
    type: task.type,
    deadline: task.deadline ?? '',
    priority: task.priority,
    status: task.status,
    notes: task.notes,
    link: task.link,
    tagsInput: task.tags.join(', '),
    estimatedMinutes: task.estimatedMinutes === null ? '' : String(task.estimatedMinutes),
  };
}

function toInput(form: FormState): TaskInput {
  const tags = form.tagsInput
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  const mins = form.estimatedMinutes.trim();
  const est = mins.length > 0 && !Number.isNaN(Number(mins)) ? Number(mins) : null;
  return {
    title: form.title.trim(),
    course: form.course.trim(),
    type: form.type,
    deadline: form.deadline.trim() === '' ? null : form.deadline,
    priority: form.priority,
    status: form.status,
    notes: form.notes,
    link: form.link.trim(),
    tags,
    estimatedMinutes: est,
  };
}

export function TaskForm({ open, onOpenChange, task }: Props) {
  const isMobile = useIsMobile();
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const isEdit = task !== null;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(task ? fromTask(task) : emptyForm);
      setShowDeleteConfirm(false);
    }
  }, [open, task]);

  const titleValid = useMemo(() => form.title.trim().length > 0, [form.title]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!titleValid) return;
    const input = toInput(form);
    try {
      if (isEdit && task) {
        updateTask(task.id, input);
        toast.success(t.toast.updated);
      } else {
        addTask(input);
        toast.success(t.toast.saved);
      }
      onOpenChange(false);
    } catch {
      toast.error(t.toast.storageError);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    toast.success(t.toast.deleted);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const handleKey: React.KeyboardEventHandler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const headerRight = isEdit && task ? (
    <span className="num text-[11px] text-subtle">{shortId(task.id)}</span>
  ) : null;

  const body = (
    <form onSubmit={handleSubmit} onKeyDown={handleKey} className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3.5 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-title">{t.form.labelTitle}</Label>
          <Input
            id="task-title"
            autoFocus
            required
            value={form.title}
            placeholder={t.form.placeholderTitle}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-course">{t.form.labelCourse}</Label>
            <Input
              id="task-course"
              value={form.course}
              placeholder={t.form.placeholderCourse}
              onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t.form.labelType}</Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as TaskType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((ty) => (
                  <SelectItem key={ty} value={ty}>
                    {t.types[ty]} <span className="num text-subtle">· {ty}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-deadline">{t.form.labelDeadline}</Label>
            <Input
              id="task-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              className="num"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t.form.labelPriority}</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((pr) => (
                  <SelectItem key={pr} value={pr}>
                    <span className="num text-subtle me-1">{PRIORITY_CODE[pr]}</span>
                    {t.priorities[pr]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label>{t.form.labelStatus}</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {t.statusesHe[st]} <span className="num text-subtle">· {st}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-minutes">{t.form.labelEstimated}</Label>
            <Input
              id="task-minutes"
              type="number"
              min={0}
              inputMode="numeric"
              value={form.estimatedMinutes}
              onChange={(e) => setForm((p) => ({ ...p, estimatedMinutes: e.target.value }))}
              className="num"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-notes">{t.form.labelNotes}</Label>
          <Textarea
            id="task-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-link">{t.form.labelLink}</Label>
            <Input
              id="task-link"
              type="url"
              value={form.link}
              placeholder={t.form.placeholderLink}
              dir="ltr"
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-tags">{t.form.labelTags}</Label>
            <Input
              id="task-tags"
              value={form.tagsInput}
              placeholder={t.form.placeholderTags}
              onChange={(e) => setForm((p) => ({ ...p, tagsInput: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 border-t border-border-inner pt-3 sm:flex-row sm:items-center sm:justify-between">
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            className="text-severity-danger hover:bg-severity-danger/10 hover:text-severity-danger"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={t.a11y.deleteTask}
          >
            <Trash2 className="h-3 w-3" />
            {t.form.delete}
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="flex-1 sm:flex-initial" onClick={() => onOpenChange(false)}>
            {t.form.cancel}
          </Button>
          <Button type="submit" className="flex-1 sm:flex-initial" disabled={!titleValid}>
            {t.form.save}
            <span className="num hidden text-[10px] opacity-70 sm:inline">· {t.form.saveHint}</span>
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-panel/95 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm text-center">
            <h3 id="confirm-delete-title" className="text-sm font-semibold text-primary">
              {t.form.confirmDeleteTitle}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground">{t.form.confirmDeleteBody}</p>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                {t.form.cancel}
              </Button>
              <Button type="button" variant="destructive" className="flex-1" onClick={handleDelete}>
                {t.form.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="relative h-[92vh]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{isEdit ? t.form.editTitle : t.form.addTitle}</SheetTitle>
              {headerRight}
            </div>
            <SheetDescription className="sr-only">{isEdit ? t.form.editTitle : t.form.addTitle}</SheetDescription>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEdit ? t.form.editTitle : t.form.addTitle}</DialogTitle>
            {headerRight}
          </div>
          <DialogDescription className="sr-only">{isEdit ? t.form.editTitle : t.form.addTitle}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
