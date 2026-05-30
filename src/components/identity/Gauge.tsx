import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Arco SVG de 240° com agulha física (spring damping=12, stiffness=90).
// PROJETO.md §8.5 — usado em FuelPage como medidor de consumo (km/L).
type GaugeProps = {
  value: number;
  min?: number;
  max: number;
  label?: string;
  size?: number;
  /** fração do arco final pintada como zona de perigo (default 0.85 → 15% final) */
  dangerThreshold?: number;
  /** fração do arco inicial pintada como zona "boa" em positive (default 0 → desligada) */
  positiveThreshold?: number;
  className?: string;
};

const START_DEG = 150;
const SWEEP_DEG = 240;
const END_DEG = START_DEG + SWEEP_DEG;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const a = polar(cx, cy, r, fromDeg);
  const b = polar(cx, cy, r, toDeg);
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y}`;
}

export function Gauge({
  value,
  min = 0,
  max,
  label,
  size = 220,
  dangerThreshold = 0.85,
  positiveThreshold = 0,
  className,
}: GaugeProps) {
  const reduce = useReducedMotion();
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const currentDeg = START_DEG + t * SWEEP_DEG;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const trackWidth = Math.max(4, size * 0.035);

  const tracks = useMemo(() => {
    const full = arcPath(cx, cy, radius, START_DEG, END_DEG);
    const danger =
      dangerThreshold < 1
        ? arcPath(cx, cy, radius, START_DEG + dangerThreshold * SWEEP_DEG, END_DEG)
        : null;
    const positive =
      positiveThreshold > 0
        ? arcPath(cx, cy, radius, START_DEG, START_DEG + positiveThreshold * SWEEP_DEG)
        : null;
    const filled = t > 0.001 ? arcPath(cx, cy, radius, START_DEG, currentDeg) : null;
    return { full, danger, positive, filled };
  }, [cx, cy, radius, dangerThreshold, positiveThreshold, t, currentDeg]);

  const needleEnd = polar(cx, cy, radius * 0.92, 0);

  return (
    <div
      className={cn('relative inline-flex flex-col items-center', className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label ?? 'medidor'}
    >
      <svg
        width={size}
        height={size * 0.72}
        viewBox={`0 ${size * 0.18} ${size} ${size * 0.62}`}
        className="overflow-visible"
      >
        {/* track full */}
        <path
          d={tracks.full}
          fill="none"
          stroke="var(--graphite-soft)"
          strokeWidth={trackWidth}
          strokeLinecap="round"
        />

        {/* positive zone (low end) */}
        {tracks.positive && (
          <path
            d={tracks.positive}
            fill="none"
            stroke="var(--positive-soft)"
            strokeWidth={trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* danger zone (high end) */}
        {tracks.danger && (
          <path
            d={tracks.danger}
            fill="none"
            stroke="var(--danger-soft)"
            strokeWidth={trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* filled portion — sweep amber as value rises */}
        {tracks.filled && (
          <motion.path
            d={tracks.filled}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={trackWidth}
            strokeLinecap="round"
            initial={reduce ? undefined : { pathLength: 0 }}
            animate={reduce ? undefined : { pathLength: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 80, mass: 0.9 }}
          />
        )}

        {/* tick marks at 0, 25, 50, 75, 100% */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const deg = START_DEG + p * SWEEP_DEG;
          const inner = polar(cx, cy, radius - trackWidth * 1.2, deg);
          const outer = polar(cx, cy, radius + trackWidth * 0.6, deg);
          return (
            <line
              key={`tick-${p}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--text-faint)"
              strokeWidth={1}
              strokeLinecap="round"
              opacity={p === 0 || p === 1 ? 0.6 : 0.35}
            />
          );
        })}

        {/* needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="var(--accent-bright)"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ originX: cx, originY: cy }}
          initial={{ rotate: START_DEG }}
          animate={{ rotate: currentDeg }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', damping: 12, stiffness: 90, mass: 1 }
          }
        />

        {/* center cap */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.035}
          fill="var(--surface-elev)"
          stroke="var(--accent-bright)"
          strokeWidth={1.5}
        />
      </svg>

      {label && <span className="text-instrument-label mt-2">{label}</span>}
    </div>
  );
}
