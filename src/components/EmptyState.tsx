import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/locales/he';

interface Props {
  onNewTask?: () => void;
  variant?: 'empty' | 'filtered';
}

export function EmptyState({ onNewTask, variant = 'empty' }: Props) {
  const copy = variant === 'filtered' ? t.emptyFiltered : t.empty;

  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
        <Sparkles className="h-6 w-6 text-accent" aria-hidden />
      </div>
      <h3 className="font-fraunces text-xl italic text-ink">{copy.title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{copy.body}</p>
      {variant === 'empty' && onNewTask && (
        <Button onClick={onNewTask} className="mt-2">
          {t.empty.addCta}
        </Button>
      )}
    </div>
  );
}
