import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Switch } from '@/components/ui/Switch';
import { haptic } from '@/lib/haptics';
import { validateOdometer } from '@/lib/fuel';
import { FUEL_LABELS, FUEL_TYPES, type FuelType } from '@/types/vehicle';
import type { FuelLog } from '@/types/fuel';
import { cn } from '@/lib/utils';

const schema = z.object({
  totalCost: z.number().nullable().optional(),
  liters: z.string().min(1, 'Obrigatório'),
  pricePerLiter: z.string().min(1, 'Obrigatório'),
  odometer: z.string().min(1, 'Obrigatório'),
  date: z.string().min(1, 'Obrigatório'),
  fuelType: z.enum(FUEL_TYPES),
  fullTank: z.boolean(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  log?: FuelLog;
}

export function AddFuelSheet({ open, onClose, log }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 bg-[var(--bg)] rounded-t-[32px] border-t-[3px] border-x-[3px] border-[var(--border)]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.6 }}
              >
                <SheetBody onClose={onClose} log={log} />
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function parseLocaleNumber(input: string | undefined): number {
  if (!input) return NaN;
  const cleaned = input.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
  return Number.parseFloat(cleaned);
}

function SheetBody({ onClose, log }: { onClose: () => void; log?: FuelLog }) {
  const { userTag } = useAuth();
  const { selectedVehicle, activeVehicles } = useVehicles();
  const { logsForVehicle, addFuelLog, updateFuelLog } = useFuel();
  const { toast } = useToast();

  const isEdit = !!log;
  const actualVehicle = isEdit ? activeVehicles.find(v => v.id === log.vehicle_id) : selectedVehicle;
  const vehicleFuelType = actualVehicle?.fuel_type ?? 'gasoline';

  // F3: Inteligência Contextual de Combustível
  const allowedFuelTypes = (() => {
    if (vehicleFuelType === 'flex' || vehicleFuelType === 'hybrid') return ['gasoline', 'ethanol'] as FuelType[];
    if (vehicleFuelType === 'gasoline') return ['gasoline'] as FuelType[];
    if (vehicleFuelType === 'diesel') return ['diesel'] as FuelType[];
    if (vehicleFuelType === 'ethanol') return ['ethanol'] as FuelType[];
    if (vehicleFuelType === 'electric') return ['electric'] as FuelType[];
    return ['gasoline'] as FuelType[];
  })();

  const defaultFuelType = allowedFuelTypes.includes(log?.fuel_type as FuelType) 
    ? (log!.fuel_type as FuelType) 
    : allowedFuelTypes[0] as FuelType;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      totalCost: log?.total_cost ?? undefined,
      liters: log ? log.liters.toFixed(3).replace('.', ',') : '',
      pricePerLiter: log?.price_per_liter ? log.price_per_liter.toFixed(3).replace('.', ',') : '',
      odometer: log ? String(log.odometer) : '',
      date: log?.date ?? format(new Date(), 'yyyy-MM-dd'),
      fuelType: defaultFuelType,
      fullTank: log?.full_tank ?? true,
    }
  });

  const [focusedField, setFocusedField] = useState<'total' | 'liters' | 'ppl' | null>(null);

  const wTotalCost = watch('totalCost');
  const wLiters = watch('liters');
  const wPpl = watch('pricePerLiter');
  const wFuelType = watch('fuelType');
  const wFullTank = watch('fullTank');

  // F4: Bomba Auto-Calculável (Triângulo Matemático)
  useEffect(() => {
    if (!focusedField) return;

    const total = wTotalCost ?? 0;
    const l = parseLocaleNumber(wLiters);
    const ppl = parseLocaleNumber(wPpl);

    if (focusedField === 'total') {
      if (Number.isFinite(ppl) && ppl > 0) {
        const nextLiters = (total / ppl).toFixed(3).replace('.', ',');
        if (nextLiters !== wLiters) setValue('liters', nextLiters);
      } else if (Number.isFinite(l) && l > 0) {
        const nextPpl = (total / l).toFixed(3).replace('.', ',');
        if (nextPpl !== wPpl) setValue('pricePerLiter', nextPpl);
      }
    } else if (focusedField === 'liters') {
      if (Number.isFinite(ppl) && ppl > 0 && Number.isFinite(l) && l > 0) {
        const nextTotal = parseFloat((l * ppl).toFixed(2));
        if (nextTotal !== wTotalCost) setValue('totalCost', nextTotal);
      } else if (total > 0 && Number.isFinite(l) && l > 0) {
        const nextPpl = (total / l).toFixed(3).replace('.', ',');
        if (nextPpl !== wPpl) setValue('pricePerLiter', nextPpl);
      }
    } else if (focusedField === 'ppl') {
      if (Number.isFinite(l) && l > 0 && Number.isFinite(ppl) && ppl > 0) {
        const nextTotal = parseFloat((l * ppl).toFixed(2));
        if (nextTotal !== wTotalCost) setValue('totalCost', nextTotal);
      } else if (total > 0 && Number.isFinite(ppl) && ppl > 0) {
        const nextLiters = (total / ppl).toFixed(3).replace('.', ',');
        if (nextLiters !== wLiters) setValue('liters', nextLiters);
      }
    }
  }, [wTotalCost, wLiters, wPpl, focusedField, setValue]);

  const displayPpl = parseLocaleNumber(wPpl);

  async function onSubmit(data: FormData) {
    if (!actualVehicle) {
      haptic('error');
      toast('Veículo não encontrado. Ele pode ter sido removido.', 'error');
      return;
    }

    const odoNum = parseInt(data.odometer.replace(/\D/g, ''), 10);
    if (!Number.isFinite(odoNum) || odoNum <= 0) {
      haptic('error');
      toast('Hodômetro inválido.', 'error');
      return;
    }

    const total = data.totalCost ?? 0;
    const liters = parseLocaleNumber(data.liters);
    const ppl = parseLocaleNumber(data.pricePerLiter);

    if (total <= 0 || !Number.isFinite(liters) || liters <= 0 || !Number.isFinite(ppl) || ppl <= 0) {
      haptic('error');
      toast('Verifique os valores de Total, Litros e Preço.', 'error');
      return;
    }

    if (!isEdit) {
      const odomErr = validateOdometer(logsForVehicle(actualVehicle.id), odoNum);
      if (odomErr) {
        haptic('error');
        toast(odomErr, 'error');
        return;
      }
    }

    const now = new Date().toISOString();
    const logData: FuelLog = {
      id: log?.id ?? crypto.randomUUID(),
      vehicle_id: actualVehicle.id,
      date: data.date,
      odometer: odoNum,
      liters,
      total_cost: total,
      price_per_liter: ppl,
      full_tank: data.fullTank,
      fuel_type: data.fuelType,
      gas_station: log?.gas_station ?? null,
      notes: null,
      created_by: log?.created_by ?? userTag ?? 'Daniel',
      created_at: log?.created_at ?? now,
      updated_at: now,
      archived_at: null,
    };

    if (isEdit) {
      updateFuelLog(logData);
      haptic('success');
      toast('Abastecimento atualizado', 'success');
    } else {
      addFuelLog(logData);
      haptic('success');
      toast('Abastecimento registrado', 'success');
    }
    onClose();
  }

  return (
    <>
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-border" />
      </div>

      <div className="px-5 pt-2 pb-4 overflow-y-auto max-h-[92dvh]">
        <Dialog.Title className="text-editorial text-text" style={{ fontSize: 26 }}>
          {isEdit ? 'Editar abastecimento' : 'Novo abastecimento'}
        </Dialog.Title>
        {actualVehicle && (
          <p className="text-instrument-label mt-1 mb-4">{actualVehicle.name}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} aria-label="Formulário de abastecimento">
          {/* Tipo de combustível */}
          {allowedFuelTypes.length > 1 ? (
            <div className="mt-4">
              <p className="text-instrument-label mb-2">Combustível</p>
              <div className="flex flex-wrap gap-2">
                {allowedFuelTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { haptic('tap'); setValue('fuelType', t); }}
                    className={cn(
                      'px-4 py-2 rounded-[32px] text-[13px] font-bold border-2 transition-all active:scale-95',
                      wFuelType === t
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--border)] shadow-[var(--shadow-brutal-xs)]'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                    )}
                  >
                    {FUEL_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-instrument-label">Combustível</p>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-transparent text-muted border-border">
                {FUEL_LABELS[allowedFuelTypes[0] as FuelType]}
              </span>
            </div>
          )}

          {/* CurrencyInput — valor total em BRL */}
          <div className="mt-4">
            <Field label="Total (R$)">
              <Controller
                control={control}
                name="totalCost"
                render={({ field }) => (
                  <CurrencyInput
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={field.onChange}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      setFocusedField('total');
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }}
                    autoFocus
                  />
                )}
              />
            </Field>
          </div>

          {/* Hint de R$/L */}
          {Number.isFinite(displayPpl) && displayPpl > 0 && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-instrument-label text-center mt-3 text-muted"
            >
              R$ <span className="text-mech text-accent">{displayPpl.toFixed(3)}</span> / litro
            </motion.p>
          )}

          {/* Litros + R$/litro */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Field label="Litros">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 35,500"
                {...register('liters')}
                onFocus={(e) => {
                  setFocusedField('liters');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </Field>
            <Field label="R$ / litro">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 5,689"
                {...register('pricePerLiter')}
                onFocus={(e) => {
                  setFocusedField('ppl');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </Field>
          </div>

          {/* Hodômetro + Data */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Hodômetro (km)">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="45230"
                {...register('odometer')}
                onFocus={(e) => {
                  setFocusedField(null);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </Field>
            <Field label="Data">
              <Input
                type="date"
                {...register('date')}
                onFocus={(e) => {
                  setFocusedField(null);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </Field>
          </div>

          {/* Tanque cheio */}
          <div className="flex items-center justify-between mt-4 py-2">
            <div>
              <p className="text-sm text-text">Tanque cheio</p>
              <p className="text-xs text-muted">Usado para calcular km/L</p>
            </div>
            <Switch checked={wFullTank} onCheckedChange={(v) => setValue('fullTank', v)} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-6 py-4 rounded-[var(--radius-xl)] flex items-center justify-center font-bold uppercase tracking-[0.1em]",
              "border-2 border-[var(--border)] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            )}
            style={{ 
              background: 'var(--accent)', 
              color: '#1A1816', 
              fontSize: 14,
              boxShadow: 'var(--shadow-brutal-md)' 
            }}
          >
            {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Registrar'}
          </button>
        </form>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label 
        className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
        style={{ color: 'rgba(13,13,13,0.7)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
