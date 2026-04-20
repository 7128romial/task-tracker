import { ArrowDown, ArrowUp } from 'lucide-react';
import { Panel } from '@/components/Panel';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: number | string;
  body: string;
  barColor: string;
  /** "good" = green up arrows, red down. "inverse" = red up arrows, green down. "neutral" = amber. */
  deltaTone?: 'good' | 'inverse' | 'neutral';
  delta?: number;
  valueColor?: string;
  suffix?: string;
}

export function StatPanel({
  title,
  value,
  body,
  barColor,
  delta = 0,
  deltaTone = 'inverse',
  valueColor,
  suffix,
}: Props) {
  const deltaLabel =
    delta === 0 ? '±0' : delta > 0 ? `+${delta}` : `${delta}`;
  const deltaColor =
    delta === 0
      ? 'text-subtle'
      : deltaTone === 'neutral'
        ? 'text-severity-warn'
        : deltaTone === 'good'
          ? delta > 0
            ? 'text-severity-done'
            : 'text-severity-danger'
          : delta > 0
            ? 'text-severity-danger'
            : 'text-severity-done';

  return (
    <Panel title={title} barColor={barColor}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'num text-3xl font-medium leading-none tracking-tight',
            valueColor ?? 'text-primary'
          )}
        >
          {value}
        </span>
        {suffix && <span className="text-xs text-subtle">{suffix}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{body}</span>
        <span className={cn('num inline-flex items-center gap-0.5 text-[11px]', deltaColor)}>
          {delta !== 0 &&
            (delta > 0 ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            ))}
          {deltaLabel}
        </span>
      </div>
    </Panel>
  );
}
