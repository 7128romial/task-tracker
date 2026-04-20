import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({ label, value, onRemove, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-sm border border-border-strong bg-panel-elev/80 ps-2 pe-1 text-[11px]',
        className
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="text-subtle">=</span>
      <span className="text-body">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ms-1 inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-panel-hover hover:text-body"
        aria-label={`הסרת ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
