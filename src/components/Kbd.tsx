import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: Props) {
  return (
    <kbd
      className={cn(
        'num inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm border border-border-strong bg-panel-elev px-1 text-[10px] font-medium text-body',
        className
      )}
    >
      {children}
    </kbd>
  );
}
