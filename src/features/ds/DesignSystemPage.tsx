import { useEffect, useState, type ReactNode } from 'react';
import { Car, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/EmptyState';
import { Money } from '@/components/Money';
import { PageHeader } from '@/components/PageHeader';
import { HeroNumber } from '@/components/identity/HeroNumber';
import { Odometer } from '@/components/identity/Odometer';
import { Gauge } from '@/components/identity/Gauge';
import { ScaleRule } from '@/components/identity/ScaleRule';
import { GaugeSpinner } from '@/components/identity/GaugeSpinner';
import { HUDToast } from '@/components/identity/HUDToast';
import { TimelineDot } from '@/components/identity/TimelineDot';
import { NumberPad } from '@/components/identity/NumberPad';
import { KeyChip } from '@/components/identity/KeyChip';
import { haptic } from '@/lib/haptics';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.18em] text-faint font-semibold mb-3 px-5">
        {title}
      </p>
      <div className="px-5 flex flex-col gap-3">{children}</div>
    </section>
  );
}

const PALETTE: Array<[string, string]> = [
  ['#07070A', 'BG'],
  ['#0E0E12', 'Surface'],
  ['#16161C', 'Surface-2'],
  ['#1C1C24', 'Surface-elev'],
  ['#21212A', 'Border'],
  ['#F2EDE4', 'Text'],
  ['#9E9890', 'Muted'],
  ['#5A5650', 'Faint'],
  ['#E8A85C', 'Accent'],
  ['#5C7A9E', 'Graphite'],
  ['#7CB987', 'Positive'],
  ['#C85B5B', 'Danger'],
];

export function DesignSystemPage() {
  const [sw1, setSw1] = useState(false);
  const [sw2, setSw2] = useState(true);
  const { toast } = useToast();

  return (
    <div className="min-h-dvh bg-bg pb-[calc(env(safe-area-inset-bottom,0px)+64px+80px)]">
      <PageHeader title="Design System" subtitle="Tanque Cheio · v1.7" chip="rc" />

      {/* === v1.5 — Telemetria Íntima === */}
      <V15Showcase />

      {/* Palette */}
      <Section title="Paleta — Painel Noturno v2">
        <div className="grid grid-cols-4 gap-2">
          {PALETTE.map(([color, name]) => (
            <div key={color} className="flex flex-col items-center gap-1.5">
              <div
                className="w-full aspect-square rounded-xl border border-border"
                style={{ background: color }}
              />
              <span className="text-[10px] text-faint text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Tipografia">
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3">
          <p className="font-display text-4xl font-semibold text-text leading-tight">
            Bodoni Moda
          </p>
          <p className="font-display text-4xl text-accent leading-tight">1.234,56</p>
          <p className="text-base text-muted mt-3">Jost Variable — Interface</p>
          <p className="text-xs text-faint mt-1 tracking-[0.18em] uppercase">
            legenda · metadata · labels
          </p>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Botões">
        <Button variant="primary">
          <Fuel size={18} /> Registrar Abastecimento
        </Button>
        <Button variant="outline">Cancelar</Button>
        <Button variant="ghost">Ver histórico completo →</Button>
        <Button variant="danger">Excluir registro</Button>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm">Pequeno</Button>
          <Button size="icon" aria-label="Combustível">
            <Fuel size={18} />
          </Button>
          <Button size="lg">Grande</Button>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <Input label="Quilometragem" placeholder="Ex: 45.000 km" type="text" inputMode="numeric" />
        <Input
          label="Valor total"
          placeholder="R$ 0,00"
          error="Este campo é obrigatório"
        />
        <Input
          label="Observação"
          placeholder="Combustível adulterado, etc."
          hint="Máximo 200 caracteres"
        />
      </Section>

      {/* Money */}
      <Section title="Money — Bodoni Moda numerals">
        <div className="flex flex-wrap gap-4 items-end">
          <Money value={12345.67} size="xl" />
          <Money value={-89.9} size="lg" colorBySign />
          <Money value={320.0} size="md" colorBySign />
          <Money value={12.5} size="sm" />
        </div>
      </Section>

      {/* Toasts */}
      <Section title="Toasts">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toast('Abastecimento salvo com sucesso!', 'success')}>
            Sucesso
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast('Revisão preventiva se aproximando', 'warning')}
          >
            Aviso
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => toast('Erro ao salvar. Tente novamente.', 'error')}
          >
            Erro
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast('Sincronizando dados...', 'info')}
          >
            Info
          </Button>
        </div>
      </Section>

      {/* Switch */}
      <Section title="Switch">
        <div className="flex flex-col gap-4">
          <Switch
            checked={sw1}
            onCheckedChange={setSw1}
            label="Receber notificações de revisão"
          />
          <Switch
            checked={sw2}
            onCheckedChange={setSw2}
            label="Sincronização automática"
          />
          <Switch
            checked={false}
            onCheckedChange={() => undefined}
            label="Modo claro (desabilitado)"
            disabled
          />
        </div>
      </Section>

      {/* Empty State */}
      <Section title="Empty State">
        <EmptyState
          icon={<Car size={48} />}
          title="Nenhum veículo cadastrado"
          description="Adicione seu primeiro veículo para começar a registrar abastecimentos e manutenções."
          action={{
            label: '+ Adicionar veículo',
            onClick: () => toast('Abrindo cadastro de veículo...', 'info'),
          }}
        />
      </Section>
    </div>
  );
}

