import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium select-none',
    'transition-all duration-150 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-[#1A1816] hover:bg-[var(--accent-hover)]',
        ghost:
          'bg-transparent text-muted hover:text-text hover:bg-surface-2',
        outline:
          'border border-border text-text bg-transparent hover:border-accent hover:text-accent',
        danger:
          'bg-[var(--danger-soft)] text-danger hover:bg-danger hover:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-lg',
        md: 'h-11 px-5 text-base rounded-xl',
        lg: 'h-14 px-6 text-lg rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
