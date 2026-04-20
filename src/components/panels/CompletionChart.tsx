import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Panel } from '@/components/Panel';
import { HEX } from '@/constants/colors';
import { COMPLETION_WINDOW_DAYS } from '@/constants/task';
import { t } from '@/locales/he';
import { selectCompletionSeries, useTaskStore } from '@/stores/taskStore';
import { formatDDMMYY } from '@/utils/dates';

interface ChartDatum {
  date: string;
  opened: number;
  completed: number;
  cumulativeCompleted: number;
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  name?: string;
  color?: string;
  value?: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-sm border border-border bg-panel-elev px-2.5 py-1.5 text-[11px] shadow-elevated">
      <div className="num mb-1 text-subtle">{formatDDMMYY(String(label))}</div>
      {payload.map((p, i) => (
        <div key={String(p.dataKey ?? i)} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden />
          <span className="text-body">{p.name}:</span>
          <span className="num text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function CompletionChart() {
  const data = useTaskStore((s) => selectCompletionSeries(s, COMPLETION_WINDOW_DAYS));
  const hasData = data.some((d) => d.opened > 0 || d.completed > 0);

  const firstLabel = data[0]?.date.slice(5);
  const lastLabel = data[data.length - 1]?.date.slice(5);

  return (
    <Panel title={t.panels.completionTitle} className="min-h-[220px]">
      {!hasData ? (
        <div className="flex h-[160px] items-center justify-center text-[11px] text-subtle">
          {t.panels.completionEmpty}
        </div>
      ) : (
        <>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data as ChartDatum[]} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="doneFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={HEX.done} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={HEX.done} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={HEX.borderInner} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} reversed />
                <YAxis hide />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: HEX.textMuted, strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeCompleted"
                  name={t.panels.seriesCompleted}
                  stroke={HEX.done}
                  strokeWidth={1.5}
                  fill="url(#doneFill)"
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  name={t.panels.seriesOpened}
                  stroke={HEX.accent}
                  strokeWidth={1.5}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-subtle">
            <span className="num">{firstLabel}</span>
            <span className="num">{lastLabel}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border-inner pt-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: HEX.done }} aria-hidden />
              <span className="text-muted-foreground">{t.panels.seriesCompleted}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: HEX.accent }} aria-hidden />
              <span className="text-muted-foreground">{t.panels.seriesOpened}</span>
            </span>
          </div>
        </>
      )}
    </Panel>
  );
}
