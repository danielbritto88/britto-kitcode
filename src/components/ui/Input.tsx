import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-muted tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-12 w-full rounded-xl border border-border bg-surface px-4',
            'text-text placeholder:text-faint',
            'transition-colors duration-150',
            'focus:outline-none focus:border-accent',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-danger focus:border-danger',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
