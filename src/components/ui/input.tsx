import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-7 w-full rounded-sm border border-border bg-panel px-2.5 text-xs text-body placeholder:text-subtle focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
