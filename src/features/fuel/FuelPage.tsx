import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { EmptyState } from '@/components/EmptyState';
import { NeedleAtZero, FuelPump } from '@/components/identity/EmptyArt';
import { HeaderControls } from '@/components/HeaderControls';
import { Money } from '@/components/Money';
import { Gauge } from '@/components/identity/Gauge';
import { GaugeSpinner } from '@/components/identity/GaugeSpinner';
import { Trash2 } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { AddFuelSheet } from './AddFuelSheet';
import type { FuelLog } from '@/types/fuel';

// Telemetria Íntima v1.5 — agulha de consumo no topo, lista plana abaixo.
// PROJETO.md §8.4.
export function FuelPage() {
  const { selectedVehicle } = useVehicles();
  const {
    logsForVehicle,
    statsForVehicle,
    deleteFuelLog,
    isSyncing,
    triggerSync,
  } = useFuel();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const vehicleLogs = selectedVehicle ? logsForVehicle(selectedVehicle.id) : [];
  const stats = selectedVehicle ? statsForVehicle(selectedVehicle.id) : null;
  const sortedLogs = [...vehicleLogs].sort((a, b) => b.date.localeCompare(a.date));

  // Faixa dinâmica do gauge conforme categoria do veículo
  const isMotorcycle = selectedVehicle?.category === 'motorcycle';
  const gaugeMin = isMotorcycle ? 15 : 6;
  const gaugeMax = isMotorcycle ? 45 : 18;

  const lastConsumption = stats?.lastConsumption ?? null;
  const monthAvg = stats?.monthAvgConsumption ?? null;

  function handleDelete(id: string) {
    if (confirming === id) {
      haptic('warning');
      deleteFuelLog(id);
      setConfirming(null);
    } else {
      haptic('tap');
      setConfirming(id);
      setTimeout(() => setConfirming(null), 3000);
    }
  }

  return (
    <div className="min-h-dvh bg-transparent flex flex-col">
      <PageHeader
        title="Combustível"
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                haptic('tap');
                triggerSync();
              }}
              className="p-2 text-muted active:text-accent transition-colors"
              aria-label="Sincronizar"
            >
              {isSyncing ? (
                <GaugeSpinner size={22} label="Sincronizando" />
              ) : (
                <SyncIcon />
              )}
            </button>
            <HeaderControls />
          </div>
        }
      />

      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] overscroll-y-contain">
        {!selectedVehicle ? (
          <EmptyState
            icon={<NeedleAtZero size={80} />}
            title="Nenhum veículo selecionado"
            description="Adicione e selecione um veículo para registrar abastecimentos."
          />
        ) : vehicleLogs.length === 0 ? (
          <EmptyState
            icon={<FuelPump size={80} />}
            title="Sem abastecimentos"
            description="Registre o primeiro abastecimento do seu veículo."
            action={{ label: 'Registrar agora', onClick: () => setSheetOpen(true) }}
          />
        ) : (
          <>
            {/* Gauge de consumo */}
            <div className="flex flex-col items-center pt-6 pb-4 px-4">
              <Gauge
                value={lastConsumption ?? gaugeMin}
                min={gaugeMin}
                max={gaugeMax}
                size={240}
                positiveThreshold={0.55}
                dangerThreshold={0.95}
              />
              <div className="-mt-12 flex flex-col items-center">
                <p
                  className="font-bold leading-none tracking-tight"
                  style={{ 
                    fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                    fontVariationSettings: "'opsz' 72, 'wght' 700",
                    fontSize: 64,
                    color: '#0D0D0D'
                  }}
                  aria-label={`Consumo: ${lastConsumption?.toFixed(1) ?? '—'} km/L`}
                >
                  {lastConsumption != null ? lastConsumption.toFixed(1) : '—'}
                </p>
                <p 
                  className="uppercase tracking-[0.14em] text-[10px] font-bold mt-2"
                  style={{ color: 'rgba(13,13,13,0.7)' }}
                >
                  km / L · último tanque
                </p>
              </div>
            </div>

            {/* Régua — média do mês + gasto */}
            <div className="grid grid-cols-2 border-y-2 border-[var(--border)] bg-[var(--surface)] mt-2">
              <ReglaTile
                label="Média do mês"
                value={
                  monthAvg != null ? (
                    <span className="font-display text-xl text-text">{monthAvg.toFixed(1)}</span>
                  ) : (
                    <span className="font-display text-xl text-faint">—</span>
                  )
                }
                hint="km / L"
              />
              <ReglaTile
                label="Gasto do mês"
                value={
                  stats?.monthCost != null && stats.monthCost > 0 ? (
                    <Money value={stats.monthCost} size="md" />
                  ) : (
                    <span className="font-display text-xl text-faint">—</span>
                  )
                }
              />
            </div>

            {/* Lista de abastecimentos */}
            <div className="px-4 pt-6 pb-2 flex flex-col gap-3">
              <p 
                className="uppercase tracking-[0.14em] text-[10px] font-bold mb-1"
                style={{ color: 'rgba(13,13,13,0.7)' }}
              >
                Histórico
              </p>
              <AnimatePresence initial={false}>
                {sortedLogs.map((log) => (
                  <FuelTile
                    key={log.id}
                    log={log}
                    confirming={confirming === log.id}
                    onDelete={() => handleDelete(log.id)}
                    onEdit={() => setEditingLog(log)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      <BottomTabBarBrutal
        onAddFuel={() => setSheetOpen(true)}
      />
      <AddFuelSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <AddFuelSheet
        open={editingLog !== null}
        onClose={() => setEditingLog(null)}
        log={editingLog ?? undefined}
      />
    </div>
  );
}

function SyncIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ReglaTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="px-3 py-5 flex flex-col items-center gap-1.5 border-r-2 border-[var(--border)] last:border-r-0">
      <span className="leading-none">{value}</span>
      <p 
        className="uppercase tracking-[0.14em] text-[10px] font-bold text-center"
        style={{ color: 'rgba(13,13,13,0.7)' }}
      >
        {label}
        {hint && <span className="normal-case tracking-normal ml-1 opacity-70">· {hint}</span>}
      </p>
    </div>
  );
}

function FuelTile({
  log,
  confirming,
  onDelete,
  onEdit,
}: {
  log: FuelLog;
  confirming: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const dateLabel = format(new Date(log.date + 'T12:00:00'), "d 'de' MMM", { locale: ptBR });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="border-2 border-[var(--border)] rounded-[var(--radius-xl)] p-4 bg-[var(--surface)] shadow-[var(--shadow-brutal-xs)] mb-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p 
            className="uppercase tracking-[0.1em] text-[10px] font-bold"
            style={{ color: 'rgba(13,13,13,0.6)' }}
          >
            {dateLabel}
          </p>
          {log.gas_station && (
            <p className="font-bold text-[13px] truncate mt-0.5 text-[#0D0D0D]">{log.gas_station}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-[var(--border)] text-[#0D0D0D]">
              {log.liters.toFixed(2)} L · {log.odometer.toLocaleString('pt-BR')} km
            </span>
            {log.full_tank && (
              <span 
                className="uppercase tracking-[0.1em] text-[9px] font-bold px-2 py-0.5 rounded border border-[var(--accent)] text-[var(--accent)] bg-[rgba(181,154,106,0.1)]"
              >
                Tanque cheio
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <Money value={log.total_cost} size="md" />
          <p className="font-mono text-[10px] font-bold mt-1 text-[rgba(13,13,13,0.5)]">
            R$ {log.price_per_liter.toFixed(3)} / L
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t-2 border-[var(--border)] border-opacity-10">
        <button
          onClick={() => { haptic('tap'); onEdit(); }}
          className="uppercase tracking-[0.1em] text-[10px] font-bold text-[rgba(13,13,13,0.5)] active:text-[var(--accent)] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className={[
            'uppercase tracking-[0.1em] text-[10px] font-bold transition-colors flex flex-col items-end',
            confirming ? 'text-[var(--danger)]' : 'text-[rgba(13,13,13,0.5)] active:text-[#0D0D0D]',
          ].join(' ')}
        >
          <span className="flex items-center gap-1">
            {confirming ? 'Confirmar exclusão' : 'Excluir'}
            <Trash2 size={13} />
          </span>
          {confirming && (
            <motion.span
              className="block h-[2px] bg-danger rounded-full mt-0.5 w-full"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              style={{ transformOrigin: 'right' }}
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}
