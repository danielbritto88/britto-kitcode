import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Substitui todos os spinners. Agulha pulsando 0 → redline em loop.
// PROJETO.md §8.5/§8.6 — usar em qualquer carregamento.
type GaugeSpinnerProps = {
  size?: number;
  label?: string;
  className?: string;
};

const START_DEG = 150;
const END_DEG = 390;

export function GaugeSpinner({ size = 32, label, className }: GaugeSpinnerProps) {
  const reduce = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const sw = Math.max(2, size * 0.06);

  // Track arc path 240°
  const trackPath = (() => {
    const fromRad = (START_DEG * Math.PI) / 180;
    const toRad = (END_DEG * Math.PI) / 180;
    const x1 = cx + r * Math.cos(fromRad);
    const y1 = cy + r * Math.sin(fromRad);
    const x2 = cx + r * Math.cos(toRad);
    const y2 = cy + r * Math.sin(toRad);
    return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  })();

  return (
    <div
      role="status"
      aria-label={label ?? 'Carregando'}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <svg
        width={size}
        height={size * 0.72}
        viewBox={`0 ${size * 0.18} ${size} ${size * 0.62}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <path
          d={trackPath}
          fill="none"
          stroke="var(--graphite-soft)"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <motion.line
          x1={cx}
          y1={cy}
          x2={cx + r * 0.92}
          y2={cy}
          stroke="var(--accent-bright)"
          strokeWidth={Math.max(1.5, size * 0.06)}
          strokeLinecap="round"
          style={{ originX: cx, originY: cy }}
          initial={{ rotate: START_DEG }}
          animate={
            reduce
              ? { rotate: (START_DEG + END_DEG) / 2 }
              : { rotate: [START_DEG, END_DEG, START_DEG] }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.6, ease: [0.65, 0, 0.35, 1], repeat: Infinity }
          }
        />
        <circle cx={cx} cy={cy} r={size * 0.06} fill="var(--accent-bright)" />
      </svg>
    </div>
  );
}
