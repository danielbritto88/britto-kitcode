import { useMemo, useState } from 'react';
import { Filter, FileDown, MessageCircle, FileText } from 'lucide-react';
import { subMonths, format, startOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useVehicles } from '@/context/VehicleContext';
import { useFuel } from '@/context/FuelContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabBarBrutal } from '@/components/BottomTabBarBrutal';
import { HeaderControls } from '@/components/HeaderControls';
import { ScaleRule } from '@/components/identity/ScaleRule';
import { Gauge } from '@/components/identity/Gauge';
import { FillMeter } from '@/components/identity/FillMeter';
import { HeroNumber } from '@/components/identity/HeroNumber';
import { ChartScroll } from '@/components/identity/EmptyArt';
import { Money } from '@/components/Money';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { FUEL_LABELS, type FuelType } from '@/types/vehicle';
import { MAINTENANCE_LABELS } from '@/types/maintenance';
import type { FuelLog } from '@/types/fuel';
import type { MaintenanceLog } from '@/types/maintenance';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'month' | '3months' | 'year' | 'all';

interface KmlEntry {
  date: string;
  kml: number;
  km: number;
  fuel_type: FuelType | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Mês',
  '3months': '3 meses',
  year: 'Ano',
  all: 'Tudo',
};

const PERIOD_LABELS_FULL: Record<Period, string> = {
  month: 'Último mês',
  '3months': 'Últimos 3 meses',
  year: 'Último ano',
  all: 'Todo o período',
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function periodStart(p: Period): string {
  const today = new Date();
  if (p === 'month') return format(startOfMonth(today), 'yyyy-MM-dd');
  if (p === '3months') return format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd');
  if (p === 'year') return format(startOfYear(today), 'yyyy-MM-dd');
  return '2000-01-01';
}

function computeKmlEntries(logs: FuelLog[]): KmlEntry[] {
  const byVehicle = new Map<string, FuelLog[]>();
  for (const log of logs) {
    if (!byVehicle.has(log.vehicle_id)) byVehicle.set(log.vehicle_id, []);
    byVehicle.get(log.vehicle_id)!.push(log);
  }

  const result: KmlEntry[] = [];
  for (const [, vLogs] of byVehicle) {
    const sorted = [...vLogs].sort((a, b) => a.odometer - b.odometer);
    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i]!;
      const prev = sorted[i - 1]!;
      if (curr.full_tank && curr.odometer > prev.odometer && curr.liters > 0) {
        const km = curr.odometer - prev.odometer;
        const kml = km / curr.liters;
        if (kml > 1 && kml < 50) {
          result.push({ date: curr.date, kml, km, fuel_type: curr.fuel_type });
        }
      }
    }
  }
  return result;
}

function monthlyAvgChart(entries: KmlEntry[]): { month: string; label: string; kml: number }[] {
  const byMonth = new Map<string, number[]>();
  for (const e of entries) {
    const m = e.date.slice(0, 7);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(e.kml);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, kmls]) => {
      const [y, mo] = month.split('-');
      const label = format(new Date(Number(y), Number(mo) - 1, 1), 'MMM', { locale: ptBR });
      return {
        month,
        label,
        kml: Math.round((kmls.reduce((s, k) => s + k, 0) / kmls.length) * 10) / 10,
      };
    });
}

