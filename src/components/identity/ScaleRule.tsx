import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Régua horizontal de marcadores. Substitui grid de KPIs em HomePage.
// PROJETO.md §8.5 — labels uppercase + valor médio + tick âmbar no destaque.
export type ScaleRuleItem = {
  label: string;
  value: ReactNode;
  highlighted?: boolean;
  ariaLabel?: string;
};

type ScaleRuleProps = {
  items: ScaleRuleItem[];
  className?: string;
};

export function ScaleRule({ items, className }: ScaleRuleProps) {
  return (
    <div
      role="group"
      className={cn('flex w-full divide-x divide-border-soft', className)}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 relative"
          aria-label={item.ariaLabel}
        >
          {item.highlighted && (
            <span
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-2 bg-accent rounded-b-sm"
            />
          )}
          <span
            className={cn(
              'text-instrument-label',
              item.highlighted && 'text-accent',
            )}
          >
            {item.label}
          </span>
          <span
            className={cn(
              'font-display text-xl leading-none',
              item.highlighted ? 'text-accent' : 'text-text',
            )}
            style={{ fontVariationSettings: "'opsz' 72, 'wght' 500" }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
