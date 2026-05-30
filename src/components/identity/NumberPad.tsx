import { useEffect, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

// Pad numérico gigante para AddFuelSheet — sem teclado nativo.
// PROJETO.md §8.5/§8.6 — confirmar exige long-press 250ms (gatilho de bomba).
type NumberPadProps = {
  value: string;
  onChange: (next: string) => void;
  onConfirm: () => void;
  decimal?: boolean;
  /** Modo BRL: value é string de centavos inteiros ("15035" = R$ 150,35). Display formata automaticamente. */
  currency?: boolean;
  confirmLabel?: string;
  longPressMs?: number;
  className?: string;
  /** opcional: prefixo visual no display (ignorado quando currency=true) */
  prefix?: string;
  /** opcional: sufixo visual (ex: "L") */
  suffix?: string;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function NumberPad({
  value,
  onChange,
  onConfirm,
  decimal = false,
  currency = false,
  confirmLabel = 'Confirmar',
  longPressMs = 250,
  className,
  prefix,
  suffix,
}: NumberPadProps) {
  const effectiveDecimal = decimal && !currency;
  const reduce = useReducedMotion();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  function press(key: string) {
    haptic('tap');
    if (key === 'back') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!effectiveDecimal || value.includes(',') || value.includes('.')) return;
      onChange((value || '0') + ',');
      return;
    }
    onChange(value + key);
  }

  function startHold() {
    if (!value) return;
    haptic('tap');
    setHolding(true);
    startedAtRef.current = performance.now();
    if (!reduce) {
      const tick = () => {
        const elapsed = performance.now() - (startedAtRef.current ?? 0);
        const p = Math.min(1, elapsed / longPressMs);
        setProgress(p);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setProgress(1);
    }
    timerRef.current = window.setTimeout(() => {
      haptic('success');
      onConfirm();
      cleanupHold();
    }, longPressMs);
  }

  function cleanupHold() {
    setHolding(false);
    setProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startedAtRef.current = null;
  }

  function cancelHold() {
    if (holding) cleanupHold();
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const keys: Array<{ k: string; label?: string; icon?: boolean }> = [
    ...DIGITS.map((d) => ({ k: d })),
    { k: effectiveDecimal ? '.' : '00' },
    { k: '0' },
    { k: 'back', icon: true },
  ];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Display */}
      <div
        className="flex items-baseline justify-center gap-2 py-4 select-none"
        aria-live="polite"
      >
        {prefix && !currency && <span className="text-instrument-label mb-2">{prefix}</span>}
        <span
          className="text-hero"
          style={{ fontSize: 'clamp(3rem, 14vw, 5rem)' }}
        >
          {currency
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                parseInt(value || '0', 10) / 100,
              )
            : (value || <span style={{ color: 'var(--text-ghost)' }}>0</span>)}
        </span>
        {suffix && <span className="text-instrument-label mb-2">{suffix}</span>}
      </div>

      {/* Pad */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map(({ k, icon }) => {
          if (k === '00' && effectiveDecimal) return null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={cn(
                'h-14 rounded-xl bg-surface-2 active:bg-surface-elev transition-colors',
                'flex items-center justify-center font-mech text-text text-2xl',
              )}
              aria-label={
                k === 'back'
                  ? 'Apagar último dígito'
                  : k === '.'
                    ? 'Vírgula decimal'
                    : k
              }
            >
              {icon ? (
                <Delete size={20} className="text-muted" />
              ) : k === '.' ? (
                ','
              ) : (
                k
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmar — long-press */}
      <button
        type="button"
        disabled={!value}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className={cn(
          'relative h-14 rounded-xl overflow-hidden mt-1',
          'bg-accent-soft text-accent disabled:opacity-40 disabled:bg-surface-2 disabled:text-faint',
          'flex items-center justify-center select-none',
          'font-medium tracking-wider uppercase',
        )}
        style={{ fontSize: 13, letterSpacing: '0.18em' }}
        aria-label={`${confirmLabel} — segure 250ms`}
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 origin-left"
          style={{ background: 'var(--accent)', mixBlendMode: 'normal' }}
          animate={{ scaleX: holding ? progress : 0 }}
          transition={{ duration: 0 }}
        />
        <span className="relative z-10" style={{ color: holding ? '#1A1816' : undefined }}>
          {holding ? 'segure…' : confirmLabel}
        </span>
      </button>
    </div>
  );
}
