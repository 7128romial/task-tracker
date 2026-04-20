import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/locales/he';

interface Props {
  onNewTask: () => void;
}

export function Header({ onNewTask }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h1 className="font-fraunces text-2xl italic leading-tight text-ink sm:text-3xl">
            {t.app.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {t.app.subtitle}
          </p>
        </div>
        <Button onClick={onNewTask} aria-label={t.header.addTask} className="min-h-[44px]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.header.addTask}</span>
          <span className="sm:hidden">{t.header.addTaskShort}</span>
        </Button>
      </div>
    </header>
  );
}
