import { ChevronLeft, Clock, Plus, RotateCw, Command as CommandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/locales/he';
import { SEMESTER_CONTEXT, TIME_RANGE_LABEL } from '@/constants/task';
import { useTaskStore } from '@/stores/taskStore';

interface Props {
  onNewTask: () => void;
  onOpenPalette: () => void;
}

export function TopBar({ onNewTask, onOpenPalette }: Props) {
  const touch = useTaskStore((s) => s.replaceAll); // noop refresh; still animates indicator
  const tasks = useTaskStore((s) => s.tasks);

  const handleRefresh = () => {
    // Tapping refresh re-emits the same list so lastMutationAt bumps.
    touch([...tasks]);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-page/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-2">
        <BrandMark />
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-semibold tracking-tight text-primary">{t.app.title}</span>
          <ChevronLeft className="h-3.5 w-3.5 text-subtle" aria-hidden />
          <span className="text-body">{SEMESTER_CONTEXT}</span>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline" size="default" className="gap-1.5 text-[11px]">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">{TIME_RANGE_LABEL}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label={t.topbar.refresh}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenPalette}
            aria-label={t.topbar.openPalette}
            className="hidden sm:inline-flex"
          >
            <CommandIcon className="h-3 w-3" />
          </Button>
          <Button onClick={onNewTask} className="gap-1 text-[11px]">
            <Plus className="h-3 w-3" />
            <span>{t.topbar.newTask}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <div
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px]"
      style={{
        background: 'linear-gradient(135deg, #FF780A 0%, #F2CC0C 100%)',
      }}
      aria-hidden
    >
      <span className="text-[10px] font-bold text-black">T</span>
    </div>
  );
}
