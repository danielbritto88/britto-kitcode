// Arte SVG proprietária para estados vazios — vocabulário "Telemetria Íntima".
// Cada componente é uma ilustração compacta 80×80 (viewBox normalizado).
// Paleta: âmbar #E8A85C (destaque), grafite #2A2824 (estrutura), #3A3830 (secundário).

const AMBER = '#E8A85C';
const GRAPHITE = '#2A2824';
const MUTED = '#3A3830';
const FAINT = '#5A5650';

// Agulha de consumo apontando para zero — para "sem abastecimentos" ou "combustível vazio".
export function NeedleAtZero({ size = 80 }: { size?: number }) {
  // Arco 240° de 150° a 390°, agulha em 150° (zero)
  const cx = 40;
  const cy = 44;
  const r = 28;

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arc(from: number, to: number) {
    const a = polar(from);
    const b = polar(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
  }

  // Needle tip at zero (150°)
  const tipR = r * 0.9;
  const tipPt = { x: cx + tipR * Math.cos((150 * Math.PI) / 180), y: cy + tipR * Math.sin((150 * Math.PI) / 180) };

  // Ticks at 0%, 50%, 100%
  const ticks = [150, 270, 390].map((deg) => {
    const inner = { x: cx + (r - 4) * Math.cos((deg * Math.PI) / 180), y: cy + (r - 4) * Math.sin((deg * Math.PI) / 180) };
    const outer = { x: cx + (r + 3) * Math.cos((deg * Math.PI) / 180), y: cy + (r + 3) * Math.sin((deg * Math.PI) / 180) };
    return { inner, outer };
  });

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* track full */}
      <path d={arc(150, 390)} stroke={MUTED} strokeWidth="4" strokeLinecap="round" />

      {/* filled portion — zero (none) */}
      {/* no fill — needle at zero */}

      {/* ticks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y} stroke={FAINT} strokeWidth="1" strokeLinecap="round" />
      ))}

      {/* needle pointing to 150° (zero) */}
      <line x1={cx} y1={cy} x2={tipPt.x} y2={tipPt.y} stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" />

      {/* center cap */}
      <circle cx={cx} cy={cy} r="3.5" fill={GRAPHITE} stroke={AMBER} strokeWidth="1.5" />

      {/* label E */}
      <text x={cx - r - 5} y={cy + 6} fill={AMBER} fontSize="7" fontFamily="JetBrains Mono Variable, monospace" textAnchor="middle">E</text>
      {/* label F */}
      <text x={cx + r + 5} y={cy + 6} fill={FAINT} fontSize="7" fontFamily="JetBrains Mono Variable, monospace" textAnchor="middle">F</text>
    </svg>
  );
}

// Bomba de combustível estilizada — para empty state de abastecimentos.
export function FuelPump({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Body */}
      <rect x="18" y="24" width="30" height="40" rx="3" fill={GRAPHITE} stroke={MUTED} strokeWidth="1.5" />

      {/* Screen / display area */}
      <rect x="23" y="30" width="20" height="14" rx="2" fill={MUTED} />
      <polyline points="26,40 30,35 34,38 38,33" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Nozzle arm */}
      <path d="M 48 34 L 56 34 L 56 48 L 52 48" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Nozzle tip */}
      <rect x="48" y="45" width="8" height="5" rx="1.5" fill={MUTED} />

      {/* Amber drop from nozzle */}
      <path d="M 52 50 C 51 52 50 54 52 56 C 54 54 53 52 52 50 Z" fill={AMBER} opacity="0.7" />

      {/* Base */}
      <rect x="14" y="62" width="38" height="4" rx="2" fill={MUTED} />
    </svg>
  );
}

// Manual de oficina — para empty state de manutenções.
export function WorkshopManual({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Book spine */}
      <rect x="36" y="14" width="6" height="52" rx="1" fill={MUTED} />

      {/* Left page */}
      <path d="M 36 16 C 28 16 16 20 14 26 L 14 60 C 16 54 28 52 36 52 Z" fill={GRAPHITE} stroke={MUTED} strokeWidth="1" />

      {/* Right page */}
      <path d="M 42 16 C 50 16 62 20 64 26 L 64 60 C 62 54 50 52 42 52 Z" fill={GRAPHITE} stroke={MUTED} strokeWidth="1" />

      {/* Left page lines (text) */}
      <line x1="20" y1="28" x2="33" y2="27" stroke={FAINT} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="33" x2="33" y2="32" stroke={FAINT} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="38" x2="33" y2="37" stroke={FAINT} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="43" x2="29" y2="42.5" stroke={FAINT} strokeWidth="1.5" strokeLinecap="round" />

      {/* Right page — wrench */}
      <path
        d="M 50 24 C 53 24 56 27 56 30 C 56 31.5 55.5 32.5 54.5 33.5 L 47 41 C 46 42 46 43.5 47 44.5 C 48 45.5 49.5 45.5 50.5 44.5 L 58 37 C 59 36 60 34.5 60 32 C 60 27 56 23 50 24 Z"
        stroke={AMBER}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="43.5" r="2.5" fill={AMBER} opacity="0.4" />
    </svg>
  );
}

// Pergaminho com gráfico que se esvai — para empty state de relatórios.
export function ChartScroll({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Scroll rolls */}
      <ellipse cx="40" cy="18" rx="24" ry="6" fill={MUTED} />
      <ellipse cx="40" cy="62" rx="24" ry="6" fill={MUTED} />

      {/* Scroll body */}
      <rect x="16" y="18" width="48" height="44" fill={GRAPHITE} />
      <rect x="16" y="18" width="48" height="44" stroke={MUTED} strokeWidth="1" />

      {/* Chart line — ascending then dashes out */}
      <polyline points="22,52 30,44 38,46 46,36" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dashed "no data" continuation */}
      <line x1="46" y1="36" x2="50" y2="33" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" opacity="0.5" />
      <line x1="52" y1="31" x2="56" y2="28" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" opacity="0.2" />

      {/* Baseline */}
      <line x1="22" y1="54" x2="58" y2="54" stroke={FAINT} strokeWidth="1" strokeLinecap="round" />

      {/* X axis ticks */}
      <line x1="30" y1="54" x2="30" y2="56" stroke={FAINT} strokeWidth="1" />
      <line x1="38" y1="54" x2="38" y2="56" stroke={FAINT} strokeWidth="1" />
      <line x1="46" y1="54" x2="46" y2="56" stroke={FAINT} strokeWidth="1" />

      {/* Top roll shadow line */}
      <ellipse cx="40" cy="18" rx="24" ry="6" fill={MUTED} />
      {/* Bottom roll shadow line */}
      <ellipse cx="40" cy="62" rx="24" ry="6" fill={MUTED} />
    </svg>
  );
}
