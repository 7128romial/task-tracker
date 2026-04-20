import { CircleDashed, Circle, CheckCircle2, Flame } from 'lucide-react';
import { selectStats, useTaskStore } from '@/stores/taskStore';
import { t } from '@/locales/he';
import { cn } from '@/lib/utils';

interface CardProps {
  label: string;
  value: number;
  footnote?: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, footnote, icon, accent }: CardProps) {
  return (
    <div className="card-surface flex flex-col gap-2 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', accent)}>
          {icon}
        </span>
      </div>
      <div className="num font-fraunces text-3xl font-medium text-ink sm:text-4xl">
        {value}
      </div>
      {footnote && (
        <span className="text-xs text-muted-foreground">{footnote}</span>
      )}
    </div>
  );
}

export function StatsCards() {
  const stats = useTaskStore(selectStats);

  return (
    <section
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      aria-label={t.app.subtitle}
    >
      <StatCard
        label={t.stats.open}
        value={stats.open}
        icon={<CircleDashed className="h-4 w-4 text-status-open" />}
        accent="bg-status-open-bg"
      />
      <StatCard
        label={t.stats.inProgress}
        value={stats.inProgress}
        icon={<Circle className="h-4 w-4 text-status-progress" />}
        accent="bg-status-progress-bg"
      />
      <StatCard
        label={t.stats.done}
        value={stats.done}
        footnote={stats.total > 0 ? `${stats.donePercent}% ${t.stats.percentDone}` : undefined}
        icon={<CheckCircle2 className="h-4 w-4 text-status-done" />}
        accent="bg-status-done-bg"
      />
      <StatCard
        label={t.stats.urgent}
        value={stats.urgentThisWeek}
        icon={<Flame className="h-4 w-4 text-priority-high" />}
        accent="bg-priority-high-bg"
      />
    </section>
  );
}
