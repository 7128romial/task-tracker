import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title?: React.ReactNode;
  titleEnd?: React.ReactNode;
  barColor?: string;
  children: React.ReactNode;
  bodyClassName?: string;
  className?: string;
  /** Hide the panel header entirely. */
  bare?: boolean;
  /** Show the 3-dot menu affordance on the end of the header. */
  showMenu?: boolean;
}

export function Panel({
  title,
  titleEnd,
  barColor,
  children,
  bodyClassName,
  className,
  bare,
  showMenu = true,
}: Props) {
  return (
    <section className={cn('panel relative', className)}>
      {barColor && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{ background: barColor }}
          aria-hidden
        />
      )}
      {!bare && (title || titleEnd) && (
        <header className="panel-header">
          <div className="flex min-w-0 items-center gap-2">
            {typeof title === 'string' ? (
              <span className="panel-title truncate">{title}</span>
            ) : (
              title
            )}
          </div>
          <div className="flex items-center gap-1 text-subtle">
            {titleEnd}
            {showMenu && (
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-subtle transition-colors hover:bg-panel-hover hover:text-body"
                aria-label="אפשרויות"
                tabIndex={-1}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>
      )}
      <div className={cn('panel-body', bodyClassName)}>{children}</div>
    </section>
  );
}
