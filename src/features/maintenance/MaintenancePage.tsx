import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useVehicles } from '@/context/VehicleContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useFuel } from '@/context/FuelContext';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { EmptyState } from '@/components/EmptyState';
import { WorkshopManual } from '@/components/identity/EmptyArt';
import { HeaderControls } from '@/components/HeaderControls';
import { Money } from '@/components/Money';
import { TimelineDot } from '@/components/identity/TimelineDot';
import { GaugeSpinner } from '@/components/identity/GaugeSpinner';
import { Trash2 } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { AddMaintenanceSheet } from './AddMaintenanceSheet';
import { enrichLogs } from '@/lib/maintenance';
import { MAINTENANCE_LABELS, type MaintenanceLog, type MaintenanceWithStatus } from '@/types/maintenance';
import { cn } from '@/lib/utils';

// Telemetria Íntima v1.5 — timeline vertical única, dispensa "Próximas" / "Histórico".
// PROJETO.md §8.4. Status indicado por TimelineDot.
export function MaintenancePage() {
  const { selectedVehicle } = useVehicles();
  const { logsForVehicle, deleteMaintenanceLog, isSyncing, triggerSync } = useMaintenance();
  const { logsForVehicle: fuelLogsForVehicle } = useFuel();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const rawLogs = selectedVehicle ? logsForVehicle(selectedVehicle.id) : [];
  const fuelLogs = selectedVehicle ? fuelLogsForVehicle(selectedVehicle.id) : [];
  const enriched = enrichLogs(rawLogs, fuelLogs);

  // Ordem: overdue primeiro, depois soon, depois ok (mais recente primeiro).
  const ordered = [...enriched].sort((a, b) => {
    const rank = (s: MaintenanceWithStatus['status']) =>
      s === 'overdue' ? 0 : s === 'soon' ? 1 : 2;
    const r = rank(a.status) - rank(b.status);
    return r !== 0 ? r : b.date.localeCompare(a.date);
  });

  const overdueCount = enriched.filter((e) => e.status === 'overdue').length;
  const soonCount = enriched.filter((e) => e.status === 'soon').length;

  function handleDelete(id: string) {
    if (confirming === id) {
      haptic('warning');
      deleteMaintenanceLog(id);
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
        title="Manutenção"
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
              {isSyncing ? <GaugeSpinner size={22} label="Sincronizando" /> : <SyncIcon />}
            </button>
            <HeaderControls />
          </div>
        }
      />

      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] overscroll-y-contain">
        {!selectedVehicle ? (
          <EmptyState
            icon={<WorkshopManual size={80} />}
            title="Nenhum veículo selecionado"
            description="Selecione um veículo para ver e registrar manutenções."
          />
        ) : rawLogs.length === 0 ? (
          <EmptyState
            icon={<WorkshopManual size={80} />}
            title="Sem manutenções"
            description="Registre a primeira manutenção do seu veículo."
            action={{ label: 'Registrar agora', onClick: () => setSheetOpen(true) }}
          />
        ) : (
          <>
            {/* Resumo de status */}
            {(overdueCount > 0 || soonCount > 0) && (
              <div className="px-4 pt-5 pb-3 flex items-center gap-4 border-b-2 border-[var(--border)] border-opacity-10">
                {overdueCount > 0 && (
                  <StatusSummary status="overdue" count={overdueCount} />
                )}
                {soonCount > 0 && <StatusSummary status="soon" count={soonCount} />}
              </div>
            )}

            {/* Timeline única */}
            <ol className="px-4 pt-6 relative">
              <AnimatePresence initial={false}>
                {ordered.map((log, i) => (
                  <TimelineRow
                    key={log.id}
                    log={log}
                    isLast={i === ordered.length - 1}
                    confirming={confirming === log.id}
                    onDelete={() => handleDelete(log.id)}
                    onEdit={() => setEditingLog(log)}
                  />
                ))}
              </AnimatePresence>
            </ol>
          </>
        )}
      </main>

      <BottomTabBarBrutal
        onAddMaint={() => setSheetOpen(true)}
      />
      <AddMaintenanceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <AddMaintenanceSheet
        open={editingLog !== null}
        onClose={() => setEditingLog(null)}
        log={editingLog ?? undefined}
      />
    </div>
  );
}

