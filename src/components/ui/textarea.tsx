import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[68px] w-full rounded-sm border border-border bg-panel px-2.5 py-2 text-xs text-body placeholder:text-subtle focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
