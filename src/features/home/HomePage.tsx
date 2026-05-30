import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, ChevronRight, Fuel, Wrench, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import { VehicleHeroCard, VehicleHeroCardEmpty } from '@/components/identity/VehicleHeroCard';
import { KpiScrollRow } from '@/components/identity/KpiScrollRow';
import { HeaderControls } from '@/components/HeaderControls';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { Money } from '@/components/Money';
import { enrichLogs } from '@/lib/maintenance';
import { calcStats } from '@/lib/fuel';
import { haptic } from '@/lib/haptics';
import { MAINTENANCE_LABELS } from '@/types/maintenance';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';
import { AddFuelSheet } from '@/features/fuel/AddFuelSheet';
import { AddMaintenanceSheet } from '@/features/maintenance/AddMaintenanceSheet';

type Period = 'month' | 'year' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Este mês',
  year: 'Este ano',
  all: 'Tudo',
};

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Extrai o primeiro nome de uma string "Daniel Britto" → "Daniel".
function firstName(tag: string | null): string {
  if (!tag?.trim()) return 'você';
  return tag.trim().split(/\s+/)[0]!;
}

// Determina o nível do tanque baseado no último abastecimento.
// Usa tank_capacity_liters quando disponível para refinar o cálculo.
function estimateTankPct(
  logs: import('@/types/fuel').FuelLog[],
  avgKml: number | null,
  tankCapacity: number | null,
): number {
  const sorted = [...logs].filter((l) => !l.archived_at).sort((a, b) => b.odometer - a.odometer);
  const last = sorted[0];
  if (!last || !avgKml || avgKml <= 0) return 0;

  const lastFull = sorted.find((l) => l.full_tank);
  if (!lastFull) return last.full_tank ? 0.9 : 0.5;

  const kmSinceFull = last.odometer - lastFull.odometer;
  const tankLiters = tankCapacity ?? lastFull.liters;
  const totalRange = tankLiters * avgKml;
  if (totalRange <= 0) return 0.5;

  return Math.max(0.03, Math.min(1, 1 - kmSinceFull / totalRange));
}

