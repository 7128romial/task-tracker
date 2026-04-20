import { StatPanel } from '@/components/StatPanel';
import { HEX } from '@/constants/colors';
import { t } from '@/locales/he';
import { selectStats, useTaskStore } from '@/stores/taskStore';

export function StatsRow() {
  const stats = useTaskStore(selectStats);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t.stats.open}>
      <StatPanel
        title={t.stats.open}
        value={stats.open}
        body={t.stats.openBody}
        barColor={HEX.open}
        delta={stats.deltaOpen}
        deltaTone="inverse"
      />
      <StatPanel
        title={t.stats.inProgress}
        value={stats.inProgress}
        body={t.stats.progressBody}
        barColor={HEX.progress}
        delta={stats.deltaInProgress}
        deltaTone="inverse"
      />
      <StatPanel
        title={t.stats.done}
        value={stats.done}
        suffix={stats.total > 0 ? `· ${stats.donePercent}%` : undefined}
        body={t.stats.doneBody}
        barColor={HEX.done}
        delta={stats.deltaDone}
        deltaTone="good"
        valueColor="text-severity-done"
      />
      <StatPanel
        title={t.stats.urgent}
        value={stats.urgentThisWeek}
        body={t.stats.urgentBody}
        barColor={HEX.accent}
        delta={stats.deltaUrgent}
        deltaTone="neutral"
        valueColor="text-accent"
      />
    </section>
  );
}