function buildCSV(fuelLogs: FuelLog[], maintenanceLogs: MaintenanceLog[]): string {
  const csvField = (v: string | number | null | undefined): string => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows: string[] = [];
  rows.push('Tipo,Data,Hodômetro,Litros,Valor Total,R$/Litro,Combustível,Tanque Cheio');
  for (const l of [...fuelLogs].sort((a, b) => b.date.localeCompare(a.date))) {
    rows.push(
      [
        'Abastecimento',
        l.date,
        l.odometer,
        l.liters.toFixed(3),
        l.total_cost.toFixed(2),
        l.price_per_liter.toFixed(3),
        l.fuel_type ? FUEL_LABELS[l.fuel_type] : '',
        l.full_tank ? 'Sim' : 'Não',
      ].map(csvField).join(','),
    );
  }
  if (maintenanceLogs.length > 0) {
    rows.push('');
    rows.push('Tipo,Data,Hodômetro,Custo,Serviço,Oficina');
    for (const l of [...maintenanceLogs].sort((a, b) => b.date.localeCompare(a.date))) {
      rows.push(
        [
          'Manutenção',
          l.date,
          l.odometer ?? '',
          l.cost?.toFixed(2) ?? '',
          MAINTENANCE_LABELS[l.type],
          l.shop ?? '',
        ].map(csvField).join(','),
      );
    }
  }
  return rows.join('\n');
}