// Brutalismo Elegante — HomePage reescrita.
// Referência visual: Lovable mockup (creme, bordas pretas, cards sólidos, FAB Kombi).
// PROJETO.md §8 redesign total de layout. Lógica de dados mantida intacta.
export function HomePage() {
  const { userTag } = useAuth();
  const { selectedVehicle, isAllSelected, activeVehicles } = useVehicles();
  const { logsForVehicle: fuelLogsFor, statsForVehicle } = useFuel();
  const { logsForVehicle: maintLogsFor } = useMaintenance();
  const [period, setPeriod] = useState<Period>('month');
  const navigate = useNavigate();

  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);
  const [isAddMaintOpen, setIsAddMaintOpen] = useState(false);

  const photo = usePhotoUrl(selectedVehicle?.photo_key ?? null);

  const fuelLogs = useMemo(() => (
    isAllSelected
      ? activeVehicles.flatMap((v) => fuelLogsFor(v.id))
      : selectedVehicle ? fuelLogsFor(selectedVehicle.id) : []
  ), [isAllSelected, activeVehicles, selectedVehicle, fuelLogsFor]);

  const maintLogs = useMemo(() => (
    isAllSelected
      ? activeVehicles.flatMap((v) => maintLogsFor(v.id))
      : selectedVehicle ? maintLogsFor(selectedVehicle.id) : []
  ), [isAllSelected, activeVehicles, selectedVehicle, maintLogsFor]);

  const enriched = useMemo(() => enrichLogs(maintLogs, fuelLogs), [maintLogs, fuelLogs]);

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearPrefix = `${now.getFullYear()}`;
  const currentMonthName = MONTH_NAMES[now.getMonth()]!;

  const filteredFuel = useMemo(() => {
    if (period === 'month') return fuelLogs.filter((i) => i.date.startsWith(monthPrefix));
    if (period === 'year') return fuelLogs.filter((i) => i.date.startsWith(yearPrefix));
    return fuelLogs;
  }, [fuelLogs, period, monthPrefix, yearPrefix]);

  const filteredMaint = useMemo(() => {
    if (period === 'month') return maintLogs.filter((i) => i.date.startsWith(monthPrefix));
    if (period === 'year') return maintLogs.filter((i) => i.date.startsWith(yearPrefix));
    return maintLogs;
  }, [maintLogs, period, monthPrefix, yearPrefix]);

  const fuelCost = filteredFuel.reduce((s, l) => s + l.total_cost, 0);
  const maintCost = filteredMaint.reduce((s, l) => s + (l.cost ?? 0), 0);

  const fuelStats = selectedVehicle
    ? statsForVehicle(selectedVehicle.id)
    : calcStats(fuelLogs);

  // KPIs — km rodados no período
  const sortedFuel = [...filteredFuel].sort((a, b) => a.odometer - b.odometer);
  const kmDriven =
    sortedFuel.length >= 2
      ? sortedFuel[sortedFuel.length - 1]!.odometer - sortedFuel[0]!.odometer
      : null;

  // Hodômetro atual
  const odometer = selectedVehicle
    ? (() => {
      const logs = fuelLogsFor(selectedVehicle.id);
      return logs.length > 0
        ? Math.max(...logs.map((l) => l.odometer))
        : (selectedVehicle.odometer_initial ?? 0);
    })()
    : 0;

  // Nível do tanque estimado
  const tankPct = selectedVehicle
    ? estimateTankPct(fuelLogsFor(selectedVehicle.id), fuelStats.lastConsumption, selectedVehicle.tank_capacity_liters)
    : 0;

  // Autonomia estimada restante
  const autonomyKm =
    fuelStats.lastConsumption && selectedVehicle
      ? Math.round(
        (fuelLogsFor(selectedVehicle.id)
          .filter((l) => l.full_tank)
          .slice(-1)[0]?.liters ?? 0) * fuelStats.lastConsumption * tankPct,
      ) || null
      : null;

  const alerts = enriched.filter((l) => l.status !== 'ok' && (l.next_date || l.next_odometer));
  const overdueCount = alerts.filter((a) => a.status === 'overdue').length;

  // Últimos abastecimentos (até 4)
  const recentFuel = [...fuelLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  function handleShare() {
    haptic('tap');
    const lines = [
      `🚗 ${selectedVehicle?.name ?? 'Tanque Cheio'} — ${PERIOD_LABELS[period]}`,
      '',
      `⛽ Combustível: R$ ${fuelCost.toFixed(2)}`,
      `🔧 Manutenção: R$ ${maintCost.toFixed(2)}`,
    ];
    const text = lines.join('\n');
    if (navigator.share) {
      void navigator.share({ text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col bg-transparent"
      style={{ color: 'var(--text)' }}
    >
      {/* ─── Header — saudação editorial + HeaderControls ─── */}
      <header
        className="px-5 pt-[max(env(safe-area-inset-top,0px),16px)] pb-4 bg-transparent"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Saudação */}
          <div className="flex flex-col items-start gap-1">
            <p
              className="leading-none"
              style={{
                fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                fontVariationSettings: "'opsz' 72, 'wght' 300",
                fontSize: 30,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
              }}
            >
              Olá,
            </p>
            <div className="flex items-end gap-0">
              <h1
                className="leading-none"
                style={{
                  fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                  fontVariationSettings: "'opsz' 96, 'wght' 700",
                  fontSize: 40,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  borderBottom: '3px solid var(--accent)',
                  paddingBottom: 2,
                  lineHeight: 1.05,
                }}
              >
                {firstName(userTag)}.
              </h1>
            </div>
          </div>

          {/* HeaderControls: VehicleChip + Settings */}
          <div className="pt-2 flex-shrink-0">
            <HeaderControls />
          </div>
        </div>
      </header>

      {/* ─── Conteúdo scrollável ─── */}
      <main
        className="flex-1 flex flex-col gap-5 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+80px)]"
        style={{ overflowY: 'auto' }}
      >
        {/* ── Card hero do veículo ── */}
        {!selectedVehicle && !isAllSelected ? (
          <VehicleHeroCardEmpty onAddVehicle={() => navigate('/veiculos')} />
        ) : selectedVehicle ? (
          <VehicleHeroCard
            nickname={selectedVehicle.name}
            makeModel={[selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(' ')}
            plate={selectedVehicle.plate ?? '—'}
            fuelPct={tankPct}
            autonomyKm={autonomyKm}
            odometer={odometer}
            photoUrl={photo}
            category={selectedVehicle.category}
            color={selectedVehicle.color}
            onTap={() => navigate('/veiculos')}
          />
        ) : (
          // Modo "todos" — não mostra card individual
          <div
            className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            style={{ boxShadow: 'var(--shadow-brutal-sm)' }}
          >
            <p className="font-bold text-sm">Todos os veículos</p>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">
              {activeVehicles.length} veículos agregados
            </p>
          </div>
        )}

        {/* ── Seletor de período + KPIs ── */}
        <section>
          {/* Header da seção */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">{PERIOD_LABELS[period]}</h2>
            <span className="text-sm text-[var(--text-muted)]">
              {currentMonthName} · {now.getFullYear()}
            </span>
          </div>

          {/* Filtro de período — pills com borda */}
          <div className="flex gap-2 mb-4">
            {(['month', 'year', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { haptic('tap'); setPeriod(p); }}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 border-[var(--border)] transition-colors"
                style={{
                  background: period === p ? 'var(--accent)' : 'var(--surface)',
                  color: period === p ? 'var(--accent-fg)' : 'var(--text-muted)',
                  boxShadow: period === p ? 'var(--shadow-brutal-xs)' : 'none',
                }}
              >
                {p === 'month' ? 'Mês' : p === 'year' ? 'Ano' : 'Tudo'}
              </button>
            ))}
          </div>

          {/* KPI cards */}
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <KpiScrollRow
              cards={[
                {
                  label: 'neste período',
                  value: `R$ ${fuelCost.toFixed(2).replace('.', ',')}`,
                  tag: 'Combustível',
                  tagColor: 'bg-[var(--text)] text-[var(--surface)]',
                  squiggleColor: 'var(--accent)',
                },
                {
                  label: 'média km/L',
                  value: fuelStats.lastConsumption
                    ? `${fuelStats.lastConsumption.toFixed(1)} km/L`
                    : '—',
                  tag: 'Consumo',
                  tagColor: 'bg-[var(--positive)] text-white',
                  squiggleColor: 'var(--positive)',
                },
                {
                  label: 'no período',
                  value: kmDriven != null ? `${kmDriven.toLocaleString('pt-BR')} km` : '— km',
                  tag: 'Rodados',
                  tagColor: 'bg-[var(--danger)] text-white',
                  squiggleColor: 'var(--danger)',
                },
                ...(maintCost > 0
                  ? [
                    {
                      label: 'em manutenções',
                      value: `R$ ${maintCost.toFixed(2).replace('.', ',')}`,
                      tag: 'Manutenção',
                      tagColor: 'bg-[var(--info)] text-white',
                      squiggleColor: 'var(--info)',
                    },
                  ]
                  : []),
              ]}
            />
          </motion.div>
        </section>

        {/* ── Próximas manutenções ── */}
        {alerts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">
                Próximas manutenções
                {overdueCount > 0 && (
                  <span className="ml-2 text-xs font-bold text-[var(--danger)] border border-[var(--danger)] rounded-full px-1.5 py-0.5">
                    {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <button
                onClick={() => { haptic('tap'); navigate('/manutencao'); }}
                className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-0.5"
              >
                ver todas <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {alerts.slice(0, 3).map((log) => {
                const isOverdue = log.status === 'overdue';
                const isSoon = log.status === 'soon';
                const Icon = isOverdue ? AlertTriangle : Clock;

                let hint = '';
                if (log.daysUntilNext != null) {
                  hint = isOverdue
                    ? `Atrasou ${Math.abs(log.daysUntilNext)} dias`
                    : `Em ${log.daysUntilNext} dias`;
                } else if (log.kmUntilNext != null) {
                  hint = isOverdue
                    ? `Passou ${Math.abs(log.kmUntilNext).toLocaleString('pt-BR')} km`
                    : `Faltam ${log.kmUntilNext.toLocaleString('pt-BR')} km`;
                }

                const accentColor = isOverdue
                  ? 'var(--danger)'
                  : isSoon
                    ? 'var(--warning)'
                    : 'var(--graphite)';

                return (
                  <button
                    key={log.id}
                    onClick={() => { haptic('tap'); navigate('/manutencao'); }}
                    className="flex items-center gap-3 w-full text-left rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 active:translate-x-[1px] active:translate-y-[1px] transition-[box-shadow,transform] duration-100"
                    style={{ boxShadow: 'var(--shadow-brutal-sm)' }}
                  >
                    {/* Badge de ícone */}
                    <div
                      className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                      style={{ background: `${accentColor}20`, border: `1.5px solid ${accentColor}` }}
                    >
                      <Icon size={16} style={{ color: accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--text)] truncate">
                        {MAINTENANCE_LABELS[log.type]}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: accentColor }}>
                        {hint}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-faint)] shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Últimos abastecimentos ── */}
        {recentFuel.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Últimos abastecimentos</h2>
              <button
                onClick={() => { haptic('tap'); navigate('/combustivel'); }}
                className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-0.5"
              >
                histórico <ChevronRight size={13} />
              </button>
            </div>

            <div
              className="rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              style={{ boxShadow: 'var(--shadow-brutal-sm)' }}
            >
              {recentFuel.map((log, i) => {
                const fuelTypeLabel =
                  log.fuel_type === 'gasoline'
                    ? 'Gasolina'
                    : log.fuel_type === 'ethanol'
                      ? 'Etanol'
                      : log.fuel_type === 'diesel'
                        ? 'Diesel'
                        : log.fuel_type;
                const dateFormatted = new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                });

                return (
                  <div
                    key={log.id}
                    className={[
                      'flex items-center gap-3 px-4 py-3',
                      i < recentFuel.length - 1 ? 'border-b border-[var(--border-soft)]' : '',
                    ].join(' ')}
                  >
                    {/* Ícone */}
                    <div
                      className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 border-2 border-[var(--border)]"
                      style={{ background: 'var(--accent-soft)' }}
                    >
                      <Fuel size={15} style={{ color: 'var(--accent-fg)' }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--text)] truncate">
                        {log.gas_station || 'Posto não informado'}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {dateFormatted} · {fuelTypeLabel} · {log.liters.toFixed(1)} L
                      </p>
                    </div>
                    {/* Valor + Inicial */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mb-1 text-[9px] font-bold text-[var(--text)]" title="Registrado por">
                        {firstName(userTag)[0]?.toUpperCase() || '?'}
                      </div>
                      <p
                        className="font-bold text-sm text-[var(--text)]"
                        style={{ fontFamily: "'Jost Variable', sans-serif" }}
                      >
                        <Money value={log.total_cost} size="sm" />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Empty state global ── */}
        {fuelLogs.length === 0 && maintLogs.length === 0 && (selectedVehicle || isAllSelected) && (
          <div className="flex flex-col items-center text-center py-8 gap-2">
            <div
              className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mb-2"
            >
              <Wrench size={24} className="text-[var(--text-faint)]" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-base">Nada registrado ainda</p>
            <p className="text-sm text-[var(--text-muted)]">
              Use o botão <span className="font-bold">+</span> abaixo para começar
            </p>
          </div>
        )}

        {/* ── Compartilhar ── */}
        {(fuelLogs.length > 0 || maintLogs.length > 0) && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-muted)] active:text-[var(--text)] transition-colors"
            style={{ boxShadow: 'var(--shadow-brutal-xs)' }}
          >
            <Share2 size={15} />
            Compartilhar resumo
          </button>
        )}
      </main>

      <BottomTabBarBrutal
        onAddFuel={() => setIsAddFuelOpen(true)}
        onAddMaint={() => setIsAddMaintOpen(true)}
      />

      <AddFuelSheet open={isAddFuelOpen} onClose={() => setIsAddFuelOpen(false)} />
      <AddMaintenanceSheet open={isAddMaintOpen} onClose={() => setIsAddMaintOpen(false)} />
    </div>
  );
}
