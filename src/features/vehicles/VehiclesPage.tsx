import { useState, useEffect } from 'react';
import { Car, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { EmptyState } from '@/components/EmptyState';
import { NeedleAtZero } from '@/components/identity/EmptyArt';
import { GaugeSpinner } from '@/components/identity/GaugeSpinner';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';
import { AddVehicleSheet } from './AddVehicleSheet';
import { FUEL_LABELS, type Vehicle } from '@/types/vehicle';

// i18n.locale='pt-BR' skip-nav geo: application/ld+json {"@context":"https://schema.org","@type":"WebApplication","author":{"@type":"Person","name":"Daniel Britto"},"datePublished":"2026-04-28"}
export function VehiclesPage() {
  const { activeVehicles, isSyncing, triggerSync } = useVehicles();
  const { fuelLogs } = useFuel();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  function latestOdometer(vehicleId: string): number {
    const logs = fuelLogs.filter((l) => !l.archived_at && l.vehicle_id === vehicleId);
    if (logs.length === 0) return 0;
    return Math.max(...logs.map((l) => l.odometer));
  }

  return (
    <div className="min-h-dvh bg-transparent flex flex-col">
      <PageHeader
        title="Meus Veículos"
        chip={activeVehicles.length > 0 ? String(activeVehicles.length) : undefined}
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
            <button
              type="button"
              onClick={() => {
                haptic('tap');
                navigate('/ajustes');
              }}
              className="p-2 text-muted active:text-accent transition-colors"
              aria-label="Configurações"
            >
              <Settings size={18} strokeWidth={1.75} />
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+80px)] overscroll-y-contain">
        {activeVehicles.length === 0 ? (
          <EmptyState
            icon={<NeedleAtZero size={80} />}
            title="Nenhum veículo"
            description="Adicione seu primeiro carro ou moto para começar."
            action={{ label: 'Adicionar veículo', onClick: () => setSheetOpen(true) }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {activeVehicles.map((v) => (
                <VehicleTile
                  key={v.id}
                  vehicle={v}
                  odometer={latestOdometer(v.id) || (v.odometer_initial ?? 0)}
                  onEdit={() => setEditingVehicle(v)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <BottomTabBarBrutal />

      <AddVehicleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <AddVehicleSheet
        open={editingVehicle !== null}
        onClose={() => setEditingVehicle(null)}
        vehicle={editingVehicle ?? undefined}
      />
    </div>
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

function VehicleTile({
  vehicle,
  odometer,
  onEdit,
}: {
  vehicle: Vehicle;
  odometer: number;
  onEdit: () => void;
}) {
  const imgSrc = usePhotoUrl(vehicle.photo_key);
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [imgSrc]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <button
        type="button"
        onClick={() => { haptic('tap'); onEdit(); }}
        className={cn(
          "w-full text-left rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[#b59a6a] text-[#F4EFE6] overflow-hidden active:translate-x-[2px] active:translate-y-[2px] transition-[box-shadow,transform] duration-100 mb-4 flex flex-col"
        )}
        style={{ boxShadow: 'var(--shadow-brutal-lg)' }}
        aria-label={`${vehicle.name}, ${odometer.toLocaleString('pt-BR')} km. Toque para editar`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <span
            className="uppercase tracking-[0.16em] text-[10px] font-bold"
            style={{ color: 'rgba(13,13,13,0.7)' }}
          >
            {vehicle.category === 'motorcycle' ? 'Moto' : 'Carro'}
          </span>
          {vehicle.plate && (
            <span
              className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-[rgba(13,13,13,0.2)]"
              style={{ color: '#0D0D0D' }}
            >
              {vehicle.plate}
            </span>
          )}
        </div>

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
              {vehicle.name}
            </h2>
            <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(13,13,13,0.75)' }}>
              {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          {imgSrc && !imgError ? (
            <img
              src={imgSrc}
              alt={vehicle.name}
              className="w-20 h-12 object-cover rounded-lg shrink-0 border border-[#0D0D0D]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-20 h-12 flex items-center justify-center rounded-lg shrink-0 border border-[rgba(13,13,13,0.2)] bg-[rgba(13,13,13,0.05)]">
              <Car size={24} className="text-[#0D0D0D] opacity-60" />
            </div>
          )}
        </div>

        <div style={{ height: 2, background: 'rgba(13,13,13,0.15)', margin: '0 16px' }} />

        <div className="flex items-center justify-between px-4 py-4 bg-[#25211E]">
          <span className="uppercase tracking-[0.1em] text-[9px] font-bold px-2 py-0.5 rounded bg-[rgba(181,154,106,0.2)] text-[var(--accent)] border border-[rgba(181,154,106,0.3)]">
            {FUEL_LABELS[vehicle.fuel_type]}
          </span>
          <div className="text-right">
            <p className="uppercase tracking-[0.14em] text-[9px] font-bold" style={{ color: 'rgba(244,239,230,0.5)' }}>Hodômetro</p>
            <p className="font-mono text-[14px] font-bold" style={{ color: '#F4EFE6' }}>
              {odometer.toLocaleString('pt-BR')} km
            </p>
          </div>
        </div>
      </button>

    </motion.div>
  );
}
