import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className,
      )}
    >
      {icon && <div className="text-faint opacity-60">{icon}</div>}
      <div>
        <h3 className="font-display text-xl font-semibold text-text mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
