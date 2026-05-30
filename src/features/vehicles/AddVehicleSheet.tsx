import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Image, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/context/VehicleContext';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';
import { FUEL_LABELS, FUEL_TYPES, type FuelType, type Vehicle } from '@/types/vehicle';
import { uploadPhoto } from '@/lib/photo';
import { saveLocalPhoto, deleteLocalPhoto, isLocalPhotoKey } from '@/lib/localPhoto';
import { haptic } from '@/lib/haptics';

const CATEGORIES = [
  { value: 'car' as const, label: 'Carro' },
  { value: 'motorcycle' as const, label: 'Moto' },
];

const COLORS = [
  { value: '#FFFFFF', label: 'Branco' },
  { value: '#1A1A1A', label: 'Preto' },
  { value: '#C0C0C0', label: 'Prata' },
  { value: '#4169E1', label: 'Azul' },
  { value: '#CC0000', label: 'Vermelho' },
  { value: '#2E8B57', label: 'Verde' },
  { value: '#FFD700', label: 'Amarelo' },
  { value: '#8B4513', label: 'Marrom' },
  { value: '#808080', label: 'Cinza' },
  { value: '#FF8C00', label: 'Laranja' },
];

const schema = z.object({
  name: z.string().min(1, 'Apelido obrigatório').max(30),
  brand: z.string().max(40).optional(),
  model: z.string().max(40).optional(),
  year: z.string().regex(/^\d{0,4}$/, 'Ano inválido').optional(),
  plate: z.string().max(10).optional(),
  fuel_type: z.enum(FUEL_TYPES),
  odometer_initial: z.string().refine((v) => !v || /^\d+$/.test(v), 'Informe apenas números').optional(),
  category: z.enum(['car', 'motorcycle']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  tank_capacity_liters: z.string().refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), 'Número inválido').optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
}

const MOTORCYCLE_MODELS = /bros|cg|biz|nmax|pcx|cb|mt|fazer|crosser|ninja|gsx|z[0-9]+|xre|tenere|factor|lander|sahara|hornet|tiger|versys|vstrom|kawasaki|yamaha|honda|suzuki|bmw|harley/i;

function guessCategory(model: string): 'car' | 'motorcycle' {
  return MOTORCYCLE_MODELS.test(model) ? 'motorcycle' : 'car';
}

const DEFAULT_COLOR = '#4169E1';

