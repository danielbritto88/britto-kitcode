import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Número-protagonista da tela. Bodoni clamp 56–128px com halo âmbar opcional.
// PROJETO.md §8.5 — uso obrigatório em HomePage; permitido em FuelPage acima da Gauge.
type HeroNumberProps = {
  children: ReactNode;
  unit?: string;
  halo?: boolean | 'strong';
  align?: 'left' | 'center' | 'right';
  className?: string;
  ariaLabel: string;
};

const ALIGN: Record<NonNullable<HeroNumberProps['align']>, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export function HeroNumber({
  children,
  unit,
  halo = false,
  align = 'center',
  className,
  ariaLabel,
}: HeroNumberProps) {
  const reduce = useReducedMotion();
  const haloClass = halo === 'strong' ? 'halo-accent-strong' : halo ? 'halo-accent' : '';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={reduce ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', damping: 22, stiffness: 220, mass: 0.7 }}
      className={cn('relative flex flex-col py-2 isolate', ALIGN[align], haloClass, className)}
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-2">
        <span className="text-hero" aria-hidden="true">
          {children}
        </span>
        {unit && (
          <span className="text-instrument-label mt-3" aria-hidden="true">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
}
