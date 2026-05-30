import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehicleContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Switch } from '@/components/ui/Switch';
import {
  MAINTENANCE_TYPES,
  type MaintenanceLog,
  type MaintenanceType,
  MAINTENANCE_LABELS,
} from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';

const schema = z.object({
  type: z.enum(MAINTENANCE_TYPES),
  date: z.string().min(1, 'Data obrigatória'),
  odometer: z.string().optional(),
  shop: z.string().max(60).optional(),
  notes: z.string().max(200).optional(),
  has_next: z.boolean(),
  next_date: z.string().optional(),
  next_odometer: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  log?: MaintenanceLog;
}

// F5-01: custo em BRL com máscara de vírgula (ex: "180,50").
// F5-02: modo de edição via prop `log`.
export function AddMaintenanceSheet({ open, onClose, log }: Props) {
  const { userTag } = useAuth();
  const { selectedVehicle, activeVehicles } = useVehicles();
  const { addMaintenanceLog, updateMaintenanceLog } = useMaintenance();
  const { toast } = useToast();

  const isEdit = !!log;
  const actualVehicle = isEdit ? activeVehicles.find(v => v.id === log.vehicle_id) : selectedVehicle;

  const [activeType, setActiveType] = useState<MaintenanceType>('oil');
  // F5-01: custo controlado fora do react-hook-form, formatado em BRL usando CurrencyInput
  const [cost, setCost] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'oil',
      date: format(new Date(), 'yyyy-MM-dd'),
      has_next: false,
    },
  });

  const hasNext = watch('has_next');

  useEffect(() => {
    if (!open) return;
    const t = log?.type ?? 'oil';
    setActiveType(t);
    setCost(log?.cost ?? null);
    reset({
      type: t,
      date: log?.date ?? format(new Date(), 'yyyy-MM-dd'),
      odometer: log?.odometer != null ? String(log.odometer) : '',
      shop: log?.shop ?? '',
      notes: log?.notes ?? '',
      has_next: !!(log?.next_date || log?.next_odometer),
      next_date: log?.next_date ?? '',
      next_odometer: log?.next_odometer != null ? String(log.next_odometer) : '',
    });
  }, [open, log, reset]);

  function selectType(t: MaintenanceType) {
    setActiveType(t);
    setValue('type', t);
  }

  async function onSubmit(data: FormData) {
    if (!actualVehicle) {
      toast('Veículo não encontrado. Ele pode ter sido removido.', 'error');
      return;
    }

    const odometer = data.odometer ? parseInt(data.odometer.replace(/\D/g, ''), 10) : null;
    const next_odometer =
      data.has_next && data.next_odometer
        ? parseInt(data.next_odometer.replace(/\D/g, ''), 10)
        : null;

    if (data.odometer && (odometer === null || isNaN(odometer))) {
      toast('Hodômetro inválido.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const logData: MaintenanceLog = {
      id: log?.id ?? crypto.randomUUID(),
      vehicle_id: actualVehicle.id,
      type: data.type,
      date: data.date,
      odometer: odometer && !isNaN(odometer) ? odometer : null,
      cost: cost != null && !isNaN(cost) ? cost : null,
      shop: data.shop?.trim() || null,
      notes: data.notes?.trim() || null,
      next_date: data.has_next && data.next_date ? data.next_date : null,
      next_odometer: next_odometer && !isNaN(next_odometer) ? next_odometer : null,
      created_by: log?.created_by ?? userTag ?? 'Daniel',
      created_at: log?.created_at ?? now,
      updated_at: now,
      archived_at: null,
    };

    if (isEdit) {
      updateMaintenanceLog(logData);
      haptic('success');
      toast('Manutenção atualizada!', 'success');
    } else {
      addMaintenanceLog(logData);
      haptic('success');
      toast('Manutenção registrada!', 'success');
    }
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
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
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                <div className="px-5 pb-4 overflow-y-auto max-h-[90dvh]">
                  <Dialog.Title className="text-editorial text-text mb-1" style={{ fontSize: 26 }}>
                    {isEdit ? 'Editar manutenção' : 'Nova manutenção'}
                  </Dialog.Title>
                  {actualVehicle && (
                    <p className="text-instrument-label mt-1 mb-5">{actualVehicle.name}</p>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-label="Formulário de manutenção">
                    {/* Tipo */}
                    <div>
                      <label 
                        className="block mb-2 uppercase tracking-[0.14em] text-[10px] font-bold"
                        style={{ color: 'rgba(13,13,13,0.7)' }}
                      >
                        Tipo
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MAINTENANCE_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => selectType(t)}
                              className={cn(
                                'px-4 py-2 rounded-[32px] text-[13px] font-bold border-2 transition-all active:scale-95',
                                activeType === t
                                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--border)] shadow-[var(--shadow-brutal-xs)]'
                                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                              )}
                            >
                              {MAINTENANCE_LABELS[t]}
                            </button>
                        ))}
                      </div>
                    </div>

                    {/* Data */}
                    <div>
                      <label 
                        className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                        style={{ color: 'rgba(13,13,13,0.7)' }}
                      >
                        Data
                      </label>
                      <Input type="date" {...register('date')} error={errors.date?.message} />
                    </div>

                    {/* Hodômetro + Custo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label 
                          className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                          style={{ color: 'rgba(13,13,13,0.7)' }}
                        >
                          Hodômetro (km)
                        </label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Ex: 45230"
                          {...register('odometer')}
                        />
                      </div>
                      <div>
                        <label 
                          className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                          style={{ color: 'rgba(13,13,13,0.7)' }}
                        >
                          Custo (R$)
                        </label>
                        {/* F5-01: máscara BRL automática */}
                        <CurrencyInput
                          placeholder="R$ 0,00"
                          value={cost}
                          onChange={setCost}
                        />
                      </div>
                    </div>

                    {/* Oficina */}
                    <div>
                      <label 
                        className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                        style={{ color: 'rgba(13,13,13,0.7)' }}
                      >
                        Oficina (opcional)
                      </label>
                      <Input
                        {...register('shop')}
                        placeholder="Ex: Oficina do João..."
                        autoCapitalize="words"
                      />
                    </div>

                    {/* Observações */}
                    <div>
                      <label 
                        className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                        style={{ color: 'rgba(13,13,13,0.7)' }}
                      >
                        Observações (opcional)
                      </label>
                      <Input {...register('notes')} placeholder="Detalhes..." />
                    </div>

                    {/* Próxima troca toggle */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-medium text-text">Agendar próxima</p>
                        <p className="text-xs text-muted">Data e/ou km da próxima revisão</p>
                      </div>
                      <Switch
                        checked={hasNext}
                        onCheckedChange={(v) => setValue('has_next', v)}
                      />
                    </div>

                    {/* Next date + km */}
                    {hasNext && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label 
                            className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                            style={{ color: 'rgba(13,13,13,0.7)' }}
                          >
                            Próxima data
                          </label>
                          <Input type="date" {...register('next_date')} />
                        </div>
                        <div>
                          <label 
                            className="block mb-1.5 uppercase tracking-[0.14em] text-[10px] font-bold"
                            style={{ color: 'rgba(13,13,13,0.7)' }}
                          >
                            Próximo km
                          </label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="Ex: 55000"
                            {...register('next_odometer')}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !actualVehicle}
                      className={cn(
                        "w-full mt-2 py-4 rounded-[var(--radius-xl)] flex items-center justify-center font-bold uppercase tracking-[0.1em]",
                        "border-2 border-[var(--border)] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                      )}
                      style={{ 
                        background: 'var(--accent)', 
                        color: '#1A1816', 
                        fontSize: 14,
                        boxShadow: 'var(--shadow-brutal-md)' 
                      }}
                    >
                      {isSubmitting
                        ? 'Salvando...'
                        : isEdit
                          ? 'Salvar alterações'
                          : 'Registrar manutenção'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
