import { cn } from '@/lib/utils';
import type { BadgeTone } from '@/constants/colors';

interface Props {
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const toneClass: Record<BadgeTone, string> = {
  danger: 'border-severity-danger/30 bg-severity-danger/[0.08] text-severity-danger',
  warning: 'border-severity-warn/30 bg-severity-warn/[0.08] text-severity-warn',
  info: 'border-severity-progress/30 bg-severity-progress/[0.08] text-severity-progress',
  success: 'border-severity-done/30 bg-severity-done/[0.08] text-severity-done',
  muted: 'border-border-strong bg-panel-elev/60 text-body/80',
};

const dotClass: Record<BadgeTone, string> = {
  danger: 'bg-severity-danger',
  warning: 'bg-severity-warn',
  info: 'bg-severity-progress',
  success: 'bg-severity-done',
  muted: 'bg-border-strong',
};

export function Badge({ tone = 'muted', showDot = true, className, children }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium leading-none',
        toneClass[tone],
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotClass[tone])} aria-hidden />}
      {children}
    </span>
  );
}