// === Showcase v1.5 — Telemetria Íntima ===
function V15Showcase() {
  const [hero, setHero] = useState(1847);
  const [km, setKm] = useState(48291);
  const [consumo, setConsumo] = useState(11.3);
  const [hudOpen, setHudOpen] = useState(false);
  const [hudVariant, setHudVariant] = useState<'success' | 'warning' | 'error' | 'info'>('success');
  const [hudMsg, setHudMsg] = useState('Abastecimento salvo');
  const [padValue, setPadValue] = useState('');

  useEffect(() => {
    const id = setInterval(() => setKm((v) => v + Math.floor(Math.random() * 23) + 1), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative mb-10 pb-8 border-b border-border">
      <div className="px-5 mb-4">
        <p className="text-instrument-label">v1.5 · Telemetria Íntima</p>
        <p className="text-editorial mt-1" style={{ fontSize: 22 }}>
          Componentes-assinatura
        </p>
      </div>

      {/* HeroNumber + halo */}
      <div className="px-5 mb-2">
        <p className="text-instrument-label mb-3">Hero number · halo âmbar</p>
        <div className="bg-bg-deep rounded-xl py-8 flex justify-center">
          <HeroNumber halo="strong" unit="R$" ariaLabel={`R$ ${hero},00`}>
            {hero.toLocaleString('pt-BR')}
          </HeroNumber>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => { haptic('tap'); setHero((v) => Math.max(0, v - 250)); }}>
            − R$ 250
          </Button>
          <Button size="sm" onClick={() => { haptic('success'); setHero((v) => v + 250); }}>
            + R$ 250
          </Button>
        </div>
      </div>

      {/* Odometer mecânico */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">Odômetro mecânico · JetBrains Mono tabular</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col items-center gap-4">
          <div style={{ fontSize: 28 }}>
            <Odometer value={km} digits={6} />
          </div>
          <div style={{ fontSize: 18 }}>
            <Odometer value={km} digits={6} unitLabel="km" />
          </div>
          <Button size="sm" variant="outline" onClick={() => { haptic('tap'); setKm((v) => v + 137); }}>
            + 137 km
          </Button>
          <p className="text-faint text-xs">Auto-incrementa a cada 4s</p>
        </div>
      </div>

      {/* Gauge — agulha física */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">Gauge · agulha spring 240°</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col items-center gap-4">
          <Gauge
            value={consumo}
            min={6}
            max={18}
            label={`${consumo.toFixed(1)} km/L`}
            size={240}
            positiveThreshold={0.5}
          />
          <input
            type="range"
            min={6}
            max={18}
            step={0.1}
            value={consumo}
            onChange={(e) => setConsumo(Number.parseFloat(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--accent)' }}
            aria-label="Ajustar consumo"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { haptic('warning'); setConsumo(7.2); }}>
              Pior (7.2)
            </Button>
            <Button size="sm" variant="outline" onClick={() => { haptic('tap'); setConsumo(11.3); }}>
              Médio
            </Button>
            <Button size="sm" onClick={() => { haptic('success'); setConsumo(16.8); }}>
              Melhor (16.8)
            </Button>
          </div>
        </div>
      </div>

      {/* Tipografia v1.5 */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">Tipografia · regras estritas</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3">
          <div>
            <p className="text-instrument-label">Bodoni opsz 96 · peso 500</p>
            <p className="text-hero" style={{ fontSize: 64 }}>1.847</p>
          </div>
          <div className="border-t border-border-soft pt-3">
            <p className="text-instrument-label">Editorial · Bodoni 300</p>
            <p className="text-editorial" style={{ fontSize: 32 }}>Garagem</p>
          </div>
          <div className="border-t border-border-soft pt-3">
            <p className="text-instrument-label">Mecânica · JetBrains Mono</p>
            <p className="text-mech text-text" style={{ fontSize: 18 }}>BRA-2E19 · 48.291 km</p>
          </div>
          <div className="border-t border-border-soft pt-3">
            <p className="text-instrument-label">Label de instrumento</p>
            <p className="text-instrument-label">GASTO DO MÊS · 16 ABR</p>
          </div>
        </div>
      </div>

      {/* ScaleRule */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">ScaleRule · régua de KPIs</p>
        <div className="bg-surface rounded-xl border border-border">
          <ScaleRule
            items={[
              { label: 'Combustível', value: 'R$ 1.842' },
              { label: 'Manutenção', value: 'R$ 480', highlighted: true },
              { label: 'Custo / km', value: 'R$ 0,42' },
            ]}
          />
        </div>
        <p className="text-faint text-xs mt-2">
          O destaque (tick âmbar no topo) marca o item que exige atenção agora.
        </p>
      </div>

      {/* KeyChip */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">KeyChip · header do veículo</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3 items-start">
          <KeyChip
            nickname="Civic"
            odometer={km}
            onClick={() => haptic('tap')}
          />
          <KeyChip
            nickname="Tracker"
            odometer={92450}
            onClick={() => haptic('tap')}
          />
          <p className="text-faint text-xs">Toque dispara haptic.tap. Carrossel é wired pelo container que o consome.</p>
        </div>
      </div>

      {/* TimelineDot */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">TimelineDot · status de manutenção</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3">
          <Row dot={<TimelineDot status="overdue" />} label="Troca de óleo" hint="Venceu há 12 dias" />
          <Row dot={<TimelineDot status="soon" />} label="Filtro de ar" hint="Vence em 8 dias" />
          <Row dot={<TimelineDot status="ok" />} label="Pneus" hint="Em dia · próx. 24/12" />
        </div>
      </div>

      {/* GaugeSpinner */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">GaugeSpinner · loading com agulha</p>
        <div className="bg-surface rounded-xl border border-border p-5 flex items-center gap-6">
          <GaugeSpinner size={32} label="Sincronizando" />
          <GaugeSpinner size={48} label="Carregando" />
          <GaugeSpinner size={72} label="Buscando" />
          <span className="text-faint text-xs">Substitui todos os <code className="text-mech">animate-spin</code>.</span>
        </div>
      </div>

      {/* HUDToast */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">HUDToast · notificação no HUD</p>
        <div className="bg-surface rounded-xl border border-border p-5 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={() => {
              haptic('success');
              setHudVariant('success');
              setHudMsg('Abastecimento salvo');
              setHudOpen(true);
            }}
          >
            success
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              haptic('warning');
              setHudVariant('warning');
              setHudMsg('Manutenção em 8 dias');
              setHudOpen(true);
            }}
          >
            warning
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              haptic('error');
              setHudVariant('error');
              setHudMsg('Falha ao sincronizar');
              setHudOpen(true);
            }}
          >
            error
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setHudVariant('info');
              setHudMsg('Sincronizando…');
              setHudOpen(true);
            }}
          >
            info
          </Button>
          <p className="col-span-2 text-faint text-xs">Sem fundo. Glow âmbar via text-shadow. Swipe-up dispensa.</p>
        </div>
        <HUDToast
          open={hudOpen}
          message={hudMsg}
          variant={hudVariant}
          onDismiss={() => setHudOpen(false)}
        />
      </div>

      {/* NumberPad */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">NumberPad · pad com long-press</p>
        <div className="bg-surface rounded-xl border border-border p-4">
          <NumberPad
            value={padValue}
            onChange={setPadValue}
            onConfirm={() => {
              setHudVariant('success');
              setHudMsg(`Confirmado: R$ ${padValue || '0'}`);
              setHudOpen(true);
              setPadValue('');
            }}
            decimal
            prefix="R$"
            confirmLabel="Registrar"
          />
          <p className="text-faint text-xs mt-3">
            Segure o botão "Registrar" 250ms (gatilho de bomba). Confirma com vibração de sucesso.
          </p>
        </div>
      </div>

      {/* Háptica */}
      <div className="px-5 mt-8">
        <p className="text-instrument-label mb-3">Háptica · vocabulário</p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => haptic('tap')}>tap</Button>
          <Button size="sm" variant="outline" onClick={() => haptic('success')}>success</Button>
          <Button size="sm" variant="outline" onClick={() => haptic('warning')}>warning</Button>
          <Button size="sm" variant="outline" onClick={() => haptic('error')}>error</Button>
          <Button size="sm" variant="outline" className="col-span-2" onClick={() => haptic('ignition')}>
            ignition
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({ dot, label, hint }: { dot: ReactNode; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3">
      {dot}
      <div className="flex-1 min-w-0">
        <p className="text-text text-sm">{label}</p>
        <p className="text-faint text-xs">{hint}</p>
      </div>
    </div>
  );
}
