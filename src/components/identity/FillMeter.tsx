import { motion, useReducedMotion } from 'framer-motion';

interface FillMeterProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  className?: string;
}

const OIL_COLOR = '#3D3520';

export function FillMeter({
  value,
  max = 100,
  label,
  size = 110,
  className,
}: FillMeterProps) {
  const reduce = useReducedMotion();
  const t = Math.max(0, Math.min(1, value / (max || 1)));

  const W = size * 0.45;
  const H = size * 0.85;
  const cx = size / 2;
  const fillH = H * 0.72;
  const fillTop = H * 0.22;

  const fillHeight = t * fillH;
  const fillBottom = fillTop + fillH;

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className ?? ''}`}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? 'medidor'}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Tick marks at 0%, 25%, 50%, 75%, 100% */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const y = fillBottom - p * fillH;
          const tickLen = y < fillTop + fillH * 0.15 ? W * 0.5 : W * 0.3;
          return (
            <g key={`tick-${p}`}>
              <line
                x1={cx - W / 2}
                y1={y}
                x2={cx - W / 2 + tickLen}
                y2={y}
                stroke="#0D0D0D"
                strokeWidth={1.2}
                strokeLinecap="round"
                opacity={p === 0 || p === 1 ? 0.6 : 0.3}
              />
            </g>
          );
        })}

        {/* Dipstick body — outer border */}
        <rect
          x={cx - W / 2}
          y={fillTop}
          width={W}
          height={fillH}
          rx={4}
          fill="transparent"
          stroke="#0D0D0D"
          strokeWidth={2}
        />

        {/* Fill level — oil inside dipstick */}
        {t > 0.001 && (
          <motion.rect
            x={cx - W / 2 + 2}
            y={fillBottom - fillHeight}
            width={W - 4}
            height={fillHeight}
            rx={2}
            fill={OIL_COLOR}
            initial={reduce ? undefined : { scaleY: 0, y: fillBottom }}
            animate={reduce ? undefined : { scaleY: 1, y: 0 }}
            style={{ originY: fillBottom, originX: cx }}
            transition={{ type: 'spring', damping: 14, stiffness: 70, mass: 0.8 }}
          />
        )}

        {/* "MIN" label */}
        <text
          x={cx + W / 2 + 6}
          y={fillBottom + 1}
          fill="rgba(13,13,13,0.4)"
          fontSize={7}
          fontFamily="Jost Variable, sans-serif"
          fontWeight={700}
          letterSpacing="0.1em"
        >
          MIN
        </text>

        {/* "MAX" label */}
        <text
          x={cx + W / 2 + 6}
          y={fillTop + 4}
          fill="rgba(13,13,13,0.4)"
          fontSize={7}
          fontFamily="Jost Variable, sans-serif"
          fontWeight={700}
          letterSpacing="0.1em"
        >
          MAX
        </text>
      </svg>

      {label && <span className="text-instrument-label mt-1">{label}</span>}
    </div>
  );
}
