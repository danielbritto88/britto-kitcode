import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Hodômetro mecânico CSS-only. JetBrains Mono tabular, dígitos rolam em transformY.
// PROJETO.md §8.5 — usado no <KeyChip> do header e em qualquer tela com km do veículo.
type OdometerProps = {
  value: number;
  digits?: number;
  className?: string;
  unitLabel?: string;
};

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function Odometer({ value, digits = 6, className, unitLabel = 'km' }: OdometerProps) {
  const reduce = useReducedMotion();
  const safe = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  const padded = String(safe).padStart(digits, '0').slice(-digits);

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`${safe.toLocaleString('pt-BR')} ${unitLabel}`}
    >
      <span className="inline-flex gap-[2px]" aria-hidden="true">
        {padded.split('').map((d, i) => (
          <DigitWheel key={`wheel-${i}`} digit={Number.parseInt(d, 10)} reduce={!!reduce} />
        ))}
      </span>
      <span className="text-instrument-label" aria-hidden="true">
        {unitLabel}
      </span>
    </span>
  );
}

function DigitWheel({ digit, reduce }: { digit: number; reduce: boolean }) {
  return (
    <span
      className="text-mech relative inline-block bg-surface-2 rounded-[3px] overflow-hidden text-text"
      style={{
        width: '0.78em',
        height: '1.3em',
        lineHeight: '1.3em',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        style={{
          transform: `translateY(${-digit * 1.3}em)`,
          transition: reduce ? 'none' : 'transform 600ms cubic-bezier(0.65, 0, 0.35, 1)',
          willChange: 'transform',
        }}
      >
        {NUMBERS.map((n) => (
          <span key={n} style={{ height: '1.3em', lineHeight: '1.3em' }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