export function AddVehicleSheet({ open, onClose, vehicle }: Props) {
  const isEditMode = !!vehicle;
  const { signing, userTag } = useAuth();
  const { addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const { toast } = useToast();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customColor, setCustomColor] = useState(false);

  const existingPhotoUrl = usePhotoUrl(vehicle?.photo_key ?? null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fuel_type: 'flex', category: 'car', color: DEFAULT_COLOR },
  });

  const watchModel = watch('model');

  useEffect(() => {
    if (!watchModel) return;
    const guessed = guessCategory(watchModel);
    setValue('category', guessed);
  }, [watchModel, setValue]);

  useEffect(() => {
    if (!open) return;
    reset(
      vehicle
        ? {
            name: vehicle.name,
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            year: vehicle.year?.toString() ?? '',
            plate: vehicle.plate ?? '',
            fuel_type: vehicle.fuel_type,
            odometer_initial: vehicle.odometer_initial?.toString() ?? '',
            category: vehicle.category,
            color: vehicle.color,
            tank_capacity_liters: vehicle.tank_capacity_liters?.toString() ?? '',
          }
        : { fuel_type: 'flex', name: '', brand: '', model: '', year: '', plate: '', odometer_initial: '', category: 'car', color: DEFAULT_COLOR, tank_capacity_liters: '' },
    );
    setCustomColor(false);
    setPhotoRemoved(false);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const id = setTimeout(() => {
      setPhotoFile(null);
      setPhotoPreview(null);
    }, 0);
    return () => {
      clearTimeout(id);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [open, vehicle]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoRemoved(false);
    e.target.value = '';
  }

  function handleRemovePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoRemoved(true);
  }

  async function onSubmit(data: FormData) {
    if (!isEditMode && !data.odometer_initial) {
      setError('odometer_initial', { message: 'Quilometragem obrigatória' });
      return;
    }

    setSaving(true);
    try {
      const vehicleId = isEditMode ? vehicle!.id : crypto.randomUUID();
      let photo_key = vehicle?.photo_key ?? null;

      if (photoRemoved) {
        // User explicitly removed the photo
        if (vehicle?.photo_key && isLocalPhotoKey(vehicle.photo_key)) {
          deleteLocalPhoto(vehicle.id);
        }
        photo_key = null;
      } else if (photoFile && signing) {
        try {
          photo_key = await uploadPhoto(signing, photoFile);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erro desconhecido';
          toast(`Foto não enviada: ${msg}. Veículo salvo sem foto.`, 'warning');
        }
      } else if (photoFile && !signing) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Erro ao ler foto'));
          reader.readAsDataURL(photoFile);
        });
        const saved = saveLocalPhoto(vehicleId, dataUrl);
        if (saved) {
          photo_key = `local:${vehicleId}`;
        } else {
          toast('Foto não salva: armazenamento cheio.', 'warning');
        }
      }

      const now = new Date().toISOString();
      const odometer_initial = data.odometer_initial ? parseInt(data.odometer_initial, 10) : null;
      const tank_capacity_liters = data.tank_capacity_liters ? parseFloat(data.tank_capacity_liters) : null;

      if (isEditMode && vehicle) {
        updateVehicle({
          ...vehicle,
          id: vehicle.id,
          name: data.name,
          brand: data.brand ?? '',
          model: data.model ?? '',
          year: data.year ? parseInt(data.year, 10) : null,
          plate: data.plate ?? null,
          fuel_type: data.fuel_type as FuelType,
          category: data.category,
          color: data.color,
          photo_key,
          odometer_initial,
          tank_capacity_liters,
          updated_at: now,
        });
        haptic('success');
        toast(`${data.name} atualizado!`, 'success');
      } else {
        addVehicle({
          id: vehicleId,
          name: data.name,
          brand: data.brand ?? '',
          model: data.model ?? '',
          year: data.year ? parseInt(data.year, 10) : null,
          plate: data.plate ?? null,
          fuel_type: data.fuel_type as FuelType,
          category: data.category,
          color: data.color,
          photo_key,
          odometer_initial,
          tank_capacity_liters,
          created_by: userTag ?? 'usuário',
          created_at: now,
          updated_at: now,
          archived_at: null,
        });
        haptic('success');
        toast(`${data.name} adicionado!`, 'success');
      }

      handleClose();
    } catch {
      haptic('error');
      toast('Erro ao salvar veículo.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!vehicle) return;
    if (isLocalPhotoKey(vehicle.photo_key)) {
      deleteLocalPhoto(vehicle.id);
    }
    haptic('warning');
    deleteVehicle(vehicle.id);
    toast(`${vehicle.name} excluído.`, 'info');
    handleClose();
  }

  function handleClose() {
    onClose();
  }

  const displayPhoto = photoRemoved ? null : (photoPreview ?? existingPhotoUrl);
  const canRemovePhoto = !!photoPreview || (!!vehicle?.photo_key && !photoRemoved);
  const selectedColor = watch('color');
  const selectedCategory = watch('category');

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 bg-[#F4EFE6] rounded-t-[32px] border-t-[3px] border-x-[3px] border-[#0D0D0D]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.6 }}
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(13,13,13,0.2)' }} />
                </div>

                <div className="px-5 pb-4 overflow-y-auto max-h-[85dvh]">
                  <Dialog.Title
                    className="font-bold leading-tight mb-5"
                    style={{
                      fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                      fontVariationSettings: "'opsz' 72, 'wght' 700",
                      fontSize: 28,
                      color: '#0D0D0D',
                    }}
                  >
                    {isEditMode ? 'Editar veículo' : 'Novo veículo'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-label="Formulário de veículo">
                    {/* Foto */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full" style={{ border: '3px solid #0D0D0D', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.05)' }}>
                        {displayPhoto ? (
                          <img src={displayPhoto} alt={`Foto de ${watch('name') || 'veículo'}`} className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={28} style={{ color: 'rgba(13,13,13,0.3)' }} />
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        <button
                          type="button"
                          onClick={() => cameraRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#0D0D0D] text-xs font-bold transition-colors"
                          style={{ color: 'rgba(13,13,13,0.6)' }}
                        >
                          <Camera size={13} />
                          Câmera
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#0D0D0D] text-xs font-bold transition-colors"
                          style={{ color: 'rgba(13,13,13,0.6)' }}
                        >
                          <Image size={13} />
                          Galeria
                        </button>
                        {canRemovePhoto && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-colors"
                            style={{ borderColor: '#CC0000', color: '#CC0000' }}
                          >
                            <Trash2 size={13} />
                            Remover
                          </button>
                        )}
                      </div>
                      <input
                        ref={cameraRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                      <input
                        ref={galleryRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>

                    {/* Apelido */}
                    <Field label="Apelido *">
                      <Input
                        {...register('name')}
                        placeholder="Ex: Celta, Corolla, Moto..."
                        error={errors.name?.message}
                        autoCapitalize="words"
                      />
                    </Field>

                    {/* Marca + Modelo */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Marca">
                        <Input {...register('brand')} placeholder="Ex: Toyota" autoCapitalize="words" />
                      </Field>
                      <Field label="Modelo">
                        <Input {...register('model')} placeholder="Ex: Corolla" autoCapitalize="words" />
                      </Field>
                    </div>

                    {/* Categoria */}
                    <Field label="Categoria">
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((cat) => (
                          <label key={cat.value} className="relative flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              value={cat.value}
                              checked={selectedCategory === cat.value}
                              onChange={() => setValue('category', cat.value)}
                              className="sr-only peer"
                            />
                            <span
                              className="w-full text-center py-2.5 text-[13px] font-bold border-2 border-[#0D0D0D] rounded-[var(--radius-xl)] transition-all active:scale-95"
                              style={{
                                backgroundColor: selectedCategory === cat.value ? '#F5D000' : 'transparent',
                                color: '#0D0D0D',
                                boxShadow: selectedCategory === cat.value ? '3px 3px 0px #0D0D0D' : 'none',
                              }}
                            >
                              {cat.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    {/* Cor */}
                    <Field label="Cor">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => { setValue('color', c.value); setCustomColor(false); }}
                              className="w-8 h-8 rounded-full border-2 transition-transform active:scale-90"
                              style={{
                                backgroundColor: c.value,
                                borderColor: selectedColor === c.value && !customColor ? '#0D0D0D' : 'rgba(13,13,13,0.2)',
                                transform: selectedColor === c.value && !customColor ? 'scale(1.15)' : 'scale(1)',
                                boxShadow: selectedColor === c.value && !customColor ? '2px 2px 0px #0D0D0D' : 'none',
                              }}
                              title={c.label}
                              aria-label={c.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => setCustomColor(true)}
                            className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] font-bold transition-transform active:scale-90"
                            style={{
                              borderColor: 'rgba(13,13,13,0.3)',
                              color: 'rgba(13,13,13,0.5)',
                              backgroundColor: customColor ? selectedColor : 'transparent',
                              transform: customColor ? 'scale(1.15)' : 'scale(1)',
                              boxShadow: customColor ? '2px 2px 0px #0D0D0D' : 'none',
                            }}
                            aria-label="Personalizar cor"
                          >
                            {customColor ? '' : '+'}
                          </button>
                        </div>
                        {customColor && (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={selectedColor}
                              onChange={(e) => setValue('color', e.target.value)}
                              className="w-10 h-10 p-0 border-2 border-[#0D0D0D] rounded cursor-pointer"
                              style={{ backgroundColor: 'transparent' }}
                            />
                            <span className="text-xs font-mono font-bold" style={{ color: 'rgba(13,13,13,0.6)' }}>
                              {selectedColor}
                            </span>
                          </div>
                        )}
                        {errors.color && (
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#CC0000' }}>{errors.color.message}</p>
                        )}
                      </div>
                    </Field>

                    {/* Ano + Placa */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Ano">
                        <Input
                          {...register('year')}
                          type="number"
                          placeholder="Ex: 2019"
                          inputMode="numeric"
                          error={errors.year?.message}
                        />
                      </Field>
                      <Field label="Placa">
                        <Input
                          {...register('plate')}
                          placeholder="Ex: ABC-1234"
                          autoCapitalize="characters"
                        />
                      </Field>
                    </div>

                    {/* Quilometragem atual */}
                    <Field label={`Quilometragem atual${!isEditMode ? ' *' : ''}`}>
                      <div className="relative">
                        <Input
                          {...register('odometer_initial')}
                          type="number"
                          placeholder="Ex: 48500"
                          inputMode="numeric"
                          error={errors.odometer_initial?.message}
                          className="font-mono pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none font-bold" style={{ color: 'rgba(13,13,13,0.4)' }}>
                          km
                        </span>
                      </div>
                    </Field>

                    {/* Capacidade do tanque */}
                    <Field label="Capacidade do tanque (opcional)">
                      <div className="relative">
                        <Input
                          {...register('tank_capacity_liters')}
                          type="number"
                          step="0.1"
                          placeholder="Ex: 45"
                          inputMode="decimal"
                          error={errors.tank_capacity_liters?.message}
                          className="font-mono pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none font-bold" style={{ color: 'rgba(13,13,13,0.4)' }}>
                          litros
                        </span>
                      </div>
                    </Field>

                    {/* Combustível padrão */}
                    <Field label="Combustível padrão">
                      <div className="grid grid-cols-3 gap-2">
                        {(() => {
                          const { ref, ...rest } = register('fuel_type');
                          return FUEL_TYPES.map((ft) => (
                            <label key={ft} className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                value={ft}
                                ref={ref}
                                {...rest}
                                className="sr-only peer"
                              />
                              <span className="w-full text-center py-2 text-[13px] font-bold border-2 border-[#0D0D0D] rounded-[32px] cursor-pointer transition-all active:scale-95"
                                style={{
                                  backgroundColor: watch('fuel_type') === ft ? '#F5D000' : 'transparent',
                                  color: '#0D0D0D',
                                  boxShadow: watch('fuel_type') === ft ? '3px 3px 0px #0D0D0D' : 'none',
                                }}
                              >
                                {FUEL_LABELS[ft]}
                              </span>
                            </label>
                          ));
                        })()}
                      </div>
                    </Field>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full mt-2 py-4 rounded-[var(--radius-xl)] flex items-center justify-center font-bold uppercase tracking-[0.1em] border-2 border-[#0D0D0D] disabled:opacity-50 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                      style={{
                        backgroundColor: '#F5D000',
                        color: '#1A1816',
                        fontSize: 14,
                        boxShadow: '4px 4px 0px #0D0D0D',
                      }}
                    >
                      {saving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Adicionar veículo'}
                    </button>

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="py-3 mt-1 flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-wider transition-opacity active:opacity-70"
                        style={{ color: '#CC0000' }}
                      >
                        <Trash2 size={16} />
                        Excluir veículo
                      </button>
                    )}
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