function StatusSummary({
  status,
  count,
}: {
  status: 'overdue' | 'soon';
  count: number;
}) {
  const label = status === 'overdue' ? 'em atraso' : 'próximas';
  return (
    <div className="flex items-center gap-2">
      <TimelineDot status={status} />
      <span className="uppercase tracking-[0.1em] text-[10px] font-bold text-[rgba(13,13,13,0.7)]">
        <span className={status === 'overdue' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}>
          {count}
        </span>{' '}
        · {label}
      </span>
    </div>
  );
}

function TimelineRow({
  log,
  isLast,
  confirming,
  onDelete,
  onEdit,
}: {
  log: MaintenanceWithStatus;
  isLast: boolean;
  confirming: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const dateLabel = format(new Date(log.date + 'T12:00:00'), "d 'de' MMM yyyy", {
    locale: ptBR,
  });

  let dueLabel = '';
  if (log.daysUntilNext != null) {
    dueLabel =
      log.status === 'overdue'
        ? `venceu há ${Math.abs(log.daysUntilNext)} dias`
        : `vence em ${log.daysUntilNext} dias`;
  } else if (log.kmUntilNext != null) {
    dueLabel =
      log.status === 'overdue'
        ? `passou ${Math.abs(log.kmUntilNext).toLocaleString('pt-BR')} km`
        : `faltam ${log.kmUntilNext.toLocaleString('pt-BR')} km`;
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="relative flex gap-4 pb-5"
    >
      {/* Trilha vertical da timeline */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-5 bottom-0 w-[2px] bg-[var(--border)] bg-opacity-10"
        />
      )}

      <div className="pt-1 z-10">
        <TimelineDot status={log.status} />
      </div>

      <div className="flex-1 min-w-0 bg-[var(--surface)] border-2 border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-brutal-sm)] p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="font-bold text-[14px] text-[#0D0D0D]">
            {MAINTENANCE_LABELS[log.type]}
          </span>
          {log.cost != null && (
            <span className="shrink-0">
              <Money value={log.cost} size="sm" />
            </span>
          )}
        </div>

        <p className="uppercase tracking-[0.1em] text-[10px] font-bold mt-1 text-[rgba(13,13,13,0.6)]">
          {dateLabel}
          {log.shop && <span className="normal-case tracking-normal ml-1 text-[#0D0D0D]">· {log.shop}</span>}
        </p>

        {dueLabel && (
          <p
            className={cn(
              'uppercase tracking-[0.1em] text-[10px] font-bold mt-1.5',
              log.status === 'overdue' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
            )}
          >
            {dueLabel}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {log.odometer != null && (
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-[var(--border)] text-[#0D0D0D]">
              {log.odometer.toLocaleString('pt-BR')} km
            </span>
          )}
          {log.next_date && (
            <span className="uppercase tracking-[0.1em] text-[9px] font-bold px-2 py-0.5 rounded bg-[rgba(13,13,13,0.05)] text-[rgba(13,13,13,0.6)]">
              Próx: {format(new Date(log.next_date + 'T12:00:00'), 'd MMM yyyy', { locale: ptBR })}
            </span>
          )}
          {log.next_odometer != null && (
            <span className="uppercase tracking-[0.1em] text-[9px] font-bold px-2 py-0.5 rounded bg-[rgba(13,13,13,0.05)] text-[rgba(13,13,13,0.6)]">
              Próx: {log.next_odometer.toLocaleString('pt-BR')} km
            </span>
          )}
        </div>

        {log.notes && (
          <p className="text-[12px] font-medium text-[rgba(13,13,13,0.7)] mt-2 line-clamp-2">{log.notes}</p>
        )}

        <div className="flex items-center gap-4 mt-3 pt-2 border-t-2 border-[var(--border)] border-opacity-10">
          <button
            onClick={() => { haptic('tap'); onEdit(); }}
            className="uppercase tracking-[0.1em] text-[10px] font-bold text-[rgba(13,13,13,0.5)] active:text-[var(--accent)] transition-colors"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className={cn(
              'uppercase tracking-[0.1em] text-[10px] font-bold transition-colors flex flex-col items-end',
              confirming ? 'text-[var(--danger)]' : 'text-[rgba(13,13,13,0.5)] active:text-[#0D0D0D]'
            )}
          >
            <span className="flex items-center gap-1">
              {confirming ? 'Confirmar exclusão' : 'Excluir'}
              <Trash2 size={13} />
            </span>
            {confirming && (
              <motion.span
                className="block h-[2px] bg-[var(--danger)] rounded-full mt-0.5 w-full"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: 'linear' }}
                style={{ transformOrigin: 'right' }}
              />
            )}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

function SyncIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
