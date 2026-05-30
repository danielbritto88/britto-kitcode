import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// SVG flat de carro — silhueta simples, cor configurável.
function CarIllustration({ color = 'var(--accent)' }: { color?: string }) {
  return (
    <svg
      width="100"
      height="56"
      viewBox="0 0 100 56"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* carroceria */}
      <rect x="4" y="28" width="92" height="20" rx="5" fill={color} />
      {/* capô / teto */}
      <path
        d="M18 28 Q22 10 38 10 L68 10 Q80 10 84 28Z"
        fill={color}
      />
      {/* para-brisas */}
      <path
        d="M24 28 Q27 13 39 13 L65 13 Q75 13 78 28Z"
        fill="rgba(0,0,0,0.35)"
      />
      {/* roda esquerda */}
      <circle cx="22" cy="48" r="9" fill="#0D0D0D" />
      <circle cx="22" cy="48" r="4" fill={color} />
      {/* roda direita */}
      <circle cx="76" cy="48" r="9" fill="#0D0D0D" />
      <circle cx="76" cy="48" r="4" fill={color} />
      {/* farol */}
      <rect x="88" y="30" width="5" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

// SVG flat de moto — silhueta estilizada.
function MotorcycleIllustration({ color = 'var(--accent)' }: { color?: string }) {
  return (
    <svg
      width="100"
      height="56"
      viewBox="0 0 100 56"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Roda traseira */}
      <circle cx="22" cy="42" r="11" fill="#0D0D0D" />
      <circle cx="22" cy="42" r="5" fill={color} />
      
      {/* Roda dianteira */}
      <circle cx="78" cy="42" r="11" fill="#0D0D0D" />
      <circle cx="78" cy="42" r="5" fill={color} />
      
      {/* Garfo dianteiro */}
      <path d="M68 20 L78 42" stroke={color} strokeWidth="3" strokeLinecap="round" />
      
      {/* Suspensão traseira / braço */}
      <path d="M22 42 L42 28" stroke="#0D0D0D" strokeWidth="4" strokeLinecap="round" />
      
      {/* Corpo / Tanque (Colorido) */}
      <path
        d="M40 28 Q45 16 55 18 Q62 18 68 20 L60 28 Z"
        fill={color}
      />
      
      {/* Banco */}
      <path
        d="M26 24 L42 28 C 42 28, 42 22, 34 20 C 28 18, 26 24, 26 24 Z"
        fill="#0D0D0D"
      />
      
      {/* Carenagem frontal / Farol */}
      <path d="M65 18 Q72 14 74 22 L68 24 Z" fill={color} />
      <circle cx="74" cy="20" r="3" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

interface VehicleHeroCardProps {
  nickname: string;
  makeModel: string;
  plate: string;
  fuelPct: number;       // 0–1
  autonomyKm: number | null;
  odometer: number;
  photoUrl: string | null;
  category?: 'car' | 'motorcycle';
  color?: string;
  onTap: () => void;
  className?: string;
}

// Card herói do veículo — fundo marrom muito escuro (bege noturno), dados diretos.
// Brutalismo Elegante — borda 2px preta, sombra deslocada 4px.
export function VehicleHeroCard({
  nickname,
  makeModel,
  plate,
  autonomyKm,
  odometer,
  photoUrl,
  category = 'car',
  color = 'var(--accent)',
  onTap,
  className,
}: VehicleHeroCardProps) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [photoUrl]);

  return (
    <motion.button
      onClick={onTap}
      className={cn(
        'w-full text-left rounded-[var(--radius-xl)]',
        'border-2 border-[var(--border)]',
        'bg-[#b59a6a] text-[#F4EFE6]',
        'overflow-hidden',
        'active:translate-x-[2px] active:translate-y-[2px]',
        'transition-[box-shadow,transform] duration-100',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-brutal-lg)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Row topo — label + placa */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <span
          className="uppercase tracking-[0.16em] text-[10px] font-bold"
          style={{ color: 'rgba(13,13,13,0.7)' }}
        >
          {category === 'motorcycle' ? 'Minha moto' : 'Meu carro'}
        </span>
        <span
          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-[rgba(13,13,13,0.2)]"
          style={{ color: '#0D0D0D' }}
        >
          {plate}
        </span>
      </div>

      {/* Nome do veículo + ilustração */}
      <div className="flex items-start justify-between px-4 pb-3">
        <div className="flex-1 min-w-0">
          <h2
            className="font-bold leading-tight truncate"
            style={{
              fontFamily: "'Bodoni Moda Variable', Georgia, serif",
              fontVariationSettings: "'opsz' 72, 'wght' 700",
              fontSize: 26,
              color: '#0D0D0D',
            }}
          >
            {nickname}
          </h2>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(13,13,13,0.75)' }}>
            {makeModel}
          </p>
        </div>
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt={nickname}
            className="w-20 h-12 object-cover rounded-lg shrink-0 border border-[#0D0D0D]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="shrink-0 -mr-1">
            {category === 'motorcycle' ? (
              <MotorcycleIllustration color={color === '#b59a6a' ? '#0D0D0D' : color} />
            ) : (
              <CarIllustration color={color === '#b59a6a' ? '#0D0D0D' : color} />
            )}
          </div>
        )}
      </div>

      {/* Divisor */}
      <div style={{ height: 2, background: 'rgba(13,13,13,0.15)', margin: '0 16px' }} />

      {/* Row inferior — métricas diretas */}
      <div className="flex flex-col gap-2 px-4 py-4">
        {/* Autonomia */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: '#25211E' }} // Um tom levemente mais claro que o fundo do card
        >
          <p
            className="uppercase tracking-[0.14em] text-[10px] font-bold"
            style={{ color: 'rgba(244,239,230,0.6)' }}
          >
            Autonomia
          </p>
          <p className="font-bold text-[16px]" style={{ color: '#F4EFE6' }}>
            {autonomyKm != null ? `~${autonomyKm.toLocaleString('pt-BR')} km` : '— km'}
          </p>
        </div>

        {/* Hodômetro */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: '#25211E' }}
        >
          <p
            className="uppercase tracking-[0.14em] text-[10px] font-bold"
            style={{ color: 'rgba(244,239,230,0.6)' }}
          >
            Hodômetro
          </p>
          <p
            className="font-bold text-[16px]"
            style={{
              color: '#F4EFE6',
              fontFamily: "'JetBrains Mono Variable', monospace",
              fontFeatureSettings: "'tnum' 1",
            }}
          >
            {odometer.toLocaleString('pt-BR')} <span className="text-[11px] ml-0.5 text-[rgba(244,239,230,0.7)]">km</span>
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// Empty state — quando não há veículo selecionado.
export function VehicleHeroCardEmpty({ onAddVehicle }: { onAddVehicle: () => void }) {
  return (
    <button
      onClick={onAddVehicle}
      className={cn(
        'w-full flex flex-col items-center justify-center gap-3 py-10',
        'rounded-[var(--radius-xl)]',
        'border-2 border-dashed border-[var(--border)]',
        'bg-[var(--surface)]',
        'text-[var(--text-faint)]',
        'transition-colors active:bg-[var(--surface-2)]',
      )}
      style={{ boxShadow: 'var(--shadow-brutal-sm)' }}
    >
      <Car size={32} strokeWidth={1.5} />
      <div className="text-center">
        <p className="font-semibold text-[var(--text)] text-sm">Adicionar veículo</p>
        <p className="text-xs mt-0.5 text-[var(--text-faint)]">Toque para cadastrar seu primeiro carro</p>
      </div>
    </button>
  );
}
