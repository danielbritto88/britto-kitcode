import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Odometer } from './Odometer';

// Substitui VehicleChip. "Chave inteligente" — foto circular + apelido Bodoni + odômetro.
// Toque abre carrossel de veículos (lógica fica em quem usa o componente).
// PROJETO.md §8.4/§8.5.
type KeyChipProps = {
  photoUrl?: string | null;
  nickname: string;
  odometer: number;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

export function KeyChip({
  photoUrl,
  nickname,
  odometer,
  onClick,
  className,
  ariaLabel,
}: KeyChipProps) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [photoUrl]);

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', damping: 24, stiffness: 320, mass: 0.6 }}
      aria-label={ariaLabel ?? `Veículo ${nickname}, ${odometer.toLocaleString('pt-BR')} km`}
      className={cn(
        'flex items-center gap-3 pl-1 pr-4 py-1 rounded-[32px]',
        'bg-[var(--surface)] border-[3px] border-[var(--border)]',
        onClick && 'active:translate-x-[2px] active:translate-y-[2px] cursor-pointer',
        'transition-[transform]',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-brutal-md)' }}
    >
      {/* Avatar circular (área isolada com borda) */}
      <span className="w-12 h-12 rounded-full overflow-hidden bg-[var(--surface-2)] border-[2.5px] border-[var(--border)] flex items-center justify-center shrink-0">
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <Car size={22} className="text-[var(--text-muted)]" strokeWidth={2.5} />
        )}
      </span>

      {/* Texto */}
      <span className="flex flex-col items-start min-w-0 py-1">
        <span
          className="font-bold leading-none truncate max-w-[120px]"
          style={{ 
            fontSize: 22, 
            fontFamily: "'Bodoni Moda Variable', Georgia, serif",
            color: 'var(--info, #2860F0)' // Azul escuro da referência
          }}
        >
          {nickname}
        </span>
        <span className="flex items-center gap-1" style={{ marginTop: 2 }}>
          <span style={{ fontSize: 13 }}><Odometer value={odometer} digits={6} /></span>
        </span>
      </span>
    </Wrapper>
  );
}
