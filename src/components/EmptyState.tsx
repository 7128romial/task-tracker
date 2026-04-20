import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/locales/he';

interface Props {
  onNewTask?: () => void;
  variant?: 'empty' | 'filtered';
}

export function EmptyState({ onNewTask, variant = 'empty' }: Props) {
  const copy = variant === 'filtered' ? t.emptyFiltered : t.empty;

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-panel-elev text-subtle">
        <Inbox className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-sm font-medium text-primary">{copy.title}</h3>
      <p className="max-w-sm text-xs text-muted-foreground">{copy.body}</p>
      {variant === 'empty' && onNewTask && (
        <Button onClick={onNewTask} className="mt-1">
          {t.topbar.newTask}
        </Button>
      )}
    </div>
  );
}
