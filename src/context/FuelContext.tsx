/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FuelLog, FuelStats, ChartPoint } from '@/types/fuel';
import {
  buildChartPoints,
  calcStats,
  loadFuelLogs,
  mergeFuelLogs,
  saveFuelLogs,
} from '@/lib/fuel';
import { signedJsonFetch } from '@/lib/signedFetch';
import { loadDeletions, loadVehicles, addDeletion, clearDeletions } from '@/lib/sync';
import { useAuth } from './AuthContext';

interface FuelContextValue {
  fuelLogs: FuelLog[];
  isSyncing: boolean;
  syncError: string | null;
  logsForVehicle: (vehicleId: string) => FuelLog[];
  statsForVehicle: (vehicleId: string) => FuelStats;
  chartForVehicle: (vehicleId: string) => ChartPoint[];
  addFuelLog: (log: FuelLog) => void;
  updateFuelLog: (log: FuelLog) => void;
  deleteFuelLog: (id: string) => void;
  triggerSync: () => void;
}

const POLL_MS = 10_000;

const FuelContext = createContext<FuelContextValue | null>(null);

export function FuelProvider({ children }: { children: ReactNode }) {
  const { signing, isUnlocked } = useAuth();
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(loadFuelLogs);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const latestRef = useRef<FuelLog[]>(fuelLogs);

  useEffect(() => {
    latestRef.current = fuelLogs;
  }, [fuelLogs]);

  const doSync = useCallback(async () => {
    if (!signing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const pendingDeletions = loadDeletions().filter((d) => d.type === 'fuel_log');
      // Filtra fuel_logs órfãos (vehicle_id sem veículo correspondente) para evitar FK violation no D1
      const currentVehicles = loadVehicles();
      const validVehicleIds = new Set(currentVehicles.map((v) => v.id));
      const validFuelLogs = latestRef.current.filter((f) => validVehicleIds.has(f.vehicle_id));
      const data = await signedJsonFetch<{ fuel_logs: FuelLog[] }>(
        signing,
        '/api/sync',
        {
          method: 'POST',
          body: JSON.stringify({ vehicles: currentVehicles, fuel_logs: validFuelLogs, deletions: pendingDeletions }),
        },
      );
      if (pendingDeletions.length > 0) {
        clearDeletions(pendingDeletions);
      }
      const merged = mergeFuelLogs(data.fuel_logs ?? [], latestRef.current);
      saveFuelLogs(merged);
      setFuelLogs(merged);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Erro de sync');
    } finally {
      setIsSyncing(false);
    }
  }, [signing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isUnlocked) void doSync();
  }, [isUnlocked, doSync]);

  useEffect(() => {
    if (!isUnlocked) return;
    const id = setInterval(() => void doSync(), POLL_MS);
    return () => clearInterval(id);
  }, [isUnlocked, doSync]);

  useEffect(() => {
    const handler = () => void doSync();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [doSync]);

  const addFuelLog = useCallback((log: FuelLog) => {
    const next = mergeFuelLogs(latestRef.current, [log]);
    saveFuelLogs(next);
    setFuelLogs(next);
    void doSync();
  }, [doSync]);

  const updateFuelLog = useCallback((log: FuelLog) => {
    const next = latestRef.current.map((l) => (l.id === log.id ? log : l));
    saveFuelLogs(next);
    setFuelLogs(next);
    void doSync();
  }, [doSync]);

  const deleteFuelLog = useCallback((id: string) => {
    const next = latestRef.current.filter((l) => l.id !== id);
    addDeletion('fuel_log', id);
    saveFuelLogs(next);
    setFuelLogs(next);
    void doSync();
  }, [doSync]);

  const logsForVehicle = useCallback((vehicleId: string): FuelLog[] => {
    return fuelLogs.filter((l) => l.vehicle_id === vehicleId);
  }, [fuelLogs]);

  const statsForVehicle = useCallback((vehicleId: string): FuelStats => {
    return calcStats(logsForVehicle(vehicleId));
  }, [logsForVehicle]);

  const chartForVehicle = useCallback((vehicleId: string): ChartPoint[] => {
    return buildChartPoints(logsForVehicle(vehicleId));
  }, [logsForVehicle]);

  return (
    <FuelContext.Provider
      value={{
        fuelLogs,
        isSyncing,
        syncError,
        logsForVehicle,
        statsForVehicle,
        chartForVehicle,
        addFuelLog,
        updateFuelLog,
        deleteFuelLog,
        triggerSync: doSync,
      }}
    >
      {children}
    </FuelContext.Provider>
  );
}

export function useFuel(): FuelContextValue {
  const ctx = useContext(FuelContext);
  if (!ctx) throw new Error('useFuel must be used within FuelProvider');
  return ctx;
}