async function exportPDF(
  fuelLogs: FuelLog[],
  maintenanceLogs: MaintenanceLog[],
  totalFuelCost: number,
  totalMaintenanceCost: number,
  vehicleName: string,
  period: Period,
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(7, 7, 10);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(232, 168, 92);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TANQUE CHEIO', 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(158, 152, 144);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório · ${vehicleName} · ${PERIOD_LABELS_FULL[period]}`, 14, 22);
  doc.text(`Gerado em ${format(new Date(), "d 'de' MMMM yyyy", { locale: ptBR })}`, 14, 29);

  let y = 44;

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [['Categoria', 'Valor']],
    body: [
      ['Combustível', `R$ ${totalFuelCost.toFixed(2)}`],
      ['Manutenção', `R$ ${totalMaintenanceCost.toFixed(2)}`],
      ['Total', `R$ ${(totalFuelCost + totalMaintenanceCost).toFixed(2)}`],
    ],
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error lastAutoTable is set by jsPDF-AutoTable at runtime
  y = doc.lastAutoTable.finalY + 12;

  if (fuelLogs.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('Abastecimentos', 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [['Data', 'Km', 'Litros', 'R$/L', 'Total', 'Tipo']],
      body: [...fuelLogs]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((l) => [
          l.date,
          l.odometer.toLocaleString('pt-BR'),
          l.liters.toFixed(3),
          `R$ ${l.price_per_liter.toFixed(3)}`,
          `R$ ${l.total_cost.toFixed(2)}`,
          l.fuel_type ? FUEL_LABELS[l.fuel_type] : '—',
        ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error lastAutoTable is set by jsPDF-AutoTable at runtime
    y = doc.lastAutoTable.finalY + 12;
  }

  if (maintenanceLogs.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('Manutenções', 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [['Data', 'Tipo', 'Km', 'Custo', 'Oficina']],
      body: [...maintenanceLogs]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((l) => [
          l.date,
          MAINTENANCE_LABELS[l.type],
          l.odometer?.toLocaleString('pt-BR') ?? '—',
          l.cost ? `R$ ${l.cost.toFixed(2)}` : '—',
          l.shop ?? '—',
        ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`tanque-cheio-${period}.pdf`);
}

function buildShareText(
  totalFuelCost: number,
  totalMaintenanceCost: number,
  avgKml: number | null,
  vehicleName: string,
  period: Period,
): string {
  const lines = [
    `*Tanque Cheio — ${vehicleName}*`,
    `Período: ${PERIOD_LABELS_FULL[period]}`,
    '',
    `⛽ Combustível: R$ ${totalFuelCost.toFixed(2)}`,
    `🔧 Manutenção: R$ ${totalMaintenanceCost.toFixed(2)}`,
    `💰 Total: R$ ${(totalFuelCost + totalMaintenanceCost).toFixed(2)}`,
  ];
  if (avgKml != null) lines.push(`📊 Média: ${avgKml.toFixed(1)} km/L`);
  return lines.join('\n');
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportsPage() {
  const { activeVehicles, selectedVehicle, isAllSelected } = useVehicles();
  const { fuelLogs } = useFuel();
  const { maintenanceLogs } = useMaintenance();
  const { toast } = useToast();

  const [period, setPeriod] = useState<Period>('3months');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelType | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const vehicleIds = useMemo(() => {
    if (isAllSelected) return activeVehicles.map((v) => v.id);
    if (selectedVehicle) return [selectedVehicle.id];
    return [];
  }, [isAllSelected, activeVehicles, selectedVehicle]);

  const vehicleName = isAllSelected || !selectedVehicle ? 'Todos os veículos' : selectedVehicle.name;

  const start = useMemo(() => periodStart(period), [period]);
  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredFuelLogs = useMemo(
    () =>
      fuelLogs.filter(
        (l) =>
          !l.archived_at &&
          vehicleIds.includes(l.vehicle_id) &&
          l.date >= start &&
          l.date <= today &&
          (fuelTypeFilter === 'all' || l.fuel_type === fuelTypeFilter),
      ),
    [fuelLogs, vehicleIds, start, today, fuelTypeFilter],
  );

  const filteredMaintenanceLogs = useMemo(
    () =>
      maintenanceLogs.filter(
        (l) =>
          !l.archived_at &&
          vehicleIds.includes(l.vehicle_id) &&
          l.date >= start &&
          l.date <= today,
      ),
    [maintenanceLogs, vehicleIds, start, today],
  );

  // kml computed from all vehicle logs (need previous entry regardless of period)
  const allVehicleFuelLogs = useMemo(
    () => fuelLogs.filter((l) => !l.archived_at && vehicleIds.includes(l.vehicle_id)),
    [fuelLogs, vehicleIds],
  );

  const allKmlEntries = useMemo(() => computeKmlEntries(allVehicleFuelLogs), [allVehicleFuelLogs]);

  const filteredKmlEntries = useMemo(
    () =>
      allKmlEntries.filter(
        (e) =>
          e.date >= start &&
          e.date <= today &&
          (fuelTypeFilter === 'all' || e.fuel_type === fuelTypeFilter),
      ),
    [allKmlEntries, start, today, fuelTypeFilter],
  );

  const chartData = useMemo(() => monthlyAvgChart(filteredKmlEntries), [filteredKmlEntries]);

  const totalFuelCost = filteredFuelLogs.reduce((s, l) => s + l.total_cost, 0);
  const totalMaintenanceCost = filteredMaintenanceLogs.reduce((s, l) => s + (l.cost ?? 0), 0);
  const totalCost = totalFuelCost + totalMaintenanceCost;
  const totalKm = filteredKmlEntries.reduce((s, e) => s + e.km, 0);

  const avgKml =
    filteredKmlEntries.length > 0
      ? filteredKmlEntries.reduce((s, e) => s + e.kml, 0) / filteredKmlEntries.length
      : null;

  const costPerKm =
    totalKm > 0 && totalFuelCost > 0 ? totalFuelCost / totalKm : null;

  const kmlByType = useMemo(() => {
    const m = new Map<string, { sum: number; count: number }>();
    for (const e of filteredKmlEntries) {
      const k = e.fuel_type ?? 'gasoline';
      const prev = m.get(k) ?? { sum: 0, count: 0 };
      m.set(k, { sum: prev.sum + e.kml, count: prev.count + 1 });
    }
    return [...m.entries()]
      .map(([type, { sum, count }]) => ({
        type: type as FuelType,
        avg: Math.round((sum / count) * 10) / 10,
        count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredKmlEntries]);

  const availableFuelTypes = useMemo(() => {
    const types = new Set<FuelType>();
    for (const l of fuelLogs) {
       if (!l.archived_at && vehicleIds.includes(l.vehicle_id) && l.date >= start && l.date <= today && l.fuel_type) {
         types.add(l.fuel_type);
       }
    }
    return Array.from(types);
  }, [fuelLogs, vehicleIds, start, today]);

  const maintenanceByType = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of filteredMaintenanceLogs) {
      const type = l.type;
      const cost = l.cost ?? 0;
      m.set(type, (m.get(type) ?? 0) + cost);
    }
    return [...m.entries()]
      .map(([type, cost]) => ({
        type,
        cost,
      }))
      .filter(x => x.cost > 0)
      .sort((a, b) => b.cost - a.cost);
  }, [filteredMaintenanceLogs]);

  const hasData =
    filteredFuelLogs.length > 0 || filteredMaintenanceLogs.length > 0;

  // ─── Export handlers ───────────────────────────────────────────────────────

  function handleCSV() {
    haptic('tap');
    const csv = buildCSV(filteredFuelLogs, filteredMaintenanceLogs);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tanque-cheio-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exportado!', 'success');
  }

  async function handlePDF() {
    haptic('tap');
    try {
      await exportPDF(
        filteredFuelLogs,
        filteredMaintenanceLogs,
        totalFuelCost,
        totalMaintenanceCost,
        vehicleName,
        period,
      );
      toast('PDF exportado!', 'success');
    } catch {
      toast('Erro ao gerar PDF.', 'error');
    }
  }

  async function handleWhatsApp() {
    haptic('tap');
    const text = buildShareText(
      totalFuelCost,
      totalMaintenanceCost,
      avgKml,
      vehicleName,
      period,
    );
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled or unsupported — silently ignore
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-transparent flex flex-col">
      <PageHeader title="Relatórios" action={<HeaderControls />} />

      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
        {/* Period pills + filter button */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b-2 border-[var(--border)] border-opacity-10">
          <div className="flex-1 flex gap-1.5 flex-wrap">
            {(['month', '3months', 'year', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  haptic('tap');
                  setPeriod(p);
                }}
                className={[
                  'px-3 py-1.5 rounded-full uppercase tracking-[0.1em] text-[10px] font-bold border-2 transition-colors',
                  period === p
                    ? 'bg-[var(--accent)] text-[#1A1816] border-[var(--accent)] shadow-[var(--shadow-brutal-xs)] translate-y-[-1px]'
                    : 'bg-transparent text-[rgba(13,13,13,0.6)] border-[var(--border)]',
                ].join(' ')}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              haptic('tap');
              setFilterOpen(true);
            }}
            className={[
              'p-2 transition-colors',
              fuelTypeFilter !== 'all' ? 'text-accent' : 'text-muted active:text-accent',
            ].join(' ')}
            aria-label="Filtros avançados"
          >
            <Filter size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Active fuel type filter badge */}
        {fuelTypeFilter !== 'all' && (
          <div className="px-4 pt-3">
            <button
              onClick={() => {
                haptic('tap');
                setFuelTypeFilter('all');
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-[#0D0D0D] text-[10px] uppercase tracking-[0.1em] font-bold rounded-full border-2 border-[#0D0D0D]"
              style={{ backgroundColor: 'rgba(245,208,0,0.3)' }}
            >
              <span>{FUEL_LABELS[fuelTypeFilter]}</span>
              <span className="text-[var(--accent)] opacity-60">✕</span>
            </button>
          </div>
        )}

        {vehicleIds.length === 0 ? (
          <EmptyMessage
            title="Nenhum veículo selecionado"
            hint="Selecione um veículo no header para ver os relatórios."
          />
        ) : !hasData ? (
          <EmptyMessage
            title="Sem dados neste período"
            hint="Registre abastecimentos ou manutenções para ver relatórios."
          />
        ) : (
          <div>
            {/* ── Resumo Geral (HeroNumber) ── */}
            <div className="pt-6 pb-2">
              <HeroNumber
                ariaLabel={`Total gasto no período: R$ ${totalCost.toFixed(2)}`}
                halo
              >
                R$ {totalCost.toFixed(2).replace('.', ',')}
              </HeroNumber>
              <p className="text-center uppercase tracking-[0.14em] text-[10px] font-bold text-[rgba(13,13,13,0.7)] mt-1">
                Gasto Total • {PERIOD_LABELS[period]}
              </p>
            </div>

            {/* ── Consumo ── */}
            {filteredKmlEntries.length > 0 && (
              <section className="pt-5 px-4">
                <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Consumo</p>

                <div className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] overflow-hidden">
                  <ScaleRule
                    items={[
                      {
                        label: 'Média km/L',
                        value: avgKml != null ? avgKml.toFixed(1) : '—',
                        highlighted: avgKml != null,
                        ariaLabel: `Média de consumo: ${avgKml?.toFixed(1) ?? 'sem dados'} km/L`,
                      },
                      {
                        label: 'Custo/km',
                        value:
                          costPerKm != null
                            ? `R$ ${costPerKm.toFixed(2)}`
                            : '—',
                      },
                      {
                        label: 'km rodados',
                        value:
                          totalKm > 0
                            ? totalKm.toLocaleString('pt-BR')
                            : '—',
                      },
                    ]}
                  />

                  {/* Spark line */}
                  {chartData.length >= 2 && (
                    <div className="px-4 pt-4 pb-4 border-t-2 border-[var(--border)] border-opacity-10">
                      <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Evolução km/L</p>
                      <KmlSparkLine data={chartData} />
                    </div>
                  )}
                </div>

                {/* Breakdown by fuel type */}
                {kmlByType.length > 1 && (
                  <div className="mt-4 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] p-4">
                    <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Por combustível</p>
                    <div className="flex flex-col gap-2.5">
                      {kmlByType.map(({ type, avg, count }, idx) => (
                        <div key={type} className={cn("flex items-center justify-between", idx > 0 && "pt-2.5 border-t-2 border-[var(--border)] border-opacity-10")}>
                          <span className="font-bold text-[14px] text-[#0D0D0D]">
                            {FUEL_LABELS[type]}
                            <span className="text-[rgba(13,13,13,0.5)] text-xs ml-1.5">· {count}×</span>
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[#0D0D0D]">
                            {avg.toFixed(1)} km/L
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── Financeiro ── */}
            <section className="pt-8 px-4">
              <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Financeiro</p>

              <div className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] overflow-hidden">
                <ScaleRule
                  items={[
                    {
                      label: 'Combustível',
                      value: <Money value={totalFuelCost} size="sm" />,
                      highlighted: totalFuelCost > 0,
                    },
                    {
                      label: 'Manutenção',
                      value: <Money value={totalMaintenanceCost} size="sm" />,
                    },
                    {
                      label: 'Total',
                      value: <Money value={totalCost} size="sm" />,
                    },
                  ]}
                />

                {/* Distribution — Fuel gauge + Maintenance dipstick */}
                {totalCost > 0 && (
                  <div className="flex items-center justify-around px-4 py-5 border-t-2 border-[var(--border)] border-opacity-10">
                    {(() => {
                      const fuelPct = Math.round((totalFuelCost / totalCost) * 100);
                      const maintPct = Math.round((totalMaintenanceCost / totalCost) * 100);
                      return (
                        <>
                          <div className="flex flex-col items-center gap-2">
                            <Gauge
                              value={fuelPct}
                              max={100}
                              label=""
                              size={96}
                              dangerThreshold={1}
                              positiveThreshold={0}
                              aria-label={`Combustível representa ${fuelPct}% do total`}
                            />
                            <p className="font-display text-[24px] leading-none" style={{ color: 'var(--accent)' }}>
                              {fuelPct}%
                            </p>
                            <p className="text-instrument-label">Combustível</p>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <FillMeter
                              value={maintPct}
                              max={100}
                              label=""
                              size={96}
                            />
                            <p className="font-display text-[24px] leading-none" style={{ color: '#3D3520' }}>
                              {maintPct}%
                            </p>
                            <p className="text-instrument-label">Manutenção</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Breakdown by maintenance type */}
              {maintenanceByType.length > 0 && (
                <div className="mt-4 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] p-4">
                  <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Por serviço</p>
                  <div className="flex flex-col gap-2.5">
                    {maintenanceByType.map(({ type, cost }, idx) => (
                      <div key={type} className={cn("flex items-center justify-between", idx > 0 && "pt-2.5 border-t-2 border-[var(--border)] border-opacity-10")}>
                        <span className="font-bold text-[14px] text-[#0D0D0D]">
                          {MAINTENANCE_LABELS[type as keyof typeof MAINTENANCE_LABELS]}
                        </span>
                        <span className="font-mono text-[13px] font-bold text-[#0D0D0D]">
                          R$ {cost.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Exportar ── */}
            <section className="pt-8 px-4 pb-6">
              <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Exportar</p>
              <div className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-brutal-sm)] p-2">
                <div className="flex flex-col gap-1">
                  <ExportButton
                    icon={<FileText size={18} strokeWidth={1.75} />}
                    label="Exportar CSV"
                    hint="Dados brutos filtrados"
                    onClick={handleCSV}
                  />
                  <ExportButton
                    icon={<FileDown size={18} strokeWidth={1.75} />}
                    label="Exportar PDF"
                    hint="Relatório formatado Tanque Cheio"
                    onClick={() => void handlePDF()}
                  />
                  <ExportButton
                    icon={<MessageCircle size={18} strokeWidth={1.75} />}
                    label="Compartilhar via WhatsApp"
                    hint="Resumo em texto"
                    onClick={() => void handleWhatsApp()}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <BottomTabBarBrutal />

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fuelTypeFilter={fuelTypeFilter}
        onFuelTypeChange={setFuelTypeFilter}
        availableFuelTypes={availableFuelTypes}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyMessage({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <ChartScroll size={80} />
      <p className="font-bold text-sm tracking-[0.14em] uppercase" style={{ color: 'rgba(13,13,13,0.7)' }}>{title}</p>
      <p className="text-xs font-medium" style={{ color: 'rgba(13,13,13,0.5)' }}>{hint}</p>
    </div>
  );
}

function ExportButton({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => {
        haptic('tap');
        onClick();
      }}
      className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--surface)] active:border-[var(--accent)] shadow-[var(--shadow-brutal-xs)] active:translate-x-[2px] active:translate-y-[2px] transition-all text-left w-full"
      style={{ background: 'transparent' }}
    >
      <span className="text-muted shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#0D0D0D]">{label}</p>
        <p className="text-xs text-[rgba(13,13,13,0.6)] font-medium uppercase tracking-widest mt-0.5">{hint}</p>
      </div>
    </button>
  );
}

function KmlSparkLine({ data }: { data: { month: string; label: string; kml: number }[] }) {
  if (data.length < 2) return null;

  const W = 300;
  const H = 96;
  const PAD = { top: 8, right: 8, bottom: 22, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minKml = Math.min(...data.map((d) => d.kml));
  const maxKml = Math.max(...data.map((d) => d.kml));
  const range = maxKml - minKml || 1;

  const px = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const py = (kml: number) => PAD.top + chartH - ((kml - minKml) / range) * chartH;

  const linePts = data.map((d, i) => `${px(i)},${py(d.kml)}`).join(' ');
  const fillPts = `${px(0)},${PAD.top + chartH} ${linePts} ${px(data.length - 1)},${PAD.top + chartH}`;

  // show at most 6 labels to avoid cramping
  const step = Math.ceil(data.length / 6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kml-fill-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* fill under line */}
      <polygon points={fillPts} fill="url(#kml-fill-grad)" />

      {/* baseline */}
      <line
        x1={PAD.left}
        y1={PAD.top + chartH}
        x2={W - PAD.right}
        y2={PAD.top + chartH}
        stroke="#0D0D0D"
        strokeWidth={1}
        strokeOpacity={0.15}
      />

      {/* line */}
      <polyline
        points={linePts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* dots */}
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.kml)} r="3" fill="var(--accent)" />
      ))}

      {/* month labels */}
      {data.map((d, i) =>
        i % step === 0 ? (
          <text
            key={i}
            x={px(i)}
            y={H - 4}
            textAnchor="middle"
            fill="rgba(13,13,13,0.5)"
            fontSize="9"
            fontFamily="Jost Variable, sans-serif"
            fontWeight={600}
          >
            {d.label}
          </text>
        ) : null,
      )}

      {/* Y axis: min and max */}
      <text
        x={PAD.left - 4}
        y={PAD.top + 5}
        textAnchor="end"
        fill="rgba(13,13,13,0.4)"
        fontSize="9"
        fontFamily="JetBrains Mono Variable, monospace"
        fontWeight={700}
      >
        {maxKml.toFixed(1)}
      </text>
      <text
        x={PAD.left - 4}
        y={PAD.top + chartH}
        textAnchor="end"
        fill="rgba(13,13,13,0.4)"
        fontSize="9"
        fontFamily="JetBrains Mono Variable, monospace"
        fontWeight={700}
      >
        {minKml.toFixed(1)}
      </text>
    </svg>
  );
}

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  fuelTypeFilter: FuelType | 'all';
  onFuelTypeChange: (ft: FuelType | 'all') => void;
  availableFuelTypes: FuelType[];
}

function FilterSheet({
  open,
  onClose,
  fuelTypeFilter,
  onFuelTypeChange,
  availableFuelTypes,
}: FilterSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] border-t-[3px] border-x-[3px] border-[#0D0D0D]"
                style={{ backgroundColor: '#F4EFE6', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(13,13,13,0.2)' }} />
                </div>
                <div className="px-5 pb-6">
                  <Dialog.Title className="font-bold leading-tight mb-5" style={{ fontFamily: "'Bodoni Moda Variable', Georgia, serif", fontVariationSettings: "'opsz' 72, 'wght' 700", fontSize: 26, color: '#0D0D0D' }}>
                    Filtros
                  </Dialog.Title>

                  <div className="mb-6">
                    <p className="uppercase tracking-[0.14em] text-[10px] font-bold mb-3" style={{ color: 'rgba(13,13,13,0.7)' }}>Tipo de combustível</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          haptic('tap');
                          onFuelTypeChange('all');
                        }}
                        className={[
                          'px-3 py-1.5 rounded-full uppercase tracking-[0.1em] text-[10px] font-bold border-2 transition-colors',
                          fuelTypeFilter === 'all'
                            ? 'bg-[#F5D000] text-[#1A1816] border-[#0D0D0D] shadow-[var(--shadow-brutal-xs)]'
                            : 'bg-transparent text-[rgba(13,13,13,0.6)] border-[rgba(13,13,13,0.3)]',
                        ].join(' ')}
                      >
                        Todos
                      </button>
                      {availableFuelTypes.length === 0 ? (
                         <span className="text-xs font-medium ml-2" style={{ color: 'rgba(13,13,13,0.4)' }}>Nenhum combustível registrado neste período.</span>
                      ) : (
                        availableFuelTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              haptic('tap');
                              onFuelTypeChange(t);
                            }}
                            className={[
                              'px-3 py-1.5 rounded-full uppercase tracking-[0.1em] text-[10px] font-bold border-2 transition-colors',
                              fuelTypeFilter === t
                                ? 'bg-[#F5D000] text-[#1A1816] border-[#0D0D0D] shadow-[var(--shadow-brutal-xs)]'
                                : 'bg-transparent text-[rgba(13,13,13,0.6)] border-[rgba(13,13,13,0.3)]',
                            ].join(' ')}
                          >
                            {FUEL_LABELS[t]}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      haptic('tap');
                      onClose();
                    }}
                    className="w-full py-4 font-bold uppercase tracking-[0.1em] text-sm border-2 border-[#0D0D0D] active:translate-x-[2px] active:translate-y-[2px]"
                    style={{ backgroundColor: '#F5D000', color: '#1A1816', boxShadow: '4px 4px 0px #0D0D0D', borderRadius: 'var(--radius-xl)' }}
                  >
                    Aplicar
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
