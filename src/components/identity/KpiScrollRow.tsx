import { cn } from '@/lib/utils';

// Mini squiggle decorativo — linha SVG ondulada, puramente visual.
// Evoca "gráfico de tendência" sem peso de biblioteca.
function Squiggle({ color = 'var(--border)' }: { color?: string }) {
  return (
    <svg
      width="100%"
      height="24"
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 14 C10 6, 20 18, 30 12 C40 6, 50 18, 60 12 C70 6, 80 18, 90 12 C100 6, 110 18, 120 12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  tag?: string;
  tagColor?: string; // classe bg-* ou cor inline
  squiggleColor?: string;
  className?: string;
}

// Card de KPI estilo brutalismo — borda preta 2px, sombra deslocada, label em pill colorido.
export function KpiCard({
  label,
  value,
  tag,
  tagColor = 'bg-[var(--text)] text-[var(--surface)]',
  squiggleColor,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 rounded-[var(--radius-lg)]',
        'bg-[var(--surface)] border-2 border-[var(--border)]',
        'shrink-0',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-brutal-sm)', minWidth: 140 }}
    >
      {/* Pill de label */}
      {tag && (
        <span
          className={cn(
            'self-start text-[10px] font-bold uppercase tracking-[0.12em]',
            'px-2 py-0.5 rounded-full',
            tagColor,
          )}
        >
          {tag}
        </span>
      )}

      {/* Valor principal */}
      <p
        className="font-bold leading-tight text-[var(--text)]"
        style={{ fontSize: 20, fontFamily: "'Jost Variable', sans-serif" }}
      >
        {value}
      </p>

      {/* Label descritiva */}
      <p className="text-[11px] text-[var(--text-muted)]">{label}</p>

      {/* Squiggle decorativo */}
      <Squiggle color={squiggleColor ?? 'var(--border-soft)'} />
    </div>
  );
}

// Row de KPI cards — scroll horizontal, snap.
interface KpiScrollRowProps {
  cards: KpiCardProps[];
  className?: string;
}

export function KpiScrollRow({ cards, className }: KpiScrollRowProps) {
  return (
    <div
      className={cn('flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory', className)}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {cards.map((card, i) => (
        <div key={`${card.label}-${i}`} className="snap-start">
          <KpiCard {...card} />
        </div>
      ))}
    </div>
  );
}
