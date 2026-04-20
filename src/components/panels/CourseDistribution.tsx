import { Panel } from '@/components/Panel';
import { HEX } from '@/constants/colors';
import { t } from '@/locales/he';
import { selectCourseDistribution, useTaskStore } from '@/stores/taskStore';

export function CourseDistribution() {
  const rows = useTaskStore(selectCourseDistribution);

  return (
    <Panel title={t.panels.distributionTitle} className="min-h-[220px]">
      {rows.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center text-[11px] text-subtle">
          {t.panels.distributionEmpty}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {rows.map((row) => {
              const total = row.total || 1;
              return (
                <li key={row.course} className="grid grid-cols-[80px_1fr_28px] items-center gap-3">
                  <span
                    className="truncate text-[11px] text-body"
                    title={row.course}
                  >
                    {row.course}
                  </span>
                  <div className="flex h-[14px] overflow-hidden rounded-sm border border-border-inner bg-panel-elev" aria-hidden>
                    {row.open > 0 && (
                      <span
                        className="block h-full"
                        style={{ width: `${(row.open / total) * 100}%`, background: HEX.open }}
                      />
                    )}
                    {row.inProgress > 0 && (
                      <span
                        className="block h-full"
                        style={{ width: `${(row.inProgress / total) * 100}%`, background: HEX.progress }}
                      />
                    )}
                    {row.done > 0 && (
                      <span
                        className="block h-full"
                        style={{ width: `${(row.done / total) * 100}%`, background: HEX.done }}
                      />
                    )}
                  </div>
                  <span className="num text-end text-[11px] text-primary">{row.total}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border-inner pt-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: HEX.open }} aria-hidden />
              <span className="text-muted-foreground">OPEN</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: HEX.progress }} aria-hidden />
              <span className="text-muted-foreground">IN PROGRESS</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: HEX.done }} aria-hidden />
              <span className="text-muted-foreground">DONE</span>
            </span>
          </div>
        </>
      )}
    </Panel>
  );
}
