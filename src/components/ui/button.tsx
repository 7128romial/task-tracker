import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-accent text-black hover:bg-accent-hover',
        destructive: 'bg-severity-danger text-black hover:bg-severity-danger/90',
        outline: 'border border-border bg-panel hover:bg-panel-hover text-body',
        secondary: 'bg-panel-elev text-body hover:bg-panel-hover',
        ghost: 'text-body hover:bg-panel-hover',
        link: 'text-accent underline-offset-4 hover:underline',
        chip: 'border border-border-strong bg-panel-elev/60 text-body hover:bg-panel-hover',
      },
      size: {
        default: 'h-7 px-2.5 text-xs [&_svg]:size-3.5',
        sm: 'h-6 px-2 text-[11px] [&_svg]:size-3',
        lg: 'h-8 px-3 text-xs [&_svg]:size-4',
        icon: 'h-7 w-7 [&_svg]:size-3.5',
        'icon-sm': 'h-6 w-6 [&_svg]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
