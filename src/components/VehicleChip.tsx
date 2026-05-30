import { useMemo, useState } from 'react';
import { Car, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { KeyChip } from '@/components/identity/KeyChip';
import { Odometer } from '@/components/identity/Odometer';
import { haptic } from '@/lib/haptics';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';

// Telemetria Íntima v1.5 — substitui o chip antigo pela "chave do carro" (<KeyChip>).
// Toque abre seletor; swipe horizontal alterna entre veículos diretamente.
// PROJETO.md §8.4/§8.5.
export function VehicleChip() {
  const { activeVehicles, selectedVehicle, isAllSelected, selectVehicle } = useVehicles();
  const { logsForVehicle: fuelLogsForVehicle } = useFuel();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const photo = usePhotoUrl(selectedVehicle?.photo_key ?? null);

  // Hodômetro = maior odometer nos fuel_logs; fallback para odometer_initial do cadastro.
  const odometer = useMemo(() => {
    if (!selectedVehicle) return 0;
    const logs = fuelLogsForVehicle(selectedVehicle.id);
    return logs.length > 0
      ? Math.max(...logs.map((l) => l.odometer))
      : (selectedVehicle.odometer_initial ?? 0);
  }, [selectedVehicle, fuelLogsForVehicle]);

  // Pre-compute odometer for all vehicles in the dropdown
  const odometerByVehicle = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of activeVehicles) {
      const logs = fuelLogsForVehicle(v.id);
      map.set(
        v.id,
        logs.length > 0 ? Math.max(...logs.map((l) => l.odometer)) : (v.odometer_initial ?? 0),
      );
    }
    return map;
  }, [activeVehicles, fuelLogsForVehicle]);

  // Swipe horizontal: alterna pro próximo / anterior veículo.
  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (!selectedVehicle || activeVehicles.length < 2) return;
    const idx = activeVehicles.findIndex((v) => v.id === selectedVehicle.id);
    if (idx < 0) return;
    if (info.offset.x < -60) {
      const next = activeVehicles[(idx + 1) % activeVehicles.length]!;
      haptic('tap');
      selectVehicle(next.id);
    } else if (info.offset.x > 60) {
      const prev =
        activeVehicles[(idx - 1 + activeVehicles.length) % activeVehicles.length]!;
      haptic('tap');
      selectVehicle(prev.id);
    }
  }

  return (
    <>
      {isAllSelected ? (
        <button
          type="button"
          onClick={() => { haptic('tap'); setOpen(true); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft border border-accent text-accent text-sm active:opacity-75 transition-opacity"
          aria-label="Todos os veículos selecionados"
        >
          <Layers size={14} />
          Todos
        </button>
      ) : selectedVehicle ? (
        <motion.div
          drag={activeVehicles.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={handleDragEnd}
          className="touch-pan-y"
        >
          <KeyChip
            photoUrl={photo}
            nickname={selectedVehicle.name}
            odometer={odometer}
            onClick={() => {
              haptic('tap');
              setOpen(true);
            }}
          />
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={() => {
            haptic('tap');
            setOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elev border border-border text-faint text-sm active:text-accent active:border-accent transition-colors"
          aria-label="Selecionar veículo"
        >
          <Car size={14} />
          Veículo
        </button>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <AnimatePresence>
            {open && (
              <Dialog.Content asChild forceMount>
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 bg-surface-elev rounded-t-3xl"
                  style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.6 }}
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>

                  <div className="px-5 pb-4">
                    <Dialog.Title className="text-editorial text-text" style={{ fontSize: 22 }}>
                      Trocar de veículo
                    </Dialog.Title>

                    {activeVehicles.length === 0 ? (
                      <p className="text-muted text-sm text-center py-6">
                        Nenhum veículo cadastrado ainda.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 mt-4">
                        {activeVehicles.length >= 2 && (
                          <button
                            onClick={() => {
                              haptic('tap');
                              selectVehicle('__all__');
                              setOpen(false);
                            }}
                            className={[
                              'flex items-center gap-3 p-3 rounded-2xl border transition-colors text-left',
                              isAllSelected
                                ? 'border-accent bg-accent-soft'
                                : 'border-border bg-surface active:border-accent/40',
                            ].join(' ')}
                          >
                            <div className="w-11 h-11 rounded-full bg-surface-2 border border-border shrink-0 flex items-center justify-center">
                              <Layers size={18} className="text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-display text-text leading-tight"
                                style={{ fontSize: 18, fontVariationSettings: "'opsz' 72, 'wght' 400" }}
                              >
                                Todos os veículos
                              </p>
                              <p className="text-muted text-xs mt-0.5">
                                {activeVehicles.length} veículos agregados
                              </p>
                            </div>
                            {isAllSelected && (
                              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-accent shrink-0" />
                            )}
                          </button>
                        )}
                        {activeVehicles.map((v) => (
                          <VehicleRow
                            key={v.id}
                            name={v.name}
                            photoKey={v.photo_key}
                            odometer={odometerByVehicle.get(v.id) ?? 0}
                            selected={!isAllSelected && v.id === selectedVehicle?.id}
                            onSelect={() => {
                              haptic('tap');
                              selectVehicle(v.id);
                              setOpen(false);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        haptic('tap');
                        setOpen(false);
                        navigate('/veiculos');
                      }}
                      className="w-full mt-4 py-3 text-sm text-accent font-medium border border-accent/30 rounded-xl active:bg-accent-soft transition-colors"
                    >
                      Gerenciar veículos
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function VehicleRow({
  name,
  photoKey,
  odometer,
  selected,
  onSelect,
}: {
  name: string;
  photoKey: string | null;
  odometer: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const src = usePhotoUrl(photoKey);
  return (
    <button
      onClick={onSelect}
      className={[
        'flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors text-left',
        selected
          ? 'border-[var(--border)] bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-brutal-sm)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] active:bg-[var(--surface-2)] active:translate-x-[1px] active:translate-y-[1px]',
      ].join(' ')}
    >
      <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--surface-2)] border-2 border-[var(--border)] shrink-0 flex items-center justify-center">
        {src ? (
          <img src={src} alt={`Foto de ${name}`} className="w-full h-full object-cover" />
        ) : (
          <Car size={18} className="text-[var(--text-faint)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-display leading-tight truncate"
          style={{ fontSize: 18, fontVariationSettings: "'opsz' 72, 'wght' 600" }}
        >
          {name}
        </p>
        <span style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>
          <Odometer value={odometer} digits={6} />
        </span>
      </div>
      {selected && (
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[var(--accent-fg)] shrink-0" />
      )}
    </button>
  );
}
