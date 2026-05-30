import { cn } from '@/lib/utils';

// Ponto de timeline com halo. 3 estados: ok, soon (pulsante), overdue.
// PROJETO.md §8.5 — usado em MaintenancePage como timeline única.
type TimelineDotStatus = 'ok' | 'soon' | 'overdue';

type TimelineDotProps = {
  status: TimelineDotStatus;
  size?: number;
  className?: string;
};

const COLOR_BY_STATUS: Record<TimelineDotStatus, string> = {
  ok: 'var(--graphite)',
  soon: 'var(--accent)',
  overdue: 'var(--danger)',
};

export function TimelineDot({ status, size = 8, className }: TimelineDotProps) {
  const color = COLOR_BY_STATUS[status];
  const haloSize = size * 2;

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: haloSize, height: haloSize }}
      role="img"
      aria-label={
        status === 'overdue'
          ? 'em atraso'
          : status === 'soon'
            ? 'próxima'
            : 'em dia'
      }
    >
      {/* halo */}
      <span
        aria-hidden="true"
        className={status === 'soon' ? 'tc-pulse' : ''}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          opacity: 0.18,
        }}
      />
      {/* dot */}
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      <style>{`
        @keyframes tc-pulse {
          0%, 100% { transform: scale(1); opacity: 0.18; }
          50%      { transform: scale(1.35); opacity: 0.05; }
        }
        .tc-pulse {
          animation: tc-pulse 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .tc-pulse { animation: none; }
        }
      `}</style>
    </span>
  );
}
